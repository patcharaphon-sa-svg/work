'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellRing, Check, CircleAlert, LoaderCircle, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

interface Alarm {
  id: string
  machine_id: string
  alarm_code: string | null
  cause: string | null
  description: string | null
  status: string | null
  occurred_at: string | null
  created_at: string | null
}

interface MachineOption {
  id: string
  machine_id: string
  name: string
}

const supabase = createClient()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function statusClass(value: string | null) {
  if (value === 'Open') return 'status-pill is-danger'
  if (value === 'In Progress') return 'status-pill is-warning'
  return 'status-pill'
}

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [machines, setMachines] = useState<MachineOption[]>([])
  const [machineId, setMachineId] = useState('')
  const [alarmCode, setAlarmCode] = useState('')
  const [cause, setCause] = useState('')
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
      const [alarmResult, machineResult] = await Promise.all([
        supabase.from('alarms').select('*').order('created_at', { ascending: false }),
        supabase.from('machines').select('id, machine_id, name').order('name'),
      ])
      if (!active) return
      const queryError = alarmResult.error ?? machineResult.error
      if (queryError) setError('โหลดรายการไม่สำเร็จ: ' + queryError.message)
      else {
        setAlarms(alarmResult.data ?? [])
        setMachines(machineResult.data ?? [])
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
      const machine = machines.find((item) => item.id === alarm.machine_id)
      const matchesTerm = !term || [machine?.machine_id, machine?.name, alarm.alarm_code, alarm.cause, alarm.description]
        .some((value) => value?.toLowerCase().includes(term))
      return matchesTerm && (statusFilter === 'All' || alarm.status === statusFilter)
    })
  }, [alarms, machines, search, statusFilter])

  const handleCreateAlarm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const { error: insertError } = await supabase.from('alarms').insert([{
      machine_id: machineId,
      alarm_code: alarmCode,
      description,
      cause: cause || null,
    }])
    if (insertError) setError('บันทึกการแจ้งเตือนไม่สำเร็จ: ' + insertError.message)
    else {
      setMachineId('')
      setAlarmCode('')
      setCause('')
      setDescription('')
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

  const activeCount = alarms.filter((alarm) => alarm.status === 'Open' || alarm.status === 'In Progress').length

  return (
    <div className="space-y-5">
      <section className="page-heading">
        <div>
          <p className="page-kicker">ติดตามเหตุขัดข้อง</p>
          <h1 className="page-title">การแจ้งเตือนเครื่องจักร</h1>
          <p className="page-description">บันทึกเหตุ เลือกเครื่องจากทะเบียน และติดตามจนกว่าจะปิดงาน</p>
        </div>
        <span className={activeCount ? 'status-pill is-danger' : 'status-pill'}><CircleAlert size={13} /> เปิดอยู่ {activeCount} รายการ</span>
      </section>

      {error && <div className="feedback-message" role="alert">{error}</div>}
      {message && <div className="feedback-message is-success" role="status">{message}</div>}

      <div className="form-layout">
        <section className="surface-panel">
          <div className="panel-header"><div><h2 className="panel-title">บันทึกเหตุใหม่</h2><p className="panel-subtitle">แจ้งเหตุให้ทีมซ่อมบำรุงรับทราบ</p></div><span className="metric-icon is-warning"><BellRing size={17} /></span></div>
          <form onSubmit={handleCreateAlarm} className="panel-body form-stack">
            <div><label className="field-label" htmlFor="alarm-machine">เครื่องจักร</label><select id="alarm-machine" required value={machineId} onChange={(event) => setMachineId(event.target.value)} className="field-control" disabled={machines.length === 0}><option value="">{machines.length ? 'เลือกเครื่องจักร' : 'ยังไม่มีเครื่องจักรในทะเบียน'}</option>{machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.machine_id} · {machine.name}</option>)}</select>{machines.length === 0 && <p className="field-hint">เพิ่มเครื่องจักรก่อนสร้าง alarm · <Link href="/dashboard/machines">ไปหน้าเครื่องจักร</Link></p>}</div>
            <div><label className="field-label" htmlFor="alarm-code">รหัสแจ้งเตือน</label><input id="alarm-code" required value={alarmCode} onChange={(event) => setAlarmCode(event.target.value)} placeholder="เช่น OVERHEAT-01" className="field-control" /></div>
            <div><label className="field-label" htmlFor="alarm-cause">สาเหตุเบื้องต้น <span className="text-slate-400">(ถ้ามี)</span></label><input id="alarm-cause" value={cause} onChange={(event) => setCause(event.target.value)} placeholder="เช่น อุณหภูมิสูงผิดปกติ" className="field-control" /></div>
            <div><label className="field-label" htmlFor="alarm-description">รายละเอียด</label><textarea id="alarm-description" required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="อาการที่พบและข้อมูลที่ช่วยให้ช่างตรวจสอบได้" className="field-control" /></div>
            <button type="submit" className="primary-button w-full" disabled={saving || machines.length === 0}>{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}{saving ? 'กำลังบันทึก...' : 'บันทึกการแจ้งเตือน'}</button>
          </form>
        </section>

        <section className="surface-panel">
          <div className="panel-header panel-header-stack">
            <div><h2 className="panel-title">รายการแจ้งเตือน</h2><p className="panel-subtitle">{filteredAlarms.length} จาก {alarms.length} รายการ</p></div>
            <div className="table-toolbar">
              <label className="search-control"><Search size={15} /><input aria-label="ค้นหาการแจ้งเตือน" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเครื่อง หรือรหัส" className="field-control" /></label>
              <select aria-label="กรองตามสถานะ" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-control filter-control"><option value="All">ทุกสถานะ</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Closed">Closed</option></select>
            </div>
          </div>
          {loading ? <div className="panel-body form-stack"><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /></div> : filteredAlarms.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>เครื่องจักร / รหัส</th><th>สาเหตุ</th><th>รายละเอียด</th><th>สถานะ</th><th>เวลา</th><th>ดำเนินการ</th></tr></thead>
                <tbody>
                  {filteredAlarms.map((alarm) => (
                    <tr key={alarm.id}>
                      <td><span className="cell-primary">{machines.find((machine) => machine.id === alarm.machine_id)?.name || 'ไม่พบเครื่อง'}</span><span className="cell-secondary">{machines.find((machine) => machine.id === alarm.machine_id)?.machine_id || alarm.machine_id}</span><span className="cell-secondary">{alarm.alarm_code || '—'}</span></td>
                      <td>{alarm.cause || '—'}</td>
                      <td className="table-description">{alarm.description || '—'}</td>
                      <td><span className={statusClass(alarm.status)}>{alarm.status || '—'}</span></td>
                      <td>{formatDate(alarm.occurred_at ?? alarm.created_at ?? new Date().toISOString())}</td>
                      <td><div className="inline-actions">{alarm.status === 'Open' && <button className="ghost-button compact-button" disabled={updatingId === alarm.id} onClick={() => void handleUpdateStatus(alarm, 'In Progress')}>รับงาน</button>}{alarm.status !== 'Closed' && <button className="primary-button compact-button" disabled={updatingId === alarm.id} onClick={() => void handleUpdateStatus(alarm, 'Closed')}>{updatingId === alarm.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />} ปิดงาน</button>}</div></td>
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