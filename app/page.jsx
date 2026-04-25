import Link from 'next/link'
import { headers } from 'next/headers'
import BuilderScreen from '@/components/BuilderScreen/BuilderScreen'
import { LANDING_COPY } from '@/lib/copy'
import { isCsHostName } from '@/lib/site-context'
import { TRAINING_OVERVIEW_BLOCKS } from '@/lib/training-data'
import './home.css'

export default function Home() {
  const host = headers().get('host') || ''
  const isCsHost = isCsHostName(host)

  if (isCsHost) {
    return <BuilderScreen />
  }

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-badge">{LANDING_COPY.badge}</div>
        <h1 className="hero-title">{LANDING_COPY.title}</h1>
        <p className="hero-subtitle">{LANDING_COPY.subtitle}</p>
        <div className="hero-actions">
          <a href="https://cs.k4raga.ru/" className="hero-primary">{LANDING_COPY.primaryCta}</a>
          <a href="https://www.twitch.tv/k4ragatv" target="_blank" rel="noreferrer" className="hero-secondary">
            {LANDING_COPY.secondaryCta}
          </a>
        </div>
      </section>

      <section className="overview">
        <div className="section-label">{LANDING_COPY.overviewLabel}</div>
        <div className="overview-grid">
          {LANDING_COPY.cards.map((card) => (
            <article key={card.title} className="overview-card">
              <div className="overview-title">{card.title}</div>
              <p className="overview-text">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="blocks">
        <div className="section-label">{LANDING_COPY.blocksLabel}</div>
        <div className="blocks-list">
          {TRAINING_OVERVIEW_BLOCKS.map((block) => (
            <article key={block.num} className="block-card">
              <div className="block-num">{block.num}</div>
              <div className="block-body">
                <h2 className="block-title">{block.title}</h2>
                <p className="block-desc">{block.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
