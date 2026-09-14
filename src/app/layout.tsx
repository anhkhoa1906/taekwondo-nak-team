import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/context/student-context";
import Sidebar from "@/components/dashboard/sidebar";
import { AttendanceProvider } from "@/context/attendance-context";
import { TuitionProvider } from "@/context/tuition-context";
import { BeltProvider } from "@/context/belt-context";
import { CoachProvider } from "@/context/coach-context";
import { ClassProvider } from "@/context/class-context";
import { SettingsProvider } from "@/context/settings-context";
import { AuthProvider } from "@/context/auth-context";
import AuthGuard from "@/components/auth/auth-guard";
import AppShell from "@/components/layout/app-shell";
import { ClubProvider } from "@/context/club-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAK TAEKWONDO SYSTEM",
  description: "Hệ thống quản lý câu lạc bộ Taekwondo",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthProvider>
          <AuthGuard>
            <ClubProvider>
              <SettingsProvider>
                <StudentProvider>
                  <AttendanceProvider>
                    <TuitionProvider>
                      <BeltProvider>
                        <CoachProvider>
                          <ClassProvider>
                            <AppShell>{children}</AppShell>
                          </ClassProvider>
                        </CoachProvider>
                      </BeltProvider>
                    </TuitionProvider>
                  </AttendanceProvider>
                </StudentProvider>
              </SettingsProvider>
            </ClubProvider>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
