'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, BellRing, Boxes, LayoutDashboard, LogOut, Menu, Wrench, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/client'

const supabase = createClient()

const navigation: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/dashboard/machines', label: 'เครื่องจักร', icon: Boxes },
  { href: '/dashboard/alarms', label: 'การแจ้งเตือน', icon: BellRing },
  { href: '/dashboard/maintenance', label: 'งานซ่อมบำรุง', icon: Wrench },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'ภาพรวมระบบ',
  '/dashboard/machines': 'จัดการเครื่องจักร',
  '/dashboard/alarms': 'การแจ้งเตือน',
  '/dashboard/maintenance': 'งานซ่อมบำรุง',
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (!data.session) router.replace('/login')
      else {
        setEmail(data.session.user.email ?? '')
        setReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (session) {
        setEmail(session.user.email ?? '')
        setReady(true)
      } else if (event === 'SIGNED_OUT') router.replace('/login')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!ready) return <div className="auth-wait"><div className="loading-line" style={{ width: 180 }} /></div>

  return (
    <div className="ops-shell">
      {menuOpen && <button aria-label="ปิดเมนู" className="mobile-backdrop" onClick={() => setMenuOpen(false)} />}
      <aside className={`ops-sidebar${menuOpen ? ' is-open' : ''}`}>
        <Link href="/dashboard" className="brand-lockup">
          <span className="brand-mark"><Activity size={20} strokeWidth={2.5} /></span>
          <span><span className="brand-name">PlantOps</span><span className="brand-caption">MAINTENANCE CONTROL</span></span>
        </Link>
        <p className="sidebar-label">เมนูหลัก</p>
        <nav className="sidebar-nav" aria-label="เมนูหลัก">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
            return <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="sidebar-link" aria-current={active ? 'page' : undefined}><Icon size={17} strokeWidth={2} /><span>{label}</span></Link>
          })}
        </nav>
        <div className="sidebar-footer"><strong>ระบบจัดการโรงงาน</strong>ติดตามเครื่องจักรและงานซ่อมบำรุงในที่เดียว</div>
      </aside>

      <div className="ops-workspace">
        <header className="ops-topbar">
          <div className="ops-topbar-inner">
            <div className="topbar-leading">
              <button className="icon-button mobile-menu-button" aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
              <div><p className="topbar-eyebrow">PLANT OPERATIONS / MAINTENANCE</p><p className="topbar-title">{pageTitles[pathname] ?? 'ระบบจัดการโรงงาน'}</p></div>
            </div>
            <div className="topbar-actions">
              <div className="user-identity" title={email}><span className="user-avatar">{email.slice(0, 1).toUpperCase() || 'U'}</span><span className="user-email">{email}</span></div>
              <button className="icon-button" aria-label="ออกจากระบบ" title="ออกจากระบบ" disabled={signingOut} onClick={handleSignOut}><LogOut size={17} /></button>
            </div>
          </div>
        </header>
        <main className="ops-content">{children}</main>
      </div>
    </div>
  )
}