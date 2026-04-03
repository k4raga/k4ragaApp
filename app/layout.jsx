import './globals.css'
import SiteChrome from '@/components/SiteChrome/SiteChrome'

export const metadata = {
  title: 'K4RAGA',
  description: 'K4RAGA CS training'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@500;700;900&family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SiteChrome />
        {children}
      </body>
    </html>
  )
}
