import { useEffect, useState } from 'react'
import { isURL } from '../utils/qr'
import { fetchOGP, OGPData } from '../utils/ogp'
import styles from './ResultCard.module.css'

export interface QRResult {
  id: string
  text: string
  imageUrl: string
  timestamp: Date
}

interface Props {
  result: QRResult
}

export function ResultCard({ result }: Props) {
  const { text, imageUrl, timestamp } = result
  const isLink = isURL(text)
  const [ogp, setOgp] = useState<OGPData | null>(null)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    if (!isLink) return
    fetchOGP(text)
      .then(data => {
        if (data.title || data.description || data.image) {
          setOgp(data)
        }
      })
      .catch(() => {})
  }, [text, isLink])

  const timeStr = timestamp.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.qrThumb} onClick={() => setShowImage(v => !v)} title="QR画像を表示">
          <img src={imageUrl} alt="QR code" />
          <span className={styles.qrLabel}>QR</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.time}>{timeStr}</span>
          {isLink && <span className={styles.badge}>URL</span>}
        </div>
      </div>

      {showImage && (
        <div className={styles.imagePreview}>
          <img src={imageUrl} alt="QR code full" />
        </div>
      )}

      <div className={styles.content}>
        {isLink ? (
          <a href={text} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {text}
          </a>
        ) : (
          <p className={styles.text}>{text}</p>
        )}
      </div>

      {ogp && (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ogpCard}
        >
          {ogp.image && (
            <div className={styles.ogpImage}>
              <img src={ogp.image} alt={ogp.title ?? ''} onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }} />
            </div>
          )}
          <div className={styles.ogpBody}>
            {ogp.siteName && <p className={styles.ogpSite}>{ogp.siteName}</p>}
            {ogp.title && <p className={styles.ogpTitle}>{ogp.title}</p>}
            {ogp.description && <p className={styles.ogpDesc}>{ogp.description}</p>}
          </div>
        </a>
      )}
    </div>
  )
}
