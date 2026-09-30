"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Alarm & Maintenance Management System</h1>
      <p className="text-gray-600 mb-4">ยินดีต้อนรับสู่ระบบจัดการการแจ้งเตือนและการบำรุงรักษาเครื่องจักร</p>

      {/* ใส่ Component หรือส่วนแสดงผล Machines / Alarms / Logs ตรงนี้ */}
    </main>
  );
}