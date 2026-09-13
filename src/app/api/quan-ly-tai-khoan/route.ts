import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type AccountRole = "admin" | "coach" | "staff";
type AccessLevel = "manage" | "view";

// =====================================================
// ADMIN SUPABASE CLIENT
// Dùng Service Role cho thao tác Auth Admin
// =====================================================

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Thiếu cấu hình Supabase Service Role.");
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// =====================================================
// CURRENT USER
// Dùng session hiện tại của người đang đăng nhập
// =====================================================

async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

// =====================================================
// GET CLUB ID
// =====================================================

function getClubId(request: Request) {
  const url = new URL(request.url);

  return url.searchParams.get("clubId")?.trim() || null;
}

// =====================================================
// CHECK CLUB ADMIN
//
// QUAN TRỌNG:
// Dùng Supabase client của USER hiện tại.
// Không dùng Service Role ở bước kiểm tra quyền.
//
// RLS:
// club_members -> Members can read own memberships
// =====================================================

async function checkClubAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  clubId: string,
) {
  try {
    const { data, error } = await supabase
      .from("club_members")
      .select(
        `
          id,
          user_id,
          club_id,
          role,
          access_level
        `,
      )
      .eq("user_id", userId)
      .eq("club_id", clubId)
      .limit(1);

    if (error) {
      console.error("LỖI CHECK CLUB_MEMBERS:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        clubId,
      });

      return {
        allowed: false,
        membership: null,
        error: "Không thể kiểm tra quyền CLB.",
      };
    }

    const membership = data?.[0] ?? null;

    if (!membership) {
      console.error("KHÔNG TÌM THẤY MEMBERSHIP:", {
        userId,
        clubId,
      });

      return {
        allowed: false,
        membership: null,
        error: "Bạn không thuộc CLB này.",
      };
    }

    console.log("CHECK QUYỀN CLB:", {
      userId,
      clubId,
      role: membership.role,
      accessLevel: membership.access_level,
    });

    if (membership.role !== "admin") {
      console.error("USER KHÔNG PHẢI ADMIN:", {
        userId,
        clubId,
        role: membership.role,
        accessLevel: membership.access_level,
      });

      return {
        allowed: false,
        membership,
        error: "Chỉ Admin mới có thể quản lý tài khoản.",
      };
    }

    return {
      allowed: true,
      membership,
      error: null,
    };
  } catch (error) {
    console.error("EXCEPTION CHECK CLUB:", error);

    return {
      allowed: false,
      membership: null,
      error: "Không thể kiểm tra quyền CLB.",
    };
  }
}

// =====================================================
// GET
// Lấy tài khoản theo CLB hiện tại
// =====================================================

