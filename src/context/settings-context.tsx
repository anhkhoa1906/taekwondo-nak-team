"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useClub } from "@/context/club-context";

export type ClubSettings = {
  clubName: string;
  slogan: string;
  phone: string;
  address: string;
  email: string;
  defaultTuition: number;
  defaultTrainingTime: string;
};

type SettingsContextType = {
  settings: ClubSettings;
  updateSettings: (newSettings: ClubSettings) => Promise<void>;
};

const defaultSettings: ClubSettings = {
  clubName: "Taekwondo NAK Team",
  slogan: "Rèn luyện - Kỷ luật - Phát triển",
  phone: "",
  address: "",
  email: "",
  defaultTuition: 300000,
  defaultTrainingTime: "18:00 - 19:30",
};

type SettingsRow = {
  id: number;
  club_id: string;
  club_name: string | null;
  slogan: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  default_tuition: number | null;
  default_training_time: string | null;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

function mapSettings(row: SettingsRow): ClubSettings {
  return {
    clubName: row.club_name ?? defaultSettings.clubName,
    slogan: row.slogan ?? defaultSettings.slogan,
    phone: row.phone ?? "",
    address: row.address ?? "",
    email: row.email ?? "",
    defaultTuition: Number(
      row.default_tuition ?? defaultSettings.defaultTuition,
    ),
    defaultTrainingTime:
      row.default_training_time ?? defaultSettings.defaultTrainingTime,
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [settings, setSettings] = useState<ClubSettings>(defaultSettings);

  // ==========================================
  // Tải cài đặt của CLB hiện tại
  // ==========================================

  const loadSettings = useCallback(async () => {
    if (!club?.id) {
      setSettings(defaultSettings);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("club_settings")
      .select("*")
      .eq("club_id", club.id)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Lỗi tải cài đặt CLB:", error);
      return;
    }

    if (data) {
      setSettings(mapSettings(data as SettingsRow));
    } else {
      setSettings(defaultSettings);
    }
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadSettings();
  }, [clubLoading, loadSettings]);

  // ==========================================
  // Cập nhật cài đặt
  // ==========================================

  const updateSettings = useCallback(
    async (newSettings: ClubSettings) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const settingsData = {
        club_id: club.id,
        club_name: newSettings.clubName,
        slogan: newSettings.slogan,
        phone: newSettings.phone,
        address: newSettings.address,
        email: newSettings.email,
        default_tuition: newSettings.defaultTuition,
        default_training_time: newSettings.defaultTrainingTime,
        updated_at: new Date().toISOString(),
      };

      // Tìm cài đặt của CLB hiện tại
      const { data: existingData, error: existingError } = await supabase
        .from("club_settings")
        .select("id")
        .eq("club_id", club.id)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingError) {
        console.error("Lỗi kiểm tra cài đặt CLB:", existingError);
        return;
      }

      let data;
      let error;

      if (existingData?.id) {
        const result = await supabase
          .from("club_settings")
          .update(settingsData)
          .eq("id", existingData.id)
          .eq("club_id", club.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("club_settings")
          .insert(settingsData)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Lỗi lưu cài đặt CLB:", error);
        return;
      }

      setSettings(mapSettings(data as SettingsRow));
    },
    [club?.id],
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings phải được sử dụng bên trong SettingsProvider");
  }

  return context;
}
