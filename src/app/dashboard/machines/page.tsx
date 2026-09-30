'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

interface Machine {
  id: string
  name: string
  model: string
  location: string
  status: string
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // ดึงข้อมูลจาก Supabase
  const fetchMachines = async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMachines(data)
  }

  useEffect(() => {
    fetchMachines()
  }, [])

  // บันทึกลง Supabase
  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('machines').insert([
      { name, model, location, status: 'Online' }
    ])

    if (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message)
    } else {
      setName('')
      setModel('')
      setLocation('')
      fetchMachines() // โหลดข้อมูลใหม่ทันที
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
              จัดการเครื่องจักร (Machines)
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-gray-800">เพิ่มเครื่องจักรใหม่</h2>
            <form onSubmit={handleAddMachine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อเครื่องจักร</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น CNC Milling Machine A"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">รุ่น / Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="เช่น VF-2SS"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">สถานที่ติดตั้ง / Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น โซน A - โรงงาน 1"
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : '+ เพิ่มเครื่องจักร'}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-gray-800">รายการเครื่องจักรทั้งหมด</h2>
            {machines.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">ยังไม่มีข้อมูลเครื่องจักรในระบบ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="p-3">ชื่อเครื่องจักร</th>
                      <th className="p-3">รุ่น</th>
                      <th className="p-3">สถานที่</th>
                      <th className="p-3">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {machines.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{m.name}</td>
                        <td className="p-3 text-gray-600">{m.model}</td>
                        <td className="p-3 text-gray-600">{m.location}</td>
                        <td className="p-3">
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}