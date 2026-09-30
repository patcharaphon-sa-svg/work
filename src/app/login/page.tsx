'use client'

import { useEffect, useState } from 'react'
import { Activity, ArrowRight, Eye, EyeOff, ShieldCheck, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

const supabase = createClient()

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) router.replace('/dashboard')
    })
    return () => { active = false }
  }, [router])

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: 'Technician' } },
        })
        if (error) setNotice({ type: 'error', text: error.message })
        else if (data.session) router.replace('/dashboard')
        else setNotice({ type: 'success', text: 'สมัครเรียบร้อยแล้ว ตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าใช้งาน' })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setNotice({ type: 'error', text: error.message })
        else if (data.session) router.replace('/dashboard')
      }
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'เชื่อมต่อระบบไม่สำเร็จ กรุณาลองอีกครั้ง' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-lockup login-brand-lockup">
          <span className="brand-mark"><Activity size={20} strokeWidth={2.5} /></span>
          <span><span className="brand-name">PlantOps</span><span className="brand-caption">MAINTENANCE CONTROL</span></span>
        </div>
        <div className="login-brand-copy">
          <p className="page-kicker">โรงงาน · เครื่องจักร · ทีมซ่อมบำรุง</p>
          <h1>ดูแลเครื่องจักร ให้การผลิตเดินต่อ</h1>
          <p>ติดตามเหตุขัดข้อง บันทึกงานซ่อม และดูสถานะอุปกรณ์ในพื้นที่ทำงานเดียว</p>
          <div className="login-visual" aria-hidden="true">
            <div className="visual-block"><span className="visual-label">ASSET MONITORING</span><Wrench size={24} /><span className="visual-label">ทะเบียนและสถานะเครื่องจักร</span></div>
            <div className="visual-block is-accent"><span className="visual-label">WORKFLOW</span><span className="visual-number">01 — 03</span><span className="visual-label">แจ้งเหตุ · รับงาน · บันทึกผล</span></div>
          </div>
        </div>
        <span className="login-footnote">ระบบจัดการซ่อมบำรุงสำหรับทีมปฏิบัติการ</span>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="login-mobile-mark"><Activity size={19} /> PlantOps</span>
          <div className="login-heading-row"><span className="login-shield"><ShieldCheck size={20} /></span><div><p className="page-kicker">SECURE WORKSPACE</p><h2 className="login-heading">{isSignUp ? 'สร้างบัญชีผู้ใช้งาน' : 'เข้าสู่ระบบ'}</h2></div></div>
          <p className="login-subheading">{isSignUp ? 'สมัครบัญชีสำหรับเข้าถึงระบบจัดการซ่อมบำรุง' : 'ลงชื่อเข้าใช้เพื่อดูภาพรวมและจัดการงานประจำวัน'}</p>

          {notice && <div className={`feedback-message ${notice.type === 'success' ? 'is-success' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}

          <form onSubmit={handleAuth} className="form-stack login-form">
            {isSignUp && <div><label className="field-label" htmlFor="full-name">ชื่อ-นามสกุล</label><input id="full-name" type="text" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="กรอกชื่อที่ใช้ในระบบ" className="field-control" /></div>}
            <div><label className="field-label" htmlFor="email">อีเมล</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="field-control" /></div>
            <div><label className="field-label" htmlFor="password">รหัสผ่าน</label><div className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" className="field-control" /><button type="button" className="icon-button password-toggle" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <button type="submit" className="primary-button login-submit" disabled={loading}>{loading ? <span className="login-spinner" /> : null}{loading ? 'กำลังดำเนินการ...' : isSignUp ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}{!loading && <ArrowRight size={16} />}</button>
          </form>

          <div className="login-separator"><span>หรือ</span></div>
          <button type="button" className="login-switch" onClick={() => { setIsSignUp(!isSignUp); setNotice(null) }}>{isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}</button>
          <p className="login-security-note">บัญชีใหม่จะได้รับสิทธิ์ Technician โดยค่าเริ่มต้น ติดต่อผู้ดูแลระบบหากต้องเปลี่ยนสิทธิ์</p>
        </div>
      </section>
    </main>
  )
}