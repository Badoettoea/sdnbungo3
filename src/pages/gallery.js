import { useState, useEffect } from 'react'
import Head from 'next/head'
import SwipeableViews from 'react-swipeable-views'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Gallery.module.css'

export default function Gallery() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAlbums(data)
    } catch (error) {
      console.error('Error fetching albums:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Galeri Sekolah | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Galeri Sekolah</h1>
        
        {loading ? (
          <div className={styles.loading}>Memuat...</div>
        ) : (
          <div className={styles.galleryContainer}>
            <div className={styles.albumTabs}>
              {albums.map((album, index) => (
                <button
                  key={album.id}
                  className={`${styles.albumTab} ${activeIndex === index ? styles.active : ''}`}
                  onClick={() => setActiveIndex(index)}
                >
                  {album.name}
                </button>
              ))}
            </div>

            <SwipeableViews
              index={activeIndex}
              onChangeIndex={setActiveIndex}
              className={styles.swipeableViews}
            >
              {albums.map(album => (
                <div key={album.id} className={styles.albumContent}>
                  <h2>{album.name}</h2>
                  <p>{album.description}</p>
                  
                  <div className={styles.photosGrid}>
                    {album.photos?.map(photo => (
                      <div key={photo.id} className={styles.photoItem}>
                        <img 
                          src={`https://dswzjhefngrgzowcilll.supabase.co/storage/v1/object/public/gallery/${photo.path}`}
                          alt={photo.caption}
                          className={styles.photoImage}
                        />
                        {photo.caption && <p className={styles.photoCaption}>{photo.caption}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </SwipeableViews>
          </div>
        )}
      </main>
    </div>
  )
}