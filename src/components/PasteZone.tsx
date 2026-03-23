import { useEffect, useRef, useState } from 'react'
import { decodeQRFromFile } from '../utils/qr'
import styles from './PasteZone.module.css'

interface Props {
  onResult: (text: string, imageUrl: string) => void
}

export function PasteZone({ onResult }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const zoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (!item.type.startsWith('image/')) continue
        const file = item.getAsFile()
        if (!file) continue

        setStatus('loading')
        setErrorMsg('')

        const imageUrl = URL.createObjectURL(file)

        try {
          const text = await decodeQRFromFile(file)
          onResult(text, imageUrl)
          setStatus('idle')
        } catch (err) {
          URL.revokeObjectURL(imageUrl)
          setStatus('error')
          setErrorMsg(err instanceof Error ? err.message : '読み取りに失敗しました')
          setTimeout(() => setStatus('idle'), 3000)
        }
        break
      }
    }

    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [onResult])

  return (
    <div
      ref={zoneRef}
      className={`${styles.zone} ${status === 'loading' ? styles.loading : ''} ${status === 'error' ? styles.error : ''}`}
      tabIndex={0}
    >
      {status === 'idle' && (
        <>
          <div className={styles.icon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 2H15M9 2C9 2 9 4 9 6H15C15 4 15 2 15 2M9 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2H15" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="8" y="10" width="3" height="3" rx="0.5"/>
              <rect x="13" y="10" width="3" height="3" rx="0.5"/>
              <rect x="8" y="15" width="3" height="3" rx="0.5"/>
              <path d="M13 15.5H16" strokeLinecap="round"/>
              <path d="M15 15.5V18" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={styles.label}>QRコード画像を貼り付け</p>
          <p className={styles.hint}>
            <kbd>Ctrl</kbd> + <kbd>V</kbd> でスクリーンショットを貼り付けてください
          </p>
        </>
      )}
      {status === 'loading' && (
        <>
          <div className={styles.spinner} />
          <p className={styles.label}>読み取り中...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className={styles.errorIcon}>✕</div>
          <p className={styles.label}>{errorMsg}</p>
        </>
      )}
    </div>
  )
}
