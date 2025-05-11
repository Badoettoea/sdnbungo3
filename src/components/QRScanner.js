import { useState, useEffect } from 'react'
import styles from '../styles/QRScanner.module.css'

export default function QRScanner({ onScan }) {
  const [scanResult, setScanResult] = useState('')
  const [error, setError] = useState(null)

  const handleScan = (data) => {
    if (data) {
      setScanResult(data)
      onScan(data)
    }
  }

  const handleError = (err) => {
    setError(err)
  }

  return (
    <div className={styles.scannerContainer}>
      <h3>Scan QR Code Siswa</h3>
      {error && <p className={styles.error}>Error: {error.message}</p>}
      <div className={styles.scannerBox}>
        {/* Ini akan diganti dengan implementasi scanner aktual */}
        <div className={styles.scannerPlaceholder}>
          [Scanner akan muncul di sini]
        </div>
      </div>
      {scanResult && (
        <div className={styles.scanResult}>
          Hasil Scan: {scanResult}
        </div>
      )}
    </div>
  )
}