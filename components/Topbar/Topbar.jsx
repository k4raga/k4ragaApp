'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '@/lib/logo.js'
import './Topbar.css'

export default function Topbar() {
  const path = usePathname()

  return (
    <nav className="topbar">
      <Link href="/" className="topbar-left">
        <img className="topbar-logo" src={logo} alt="K4RAGA" />
        <span className="topbar-name">K4RAGA</span>
      </Link>
      <div className="topbar-nav">
        <Link href="/" className={'topbar-link' + (path === '/' ? ' active' : '')}>Главная</Link>
        <Link href="/training" className={'topbar-link' + (path === '/training' ? ' active' : '')}>CS</Link>
      </div>
    </nav>
  )
}
