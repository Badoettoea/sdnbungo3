import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'
import QRCode from 'react-qr-code'
import styles from '../../styles/StudentProfile.module.css'

export default function StudentProfile() {
  const router = useRouter()
  const { id } = router.query
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileUrl, setProfileUrl] = useState('')

  useEffect(() => {
    if (id) fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('datasiswa')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setStudent(data)

      // Get profile picture URL
      if (data.foto_path) {
        const { data: urlData } = await supabase
          .storage
          .from('student-photos')
          .createSignedUrl(data.foto_path, 3600)
        
        setProfileUrl(urlData?.signedUrl || '')
      }
    } catch (error) {
      console.error('Error fetching student:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className={styles.container}>Memuat...</div>
  if (!student) return <div className={styles.container}>Siswa tidak ditemukan</div>

  return (
    <div className={styles.container}>
      <Head>
        <title>Profil {student.nama} | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <div className={styles.photoContainer}>
            {profileUrl ? (
              <img src={profileUrl} alt={`Foto ${student.nama}`} className={styles.profilePhoto} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span>📷</span>
              </div>
            )}
            <button 
              className={styles.uploadButton}
              onClick={() => document.getElementById('photoUpload').click()}
            >
              Ambil Foto
            </button>
            <input 
              id="photoUpload"
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <h1 className={styles.studentName}>{student.nama}</h1>
          <div className={styles.qrCode}>
            <QRCode 
              value={`${window.location.origin}/students/${student.id}`}
              size={128}
              level="H"
            />
          </div>
        </div>

        <div className={styles.detailsSection}>
          <h2>Informasi Pribadi</h2>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>NIS:</span>
            <span className={styles.detailValue}>{student.nis}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>NISN:</span>
            <span className={styles.detailValue}>{student.nisn}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>TTL:</span>
            <span className={styles.detailValue}>{student.tempat_lahir}, {new Date(student.tanggal_lahir).toLocaleDateString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Kelas:</span>
            <span className={styles.detailValue}>{student.kelas}</span>
          </div>
        </div>

        <div className={styles.attendanceSection}>
          <h2>Presensi Terakhir</h2>
          {/* Attendance data would go here */}
        </div>
      </main>
    </div>
  )

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${student.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Update student record with new photo path
      const { error: updateError } = await supabase
        .from('datasiswa')
        .update({ foto_path: filePath })
        .eq('id', student.id)

      if (updateError) throw updateError

      // Refresh the photo
      const { data: urlData } = await supabase
        .storage
        .from('student-photos')
        .createSignedUrl(filePath, 3600)
      
      setProfileUrl(urlData?.signedUrl || '')
    } catch (error) {
      console.error('Error uploading photo:', error.message)
      alert('Gagal mengupload foto')
    }
  }
}