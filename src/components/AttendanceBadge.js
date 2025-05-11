import styles from '../styles/components/Badge.module.css';

export default function AttendanceBadge({ status }) {
  const statusClass = {
    Hadir: styles.present,
    Sakit: styles.sick,
    Izin: styles.permit,
    Alpa: styles.absent
  }[status];

  return (
    <span className={`${styles.badge} ${statusClass}`}>
      {status}
    </span>
  );
}