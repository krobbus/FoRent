import { useState, useEffect } from 'react';
import { getUserFromToken } from './utils/auth';
import type { Role, Crumb } from './utils/props';

import '../src/styles/App.scss';
import '../src/styles/Auth.scss';
import '../src/styles/PropertySearch.scss';
import '../src/styles/PropertyGallery.scss';
import '../src/styles/PropertyGrid.scss';
import '../src/styles/ViewDetails.scss';
import '../src/styles/ViewProfile.scss';
import '../src/styles/UpdateProfile.scss';
import '../src/styles/TableView.scss';

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

function NavCrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;

  return (
    <div className='navCrumb'>
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {i > 0 && <em>&gt;</em>}
          {crumb.onClick
            ? <a className='backCrumb' onClick={crumb.onClick}>{crumb.label}</a>
            : <span className='activeCrumb'>{crumb.label}</span>
          }
        </span>
      ))}
    </div>
  );
}

function App() {
  const [userRole, setUserRole] = useState<Role>(() => { return getUserFromToken()?.userRole || null; });
  const [userId, setUserId] = useState<number | null>(() => { return getUserFromToken()?.userId || null; });
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');

    if (payment === 'success') return 'paymentSuccess';
    if (payment === 'cancel') return 'paymentCancel';
    return 'home';
  });
  const [previousView, setPreviousView] = useState('home');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const propertyLabel = userRole === 'landlord' ? 'My Properties' : 'My Rentals';
  const propertyView  = userRole === 'landlord' ? 'myProperties'  : 'myRentals';

  const navigateTo = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsNavOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null); 
    setUserId(null);
    localStorage.clear();
    setCurrentView('home');
    setPreviousView('home');
  }

  const requireAuth = () => {
    if (!localStorage.getItem('token')) {
      setCurrentView('auth');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const handleUnauthorized = () => handleLogout();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const getBreadcrumbs = (): Crumb[] => {
    const home: Crumb = { 
      label: 'Home', 
      onClick: () => setCurrentView('home') 
    };
    const propertyParent: Crumb = {
      label: propertyLabel,
      onClick: () => { setSelectedProperty(null); setCurrentView(propertyView); }
    };
    const viewDetailsCrumb: Crumb = {
      label: 'View Details',
      onClick: () => setCurrentView('viewDetails')
    };
    const maintenanceCrumb: Crumb = {
      label: 'Maintenance Requests',
      onClick: () => { setSelectedProperty(null); setCurrentView('maintenanceRequests'); }
    };
    const rentalAppCrumb: Crumb = {
      label: 'Rental Applications',
      onClick: () => { setSelectedProperty(null); setCurrentView('rentalApplications'); }
    };

    switch (currentView) {
      case 'auth': return [home, { label: 'Log In / Sign Up' }];
      case 'viewProfile': return [home, { label: 'View Profile' }];
      case 'updateProfile': return [home, { label: 'View Profile', onClick: () => setCurrentView('viewProfile') }, { label: 'Update Profile' }];
      case 'myProperties':
      case 'myRentals': return [home, { label: propertyLabel }];

      case 'addProperty': return [home, propertyParent, { label: 'Add New Property' }];
      case 'updateProperty': return [home, propertyParent, { label: 'Update Property' }];

      case 'viewDetails': {
        const fromProperty = previousView === 'myProperties' || previousView === 'myRentals';
        return [home, ...(fromProperty ? [propertyParent] : []), { label: 'View Details' }];
      }

      case 'applyRental': {
        const fromProperty    = previousView === 'myProperties' || previousView === 'myRentals';
        const fromRentalApps  = previousView === 'rentalApplications';
        const fromViewDetails = previousView === 'viewDetails';
        return [
          home,
          ...(fromProperty    ? [propertyParent]   : []),
          ...(fromRentalApps  ? [rentalAppCrumb]   : []),
          ...(fromViewDetails ? [viewDetailsCrumb] : []),
          { label: 'Apply for Rental' }
        ];
      }

      case 'rentalApplications': return [home, { label: 'Rental Applications' }];
      case 'createRequests': {
        const fromProperty    = previousView === 'myProperties' || previousView === 'myRentals';
        const fromMaintenance = previousView === 'maintenanceRequests';
        const fromViewDetails = previousView === 'viewDetails';

        return [
          home,
          ...(fromProperty    ? [propertyParent]   : []),
          ...(fromMaintenance ? [maintenanceCrumb] : []),
          ...(fromViewDetails ? [viewDetailsCrumb] : []),
          { label: 'Create Request' }
        ];
      }

      case 'maintenanceRequests': return [home, { label: 'Maintenance Requests' }];
      case 'paymentHistory': return [home, { label: 'Payment History' }];
      case 'paymentSuccess': return [home, { label: 'Payment Success' }];
      case 'paymentCancel': return [home, { label: 'Payment Cancelled' }];

      default: return [];
    }
  };

  const renderMainContent = () => {
    const crumbs = <NavCrumb crumbs={getBreadcrumbs()} />;

    switch (currentView) {
      case 'auth':
        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;   

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

            <UpdateProfile
              goBack={() => {
                setSelectedProperty(null);

                if (previousView === 'viewProfile'){
                  setCurrentView(previousView);
                } else {
                  setCurrentView('home');
                }
              }}
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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

            <ViewDetails
              goBack={() => {
                setSelectedProperty(null);

                if (previousView === 'home') {
                  navigateTo('availablePropertySection');
                } else if (previousView === 'myProperties' || 'myRentals' || 'rentalApplications' || 'maintenanceRequests' || 'paymentHistory'){
                  setCurrentView(previousView);
                } else {
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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

            <AddProperty 
              goBack={() => setCurrentView('myProperties')}
              userId={userId || 0} 
            />
          </>
        );
        
      case 'updateProperty':
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

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
        if (!requireAuth()) return null;

        return (
          <>
            {crumbs}

            <PaymentSuccess 
              goBack={() => {
                window.history.replaceState({}, '', '/');
                setCurrentView('paymentHistory');
              }}
            />
          </>
        );

      case 'paymentCancel':
        if (!requireAuth()) return null;
        
        return (
          <>
            {crumbs}

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

                <button onClick={() => navigateTo('marketplaceContainer')}>See Available Properties</button>
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
              <li>
                <i className='fa-solid fa-home' />
                <a onClick={() => { 
                  navigateTo('homeSection'); 
                  setIsNavOpen(false); 
                }}>Home</a>
              </li>

              <li>
                <i className='fa-solid fa-user' />
                <a onClick={() => handleNavClick('viewProfile')}>View Profile</a>
              </li>

              <li>
                <i className='fa-solid fa-users' />
                <a onClick={() => handleNavClick('updateProfile')}>Update Profile</a>
              </li>

              { userRole === 'landlord' && 
                <>
                  <li>
                    <i className='fa-solid fa-tree-city' />
                    <a onClick={() => handleNavClick('myProperties')}>My Properties</a>
                  </li>

                  <li>
                    <i className='fa-solid fa-tree-city' />
                    <a onClick={() => handleNavClick('addProperty')}>Add New Property</a>
                  </li>
                </>
              }

              { userRole === 'tenant' && 
                <li>
                  <i className='fa-solid fa-tree-city' />
                  <a onClick={() => handleNavClick('myRentals')}>My Rentals</a>
                </li> }
              
              <li>
                <i className='fa-solid fa-file-circle-check' />
                <a onClick={() => handleNavClick('rentalApplications')}>Rental Applications</a>
              </li>

              <li>
                <i className='fa-solid fa-file-contract' />
                <a onClick={() => handleNavClick('maintenanceRequests')}>Maintenance Requests</a>
              </li>

              <li>
                <i className='fa-solid fa-comment-dollar' />
                <a onClick={() => handleNavClick('paymentHistory')}>Payment History</a>
              </li>

              <li>
                <i className='fa-solid fa-arrow-right-from-bracket' />
                <a onClick={() => {
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