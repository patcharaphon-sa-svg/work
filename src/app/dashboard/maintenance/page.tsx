'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, LoaderCircle, Plus, Search, Wrench } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

interface MaintenanceLog {
  id: string
  machine_name: string | null
  technician_name: string | null
  action_taken: string | null
  spare_parts: string | null
  created_at: string
}

const supabase = createClient()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [machineName, setMachineName] = useState('')
  const [technicianName, setTechnicianName] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [spareParts, setSpareParts] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const loadLogs = async () => {
      setLoading(true)
      const { data, error: queryError } = await supabase.from('maintenance_logs').select('*').order('created_at', { ascending: false })
      if (!active) return
      if (queryError) setError('โหลดประวัติไม่สำเร็จ: ' + queryError.message)
      else {
        setLogs(data ?? [])
        setError('')
      }
      setLoading(false)
    }
    void loadLogs()
    return () => { active = false }
  }, [refreshKey])

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return logs
    return logs.filter((log) => [log.machine_name, log.technician_name, log.action_taken, log.spare_parts]
      .some((value) => value?.toLowerCase().includes(term)))
  }, [logs, search])

  const handleAddLog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const { error: insertError } = await supabase.from('maintenance_logs').insert([{
      machine_name: machineName,
      technician_name: technicianName,
      action_taken: actionTaken,
      spare_parts: spareParts || '-',
    }])
    if (insertError) setError('บันทึกงานซ่อมไม่สำเร็จ: ' + insertError.message)
    else {
      setMachineName('')
      setTechnicianName('')
      setActionTaken('')
      setSpareParts('')
      setMessage('บันทึกงานซ่อมเรียบร้อยแล้ว')
      setRefreshKey((value) => value + 1)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <section className="page-heading">
        <div>
          <p className="page-kicker">ประวัติการดำเนินงาน</p>
          <h1 className="page-title">งานซ่อมบำรุง</h1>
          <p className="page-description">บันทึกวิธีแก้ไข ผู้รับผิดชอบ และอะไหล่ เพื่อให้ตรวจสอบย้อนหลังได้</p>
        </div>
      </section>

      {error && <div className="feedback-message" role="alert">{error}</div>}
      {message && <div className="feedback-message is-success" role="status">{message}</div>}

      <div className="form-layout">
        <section className="surface-panel">
          <div className="panel-header"><div><h2 className="panel-title">บันทึกงานซ่อมใหม่</h2><p className="panel-subtitle">เก็บรายละเอียดหลังดำเนินงานเสร็จ</p></div><span className="metric-icon"><ClipboardCheck size={17} /></span></div>
          <form onSubmit={handleAddLog} className="panel-body form-stack">
            <div><label className="field-label" htmlFor="maintenance-machine">ชื่อเครื่องจักร</label><input id="maintenance-machine" required value={machineName} onChange={(event) => setMachineName(event.target.value)} placeholder="เช่น เครื่อง CNC Line 1" className="field-control" /></div>
            <div><label className="field-label" htmlFor="maintenance-technician">ผู้ดำเนินการ</label><input id="maintenance-technician" required value={technicianName} onChange={(event) => setTechnicianName(event.target.value)} placeholder="ชื่อช่างหรือผู้รับผิดชอบ" className="field-control" /></div>
            <div><label className="field-label" htmlFor="maintenance-action">วิธีแก้ไข / การดำเนินการ</label><textarea id="maintenance-action" required value={actionTaken} onChange={(event) => setActionTaken(event.target.value)} placeholder="อาการที่พบ สาเหตุ และวิธีแก้ไข" className="field-control" /></div>
            <div><label className="field-label" htmlFor="maintenance-parts">อะไหล่ที่ใช้ <span className="text-slate-400">(ถ้ามี)</span></label><input id="maintenance-parts" value={spareParts} onChange={(event) => setSpareParts(event.target.value)} placeholder="เช่น ฟิวส์ 10A, น้ำมันหล่อลื่น" className="field-control" /></div>
            <button type="submit" className="primary-button w-full" disabled={saving}>{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}{saving ? 'กำลังบันทึก...' : 'บันทึกงานซ่อม'}</button>
          </form>
        </section>

        <section className="surface-panel">
          <div className="panel-header panel-header-stack">
            <div><h2 className="panel-title">ประวัติการซ่อม</h2><p className="panel-subtitle">{filteredLogs.length} จาก {logs.length} รายการ</p></div>
            <label className="search-control"><Search size={15} /><input aria-label="ค้นหาประวัติซ่อม" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเครื่องจักร ช่าง หรืออะไหล่" className="field-control" /></label>
          </div>
          {loading ? <div className="panel-body form-stack"><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /></div> : filteredLogs.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>เครื่องจักร / ผู้ดำเนินการ</th><th>การดำเนินการ</th><th>อะไหล่</th><th>วันที่</th></tr></thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td><span className="cell-primary">{log.machine_name || 'ไม่ระบุเครื่องจักร'}</span><span className="cell-secondary">{log.technician_name || 'ไม่ระบุผู้ดำเนินการ'}</span></td>
                      <td className="table-description">{log.action_taken || '—'}</td>
                      <td>{log.spare_parts || '—'}</td>
                      <td>{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div><span className="empty-state-icon"><Wrench size={21} /></span><p className="empty-state-title">{search ? 'ไม่พบประวัติที่ค้นหา' : 'ยังไม่มีประวัติการซ่อม'}</p><p className="empty-state-copy">{search ? 'ลองค้นหาด้วยชื่อเครื่องจักรหรือผู้ดำเนินการอื่น' : 'หลังซ่อมเสร็จ บันทึกรายละเอียดไว้เพื่อให้ทีมใช้เป็นข้อมูลอ้างอิง'}</p></div></div>
          )}
        </section>
      </div>
    </div>
  )
}