import { useState } from 'react'
import './App.css'
import type { Role } from './pages/props'
import Properties from './pages/Properties'
import Auth from './pages/Auth'
import ViewProfile from './pages/ViewProfile'
import AddProperty from './pages/AddProperty'
import ViewDetails from './pages/ViewDetails'

function App() {
  const [userRole, setUserRole] = useState<Role>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const renderMainContent = () => {
    switch (currentView) {
      case 'auth':
        return (
          <Auth 
            goBack={() => setCurrentView('home')} 
            setUserRole={(role) => {
              setUserRole(role);
              selectedProperty ? setCurrentView('viewDetails') : setCurrentView('home');
            }}
            setUserId={setUserId} 
          />
        );

      case 'viewProfile':
        return <ViewProfile goBack={() => setCurrentView('home')} userRole={userRole} userId={userId || 0} />;
      
      case 'myProperties':
      case 'myRentals':
        return <Properties 
          goBack={() => setCurrentView('home')} 
          userRole={userRole} userId={userId || 0} 
          setUserId={setUserId} 
          setUserRole={setUserRole}
          onViewDetails={(prop) => { 
            setSelectedProperty(prop);
            setCurrentView('viewDetails');
          }}
        />;

      case 'addProperty':
        return <AddProperty goBack={() => setCurrentView('myProperties')} userRole={userRole} userId={userId || 0} />;

      case 'rentalApplications':
      case 'maintenanceRequests':
      case 'paymentHistory':
      case 'viewAnalytics':
        return (
          <div>
            <h2>{currentView === 'rentalApplications' && 'Rental Applications'}
                {currentView === 'maintenanceRequests' && 'Maintenance Requests'}
                {currentView === 'paymentHistory' && 'Payment History'}
                {currentView === 'viewAnalytics' && 'Analytics'}
            </h2>
            <p>Content for {currentView} will go here.</p>
          </div>
        );

      case 'viewDetails':
        if (!userRole) {
          setCurrentView('auth');
          return null;
        }

        return (
          <ViewDetails 
            property={selectedProperty} 
            goBack={() => {
              setSelectedProperty(null);
              setCurrentView('home');
            }}
            userRole={userRole}
          />
        );

      default:
        return (
          <>
            {!userRole && (
              <header id='homeSection'>
                <div className='headerWrapper'>
                  <h1 className='mainTitle'>FoRent</h1>
                  <p className='subTitle'>Unlock the Door to Better Living</p>
                </div>

                <div className='btnWrapper'>
                  <button onClick={() => setCurrentView('auth')}>Log In/Sign Up</button>
                  <button onClick={() => navigateTo('availablePropertySection')}>See Available Properties</button>
                </div>
              </header>
            )}

            <section id='availablePropertySection'>
              <Properties 
                goBack={() => setCurrentView('home')} 
                userRole={userRole} 
                userId={userId || 0} 
                setUserId={setUserId} 
                setUserRole={setUserRole}
                onViewDetails={(prop) => {
                  setSelectedProperty(prop);
                  setCurrentView('viewDetails');
                }}
              />
            </section>
          </>
        );
    }
  }

  const navigateTo = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
    
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleLogout = () => {
    setUserRole(null); 
    setUserId(null); 
    localStorage.removeItem('user');
    setCurrentView('home');
  }

  return (
    <section id='landpageContainer'>
      <nav>
        <ul>
          {userRole && (
            <>
              <li><a onClick={() => navigateTo('homeSection')}>Home</a></li>

              { userRole === 'landlord' && 
                <>
                  <li><a onClick={() => setCurrentView('viewAnalytics')}>Analytics</a></li>
                  <li><a onClick={() => setCurrentView('viewProfile')}>View Profile</a></li>
                  <li><a onClick={() => setCurrentView('myProperties')}>My Properties</a></li>
                  <ul>
                    <li><a onClick={() => setCurrentView('addProperty')}>Add New Property</a></li>
                  </ul>
                  <li><a onClick={() => setCurrentView('rentalApplications')}>Rental Applications</a></li>
                  <li><a onClick={() => setCurrentView('maintenanceRequests')}>Maintenance Requests</a></li>
                  <li><a onClick={() => setCurrentView('paymentHistory')}>Payment History</a></li>
                </>
              }

              { userRole === 'tenant' && 
                <>
                  <li><a onClick={() => setCurrentView('viewProfile')}>View Profile</a></li>
                  <li><a onClick={() => setCurrentView('myRentals')}>My Rentals</a></li>
                  <li><a onClick={() => setCurrentView('rentalApplications')}>Rental Applications</a></li>
                  <li><a onClick={() => setCurrentView('maintenanceRequests')}>Maintenance Requests</a></li>
                  <li><a onClick={() => setCurrentView('paymentHistory')}>Payment History</a></li>
                </>
              }

              <li><a onClick={() => navigateTo('availablePropertySection')}>See Available Properties</a></li>
              <li><a onClick={handleLogout}>Logout</a></li>
            </>
          )}
        </ul>
      </nav>

      <main>
        {renderMainContent()}
      </main>
    </section>  
  )
}

export default App