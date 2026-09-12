"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

type Club = {
  id: string;
  name: string;
};

type ClubContextType = {
  club: Club | null;
  loading: boolean;
  refreshClub: () => Promise<void>;
};

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClub = useCallback(async () => {
    if (!user) {
      setClub(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // ==========================================
    // 1. Lấy profile của tài khoản hiện tại
    // ==========================================

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("club_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Lỗi tải profile:", profileError);
      setClub(null);
      setLoading(false);
      return;
    }

    if (!profile?.club_id) {
      console.error("Tài khoản chưa được gán CLB.");
      setClub(null);
      setLoading(false);
      return;
    }

    // ==========================================
    // 2. Lấy thông tin CLB
    // ==========================================

    const { data: clubData, error: clubError } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("id", profile.club_id)
      .maybeSingle();

    if (clubError) {
      console.error("Lỗi tải thông tin CLB:", clubError);
      setClub(null);
      setLoading(false);
      return;
    }

    if (!clubData) {
      console.error("Không tìm thấy CLB.");
      setClub(null);
      setLoading(false);
      return;
    }

    // ==========================================
    // 3. Lưu CLB hiện tại
    // ==========================================

    setClub({
      id: clubData.id,
      name: clubData.name,
    });

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    loadClub();
  }, [authLoading, loadClub]);

  return (
    <ClubContext.Provider
      value={{
        club,
        loading: authLoading || loading,
        refreshClub: loadClub,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);

  if (!context) {
    throw new Error("useClub phải được sử dụng bên trong ClubProvider");
  }

  return context;
}
