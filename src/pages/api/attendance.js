import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { date, studentId, status, teacherId } = req.body;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          date,
          student_id: studentId,
          status,
          recorded_by: teacherId
        });

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    // Handle GET request for attendance data
    const { date, classId } = req.query;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students:student_id (name, nis, class)
        `)
        .eq('date', date)
        .eq('students.class', classId);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}