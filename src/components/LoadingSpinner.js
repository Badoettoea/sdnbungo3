import styles from '../styles/LoadingSpinner.module.css'

export default function LoadingSpinner({ size = 'medium', color = 'primary' }) {
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size]

  const colorClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    white: styles.white
  }[color]

  return (
    <div className={`${styles.spinnerContainer} ${sizeClass} ${colorClass}`}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Memuat...</p>
    </div>
  )
}