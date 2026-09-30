'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

interface Alarm {
  id: string
  machine_name: string
  alarm_code: string
  severity: string
  description: string
  status: string
  created_at: string
}

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [machineName, setMachineName] = useState('')
  const [alarmCode, setAlarmCode] = useState('')
  const [severity, setSeverity] = useState('Warning')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const fetchAlarms = async () => {
    const { data } = await supabase
      .from('alarms')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAlarms(data)
  }

  useEffect(() => {
    fetchAlarms()
  }, [])

  const handleCreateAlarm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('alarms').insert([
      {
        machine_name: machineName,
        alarm_code: alarmCode,
        severity,
        description,
        status: 'Active'
      }
    ])

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setMachineName('')
      setAlarmCode('')
      setDescription('')
      fetchAlarms()
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await supabase.from('alarms').update({ status: newStatus }).eq('id', id)
    fetchAlarms()
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
              การแจ้งเตือนเครื่องจักร (Alarms Management)
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-gray-800">แจ้งเหตุขัดข้อง / Alarm ใหม่</h2>
            <form onSubmit={handleCreateAlarm} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700">รหัสความผิดปกติ (Alarm Code)</label>
                <input
                  type="text"
                  required
                  value={alarmCode}
                  onChange={(e) => setAlarmCode(e.target.value)}
                  placeholder="เช่น ERR-404, OVERHEAT"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ระดับความรุนแรง</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Critical">Critical (วิกฤต)</option>
                  <option value="Warning">Warning (เตือนภัย)</option>
                  <option value="Info">Info (แจ้งเตือนทั่วไป)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">รายละเอียดปัญหา</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายอาการผิดปกติ..."
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : '+ บันทึกการแจ้งเตือน'}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-gray-800">รายการแจ้งเตือนทั้งหมด</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="p-3">เครื่องจักร / Code</th>
                    <th className="p-3">ระดับ</th>
                    <th className="p-3">รายละเอียด</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alarms.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-800">{a.machine_name}</p>
                        <span className="text-xs font-mono text-gray-500">{a.alarm_code}</span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          a.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          a.severity === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{a.description}</td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          a.status === 'Active' ? 'bg-red-500 text-white' :
                          a.status === 'Acknowledged' ? 'bg-yellow-400 text-gray-900' : 'bg-green-100 text-green-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {a.status === 'Active' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'Acknowledged')}
                            className="rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                          >
                            รับทราบ
                          </button>
                        )}
                        {a.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'Resolved')}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                          >
                            แก้ไขแล้ว
                          </button>
                        )}
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