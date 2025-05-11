import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Home.module.css'
import LoadingSpinner from '../components/LoadingSpinner' // Pastikan file ini ada

export default function Home() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Sekolah Kita - Beranda</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Selamat Datang</h1>
        
        <div className={styles.newsSection}>
          <h2>Pengumuman Terbaru</h2>
          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner size="large" color="primary" />
            </div>
          ) : (
            <div className={styles.newsList}>
              {news.map(item => (
                <div key={item.id} className={styles.newsCard}>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <small>{new Date(item.created_at).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.quickLinks}>
          <h2>Akses Cepat</h2>
          <div className={styles.linkGrid}>
            <a href="/students" className={styles.linkCard}>
              <span>📋</span>
              <p>Data Siswa</p>
            </a>
            <a href="/gallery" className={styles.linkCard}>
              <span>📸</span>
              <p>Galeri</p>
            </a>
            <a href="/alumni" className={styles.linkCard}>
              <span>🎓</span>
              <p>Alumni</p>
            </a>
            <a href="/attendance" className={styles.linkCard}>
              <span>✅</span>
              <p>Presensi</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}