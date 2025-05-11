import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/BottomNav.module.css'

export default function BottomNav() {
  const router = useRouter()

  const isActive = (path) => {
    return router.pathname === path ? styles.active : ''
  }

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${isActive('/')}`}>
        <span className={styles.navIcon}>🏠</span>
        <span className={styles.navLabel}>Beranda</span>
      </Link>
      
      <Link href="/students" className={`${styles.navItem} ${isActive('/students')}`}>
        <span className={styles.navIcon}>👥</span>
        <span className={styles.navLabel}>Siswa</span>
      </Link>
      
      <Link href="/gallery" className={`${styles.navItem} ${isActive('/gallery')}`}>
        <span className={styles.navIcon}>📸</span>
        <span className={styles.navLabel}>Galeri</span>
      </Link>
      
      <Link href="/alumni" className={`${styles.navItem} ${isActive('/alumni')}`}>
        <span className={styles.navIcon}>🎓</span>
        <span className={styles.navLabel}>Alumni</span>
      </Link>
      
      <Link href="/map" className={`${styles.navItem} ${isActive('/map')}`}>
        <span className={styles.navIcon}>🗺️</span>
        <span className={styles.navLabel}>Peta</span>
      </Link>
    </nav>
  )
}