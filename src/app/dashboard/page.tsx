'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BellRing, Boxes, CircleAlert, RefreshCw, Wrench } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

interface RecentAlarm {
  id: string
  machine_name: string | null
  alarm_code: string | null
  severity: string | null
  description: string | null
  status: string | null
  created_at: string
}

const supabase = createClient()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function severityClass(value: string | null) {
  if (value === 'Critical') return 'status-pill is-danger'
  if (value === 'Warning') return 'status-pill is-warning'
  return 'status-pill is-neutral'
}

export default function DashboardPage() {
  const [machineCount, setMachineCount] = useState<number | null>(null)
  const [alarmCount, setAlarmCount] = useState<number | null>(null)
  const [maintenanceCount, setMaintenanceCount] = useState<number | null>(null)
  const [criticalCount, setCriticalCount] = useState<number | null>(null)
  const [recentAlarms, setRecentAlarms] = useState<RecentAlarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      setLoading(true)
      setError('')

      const [machines, alarms, logs, critical, recent] = await Promise.all([
        supabase.from('machines').select('*', { count: 'exact', head: true }),
        supabase.from('alarms').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('maintenance_logs').select('*', { count: 'exact', head: true }),
        supabase.from('alarms').select('*', { count: 'exact', head: true }).eq('status', 'Active').eq('severity', 'Critical'),
        supabase
          .from('alarms')
          .select('id, machine_name, alarm_code, severity, description, status, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      if (!active) return
      const queryError = machines.error ?? alarms.error ?? logs.error ?? critical.error ?? recent.error
      if (queryError) {
        setError('ดึงข้อมูลไม่สำเร็จ: ' + queryError.message)
      } else {
        setMachineCount(machines.count ?? 0)
        setAlarmCount(alarms.count ?? 0)
        setMaintenanceCount(logs.count ?? 0)
        setCriticalCount(critical.count ?? 0)
        setRecentAlarms(recent.data ?? [])
      }
      setLoading(false)
    }

    void loadOverview()
    return () => { active = false }
  }, [refreshKey])

  return (
    <div className="space-y-5">
      <section className="page-heading">
        <div>
          <p className="page-kicker">ภาพรวมประจำวัน</p>
          <h1 className="page-title">ศูนย์ควบคุมการบำรุงรักษา</h1>
          <p className="page-description">ติดตามเครื่องจักร การแจ้งเตือน และบันทึกงานซ่อมบำรุงจากหน้างาน</p>
        </div>
        <div className="page-actions">
          <button className="ghost-button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> รีเฟรชข้อมูล
          </button>
          <Link className="primary-button" href="/dashboard/alarms">
            <BellRing size={15} /> แจ้งเหตุขัดข้อง
          </Link>
        </div>
      </section>

      {error && <div className="feedback-message" role="alert">{error}</div>}

      <section className="overview-grid" aria-label="สรุปข้อมูล">
        <article className="metric-card">
          <div className="metric-topline"><span>เครื่องจักรทั้งหมด</span><span className="metric-icon"><Boxes size={17} /></span></div>
          <p className="metric-value">{loading ? '—' : machineCount}</p>
          <p className="metric-caption">รายการในทะเบียนเครื่องจักร</p>
        </article>
        <article className="metric-card">
          <div className="metric-topline"><span>แจ้งเตือนที่ยังเปิด</span><span className="metric-icon is-warning"><BellRing size={17} /></span></div>
          <p className="metric-value">{loading ? '—' : alarmCount}</p>
          <p className="metric-caption">สถานะ Active ที่รอดำเนินการ</p>
        </article>
        <article className="metric-card">
          <div className="metric-topline"><span>ระดับวิกฤต</span><span className="metric-icon is-danger"><CircleAlert size={17} /></span></div>
          <p className="metric-value">{loading ? '—' : criticalCount}</p>
          <p className="metric-caption">ต้องจัดการเป็นลำดับแรก</p>
        </article>
        <article className="metric-card">
          <div className="metric-topline"><span>บันทึกซ่อมบำรุง</span><span className="metric-icon"><Wrench size={17} /></span></div>
          <p className="metric-value">{loading ? '—' : maintenanceCount}</p>
          <p className="metric-caption">ประวัติการดำเนินงานทั้งหมด</p>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <div className="surface-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">การแจ้งเตือนล่าสุด</h2>
              <p className="panel-subtitle">รายการที่เข้าระบบล่าสุด</p>
            </div>
            <Link className="ghost-button" href="/dashboard/alarms">ดูทั้งหมด <ArrowRight size={14} /></Link>
          </div>
          {loading ? (
            <div className="panel-body form-stack" aria-label="กำลังโหลด">
              <div className="loading-line" />
              <div className="loading-line" />
              <div className="loading-line" />
            </div>
          ) : recentAlarms.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>เครื่องจักร</th><th>ความรุนแรง</th><th>สถานะ</th><th>เวลา</th></tr></thead>
                <tbody>
                  {recentAlarms.map((alarm) => (
                    <tr key={alarm.id}>
                      <td><span className="cell-primary">{alarm.machine_name || 'ไม่ระบุเครื่องจักร'}</span><span className="cell-secondary">{alarm.alarm_code || alarm.description || 'ไม่มีรายละเอียด'}</span></td>
                      <td><span className={severityClass(alarm.severity)}>{alarm.severity || 'ไม่ระบุ'}</span></td>
                      <td><span className={alarm.status === 'Active' ? 'status-pill is-danger' : 'status-pill is-neutral'}>{alarm.status || 'ไม่ระบุ'}</span></td>
                      <td>{formatDate(alarm.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div>
                <span className="empty-state-icon"><BellRing size={21} /></span>
                <p className="empty-state-title">ยังไม่มีรายการแจ้งเตือน</p>
                <p className="empty-state-copy">เมื่อมีการแจ้งเหตุ รายการจะปรากฏที่นี่เพื่อให้ทีมติดตามได้ทันที</p>
                <Link className="primary-button" href="/dashboard/alarms">สร้างรายการแจ้งเตือน</Link>
              </div>
            </div>
          )}
        </div>

        <div className="surface-panel">
          <div className="panel-header"><div><h2 className="panel-title">ทางลัดหน้างาน</h2><p className="panel-subtitle">เริ่มงานที่ใช้บ่อย</p></div></div>
          <div className="panel-body form-stack">
            <Link className="ghost-button justify-between" href="/dashboard/machines"><span className="flex items-center gap-2"><Boxes size={15} /> เพิ่มเครื่องจักร</span><ArrowRight size={14} /></Link>
            <Link className="ghost-button justify-between" href="/dashboard/alarms"><span className="flex items-center gap-2"><BellRing size={15} /> บันทึกการแจ้งเตือน</span><ArrowRight size={14} /></Link>
            <Link className="ghost-button justify-between" href="/dashboard/maintenance"><span className="flex items-center gap-2"><Wrench size={15} /> บันทึกงานซ่อม</span><ArrowRight size={14} /></Link>
            <div className="feedback-message is-success">ข้อมูลในหน้านี้อัปเดตจากฐานข้อมูล Supabase โดยตรง</div>
          </div>
        </div>
      </section>
    </div>
  )
}