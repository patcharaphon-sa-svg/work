'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

interface MaintenanceLog {
  id: string
  machine_name: string
  technician_name: string
  action_taken: string
  spare_parts: string
  created_at: string
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [machineName, setMachineName] = useState('')
  const [technicianName, setTechnicianName] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [spareParts, setSpareParts] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLogs(data)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('maintenance_logs').insert([
      {
        machine_name: machineName,
        technician_name: technicianName,
        action_taken: actionTaken,
        spare_parts: spareParts || '-'
      }
    ])

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setMachineName('')
      setTechnicianName('')
      setActionTaken('')
      setSpareParts('')
      fetchLogs()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
              ← กลับหน้า Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-800">
              ประวัติการบำรุงรักษา (Maintenance Logs)
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-gray-800">บันทึกการซ่อมบำรุงใหม่</h2>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อเครื่องจักร</label>
                <input
                  type="text"
                  required
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  placeholder="เช่น CNC Machine A"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อผู้ดำเนินการ / ช่างผู้ซ่อม</label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="เช่น ช่างสมชาย"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">การดำเนินการ / วิธีแก้ไขปัญหา</label>
                <textarea
                  required
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="อธิบายสิ่งที่ได้ดำเนินการแก้ไข..."
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">อะไหล่ที่ใช้เปลี่ยน (ถ้ามี)</label>
                <input
                  type="text"
                  value={spareParts}
                  onChange={(e) => setSpareParts(e.target.value)}
                  placeholder="เช่น ฟิวส์ 10A, น้ำมันหล่อลื่น"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : '+ บันทึกการซ่อมบำรุง'}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-gray-800">ประวัติการบำรุงรักษาทั้งหมด</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="p-3">เครื่องจักร / ช่างซ่อม</th>
                    <th className="p-3">การดำเนินการ</th>
                    <th className="p-3">อะไหล่ที่ใช้</th>
                    <th className="p-3">วันที่</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-800">{log.machine_name}</p>
                        <span className="text-xs text-gray-500">{log.technician_name}</span>
                      </td>
                      <td className="p-3 text-gray-600">{log.action_taken}</td>
                      <td className="p-3 text-gray-600">{log.spare_parts}</td>
                      <td className="p-3 text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}