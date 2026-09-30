'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellRing, Check, CircleAlert, LoaderCircle, Plus, Search } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

interface Alarm {
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
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function severityClass(value: string | null) {
  if (value === 'Critical') return 'status-pill is-danger'
  if (value === 'Warning') return 'status-pill is-warning'
  return 'status-pill is-neutral'
}

function statusClass(value: string | null) {
  if (value === 'Active') return 'status-pill is-danger'
  if (value === 'Acknowledged') return 'status-pill is-warning'
  return 'status-pill'
}

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [machineName, setMachineName] = useState('')
  const [alarmCode, setAlarmCode] = useState('')
  const [severity, setSeverity] = useState('Warning')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const loadAlarms = async () => {
      setLoading(true)
      const { data, error: queryError } = await supabase.from('alarms').select('*').order('created_at', { ascending: false })
      if (!active) return
      if (queryError) setError('โหลดรายการไม่สำเร็จ: ' + queryError.message)
      else {
        setAlarms(data ?? [])
        setError('')
      }
      setLoading(false)
    }
    void loadAlarms()
    return () => { active = false }
  }, [refreshKey])

  const filteredAlarms = useMemo(() => {
    const term = search.trim().toLowerCase()
    return alarms.filter((alarm) => {
      const matchesTerm = !term || [alarm.machine_name, alarm.alarm_code, alarm.description]
        .some((value) => value?.toLowerCase().includes(term))
      return matchesTerm && (statusFilter === 'All' || alarm.status === statusFilter)
    })
  }, [alarms, search, statusFilter])

  const handleCreateAlarm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const { error: insertError } = await supabase.from('alarms').insert([{
      machine_name: machineName,
      alarm_code: alarmCode,
      severity,
      description,
      status: 'Active',
    }])
    if (insertError) setError('บันทึกการแจ้งเตือนไม่สำเร็จ: ' + insertError.message)
    else {
      setMachineName('')
      setAlarmCode('')
      setDescription('')
      setSeverity('Warning')
      setMessage('บันทึกการแจ้งเตือนแล้ว')
      setRefreshKey((value) => value + 1)
    }
    setSaving(false)
  }

  const handleUpdateStatus = async (alarm: Alarm, newStatus: string) => {
    setUpdatingId(alarm.id)
    setError('')
    const { error: updateError } = await supabase.from('alarms').update({ status: newStatus }).eq('id', alarm.id)
    if (updateError) setError('อัปเดตสถานะไม่สำเร็จ: ' + updateError.message)
    else {
      setMessage(`เปลี่ยนสถานะเป็น ${newStatus} แล้ว`)
      setRefreshKey((value) => value + 1)
    }
    setUpdatingId('')
  }

  const activeCount = alarms.filter((alarm) => alarm.status === 'Active').length

  return (
    <div className="space-y-5">
      <section className="page-heading">
        <div>
          <p className="page-kicker">ติดตามเหตุขัดข้อง</p>
          <h1 className="page-title">การแจ้งเตือนเครื่องจักร</h1>
          <p className="page-description">บันทึกเหตุ ตรวจระดับความรุนแรง และติดตามจนกว่าจะปิดงาน</p>
        </div>
        <span className={activeCount ? 'status-pill is-danger' : 'status-pill'}><CircleAlert size={13} /> เปิดอยู่ {activeCount} รายการ</span>
      </section>

      {error && <div className="feedback-message" role="alert">{error}</div>}
      {message && <div className="feedback-message is-success" role="status">{message}</div>}

      <div className="form-layout">
        <section className="surface-panel">
          <div className="panel-header"><div><h2 className="panel-title">บันทึกเหตุใหม่</h2><p className="panel-subtitle">แจ้งเหตุให้ทีมซ่อมบำรุงรับทราบ</p></div><span className="metric-icon is-warning"><BellRing size={17} /></span></div>
          <form onSubmit={handleCreateAlarm} className="panel-body form-stack">
            <div><label className="field-label" htmlFor="alarm-machine">ชื่อเครื่องจักร</label><input id="alarm-machine" required value={machineName} onChange={(event) => setMachineName(event.target.value)} placeholder="เช่น เครื่อง CNC Line 1" className="field-control" /></div>
            <div><label className="field-label" htmlFor="alarm-code">รหัสแจ้งเตือน</label><input id="alarm-code" required value={alarmCode} onChange={(event) => setAlarmCode(event.target.value)} placeholder="เช่น OVERHEAT-01" className="field-control" /></div>
            <div><label className="field-label" htmlFor="alarm-severity">ระดับความรุนแรง</label><select id="alarm-severity" value={severity} onChange={(event) => setSeverity(event.target.value)} className="field-control"><option value="Critical">Critical · วิกฤต</option><option value="Warning">Warning · เฝ้าระวัง</option><option value="Info">Info · แจ้งเพื่อทราบ</option></select></div>
            <div><label className="field-label" htmlFor="alarm-description">รายละเอียด</label><textarea id="alarm-description" required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="อาการที่พบและข้อมูลที่ช่วยให้ช่างตรวจสอบได้" className="field-control" /></div>
            <button type="submit" className="primary-button w-full" disabled={saving}>{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}{saving ? 'กำลังบันทึก...' : 'บันทึกการแจ้งเตือน'}</button>
          </form>
        </section>

        <section className="surface-panel">
          <div className="panel-header panel-header-stack">
            <div><h2 className="panel-title">รายการแจ้งเตือน</h2><p className="panel-subtitle">{filteredAlarms.length} จาก {alarms.length} รายการ</p></div>
            <div className="table-toolbar">
              <label className="search-control"><Search size={15} /><input aria-label="ค้นหาการแจ้งเตือน" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเครื่อง หรือรหัส" className="field-control" /></label>
              <select aria-label="กรองตามสถานะ" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-control filter-control"><option value="All">ทุกสถานะ</option><option value="Active">Active</option><option value="Acknowledged">Acknowledged</option><option value="Resolved">Resolved</option></select>
            </div>
          </div>
          {loading ? <div className="panel-body form-stack"><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /></div> : filteredAlarms.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>เครื่องจักร / รหัส</th><th>ระดับ</th><th>รายละเอียด</th><th>สถานะ</th><th>เวลา</th><th>ดำเนินการ</th></tr></thead>
                <tbody>
                  {filteredAlarms.map((alarm) => (
                    <tr key={alarm.id}>
                      <td><span className="cell-primary">{alarm.machine_name || 'ไม่ระบุเครื่อง'}</span><span className="cell-secondary">{alarm.alarm_code || '—'}</span></td>
                      <td><span className={severityClass(alarm.severity)}>{alarm.severity || '—'}</span></td>
                      <td className="table-description">{alarm.description || '—'}</td>
                      <td><span className={statusClass(alarm.status)}>{alarm.status || '—'}</span></td>
                      <td>{formatDate(alarm.created_at)}</td>
                      <td><div className="inline-actions">{alarm.status === 'Active' && <button className="ghost-button compact-button" disabled={updatingId === alarm.id} onClick={() => void handleUpdateStatus(alarm, 'Acknowledged')}>รับทราบ</button>}{alarm.status !== 'Resolved' && <button className="primary-button compact-button" disabled={updatingId === alarm.id} onClick={() => void handleUpdateStatus(alarm, 'Resolved')}>{updatingId === alarm.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />} ปิดงาน</button>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div><span className="empty-state-icon"><BellRing size={21} /></span><p className="empty-state-title">{search || statusFilter !== 'All' ? 'ไม่พบรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีการแจ้งเตือน'}</p><p className="empty-state-copy">{search || statusFilter !== 'All' ? 'ลองเปลี่ยนคำค้นหาหรือสถานะ' : 'เมื่อพบความผิดปกติ บันทึกรายการเพื่อให้ทีมติดตามได้'}</p></div></div>
          )}
        </section>
      </div>
    </div>
  )
}