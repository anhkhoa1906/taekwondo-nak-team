import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // =========================
    // 1. Kiểm tra user đăng nhập
    // =========================
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập." },
        { status: 401 },
      );
    }

    // =========================
    // 2. Lấy profile của user
    // =========================
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, club_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        { error: "Không thể kiểm tra quyền tài khoản." },
        { status: 500 },
      );
    }

    // =========================
    // 3. Chỉ Admin được sử dụng API
    // =========================
    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập." },
        { status: 403 },
      );
    }

    // =========================
    // 4. Tạo Admin Client
    // =========================
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Thiếu SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // =========================
    // 5. Lấy danh sách Auth Users
    // =========================
    const { data: usersData, error: usersError } =
      await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      console.error(usersError);

      return NextResponse.json(
        { error: "Không thể lấy danh sách tài khoản." },
        { status: 500 },
      );
    }

    // =========================
    // 6. Lấy profiles cùng club
    // =========================
    const { data: profiles, error: profilesError } = await adminSupabase
      .from("profiles")
      .select("user_id, club_id, role, display_name, created_at, updated_at")
      .eq("club_id", profile.club_id);

    if (profilesError) {
      console.error(profilesError);

      return NextResponse.json(
        { error: "Không thể lấy thông tin phân quyền." },
        { status: 500 },
      );
    }

    // =========================
    // 7. Ghép Auth User + Profile
    // =========================
    const profileMap = new Map(
      (profiles ?? []).map((item) => [item.user_id, item]),
    );

    const accounts = usersData.users
      .map((authUser) => {
        const userProfile = profileMap.get(authUser.id);

        if (!userProfile) return null;

        return {
          id: authUser.id,
          name:
            userProfile.display_name ||
            authUser.email?.split("@")[0] ||
            "Tài khoản",
          email: authUser.email ?? "",
          role: userProfile.role,
          status: authUser.banned_until ? "inactive" : "active",
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      accounts,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  try {
    // =========================
    // 1. Kiểm tra user hiện tại
    // =========================
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập." },
        { status: 401 },
      );
    }

    // =========================
    // 2. Kiểm tra profile Admin
    // =========================
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, club_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);

      return NextResponse.json(
        { error: "Không thể lấy thông tin phân quyền." },
        { status: 500 },
      );
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có thể tạo tài khoản." },
        { status: 403 },
      );
    }

    // =========================
    // 3. Lấy dữ liệu từ form
    // =========================
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "").trim();
    const role = body.role as "admin" | "coach" | "staff";

    if (!name) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên." },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập email." },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 },
      );
    }

    if (!["admin", "coach", "staff"].includes(role)) {
      return NextResponse.json(
        { error: "Vai trò không hợp lệ." },
        { status: 400 },
      );
    }

    // =========================
    // 4. Service Role Client
    // =========================
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Thiếu SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // =========================
    // 5. Tạo User trong Supabase Auth
    // =========================
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Create auth user error:", authError);

      return NextResponse.json(
        {
          error: authError?.message || "Không thể tạo tài khoản.",
        },
        { status: 400 },
      );
    }

    const newUser = authData.user;

    // =========================
    // 6. Tạo profile
    // =========================
    const { data: newProfile, error: newProfileError } = await adminSupabase
      .from("profiles")
      .insert({
        user_id: newUser.id,
        club_id: profile.club_id,
        role,
        display_name: name,
      })
      .select("user_id, club_id, role, display_name, created_at, updated_at")
      .single();

    // =========================
    // 7. Nếu tạo profile lỗi
    //    → xóa Auth User vừa tạo
    // =========================
    if (newProfileError || !newProfile) {
      console.error("Create profile error:", newProfileError);

      await adminSupabase.auth.admin.deleteUser(newUser.id);

      return NextResponse.json(
        {
          error:
            newProfileError?.message || "Không thể tạo thông tin phân quyền.",
        },
        { status: 500 },
      );
    }

    // =========================
    // 8. Thành công
    // =========================
    return NextResponse.json(
      {
        message: "Đã tạo tài khoản thành công.",
        account: {
          id: newUser.id,
          name: newProfile.display_name,
          email: newUser.email ?? email,
          role: newProfile.role,
          status: "active",
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create account error:", error);

    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 },
    );
  }
}
export async function PATCH(request: Request) {
  try {
    // =========================
    // 1. Kiểm tra user hiện tại
    // =========================
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập." },
        { status: 401 },
      );
    }

    // =========================
    // 2. Kiểm tra Admin
    // =========================
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, club_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: "Không thể lấy thông tin phân quyền." },
        { status: 500 },
      );
    }

    if (currentProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có thể chỉnh sửa tài khoản." },
        { status: 403 },
      );
    }

    // =========================
    // 3. Lấy dữ liệu
    // =========================
    const body = await request.json();

    const userId = String(body.userId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const role = body.role as "admin" | "coach" | "staff";

    if (!userId) {
      return NextResponse.json({ error: "Thiếu user ID." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên." },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập email." },
        { status: 400 },
      );
    }

    if (!["admin", "coach", "staff"].includes(role)) {
      return NextResponse.json(
        { error: "Vai trò không hợp lệ." },
        { status: 400 },
      );
    }

    // =========================
    // 4. Service Role Client
    // =========================
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Thiếu SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // =========================
    // 5. Kiểm tra tài khoản
    //    thuộc CLB hiện tại
    // =========================
    const { data: targetProfile, error: targetError } = await adminSupabase
      .from("profiles")
      .select("user_id, club_id, role, display_name, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
    }

    if (targetProfile.club_id !== currentProfile.club_id) {
      return NextResponse.json(
        { error: "Tài khoản không thuộc CLB hiện tại." },
        { status: 403 },
      );
    }

    // =========================
    // 6. Không cho Admin tự
    //    đổi mình thành Coach/Staff
    // =========================
    if (
      userId === user.id &&
      currentProfile.role === "admin" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự hạ quyền tài khoản Admin của mình.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 7. Cập nhật email Auth
    // =========================
    const { data: updatedAuth, error: authError } =
      await adminSupabase.auth.admin.updateUserById(userId, {
        email,
      });

    if (authError) {
      console.error("Update auth user error:", authError);

      return NextResponse.json(
        {
          error: authError.message || "Không thể cập nhật email.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 8. Cập nhật Profile
    // =========================
    const { data: updatedProfile, error: updateError } = await adminSupabase
      .from("profiles")
      .update({
        display_name: name,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("club_id", currentProfile.club_id)
      .select("user_id, club_id, role, display_name, created_at, updated_at")
      .single();

    if (updateError || !updatedProfile) {
      console.error("Update profile error:", updateError);

      return NextResponse.json(
        {
          error:
            updateError?.message || "Không thể cập nhật thông tin tài khoản.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Đã cập nhật tài khoản thành công.",
      account: {
        id: updatedProfile.user_id,
        name: updatedProfile.display_name || email.split("@")[0],
        email: updatedAuth.user.email ?? email,
        role: updatedProfile.role,
        status: "active",
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at,
      },
    });
  } catch (error) {
    console.error("Update account error:", error);

    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    // =========================
    // 1. Kiểm tra user hiện tại
    // =========================
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập." },
        { status: 401 },
      );
    }

    // =========================
    // 2. Kiểm tra Admin
    // =========================
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, club_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: "Không thể lấy thông tin phân quyền." },
        { status: 500 },
      );
    }

    if (currentProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có thể xóa tài khoản." },
        { status: 403 },
      );
    }

    // =========================
    // 3. Lấy userId cần xóa
    // =========================
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Thiếu user ID." }, { status: 400 });
    }

    // =========================
    // 4. Không cho tự xóa mình
    // =========================
    if (userId === user.id) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự xóa tài khoản của mình.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 5. Service Role Client
    // =========================
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Thiếu SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // =========================
    // 6. Kiểm tra target profile
    // =========================
    const { data: targetProfile, error: targetError } = await adminSupabase
      .from("profiles")
      .select("user_id, club_id, role, display_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
    }

    // =========================
    // 7. Chỉ xóa tài khoản
    //    trong cùng CLB
    // =========================
    if (targetProfile.club_id !== currentProfile.club_id) {
      return NextResponse.json(
        {
          error: "Tài khoản không thuộc CLB hiện tại.",
        },
        { status: 403 },
      );
    }

    // =========================
    // 8. Không cho xóa Admin
    // =========================
    if (targetProfile.role === "admin") {
      return NextResponse.json(
        {
          error: "Không thể xóa tài khoản Admin.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 9. Xóa Auth User
    // =========================
    const { error: deleteAuthError } =
      await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Delete auth user error:", deleteAuthError);

      return NextResponse.json(
        {
          error: deleteAuthError.message || "Không thể xóa tài khoản.",
        },
        { status: 500 },
      );
    }

    // profiles có FK on delete cascade
    // nên profile sẽ được xóa theo Auth User.
    return NextResponse.json({
      message: "Đã xóa tài khoản thành công.",
      userId,
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 },
    );
  }
}
export async function PUT(request: Request) {
  try {
    // =========================
    // 1. Kiểm tra user hiện tại
    // =========================
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập." },
        { status: 401 },
      );
    }

    // =========================
    // 2. Kiểm tra Admin
    // =========================
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, club_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: "Không thể lấy thông tin phân quyền." },
        { status: 500 },
      );
    }

    if (currentProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ Admin mới có thể khóa/mở khóa tài khoản." },
        { status: 403 },
      );
    }

    // =========================
    // 3. Lấy dữ liệu
    // =========================
    const body = await request.json();

    const userId = String(body.userId ?? "").trim();
    const action = body.action as "ban" | "unban";

    if (!userId) {
      return NextResponse.json({ error: "Thiếu user ID." }, { status: 400 });
    }

    if (!["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "Thao tác không hợp lệ." },
        { status: 400 },
      );
    }

    // =========================
    // 4. Không cho tự khóa mình
    // =========================
    if (userId === user.id) {
      return NextResponse.json(
        {
          error: "Bạn không thể tự khóa tài khoản Admin của mình.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 5. Service Role Client
    // =========================
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Thiếu SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 },
      );
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // =========================
    // 6. Kiểm tra tài khoản mục tiêu
    // =========================
    const { data: targetProfile, error: targetError } = await adminSupabase
      .from("profiles")
      .select("user_id, club_id, role, display_name, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản." },
        { status: 404 },
      );
    }

    // =========================
    // 7. Chỉ thao tác trong CLB hiện tại
    // =========================
    if (targetProfile.club_id !== currentProfile.club_id) {
      return NextResponse.json(
        {
          error: "Tài khoản không thuộc CLB hiện tại.",
        },
        { status: 403 },
      );
    }

    // =========================
    // 8. Không khóa Admin
    // =========================
    if (targetProfile.role === "admin") {
      return NextResponse.json(
        {
          error: "Không thể khóa tài khoản Admin.",
        },
        { status: 400 },
      );
    }

    // =========================
    // 9. Khóa / mở khóa Auth User
    // =========================
    const banDuration = action === "ban" ? "876000h" : "none";

    const { data: updatedUser, error: updateError } =
      await adminSupabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
      });

    if (updateError) {
      console.error("Update ban status error:", updateError);

      return NextResponse.json(
        {
          error:
            updateError.message || "Không thể cập nhật trạng thái tài khoản.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message:
        action === "ban" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
      account: {
        id: targetProfile.user_id,
        name:
          targetProfile.display_name ||
          updatedUser.user.email?.split("@")[0] ||
          "Tài khoản",
        email: updatedUser.user.email ?? "",
        role: targetProfile.role,
        status: action === "ban" ? "inactive" : "active",
        created_at: targetProfile.created_at,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Toggle account status error:", error);

    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ." },
      { status: 500 },
    );
  }
}
