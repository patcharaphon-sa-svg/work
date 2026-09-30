"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Machine {
  id: string;
  name: string;
  status: string;
  location: string;
}

interface Alarm {
  id: string;
  machine_id: string;
  severity: string;
  message: string;
  created_at: string;
}

interface MaintenanceLog {
  id: string;
  machine_id: string;
  description: string;
  performed_by: string;
  created_at: string;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // ดึงข้อมูลจาก Supabase Tables
    const { data: machinesData } = await supabase.from("machines").select("*");
    const { data: alarmsData } = await supabase.from("alarms").select("*");
    const { data: logsData } = await supabase.from("maintenance_logs").select("*");

    if (machinesData) setMachines(machinesData);
    if (alarmsData) setAlarms(alarmsData);
    if (logsData) setLogs(logsData);

    setLoading(false);
  };

  return (
    <main className="p-8 max-w-6xl mx-auto font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Alarm & Maintenance Management System
        </h1>
        <p className="text-gray-600 mt-1">
          ระบบจัดการและติดตามการแจ้งเตือนและการบำรุงรักษาเครื่องจักร
        </p>
      </header>

      {loading ? (
        <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูลจาก Supabase...</div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Machines Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">📌 รายการเครื่องจักร (Machines)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {machines.length > 0 ? (
                machines.map((machine) => (
                  <div key={machine.id} className="border rounded-lg p-4 shadow-sm bg-white">
                    <h3 className="font-bold text-lg">{machine.name}</h3>
                    <p className="text-sm text-gray-500">สถานที่: {machine.location || "N/A"}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${
                      machine.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {machine.status || "Unknown"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 col-span-3">ไม่พบข้อมูลเครื่องจักร</p>
              )}
            </div>
          </section>

          {/* Section 2: Active Alarms */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">🚨 การแจ้งเตือนล่าสุด (Alarms)</h2>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse bg-white text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border-b">รหัสเครื่องจักร</th>
                    <th className="p-3 border-b">ข้อความแจ้งเตือน</th>
                    <th className="p-3 border-b">ระดับความรุนแรง</th>
                    <th className="p-3 border-b">เวลา</th>
                  </tr>
                </thead>
                <tbody>
                  {alarms.length > 0 ? (
                    alarms.map((alarm) => (
                      <tr key={alarm.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{alarm.machine_id}</td>
                        <td className="p-3 border-b">{alarm.message}</td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 text-xs rounded font-bold ${
                            alarm.severity === "high" ? "bg-red-500 text-white" : "bg-yellow-400 text-black"
                          }`}>
                            {alarm.severity}
                          </span>
                        </td>
                        <td className="p-3 border-b">{new Date(alarm.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">ไม่มีการแจ้งเตือนในขณะนี้</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Maintenance Logs */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">🛠 ประวัติการบำรุงรักษา (Maintenance Logs)</h2>
            <div className="overflow-x-auto border rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse bg-white text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border-b">รหัสเครื่องจักร</th>
                    <th className="p-3 border-b">รายละเอียด</th>
                    <th className="p-3 border-b">ผู้ดำเนินการ</th>
                    <th className="p-3 border-b">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{log.machine_id}</td>
                        <td className="p-3 border-b">{log.description}</td>
                        <td className="p-3 border-b">{log.performed_by}</td>
                        <td className="p-3 border-b">{new Date(log.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">ยังไม่มีประวัติการบำรุงรักษา</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}