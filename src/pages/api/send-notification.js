import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { studentId, message } = req.body

  try {
    // Dapatkan data siswa dan orang tua
    const { data: student, error: studentError } = await supabase
      .from('datasiswa')
      .select('nama, orang_tua')
      .eq('id', studentId)
      .single()

    if (studentError) throw studentError

    // Simpan notifikasi ke database
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        student_id: studentId,
        message,
        status: 'pending'
      })

    if (notifError) throw notifError

    // Di sini seharusnya ada integrasi dengan API WhatsApp/Email
    // Ini hanya simulasi
    console.log(`Mengirim notifikasi ke orang tua ${student.orang_tua}: ${message}`)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    res.status(500).json({ error: error.message })
  }
}