export async function GET(request: Request) {
  try {
    const clubId = getClubId(request);

    if (!clubId) {
      return NextResponse.json(
        {
          error: "Thiếu clubId.",
        },
        {
          status: 400,
        },
      );
    }

    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Bạn chưa đăng nhập.",
        },
        {
          status: 401,
        },
      );
    }

    // ===============================================
    // CHECK ADMIN BẰNG SESSION USER
    // ===============================================

    const permission = await checkClubAdmin(supabase, user.id, clubId);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: permission.error,
        },
        {
          status: 403,
        },
      );
    }

    // ===============================================
    // SAU KHI ĐÃ XÁC THỰC
    // Dùng Service Role để lấy dữ liệu Auth
    // ===============================================

    const adminSupabase = getAdminClient();

    // ===============================================
    // MEMBERSHIPS
    // ===============================================

    const { data: memberships, error: membershipError } = await adminSupabase
      .from("club_members")
      .select(
        `
            id,
            user_id,
            club_id,
            role,
            access_level,
            created_at
          `,
      )
      .eq("club_id", clubId)
      .order("created_at", {
        ascending: true,
      });

    if (membershipError) {
      console.error("Lỗi lấy membership:", membershipError);

      return NextResponse.json(
        {
          error: "Không thể lấy danh sách thành viên.",
        },
        {
          status: 500,
        },
      );
    }

    // ===============================================
    // PROFILE
    // ===============================================

    const userIds = (memberships ?? []).map((item) => item.user_id);

    let profiles: {
      user_id: string;
      display_name: string | null;
      created_at: string | null;
      updated_at: string | null;
    }[] = [];

    if (userIds.length > 0) {
      const { data, error: profileError } = await adminSupabase
        .from("profiles")
        .select(
          `
              user_id,
              display_name,
              created_at,
              updated_at
            `,
        )
        .in("user_id", userIds);

      if (profileError) {
        console.error("Lỗi lấy profiles:", profileError);

        return NextResponse.json(
          {
            error: "Không thể lấy thông tin tài khoản.",
          },
          {
            status: 500,
          },
        );
      }

      profiles = data ?? [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [profile.user_id, profile]),
    );

    // ===============================================
    // AUTH USERS
    // ===============================================

    const { data: usersData, error: usersError } =
      await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error("Lỗi lấy Auth users:", usersError);

      return NextResponse.json(
        {
          error: "Không thể lấy danh sách tài khoản.",
        },
        {
          status: 500,
        },
      );
    }

    const userMap = new Map(
      usersData.users.map((authUser) => [authUser.id, authUser]),
    );

    // ===============================================
    // BUILD ACCOUNTS
    // ===============================================

    const accounts = (memberships ?? [])
      .map((membership) => {
        const authUser = userMap.get(membership.user_id);

        if (!authUser) {
          return null;
        }

        const profile = profileMap.get(membership.user_id);

        return {
          id: membership.user_id,

          name:
            profile?.display_name ||
            authUser.email?.split("@")[0] ||
            "Tài khoản",

          email: authUser.email ?? "",

          role: membership.role as AccountRole,

          accessLevel: membership.access_level as AccessLevel,

          status: authUser.banned_until ? "inactive" : "active",

          created_at: membership.created_at,

          updated_at: profile?.updated_at ?? membership.created_at,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json({
      accounts,
    });
  } catch (error) {
    console.error("GET account error:", error);

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi máy chủ.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// TẠO TÀI KHOẢN + MEMBERSHIP
// =====================================================

export async function POST(request: Request) {
  try {
    const clubId = getClubId(request);

    if (!clubId) {
      return NextResponse.json(
        {
          error: "Thiếu clubId.",
        },
        {
          status: 400,
        },
      );
    }

    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Bạn chưa đăng nhập.",
        },
        {
          status: 401,
        },
      );
    }

    const permission = await checkClubAdmin(supabase, user.id, clubId);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: permission.error,
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "").trim();

    const role = body.role as AccountRole;

    const accessLevel = body.accessLevel as AccessLevel;

    if (!name) {
      return NextResponse.json(
        {
          error: "Vui lòng nhập tên.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Vui lòng nhập email.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Mật khẩu phải có ít nhất 6 ký tự.",
        },
        {
          status: 400,
        },
      );
    }

    if (!["admin", "coach", "staff"].includes(role)) {
      return NextResponse.json(
        {
          error: "Vai trò không hợp lệ.",
        },
        {
          status: 400,
        },
      );
    }

    const finalAccessLevel =
      role === "admin"
        ? "manage"
        : accessLevel === "manage"
          ? "manage"
          : "view";

    const adminSupabase = getAdminClient();

    // ===============================================
    // CHECK EMAIL
    // ===============================================

    const { data: usersData } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const existingUser = usersData.users.find(
      (item) => item.email?.toLowerCase() === email,
    );

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email này đã tồn tại trong hệ thống.",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================================
    // CREATE AUTH USER
    // ===============================================

    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Lỗi create auth user:", authError);

      return NextResponse.json(
        {
          error: authError?.message || "Không thể tạo tài khoản.",
        },
        {
          status: 400,
        },
      );
    }

    const newUser = authData.user;

    // ===============================================
    // CREATE PROFILE
    // ===============================================

    const { data: newProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .insert({
        user_id: newUser.id,

        club_id: clubId,

        role,

        display_name: name,
      })
      .select(
        `
            user_id,
            club_id,
            role,
            display_name,
            created_at,
            updated_at
          `,
      )
      .single();

    if (profileError || !newProfile) {
      console.error("Lỗi create profile:", profileError);

      await adminSupabase.auth.admin.deleteUser(newUser.id);

      return NextResponse.json(
        {
          error: profileError?.message || "Không thể tạo profile.",
        },
        {
          status: 500,
        },
      );
    }

    // ===============================================
    // CREATE CLUB MEMBERSHIP
    // ===============================================

    const { data: membership, error: membershipError } = await adminSupabase
      .from("club_members")
      .insert({
        user_id: newUser.id,

        club_id: clubId,

        role,

        access_level: finalAccessLevel,
      })
      .select(
        `
            id,
            user_id,
            club_id,
            role,
            access_level,
            created_at
          `,
      )
      .single();

    if (membershipError || !membership) {
      console.error("Lỗi create membership:", membershipError);

      await adminSupabase.from("profiles").delete().eq("user_id", newUser.id);

      await adminSupabase.auth.admin.deleteUser(newUser.id);

      return NextResponse.json(
        {
          error:
            membershipError?.message || "Không thể tạo quyền truy cập CLB.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Đã tạo tài khoản thành công.",

        account: {
          id: newUser.id,

          name,

          email: newUser.email ?? email,

          role,

          accessLevel: finalAccessLevel,

          status: "active",

          created_at: membership.created_at,

          updated_at: newProfile.updated_at,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST account error:", error);

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi máy chủ.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// PATCH
// SỬA TÀI KHOẢN TRONG CLB HIỆN TẠI
// =====================================================

export async function PATCH(request: Request) {
  try {
    const clubId = getClubId(request);

    if (!clubId) {
      return NextResponse.json(
        {
          error: "Thiếu clubId.",
        },
        {
          status: 400,
        },
      );
    }

    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Bạn chưa đăng nhập.",
        },
        {
          status: 401,
        },
      );
    }

    const permission = await checkClubAdmin(supabase, user.id, clubId);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: permission.error,
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const userId = String(body.userId ?? "").trim();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const role = body.role as AccountRole;

    const accessLevel = body.accessLevel as AccessLevel;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Thiếu user ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        {
          error: "Vui lòng nhập đầy đủ thông tin.",
        },
        {
          status: 400,
        },
      );
    }

    if (!["admin", "coach", "staff"].includes(role)) {
      return NextResponse.json(
        {
          error: "Vai trò không hợp lệ.",
        },
        {
          status: 400,
        },
      );
    }

    const finalAccessLevel =
      role === "admin"
        ? "manage"
        : accessLevel === "manage"
          ? "manage"
          : "view";

    const adminSupabase = getAdminClient();

    // ===============================================
    // TARGET MEMBERSHIP
    // ===============================================

    const { data: targetMembership, error: targetError } = await adminSupabase
      .from("club_members")
      .select(
        `
            id,
            user_id,
            club_id,
            role,
            access_level
          `,
      )
      .eq("user_id", userId)
      .eq("club_id", clubId)
      .limit(1)
      .maybeSingle();

    if (targetError) {
      console.error("Lỗi target membership:", targetError);

      return NextResponse.json(
        {
          error: "Không thể kiểm tra tài khoản trong CLB.",
        },
        {
          status: 500,
        },
      );
    }

    if (!targetMembership) {
      return NextResponse.json(
        {
          error: "Tài khoản không thuộc CLB hiện tại.",
        },
        {
          status: 404,
        },
      );
    }

    // ===============================================
    // KHÔNG CHO ADMIN TỰ HẠ QUYỀN
    // ===============================================

    if (
      userId === user.id &&
      permission.membership?.role === "admin" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự hạ quyền Admin của mình.",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================================
    // UPDATE AUTH EMAIL
    // ===============================================

    const { data: updatedAuth, error: authError } =
      await adminSupabase.auth.admin.updateUserById(userId, {
        email,
      });

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message || "Không thể cập nhật email.",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================================
    // UPDATE PROFILE NAME
    //
    // Không đổi role/club_id ở profiles.
    // Role SaaS chính thức nằm ở club_members.
    // ===============================================

    const { data: updatedProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        display_name: name,

        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select(
        `
            user_id,
            display_name,
            created_at,
            updated_at
          `,
      )
      .single();

    if (profileError || !updatedProfile) {
      return NextResponse.json(
        {
          error: profileError?.message || "Không thể cập nhật profile.",
        },
        {
          status: 500,
        },
      );
    }

    // ===============================================
    // UPDATE CLUB MEMBERSHIP
    // ===============================================

    const { data: updatedMembership, error: membershipError } =
      await adminSupabase
        .from("club_members")
        .update({
          role,

          access_level: finalAccessLevel,
        })
        .eq("user_id", userId)
        .eq("club_id", clubId)
        .select(
          `
            id,
            user_id,
            club_id,
            role,
            access_level,
            created_at
          `,
        )
        .single();

    if (membershipError || !updatedMembership) {
      return NextResponse.json(
        {
          error: membershipError?.message || "Không thể cập nhật quyền CLB.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      message: "Đã cập nhật tài khoản thành công.",

      account: {
        id: userId,

        name: updatedProfile.display_name ?? name,

        email: updatedAuth.user.email ?? email,

        role,

        accessLevel: finalAccessLevel,

        status: "active",

        created_at: updatedMembership.created_at,

        updated_at: updatedProfile.updated_at,
      },
    });
  } catch (error) {
    console.error("PATCH account error:", error);

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi máy chủ.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// DELETE
// CHỈ XÓA MEMBERSHIP KHỎI CLB
// KHÔNG XÓA AUTH USER
// =====================================================

export async function DELETE(request: Request) {
  try {
    const clubId = getClubId(request);

    if (!clubId) {
      return NextResponse.json(
        {
          error: "Thiếu clubId.",
        },
        {
          status: 400,
        },
      );
    }

    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Bạn chưa đăng nhập.",
        },
        {
          status: 401,
        },
      );
    }

    const permission = await checkClubAdmin(supabase, user.id, clubId);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: permission.error,
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const userId = String(body.userId ?? "").trim();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Thiếu user ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự xóa mình khỏi CLB.",
        },
        {
          status: 400,
        },
      );
    }

    const adminSupabase = getAdminClient();

    // ===============================================
    // CHECK TARGET
    // ===============================================

    const { data: targetMembership, error: targetError } = await adminSupabase
      .from("club_members")
      .select(
        `
            id,
            user_id,
            club_id,
            role
          `,
      )
      .eq("user_id", userId)
      .eq("club_id", clubId)
      .limit(1)
      .maybeSingle();

    if (targetError) {
      console.error(targetError);

      return NextResponse.json(
        {
          error: "Không thể kiểm tra thành viên.",
        },
        {
          status: 500,
        },
      );
    }

    if (!targetMembership) {
      return NextResponse.json(
        {
          error: "Tài khoản không thuộc CLB hiện tại.",
        },
        {
          status: 404,
        },
      );
    }

    if (targetMembership.role === "admin") {
      return NextResponse.json(
        {
          error: "Không thể xóa Admin khỏi CLB.",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================================
    // DELETE MEMBERSHIP ONLY
    // ===============================================

    const { error: deleteError } = await adminSupabase
      .from("club_members")
      .delete()
      .eq("user_id", userId)
      .eq("club_id", clubId);

    if (deleteError) {
      console.error(deleteError);

      return NextResponse.json(
        {
          error: "Không thể xóa quyền truy cập CLB.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      message: "Đã xóa tài khoản khỏi CLB.",

      userId,

      clubId,
    });
  } catch (error) {
    console.error("DELETE account error:", error);

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi máy chủ.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// PUT
// KHÓA / MỞ KHÓA TÀI KHOẢN
// =====================================================

export async function PUT(request: Request) {
  try {
    const clubId = getClubId(request);

    if (!clubId) {
      return NextResponse.json(
        {
          error: "Thiếu clubId.",
        },
        {
          status: 400,
        },
      );
    }

    const { supabase, user } = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Bạn chưa đăng nhập.",
        },
        {
          status: 401,
        },
      );
    }

    const permission = await checkClubAdmin(supabase, user.id, clubId);

    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: permission.error,
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const userId = String(body.userId ?? "").trim();

    const action = body.action as "ban" | "unban";

    if (!userId) {
      return NextResponse.json(
        {
          error: "Thiếu user ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (!["ban", "unban"].includes(action)) {
      return NextResponse.json(
        {
          error: "Thao tác không hợp lệ.",
        },
        {
          status: 400,
        },
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự khóa tài khoản của mình.",
        },
        {
          status: 400,
        },
      );
    }

    const adminSupabase = getAdminClient();

    // ===============================================
    // CHECK TARGET MEMBERSHIP
    // ===============================================

    const { data: targetMembership, error: membershipError } =
      await adminSupabase
        .from("club_members")
        .select(
          `
            user_id,
            club_id,
            role,
            access_level
          `,
        )
        .eq("user_id", userId)
        .eq("club_id", clubId)
        .limit(1)
        .maybeSingle();

    if (membershipError) {
      console.error(membershipError);

      return NextResponse.json(
        {
          error: "Không thể kiểm tra thành viên.",
        },
        {
          status: 500,
        },
      );
    }

    if (!targetMembership) {
      return NextResponse.json(
        {
          error: "Tài khoản không thuộc CLB hiện tại.",
        },
        {
          status: 404,
        },
      );
    }

    if (targetMembership.role === "admin") {
      return NextResponse.json(
        {
          error: "Không thể khóa Admin.",
        },
        {
          status: 400,
        },
      );
    }

    // ===============================================
    // BAN / UNBAN
    // ===============================================

    const banDuration = action === "ban" ? "876000h" : "none";

    const { data: updatedUser, error: updateError } =
      await adminSupabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      });

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error: updateError.message || "Không thể cập nhật trạng thái.",
        },
        {
          status: 500,
        },
      );
    }

    // ===============================================
    // PROFILE
    // ===============================================

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select(
        `
            display_name,
            created_at,
            updated_at
          `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    return NextResponse.json({
      message:
        action === "ban" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",

      account: {
        id: userId,

        name:
          profile?.display_name ||
          updatedUser.user.email?.split("@")[0] ||
          "Tài khoản",

        email: updatedUser.user.email ?? "",

        role: targetMembership.role as AccountRole,

        accessLevel: targetMembership.access_level as AccessLevel,

        status: action === "ban" ? "inactive" : "active",

        created_at: profile?.created_at ?? new Date().toISOString(),

        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("PUT account error:", error);

    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi máy chủ.",
      },
      {
        status: 500,
      },
    );
  }
}
