import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styles from '../styles/Attendance.module.css'

export default function Attendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)

  useEffect(() => {
    checkUserRole()
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('dataguru')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (data) setIsTeacher(true)
    }
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas', { ascending: true })
      
      if (error) throw error
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('datasiswa')
        .select('id, nama, nis')
        .eq('kelas', selectedClass)
        .order('nama', { ascending: true })
      
      if (error) throw error
      setStudents(data)

      // Initialize attendance status
      const initialAttendance = {}
      data.forEach(student => {
        initialAttendance[student.id] = 'present' // default to present
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error fetching students:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const submitAttendance = async () => {
    if (!selectedClass) {
      toast.error('Pilih kelas terlebih dahulu')
      return
    }

    try {
      setLoading(true)
      const attendanceDate = new Date().toISOString().split('T')[0]
      
      // Prepare attendance records
      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        date: attendanceDate,
        status,
        kelas: selectedClass
      }))

      // Insert to Supabase
      const { error } = await supabase
        .from('presensi')
        .upsert(attendanceRecords)
      
      if (error) throw error
      
      toast.success('Presensi berhasil disimpan')
      
      // TODO: Send notifications for absent students
      const absentStudents = students.filter(s => attendance[s.id] !== 'present')
      if (absentStudents.length > 0) {
        // This would be replaced with actual notification logic
        console.log('Notifying parents of absent students:', absentStudents)
      }
    } catch (error) {
      console.error('Error submitting attendance:', error.message)
      toast.error('Gagal menyimpan presensi')
    } finally {
      setLoading(false)
    }
  }

  if (!isTeacher) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Presensi | Sekolah Kita</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main className={styles.main}>
          <h1>Presensi Siswa</h1>
          <p>Hanya wali kelas yang dapat mengakses halaman ini.</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Presensi | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Presensi Siswa</h1>
        
        <div className={styles.controls}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={styles.classSelect}
            disabled={loading}
          >
            <option value="">Pilih Kelas</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.nama_kelas}>{cls.nama_kelas}</option>
            ))}
          </select>

          <button 
            onClick={submitAttendance}
            disabled={loading || !selectedClass}
            className={styles.submitButton}
          >
            {loading ? 'Menyimpan...' : 'Simpan Presensi'}
          </button>
        </div>

        {loading && selectedClass ? (
          <div className={styles.loading}>Memuat data siswa...</div>
        ) : (
          selectedClass && (
            <div className={styles.attendanceTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Nama Siswa</div>
                <div className={styles.headerCell}>NIS</div>
                <div className={styles.headerCell}>Kehadiran</div>
              </div>
              
              {students.map(student => (
                <div key={student.id} className={styles.tableRow}>
                  <div className={styles.cell}>{student.nama}</div>
                  <div className={styles.cell}>{student.nis}</div>
                  <div className={styles.cell}>
                    <select
                      value={attendance[student.id] || 'present'}
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="present">Hadir</option>
                      <option value="sick">Sakit</option>
                      <option value="permit">Izin</option>
                      <option value="absent">Alpa</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  )
}