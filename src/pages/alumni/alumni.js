import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Alumni.module.css'

export default function Alumni() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAlumni()
  }, [yearFilter, searchTerm])

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('alumni')
        .select('*')
        .order('graduation_year', { ascending: false })
        .order('name', { ascending: true })

      if (yearFilter) {
        query = query.eq('graduation_year', yearFilter)
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,current_job.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setAlumni(data)
    } catch (error) {
      console.error('Error fetching alumni:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Get unique graduation years for filter
  const graduationYears = [...new Set(alumni.map(a => a.graduation_year))].sort((a, b) => b - a)

  return (
    <div className={styles.container}>
      <Head>
        <title>Alumni | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Data Alumni</h1>
        
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Cari alumni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={styles.yearSelect}
          >
            <option value="">Semua Angkatan</option>
            {graduationYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Memuat...</div>
        ) : (
          <div className={styles.alumniGrid}>
            {alumni.map(alumnus => (
              <div key={alumnus.id} className={styles.alumniCard}>
                <div className={styles.alumniPhoto}>
                  {alumnus.photo_url ? (
                    <img src={alumnus.photo_url} alt={`Foto ${alumnus.name}`} />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className={styles.alumniInfo}>
                  <h3>{alumnus.name}</h3>
                  <p>Lulus: {alumnus.graduation_year}</p>
                  {alumnus.university && <p>Perguruan Tinggi: {alumnus.university}</p>}
                  {alumnus.current_job && <p>Pekerjaan: {alumnus.current_job}</p>}
                  {alumnus.achievements && <p>Prestasi: {alumnus.achievements}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}