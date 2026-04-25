import { useState } from 'react'
import type { Role } from './pages/props'
import './App.css'
import Marketplace from './pages/Marketplace'
import Properties from './pages/Properties'
import Auth from './pages/Auth'
import ViewProfile from './pages/ViewProfile'
import AddProperty from './pages/AddProperty'
import ViewDetails from './pages/ViewDetails'

function App() {
  const [userRole, setUserRole] = useState<Role>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [currentView, setCurrentView] = useState('home')
  const [previousView, setPreviousView] = useState('home')
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const propertyLabel = userRole === 'landlord' ? 'My Properties' : 'My Rentals';

  const renderMainContent = () => {
    switch (currentView) {
      case 'auth':
        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> Log In/Sign Up </span>
            </span>

            <Auth
              goBack ={() => setCurrentView('home')}
              setUserRole={(role) => {
                setUserRole(role);
                selectedProperty ? setCurrentView('viewDetails') : setCurrentView('home');
              }}
              setUserId={setUserId} 
            />
          </>
        );

      case 'viewProfile':
        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> View Profile </span>
            </span>

            <ViewProfile 
              userRole={userRole} 
              userId={userId || 0} 
            />
          </>
        );
      
      case 'myProperties':
      case 'myRentals':

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> {propertyLabel} </span>
            </span>

            <Properties 
              userRole={userRole} 
              userId={userId || 0} 
              setUserId={setUserId} 
              setUserRole={setUserRole}
              onViewDetails={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('viewDetails');
              }}
            />
          </>
        );

      case 'addProperty':
        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<a onClick={() => setCurrentView('myProperties')}> {propertyLabel} </a>
              &gt;<span className='activeCrumb'> Add New Property </span>
            </span>

            <AddProperty 
              goBack={() => setCurrentView('myProperties')}
              userId={userId || 0} 
            />
          </>
        );

      case 'rentalApplications':
      case 'maintenanceRequests':
      case 'paymentHistory':
      case 'viewAnalytics':
        return (
          <div>
            <h2>
              {currentView === 'rentalApplications' && 'Rental Applications'}
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
          <>
            <span>
              &gt;<a onClick={() => {
                setSelectedProperty(null);
                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else {
                  setCurrentView('home');
                }
              }}> Home </a> 
              
              {(previousView === 'myProperties' || previousView === 'myRentals') && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}> {propertyLabel} </a>
                </>
              )}

              &gt;<span className='activeCrumb'> View Details </span>
            </span>

            <ViewDetails 
              property={selectedProperty}
            />
          </>
        );

      default:
        return (
          <>     
            <header id='homeSection'>
              <div className='headerWrapper'>
                <h1 className='mainTitle'>FoRent</h1>
                <p className='subTitle'>Unlock the Door to Better Living</p>
              </div>

              <div className='btnWrapper'>
                {!userRole && (
                  <button onClick={() => setCurrentView('auth')}>Log In/Sign Up</button>
                )}
                <button onClick={() => navigateTo('availablePropertySection')}>See Available Properties</button>
              </div>
            </header>

            <section id='availablePropertySection'>
              <Marketplace 
                onViewDetails={(prop) => {
                  setSelectedProperty(prop);
                  setPreviousView('home');
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
    setPreviousView('home');
  }

  return (
    <section id='landpageContainer'>
      <nav>
        <ul>
          {userRole && (
            <>
              <li><a onClick={() => navigateTo('homeSection')}>Home</a></li>
              <li><a onClick={() => setCurrentView('viewProfile')}>View Profile</a></li>

              { userRole === 'landlord' && 
                <>
                  <li><a onClick={() => setCurrentView('viewAnalytics')}>Analytics</a></li>
                  <li><a onClick={() => setCurrentView('myProperties')}>My Properties</a></li>
                  <ul>
                    <li><a onClick={() => setCurrentView('addProperty')}>Add New Property</a></li>
                  </ul>
                </>
              }
              { userRole === 'tenant' && <li><a onClick={() => setCurrentView('myRentals')}>My Rentals</a></li> }
              
              <li><a onClick={() => setCurrentView('rentalApplications')}>Rental Applications</a></li>
              <li><a onClick={() => setCurrentView('maintenanceRequests')}>Maintenance Requests</a></li>
              <li><a onClick={() => setCurrentView('paymentHistory')}>Payment History</a></li>
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