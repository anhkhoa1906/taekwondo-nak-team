import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/context/student-context";
import Sidebar from "@/components/dashboard/sidebar";
import { AttendanceProvider } from "@/context/attendance-context";
import { TuitionProvider } from "@/context/tuition-context";
import { BeltProvider } from "@/context/belt-context";
import { CoachProvider } from "@/context/coach-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taekwondo NAK Team",
  description: "Hệ thống quản lý CLB Taekwondo",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <StudentProvider>
          <AttendanceProvider>
            <TuitionProvider>
              <BeltProvider>
                <CoachProvider>
                  <Sidebar />

                  <main className="min-h-screen pl-20">{children}</main>
                </CoachProvider>
              </BeltProvider>
            </TuitionProvider>
          </AttendanceProvider>
        </StudentProvider>
      </body>
    </html>
  );
}
