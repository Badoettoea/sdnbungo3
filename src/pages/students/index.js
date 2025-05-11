import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import styles from '../../styles/StudentsList.module.css'

export default function StudentsList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState('')
  const router = useRouter()
  const observer = useRef()
  const loadingRef = useRef()

  const PAGE_SIZE = 50

  useEffect(() => {
    fetchStudents(true)
  }, [filter])

  const fetchStudents = async (reset = false) => {
    if (reset) {
      setPage(0)
      setHasMore(true)
    }

    try {
      setLoading(true)
      const currentPage = reset ? 0 : page
      
      let query = supabase
        .from('datasiswa')
        .select('id, nama, nis, kelas, foto_path')
        .order('nama', { ascending: true })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

      if (filter) {
        query = query.or(`nama.ilike.%${filter}%,nis.ilike.%${filter}%,kelas.ilike.%${filter}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      if (reset) {
        setStudents(data)
      } else {
        setStudents(prev => [...prev, ...data])
      }

      setHasMore(data.length === PAGE_SIZE)
      if (!reset) setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching students:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasMore || loading) return

    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchStudents()
      }
    }, options)

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current)
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [loading, hasMore])

  return (
    <div className={styles.container}>
      <Head>
        <title>Data Siswa | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Data Siswa</h1>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Cari siswa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.studentsGrid}>
          {students.map(student => (
            <motion.div
              key={student.id}
              className={styles.studentCard}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <div className={styles.studentPhoto}>
                {student.foto_path ? (
                  <img 
                    src={`https://dswzjhefngrgzowcilll.supabase.co/storage/v1/object/public/student-photos/${student.foto_path}`}
                    alt={`Foto ${student.nama}`}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div className={styles.studentInfo}>
                <h3>{student.nama}</h3>
                <p>NIS: {student.nis}</p>
                <p>Kelas: {student.kelas}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && <div className={styles.loading}>Memuat...</div>}
        {!loading && hasMore && (
          <div ref={loadingRef} className={styles.loading}>Memuat lebih banyak...</div>
        )}
      </main>
    </div>
  )
}