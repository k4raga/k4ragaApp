'use client'
import { useRouter } from 'next/navigation'
import './Popup.css'

export default function Popup({ show, icon, title, desc, onClose, backHref }) {
  const router = useRouter()

  return (
    <div className={'popup-overlay' + (show ? ' show' : '')}>
      <div className="popup">
        <button className="popup-close" onClick={onClose}>✕</button>
        <div className="popup-icon">{icon}</div>
        <div className="popup-title">{title}</div>
        <p className="popup-desc">{desc}</p>
        <button className="popup-btn" onClick={() => router.push(backHref || '/')}>
          {backHref ? 'К дню' : 'На главную'}
        </button>
      </div>
    </div>
  )
}
