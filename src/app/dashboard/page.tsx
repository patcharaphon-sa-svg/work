'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [profile] = useState<any>({ full_name: 'ผู้ใช้งานระบบ (Admin)', role: 'Admin' })
  const [machineCount, setMachineCount] = useState(0)
  const [alarmCount, setAlarmCount] = useState(0)
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ดึงจำนวนเครื่องจักร
        const { count: countMachines } = await supabase
          .from('machines')
          .select('*', { count: 'exact', head: true })

        // ดึงจำนวน Alarms
        const { count: countAlarms } = await supabase
          .from('alarms')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Active')

        // ดึงจำนวน Maintenance
        const { count: countLogs } = await supabase
          .from('maintenance_logs')
          .select('*', { count: 'exact', head: true })

        setMachineCount(countMachines || 0)
        setAlarmCount(countAlarms || 0)
        setMaintenanceCount(countLogs || 0)
      } catch (err) {
        console.log('Database connecting...')
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Bar */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">
            Alarm & Maintenance System
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{profile?.full_name}</p>
              <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                {profile?.role}
              </span>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">ยินดีต้อนรับสู่ระบบบริหารจัดการ</h2>
          <p className="mt-1 text-sm text-gray-600">
            ภาพรวมการทำงานของเครื่องจักร สถิติการแจ้งเตือนขัดข้อง และประวัติการบำรุงรักษา
          </p>
        </div>

        {/* Dynamic Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/machines"
            className="group rounded-lg border-l-4 border-blue-500 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">เครื่องจักรทั้งหมด</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : machineCount}
              </p>
              <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                จัดการเครื่องจักร →
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/alarms"
            className="group rounded-lg border-l-4 border-red-500 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">การแจ้งเตือนที่รอดำเนินการ (Active)</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-3xl font-bold text-red-600">
                {loading ? '...' : alarmCount}
              </p>
              <span className="text-xs font-semibold text-red-600 group-hover:underline">
                ดูรายการแจ้งเตือน →
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/maintenance"
            className="group rounded-lg border-l-4 border-green-500 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">ประวัติการซ่อมบำรุงทั้งหมด</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : maintenanceCount}
              </p>
              <span className="text-xs font-semibold text-green-600 group-hover:underline">
                ดูประวัติซ่อมบำรุง →
              </span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}