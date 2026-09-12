"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestDatabasePage() {
  const [status, setStatus] = useState("Đang kiểm tra...");

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient();

      const { error } = await supabase
        .from("test_connection")
        .select("*")
        .limit(1);

      if (error) {
        setStatus(`❌ Kết nối lỗi: ${error.message}`);
        return;
      }

      setStatus("✅ Kết nối Supabase thành công!");
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Test Database</h1>

        <p>{status}</p>
      </div>
    </div>
  );
}
