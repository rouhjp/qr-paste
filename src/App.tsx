import { useCallback, useState } from 'react'
import { PasteZone } from './components/PasteZone'
import { ResultCard, QRResult } from './components/ResultCard'
import styles from './App.module.css'

export default function App() {
  const [results, setResults] = useState<QRResult[]>([])

  const handleResult = useCallback((text: string, imageUrl: string) => {
    const result: QRResult = {
      id: crypto.randomUUID(),
      text,
      imageUrl,
      timestamp: new Date(),
    }
    setResults(prev => [result, ...prev])
  }, [])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h2" strokeLinecap="round"/>
          </svg>
          QR Paste
        </div>
        {results.length > 0 && (
          <span className={styles.count}>{results.length} 件</span>
        )}
      </header>

      <main className={styles.main}>
        <div className={styles.feed}>
          <PasteZone onResult={handleResult} />

          {results.length === 0 && (
            <div className={styles.empty}>
              <p>QRコード画像を貼り付けると結果がここに表示されます</p>
            </div>
          )}

          {results.map(r => (
            <ResultCard key={r.id} result={r} />
          ))}
        </div>
      </main>
    </div>
  )
}
