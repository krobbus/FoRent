import { useState } from 'react';
import { getUserFromToken } from './utils/auth';
import type { Role } from './utils/props';

import '../src/styles/App.scss';
import '../src/styles/PropertyGrid.scss'

import Auth from './pages/Auth';
import Marketplace from './pages/Marketplace';
import Properties from './pages/Properties';
import ViewDetails from './pages/ViewDetails';

import ViewProfile from './pages/ViewProfile';
import UpdateProfile from './pages/UpdateProfile';

import AddProperty from './pages/AddProperty';
import UpdateProperty from './pages/UpdateProperty';

import ApplyRental from './pages/ApplyRental';
import RentalApplications from './pages/RentalApplications';

import CreateRequests from './pages/CreateRequests';
import MaintenanceRequests from './pages/MaintenanceRequests';

import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  const [userRole, setUserRole] = useState<Role>(() => {
    return getUserFromToken()?.userRole || null;
  });

  const [userId, setUserId] = useState<number | null>(() => {
    return getUserFromToken()?.userId || null;
  });

  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');

    if (payment === 'success') return 'paymentSuccess';
    if (payment === 'cancel') return 'paymentCancel';
    return 'home';
  });

  const [previousView, setPreviousView] = useState('home')
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const propertyLabel = userRole === 'landlord' ? 'My Properties' : 'My Rentals';

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsNavOpen(false);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'auth':
        return (
          <>
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>Log In/Sign Up</span>
            </div>

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

      case 'viewProfile':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>View Profile</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <a onClick={() => setCurrentView('viewProfile')}>View Profile</a>
              <em>&gt;</em>
              <span className='activeCrumb'>Update Profile</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>{propertyLabel}</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => {
                setSelectedProperty(null);
                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else {
                  setCurrentView('home');
                }
              }}>Home</a>

              <em>&gt;</em>
              
              {(previousView === 'myProperties' || previousView === 'myRentals') && (
                <>
                  <a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}>{propertyLabel}</a>

                  <em>&gt;</em>
                </>
              )}

              <span className='activeCrumb'>View Details</span>
            </div>

            <ViewDetails
              goBack={() => {
                setSelectedProperty(null);

                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else if(previousView === 'myProperties' || 
                  previousView === 'myRentals' || 'rentalApplications' || 'maintenanceRequests' || 'paymentHistory'
                ){
                  setCurrentView(previousView);
                }else {
                  setCurrentView('home');
                }
              }}

              userRole={userRole}
              userId={userId || 0}
              property={selectedProperty}
              onViewApplyRental={() => { 
                setSelectedProperty(selectedProperty); 
                setCurrentView('applyRental'); 
              }}
              onViewRentalApplications={() => {
                setCurrentView('rentalApplications'); 
              }}
            />
          </>
        );

      case 'addProperty':
        if (localStorage.getItem('token') === null) {
          handleLogout();
        }

        return (
          <>
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <a onClick={() => setCurrentView('myProperties')}>{propertyLabel}</a>
              <em>&gt;</em>
              <span className='activeCrumb'>Add New Property</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <a onClick={() => setCurrentView('myProperties')}>{propertyLabel}</a>
              <em>&gt;</em>
              <span className='activeCrumb'>Update Property</span>
            </div>

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
            <div className='navCrumb'>
              &gt;<a onClick={() => {
                setSelectedProperty(null);
                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else {
                  setCurrentView('home');
                }
              }}>Home</a>

              <em>&gt;</em>

              {(
                previousView === 'myProperties' || 
                previousView === 'myRentals' || 
                previousView === 'rentalApplications'
              ) && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}>
                    {previousView === 'rentalApplications' ? 'Rental Applications' : `${propertyLabel}`}
                  </a>
                </>
              )}

              <em>&gt;</em>

              {previousView === 'viewDetails' && (
                <>
                  &gt;<a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView('viewDetails');
                  }}>View Details</a>
                </>
              )}

              <em>&gt;</em>

              <span className='activeCrumb'>Apply for Rental</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>Rental Applications</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 

              <em>&gt;</em>

              {(previousView === 'myProperties' || previousView === 'myRentals' || previousView === 'maintenanceRequests') && (
                <>
                  <a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView(previousView);
                  }}>
                    {previousView === 'maintenanceRequests' ? 'Maintenance Requests' : `${propertyLabel}`}
                  </a>
                </>
              )}

              <em>&gt;</em>

              {previousView === 'viewDetails' && (
                <>
                  <a onClick={() => {
                    setSelectedProperty(null);
                    setCurrentView('viewDetails');
                  }}>View Details</a>
                </>
              )}

              <em>&gt;</em>

              <span className='activeCrumb'>Create Requests</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em> 
              <span className='activeCrumb'>Maintenance Requests</span>
            </div>

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
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>Payment History</span>
            </div>

            <PaymentHistory
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

      case 'paymentSuccess':
        return (
          <>
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>Payment Success</span>
            </div>

            <PaymentSuccess 
              goBack={() => {
                window.history.replaceState({}, '', '/');
                setCurrentView('paymentHistory');
              }}
            />
          </>
        );

      case 'paymentCancel':
        return (
          <>
            <div className='navCrumb'>
              <a onClick={() => setCurrentView('home')}>Home</a> 
              <em>&gt;</em>
              <span className='activeCrumb'>Payment Cancelled</span>
            </div>

            <PaymentCancel
              goBack={() => {
                window.history.replaceState({}, '', '/');
                setCurrentView('paymentHistory');
              }}
            />
          </>
        );

      default:
        return (
          <>
            <div className='headerWrapper'>
              <h1>FoRent</h1>
              <h2>Unlock the Door to Better Living</h2>

              <div className='btnWrapper'>
                {!userRole && (
                  <button onClick={() => setCurrentView('auth')}>Log In / Sign Up</button>
                )}

                <button onClick={() => navigateTo('marketplaceSection')}>See Available Properties</button>
              </div>
            </div>

            <Marketplace
              userId={userId || 0}
              userRole={userRole}
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
              onViewRentalApplications={() => {
                setCurrentView('rentalApplications'); 
              }}
            />
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
    localStorage.clear();
    setCurrentView('home');
    setPreviousView('home');
  }

  return (
    <>
      <nav className={`navbar ${isNavOpen ? 'nav-active' : ''}`}>
        {userRole &&
          <>
            <i className={`fa-solid fa-bars ${isNavOpen ? 'show' : ''}`} onClick={() => setIsNavOpen(!isNavOpen)} />

            <div className={`navTitle ${isNavOpen ? 'show' : ''}`}>
              <img src='/Logo.png' />
              <h2>FoRent</h2>
            </div>
          </>
        }

        <ul className={isNavOpen ? 'show' : ''}>
          {userRole && (
            <>
              <li><a onClick={() => { 
                navigateTo('homeSection'); 
                setIsNavOpen(false); 
              }}>Home</a></li>

              <li><a onClick={() => handleNavClick('viewProfile')}>View Profile</a></li>
              <li><a onClick={() => handleNavClick('updateProfile')}>Update Profile</a></li>

              { userRole === 'landlord' && 
                <>
                  <li><a onClick={() => handleNavClick('myProperties')}>My Properties</a></li>
                  <li><a onClick={() => handleNavClick('addProperty')}>Add New Property</a></li>
                </>
              }
              { userRole === 'tenant' && <li><a onClick={() => handleNavClick('myRentals')}>My Rentals</a></li> }
              
              <li><a onClick={() => handleNavClick('rentalApplications')}>Rental Applications</a></li>
              <li><a onClick={() => handleNavClick('maintenanceRequests')}>Maintenance Requests</a></li>
              <li><a onClick={() => handleNavClick('paymentHistory')}>Payment History</a></li>
              <li><a onClick={() => {
                handleLogout(); 
                setIsNavOpen(false);
              }}>Logout</a></li>
            </>
          )}
        </ul>
      </nav>

      <main>
        {renderMainContent()}
      </main>
    </>  
  )
}

export default App