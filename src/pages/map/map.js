import { useState, useEffect } from 'react'
import Head from 'next/head'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Map.module.css'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const center = {
  lat: -6.7729486, // Default to Jakarta, replace with your school's coordinates
  lng: 110.6300627
}

export default function SchoolMap() {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('school_locations')
        .select('*')
      
      if (error) throw error
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Peta Sekolah | Sekolah Kita</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Peta Sekolah</h1>
        
        {loading ? (
          <div className={styles.loading}>Memuat peta...</div>
        ) : (
          <div className={styles.mapContainer}>
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={17}
              >
                {locations.map(location => (
                  <Marker
                    key={location.id}
                    position={{ lat: location.latitude, lng: location.longitude }}
                    onClick={() => setSelectedLocation(location)}
                    icon={{
                      url: getIconForLocation(location.type),
                      scaledSize: new window.google.maps.Size(32, 32)
                    }}
                  />
                ))}

                {selectedLocation && (
                  <InfoWindow
                    position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                    onCloseClick={() => setSelectedLocation(null)}
                  >
                    <div className={styles.infoWindow}>
                      <h3>{selectedLocation.name}</h3>
                      <p>{selectedLocation.description}</p>
                      {selectedLocation.photo_url && (
                        <img 
                          src={selectedLocation.photo_url} 
                          alt={selectedLocation.name}
                          className={styles.locationPhoto}
                        />
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        <div className={styles.legend}>
          <h3>Keterangan:</h3>
          <div className={styles.legendItem}>
            <img src="/icons/classroom.png" alt="Kelas" className={styles.legendIcon} />
            <span>Ruang Kelas</span>
          </div>
          <div className={styles.legendItem}>
            <img src="/icons/lab.png" alt="Lab" className={styles.legendIcon} />
            <span>Laboratorium</span>
          </div>
          <div className={styles.legendItem}>
            <img src="/icons/library.png" alt="Perpustakaan" className={styles.legendIcon} />
            <span>Perpustakaan</span>
          </div>
          <div className={styles.legendItem}>
            <img src="/icons/office.png" alt="Kantor" className={styles.legendIcon} />
            <span>Kantor</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function getIconForLocation(type) {
  switch(type) {
    case 'classroom': return '/icons/classroom.png'
    case 'lab': return '/icons/lab.png'
    case 'library': return '/icons/library.png'
    case 'office': return '/icons/office.png'
    default: return '/icons/marker.png'
  }
}