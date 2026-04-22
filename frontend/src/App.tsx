import { useState } from 'react'
import './App.css'
import type { Role } from './pages/props'
import Properties from './pages/properties'
import Auth from './pages/auth'

function App() {
  const [userRole, setUserRole] = useState<Role>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  const handleLogin = () => {
    setShowAuth(true)
  }

  const handleLogout = () => setUserRole(null)

  if (showAuth) {
    return <Auth goBack={() => setShowAuth(false)} setUserRole={setUserRole} setUserId={setUserId} />
  }

  return (
    <section id='landpageContainer'>
      <nav>
        {userRole &&
          <ul>
            <li><a href='#landpageContainer'>Home</a></li>
            { userRole === 'landlord' && 
              <>
                <li><a href='#analyticsContainer'>Analytics</a></li>
                <li><a href='#myPropertiesContainer'>My Properties</a></li>
                <li><a href='#rentalApplicationsContainer'>Rental Applications</a></li>
                <li><a href='#maintenanceRequestsContainer'>Maintenance Requests</a></li>
                <li><a href='#paymentHistoryContainer'>Payment History</a></li>
              </>
            }
            { userRole === 'tenant' && 
              <>
                <li><a href='#profileContainer'>View Profile</a></li>
                <li><a href='#myRentalsContainer'>My Rentals</a></li>
                <li><a href='#rentalApplicationsContainer'>Rental Applications</a></li>
                <li><a href='#maintenanceRequestsContainer'>Maintenance Requests</a></li>
                <li><a href='#paymentHistoryContainer'>Payment History</a></li>
              </>
            }
            <li><a onClick={handleLogout}>Logout</a></li>
          </ul>
        }

        {!userRole &&
          <ul>
            <li><a href='#landpageContainer'>Home</a></li>
            <li><a href='#propertiesContainer'>See Available Properties</a></li>
          </ul>
        }
      </nav>

      {!userRole && 
        <header>
          <div className='headerWrapper'>
            <h1 className='mainTitle'>FoRent</h1>
            <p className='subTitle'>Unlock the Door to Better Living</p>
          </div>

          <div className='btnWrapper'>
            <button onClick={handleLogin}>Login/Sign Up</button>
            <button>See Available Properties</button>
          </div>
        </header>
      }

      <main>
        {userId ? <Properties userRole={userRole} userId={userId} /> : <p>Please log in to manage properties.</p>}
      </main>
    </section>  
  )
}

export default App