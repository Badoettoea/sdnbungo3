import '../styles/globals.css'
import BottomNav from '../components/BottomNav'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function MyApp({ Component, pageProps }) {
  return (
    <div className="app-container">
      <Component {...pageProps} />
      <BottomNav />
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  )
}

export default MyApp