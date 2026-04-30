import { useState } from 'react'
import type { Role } from './pages/props'
import './App.css'

import Auth from './pages/Auth'
import Marketplace from './pages/Marketplace'
import Properties from './pages/Properties'
import ViewDetails from './pages/ViewDetails'

import ViewProfile from './pages/ViewProfile'
import UpdateProfile from './pages/UpdateProfile'

import AddProperty from './pages/AddProperty'
import UpdateProperty from './pages/UpdateProperty'

import ApplyRental from './pages/ApplyRental'
import RentalApplications from './pages/RentalApplications'

import CreateRequests from './pages/CreateRequests'
import MaintenanceRequests from './pages/MaintenanceRequests'

import PaymentHistory from './pages/PaymentHistory'

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
              setUserId={setUserId} 
              setUserRole={(role) => {
                setUserRole(role);
                selectedProperty ? setCurrentView('viewDetails') : setCurrentView('home');
              }}
            />
          </>
        );

      case 'viewAnalytics':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }
        
        return (
          <div>
            <h2>
              {currentView === 'viewAnalytics' && 'Analytics'}
            </h2>
            <p>Content for {currentView} will go here.</p>
          </div>
        );

      case 'viewProfile':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> View Profile </span>
            </span>

            <ViewProfile
              goBack={() => setCurrentView('home')}
              userId={userId || 0}
              userRole={userRole} 
              onUpdateProfile={() => { 
                setPreviousView(currentView);
                setCurrentView('updateProfile');
              }}
            />
          </>
        );

      case 'updateProfile':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<a onClick={() => setCurrentView('viewProfile')}> View Profile </a>
              &gt;<span className='activeCrumb'> Update Profile </span>
            </span>

            <UpdateProfile
              goBack={() => setCurrentView('viewProfile')}
              userId={userId || 0}
              userRole={userRole} 
              onSuccess={() => {
                setCurrentView('viewProfile');
              }}
            />
          </>
        );
      
      case 'myProperties':
      case 'myRentals':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> {propertyLabel} </span>
            </span>

            <Properties
              goBack={() => setCurrentView('home')}
              userId={userId || 0} 
              userRole={userRole} 
              setUserId={setUserId} 
              setUserRole={setUserRole}
              onViewDetails={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('viewDetails');
              }}
              onCreateRequest={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('createRequests');
              }}
              onUpdateProperty={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('updateProperty');
              }}
            />
          </>
        );
      
      case 'viewDetails':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

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
              onViewApplyRental={() => { 
                setSelectedProperty(selectedProperty); 
                setCurrentView('applyRental'); 
              }}
              
              goBack={() => {
                setSelectedProperty(null);

                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else if(previousView === 'myProperties' || 
                  previousView === 'myRentals' || 
                  previousView === 'rentalApplications' ||
                  previousView === 'maintenanceRequests'
                ){
                  setCurrentView(previousView);
                }else {
                  setCurrentView('home');
                }
              }}

              property={selectedProperty}
            />
          </>
        );

      case 'addProperty':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

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
        
      case 'updateProperty':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<a onClick={() => setCurrentView('myProperties')}> {propertyLabel} </a>
              &gt;<span className='activeCrumb'> Update Property </span>
            </span>

            <UpdateProperty 
              goBack={() => setCurrentView('myProperties')}
              property={selectedProperty}
              onSuccess={() => {
                setSelectedProperty(null);
                setCurrentView('myProperties');
              }}
            />
          </>
        );
      
      case 'applyRental':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

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
              
              {(previousView === 'myProperties' || previousView === 'myRentals' || previousView === 'rentalApplications') && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}>
                    {previousView === 'rentalApplications' ? 'Rental Applications' : `${propertyLabel}`}
                  </a>
                </>
              )}

              {previousView === 'viewDetails' && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView('viewDetails');
                  }}> View Details </a>
                </>
              )}

              &gt;<span className='activeCrumb'> Apply for Rental </span>
            </span>

            <ApplyRental
              property={selectedProperty}
              userId={userId || 0}
              userRole={userRole}
              onSuccess={() => setCurrentView('rentalApplications')}
              onCancel={() => {
                setSelectedProperty(null);

                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else if(previousView === 'myProperties' || previousView === 'myRentals'){
                  setCurrentView('myProperties');
                } else if(previousView === 'viewDetails') {
                  setCurrentView('viewDetails');
                } else {
                  setCurrentView('home');
                }
              }}
            />
          </>
        );

      case 'rentalApplications':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> Rental Applications </span>
            </span>

            <RentalApplications
              goBack={() => setCurrentView('home')}
              userId={userId || 0} 
              userRole={userRole}
              onViewDetails={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('viewDetails');
              }}
            />
          </>
        );

      case 'createRequests':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => { setCurrentView('home')}}> Home </a>

              {(previousView === 'myProperties' || previousView === 'myRentals' || previousView === 'maintenanceRequests') && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}>
                    {previousView === 'maintenanceRequests' ? 'Maintenance Requests' : `${propertyLabel}`}
                  </a>
                </>
              )}

              {previousView === 'viewDetails' && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView('viewDetails');
                  }}> View Details </a>
                </>
              )}

              &gt;<span className='activeCrumb'> Create Requests </span>
            </span>

            <CreateRequests
              property={selectedProperty}
              userId={userId || 0}
              userRole={userRole}
              onSuccess={() => setCurrentView('maintenanceRequests')}
              onCancel={() => {
                if(previousView === 'myProperties' || previousView === 'myRentals'){
                  setCurrentView('myProperties');
                } else if(previousView === 'viewDetails') {
                  setCurrentView('viewDetails');
                } else {
                  setCurrentView('home');
                }
              }}
            />
          </>
        );
      
      case 'maintenanceRequests':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> Maintenance Requests </span>
            </span>

            <MaintenanceRequests
              goBack={() => setCurrentView('home')}
              userId={userId || 0}
              userRole={userRole}
              onViewDetails={(prop) => { 
                setSelectedProperty(prop);
                setPreviousView(currentView);
                setCurrentView('viewDetails');
              }}
            />
          </>
        );
      
      case 'paymentHistory':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <span>
              &gt;<a onClick={() => setCurrentView('home')}> Home </a> 
              &gt;<span className='activeCrumb'> Payment History </span>
            </span>

            <PaymentHistory
              goBack={() => setCurrentView('home')}
              userId={userId || 0}
              userRole={userRole}
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
                property={selectedProperty}
                onViewApplyRental={(prop) => {
                  setSelectedProperty(prop);
                  setPreviousView('home');
                  setCurrentView('applyRental');
                }}
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
    localStorage.removeItem('token');
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
              <ul>
                <li><a onClick={() => setCurrentView('updateProfile')}>Update Profile</a></li>
              </ul>

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