import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from '../styles/components/Modal.module.css';

export default function PhotoUploadModal({ studentId, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('student-photos')
        .upload(fileName, file);

      if (error) throw error;
      
      onUploadSuccess(fileName);
      onClose();
    } catch (error) {
      console.error('Upload error:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Upload Foto Profil</h3>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className={styles.modalActions}>
          <button onClick={onClose}>Batal</button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Mengupload...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}