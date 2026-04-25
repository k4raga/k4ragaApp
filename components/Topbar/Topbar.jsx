'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAV_COPY } from '@/lib/copy'
import logo from '@/lib/logo.js'
import { getClientHostName, isCsHostName } from '@/lib/site-context'
import './Topbar.css'

export default function Topbar() {
  const path = usePathname()
  const [isCsHost, setIsCsHost] = useState(false)

  useEffect(() => {
    setIsCsHost(isCsHostName(getClientHostName()))
  }, [])

  return (
    <nav className="topbar">
      <Link href={isCsHost ? '/' : 'https://k4raga.ru/'} className="topbar-left">
        <img className="topbar-logo" src={logo} alt="K4RAGA" />
        <span className="topbar-name">K4RAGA</span>
      </Link>
      <div className="topbar-nav">
        {isCsHost ? (
          <>
            <Link href="/" className={'topbar-link' + (path === '/' ? ' active' : '')}>{NAV_COPY.cs.home}</Link>
            <Link href="/training" className={'topbar-link' + (path === '/training' ? ' active' : '')}>{NAV_COPY.cs.training}</Link>
            <Link href="/faceit" className={'topbar-link' + (path === '/faceit' ? ' active' : '')}>{NAV_COPY.cs.faceit}</Link>
          </>
        ) : (
          <>
            <Link href="/" className={'topbar-link' + (path === '/' ? ' active' : '')}>{NAV_COPY.main.home}</Link>
            <a href="https://cs.k4raga.ru/" className="topbar-link">{NAV_COPY.main.cs}</a>
          </>
        )}
      </div>
    </nav>
  )
}
