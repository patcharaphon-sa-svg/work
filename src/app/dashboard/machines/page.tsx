'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, LoaderCircle, Plus, Search, Wrench } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

interface Machine {
  id: string
  machine_id: string
  name: string
  type: string | null
  location: string | null
  status: string | null
  created_at?: string
}

const supabase = createClient()

function statusClass(status: string | null) {
  if (status === 'Running') return 'status-pill'
  if (status === 'Maintenance') return 'status-pill is-warning'
  if (status === 'Alarm') return 'status-pill is-danger'
  return 'status-pill is-neutral'
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [machineCode, setMachineCode] = useState('')
  const [name, setName] = useState('')
  const [machineType, setMachineType] = useState('')
  const [location, setLocation] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) setError(queryError.message)
        else {
          setMachines(data ?? [])
          setError('')
        }
        setLoading(false)
      })
    return () => { active = false }
  }, [refreshKey])

  const filteredMachines = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return machines
    return machines.filter((machine) => [machine.machine_id, machine.name, machine.type, machine.location, machine.status]
      .some((value) => value?.toLowerCase().includes(term)))
  }, [machines, search])

  const handleAddMachine = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { error: insertError } = await supabase.from('machines').insert([{ machine_id: machineCode, name, type: machineType, location }])
    if (insertError) setError('เพิ่มเครื่องจักรไม่สำเร็จ: ' + insertError.message)
    else {
      setMachineCode('')
      setName('')
      setMachineType('')
      setLocation('')
      setMessage('เพิ่มเครื่องจักรเรียบร้อยแล้ว')
      setRefreshKey((value) => value + 1)
    }
    setSaving(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    setError('')
    const { error: updateError } = await supabase.from('machines').update({ status }).eq('id', id)
    if (updateError) setError('อัปเดตสถานะไม่สำเร็จ: ' + updateError.message)
    else setRefreshKey((value) => value + 1)
    setUpdatingId('')
  }

  return (
    <div className="space-y-5">
      <section className="page-heading">
        <div>
          <p className="page-kicker">ทะเบียนสินทรัพย์</p>
          <h1 className="page-title">เครื่องจักร</h1>
          <p className="page-description">จัดการข้อมูลพื้นฐานและสถานะการทำงานของเครื่องจักรในโรงงาน</p>
        </div>
      </section>

      {error && <div className="feedback-message" role="alert">{error}</div>}
      {message && <div className="feedback-message is-success" role="status">{message}</div>}

      <div className="form-layout">
        <section className="surface-panel">
          <div className="panel-header"><div><h2 className="panel-title">เพิ่มเครื่องจักร</h2><p className="panel-subtitle">กรอกข้อมูลพื้นฐานเพื่อเพิ่มเข้าทะเบียน</p></div><span className="metric-icon"><Plus size={17} /></span></div>
          <form onSubmit={handleAddMachine} className="panel-body form-stack">
            <div><label className="field-label" htmlFor="machine-code">รหัสเครื่องจักร</label><input id="machine-code" required value={machineCode} onChange={(event) => setMachineCode(event.target.value)} placeholder="เช่น CNC-001" className="field-control" /></div>
            <div><label className="field-label" htmlFor="machine-name">ชื่อเครื่องจักร</label><input id="machine-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="เช่น เครื่องกัด CNC" className="field-control" /></div>
            <div><label className="field-label" htmlFor="machine-type">ประเภท / รุ่น</label><input id="machine-type" required value={machineType} onChange={(event) => setMachineType(event.target.value)} placeholder="เช่น เครื่องกัดแนวตั้ง" className="field-control" /></div>
            <div><label className="field-label" htmlFor="machine-location">ตำแหน่งติดตั้ง</label><input id="machine-location" required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="เช่น อาคาร 1 · โซน A" className="field-control" /></div>
            <button type="submit" className="primary-button w-full" disabled={saving}>{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}{saving ? 'กำลังบันทึก...' : 'เพิ่มเครื่องจักร'}</button>
          </form>
        </section>

        <section className="surface-panel">
          <div className="panel-header panel-header-stack">
            <div><h2 className="panel-title">รายการเครื่องจักร</h2><p className="panel-subtitle">{machines.length} รายการในทะเบียน</p></div>
            <label className="search-control"><Search size={15} /><input aria-label="ค้นหาเครื่องจักร" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อ หรือสถานที่" className="field-control" /></label>
          </div>
          {loading ? <div className="panel-body form-stack"><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /></div> : filteredMachines.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>เครื่องจักร / รหัส</th><th>ประเภท</th><th>สถานที่</th><th>สถานะการทำงาน</th></tr></thead>
                <tbody>
                  {filteredMachines.map((machine) => (
                    <tr key={machine.id}>
                      <td><span className="cell-primary">{machine.name}</span><span className="cell-secondary">{machine.machine_id}</span></td>
                      <td>{machine.type || '—'}</td>
                      <td>{machine.location || '—'}</td>
                      <td><div className="machine-status-cell"><span className={statusClass(machine.status)}>{machine.status || 'ไม่ระบุ'}</span><select aria-label={`เปลี่ยนสถานะ ${machine.name}`} className="field-control status-select" value={machine.status || 'Stop'} disabled={updatingId === machine.id} onChange={(event) => void handleStatusChange(machine.id, event.target.value)}><option value="Running">Running · ทำงาน</option><option value="Stop">Stop · หยุด</option><option value="Alarm">Alarm · ผิดปกติ</option><option value="Maintenance">Maintenance · ซ่อมบำรุง</option></select>{updatingId === machine.id && <Check size={14} className="text-emerald-700" />}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div><span className="empty-state-icon"><Wrench size={21} /></span><p className="empty-state-title">{search ? 'ไม่พบเครื่องจักรที่ค้นหา' : 'ยังไม่มีเครื่องจักรในทะเบียน'}</p><p className="empty-state-copy">{search ? 'ลองใช้ชื่อ รุ่น หรือสถานที่อื่น' : 'เพิ่มเครื่องจักรทางด้านซ้ายเพื่อเริ่มติดตามสถานะและงานซ่อม'}</p></div></div>
          )}
        </section>
      </div>
    </div>
  )
}