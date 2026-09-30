'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Technician')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // สมัครสมาชิก
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        })

        if (error) {
          setMessage('เกิดข้อผิดพลาด: ' + error.message)
        } else {
          setMessage('สมัครสมาชิกสำเร็จ! หากตั้งค่าให้ยืนยันอีเมล ให้ตรวจสอบใน Inbox หรือลองเข้าสู่ระบบได้เลย')
        }
      } else {
        // เข้าสู่ระบบ
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setMessage('เข้าสู่ระบบไม่สำเร็จ: ' + error.message)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          {isSignUp ? 'สร้างบัญชีผู้ใช้งาน' : 'เข้าสู่ระบบ'}
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Alarm & Maintenance Management System
        </p>

        {message && (
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-center text-xs font-medium text-blue-800 border border-blue-200">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="mt-6 space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  บทบาท (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technician" className="text-gray-900">Technician (ช่างซ่อมบำรุง)</option>
                  <option value="Operator" className="text-gray-900">Operator (ผู้คุมเครื่อง)</option>
                  <option value="Admin" className="text-gray-900">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : isSignUp ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {isSignUp
              ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'
              : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
          </button>
        </div>
      </div>
    </div>
  )
}