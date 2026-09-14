"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

// =====================================================
// TYPES
// =====================================================

export type UserRole = "admin" | "coach" | "staff";

export type Profile = {
  user_id: string;
  club_id: string;
  role: UserRole;

  display_name: string;
  avatar_url: string;
};

type AuthContextType = {
  user: User | null;

  profile: Profile | null;

  loading: boolean;

  profileLoading: boolean;

  // Active club
  setActiveClub: (clubId: string, role: UserRole) => void;

  // Profile
  updateProfile: (
    displayName: string,
    avatarUrl: string,
  ) => Promise<{
    error: string | null;
  }>;

  // Auth
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: string | null;
  }>;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => Promise<void>;
};

// =====================================================
// CONTEXT
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =====================================================
// SUPABASE CLIENT
// =====================================================

const supabase = createClient();

// =====================================================
// PROVIDER
// =====================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(false);

  // ===================================================
  // ACTIVE CLUB
  // ===================================================

  const setActiveClub = useCallback((clubId: string, role: UserRole) => {
    setProfile((currentProfile) => {
      if (!currentProfile) {
        return currentProfile;
      }

      return {
        ...currentProfile,
        club_id: clubId,
        role,
      };
    });
  }, []);

  // ===================================================
  // LOAD CURRENT SESSION
  // ===================================================
  //
  // IMPORTANT:
  // Không dùng getUser() ở đây.
  //
  // Khi người dùng chưa đăng nhập, getUser()
  // có thể trả AuthSessionMissingError.
  //
  // getSession() phù hợp hơn cho việc kiểm tra
  // session hiện tại ở phía client.
  // ===================================================

  useEffect(() => {
    let mounted = true;

    // -----------------------------------------------
    // AUTH STATE LISTENER
    // -----------------------------------------------

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      // Không reload lại toàn bộ user/profile khi Supabase
      // chỉ đang refresh access token lúc quay lại tab.
      if (event === "TOKEN_REFRESHED") {
        return;
      }

      const nextUser = session?.user ?? null;

      setUser((currentUser) => {
        // Cùng một tài khoản thì giữ nguyên object hiện tại.
        // Tránh làm các useEffect([user]) chạy lại không cần thiết.
        if (currentUser?.id === nextUser?.id) {
          return currentUser;
        }

        return nextUser;
      });
    });

    // -----------------------------------------------
    // LOAD EXISTING SESSION
    // -----------------------------------------------

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          console.error("Lỗi kiểm tra session:", error);

          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("Lỗi khởi tạo authentication:", error);

        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    // -----------------------------------------------
    // CLEANUP
    // -----------------------------------------------

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  // ===================================================
  // LOAD PROFILE
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      // ---------------------------------------------
      // CHƯA LOGIN
      // ---------------------------------------------

      if (!user) {
        setProfile(null);
        setProfileLoading(false);

        return;
      }

      setProfileLoading(true);

      // ---------------------------------------------
      // LOAD PROFILE
      // ---------------------------------------------

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              user_id,
              club_id,
              role,
              display_name,
              avatar_url
            `,
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (!mounted) {
          return;
        }

        // -------------------------------------------
        // ERROR
        // -------------------------------------------

        if (error) {
          console.error("Lỗi tải profile:", error);

          setProfile(null);

          return;
        }

        // -------------------------------------------
        // SUCCESS
        // -------------------------------------------

        if (data) {
          setProfile({
            user_id: data.user_id,

            club_id: data.club_id,

            role: data.role as UserRole,

            display_name: data.display_name ?? "",

            avatar_url: data.avatar_url ?? "",
          });

          return;
        }

        // -------------------------------------------
        // NO PROFILE
        // -------------------------------------------

        setProfile(null);
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("Lỗi tải profile:", error);

        setProfile(null);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  // ===================================================
  // UPDATE PROFILE
  // ===================================================

  const updateProfile = useCallback(
    async (displayName: string, avatarUrl: string) => {
      // ---------------------------------------------
      // CHECK LOGIN
      // ---------------------------------------------

      if (!user) {
        return {
          error: "Bạn chưa đăng nhập.",
        };
      }

      // ---------------------------------------------
      // CLEAN NAME
      // ---------------------------------------------

      const cleanName = displayName.trim();

      if (!cleanName) {
        return {
          error: "Họ và tên không được để trống.",
        };
      }

      // ---------------------------------------------
      // UPDATE THROUGH RPC
      // ---------------------------------------------

      const { data, error } = await supabase.rpc("update_my_profile", {
        new_display_name: cleanName,

        new_avatar_url: avatarUrl || null,
      });

      // ---------------------------------------------
      // ERROR
      // ---------------------------------------------

      if (error) {
        console.error("Lỗi cập nhật profile:", error);

        return {
          error: error.message,
        };
      }

      // ---------------------------------------------
      // UPDATE LOCAL STATE
      // ---------------------------------------------

      if (data) {
        setProfile((currentProfile) => {
          if (!currentProfile) {
            return currentProfile;
          }

          return {
            ...currentProfile,

            display_name: data.display_name ?? "",

            avatar_url: data.avatar_url ?? "",
          };
        });
      }

      return {
        error: null,
      };
    },
    [user],
  );

  // ===================================================
  // SIGN UP
  // ===================================================

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      return {
        error: error?.message ?? null,
      };
    } catch (error) {
      console.error("Lỗi đăng ký:", error);

      return {
        error: "Không thể đăng ký tài khoản. Vui lòng thử lại.",
      };
    }
  }, []);

  // ===================================================
  // SIGN IN
  // ===================================================

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        error: error?.message ?? null,
      };
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      return {
        error: "Không thể đăng nhập. Vui lòng thử lại.",
      };
    }
  }, []);

  // ===================================================
  // SIGN OUT
  // ===================================================

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Lỗi đăng xuất:", error);
      }

      // Đảm bảo local state được reset
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  }, []);

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        profile,

        loading,

        profileLoading,

        setActiveClub,

        updateProfile,

        signUp,

        signIn,

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
