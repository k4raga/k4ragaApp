import Link from 'next/link'
import './home.css'

const BLOCKS = [
  {
    num: '01',
    title: 'Аим',
    desc: 'Постановка прицела, хедшоты и флик-шоты перед каткой.'
  },
  {
    num: '02',
    title: 'Мувмент',
    desc: 'Контрастрейф, пики и контроль движения без суеты.'
  },
  {
    num: '03',
    title: 'Пистолеты и автоматы',
    desc: 'Короткий проход по оружию, которое чаще всего решает начало матча.'
  },
  {
    num: '04',
    title: 'Снайпинг и добивка',
    desc: 'AWP, SSG и финальный блок, который собирает форму.'
  }
]

export default function Home() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-badge">CS TRAINING SYSTEM</div>
        <h1 className="hero-title">K4RAGA</h1>
        <p className="hero-subtitle">
          Две страницы. Никакого календаря, дат и лишней возни.
          Только разводная и детальная CS-тренировка.
        </p>
        <div className="hero-actions">
          <Link href="/training" className="hero-primary">Открыть тренировку</Link>
          <a href="https://www.twitch.tv/k4ragatv" target="_blank" rel="noreferrer" className="hero-secondary">
            Twitch
          </a>
        </div>
      </section>

      <section className="overview">
        <div className="section-label">КАК ЭТО УСТРОЕНО</div>
        <div className="overview-grid">
          <article className="overview-card">
            <div className="overview-title">Главная</div>
            <p className="overview-text">
              Коротко объясняет, из каких блоков состоит тренировка и куда нажимать.
            </p>
          </article>
          <article className="overview-card">
            <div className="overview-title">Тренировка</div>
            <p className="overview-text">
              Одна детальная страница, где ты проходишь все упражнения по порядку и отмечаешь прогресс.
            </p>
          </article>
        </div>
      </section>

      <section className="blocks">
        <div className="section-label">БЛОКИ ТРЕНИРОВКИ</div>
        <div className="blocks-list">
          {BLOCKS.map((block) => (
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
