import { useEffect, useState } from 'react'
import type { PropertyDataProps, PropertiesProps} from './props'
import AddProperty from './AddProperty'
import Auth from './Auth'
import ViewDetails from './ViewDetails'

function Properties({ goBack, userRole, userId, setUserId, setUserRole }: PropertiesProps) {
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddProperty, setShowAddProperty] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    const [showPropertyDetails, setShowPropertyDetails] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<PropertyDataProps | null>(null)
    const [pendingProperty, setPendingProperty] = useState<PropertyDataProps | null>(null)

    const addProperty = () => setShowAddProperty(true)
    const viewPropertyDetails = (property: PropertyDataProps) => {
        if (!userRole) {
            setPendingProperty(property);
            setShowAuth(true);
        } else {
            setSelectedProperty(property);
            setShowPropertyDetails(true);
        }
    };

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties');
                const data = await response.json();
                setProperties(data);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        if (userRole && pendingProperty) {
            setSelectedProperty(pendingProperty);
            setShowPropertyDetails(true);
            setPendingProperty(null);
            setShowAuth(false);
        }
    }, [userRole, pendingProperty]);

    const deleteProperty = async (propertyId: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this property? This action cannot be undone.");
        
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setProperties(prev => prev.filter(prop => prop.id !== propertyId));
                    alert("Property deleted.");
                } else {
                    const data = await response.json();
                    alert(data.error || "Failed to delete.");
                }
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    if (showAddProperty) return <AddProperty goBack={() => setShowAddProperty(false)} userId={userId} userRole={userRole} />;
    if (showAuth) return <Auth goBack={() => setShowAuth(false)} setUserId={setUserId} setUserRole={setUserRole} />;
    if (showPropertyDetails && selectedProperty) {
        return <ViewDetails goBack={() => setShowPropertyDetails(false)} property={selectedProperty} />;
    }

    return (
        <section id='propertiesContainer'>
            {userRole && (
                <span>
                    &gt;<a onClick={goBack}> Home </a> 
                    &gt;<span className='activeCrumb'> My Properties </span>
                </span>
            )}

            <header>
                {userRole === 'landlord' && (<h1 className='mainTitle'>MY PROPERTIES</h1>)} 
                {userRole === 'tenant' && (<h1 className='mainTitle'>MY RENTALS</h1>)}
                {!userRole && (<h1 className='mainTitle'>AVAILABLE PROPERTIES</h1>)}
                <p>Explore our wide range of rental properties to find your perfect home.</p>
            </header>

            <main>
                {loading ? (
                    <p>Loading properties...</p>
                ) : (
                    <>
                        {userRole === 'landlord' && (
                            <section className='landlordView'>
                                <h2>Manage Your Listings</h2>
                                <div className='propertyGrid'>
                                    {properties.length > 0 ? 
                                        <p>You have no properties listed. Start by adding a new property.</p>
                                    :
                                        <>
                                            {properties
                                                .filter(p => Number(p.landlord_id) === Number(userId))
                                                .map(p => (
                                                    <div key={p.id} className='propertyCard'>
                                                        <h3>{p.property_name}</h3>

                                                        <div className='propertyInfo'>
                                                            <p>Price: ₱{p.price}</p>
                                                            <p>Status: <strong>{p.status}</strong></p>
                                                        </div>

                                                        <div className='propertyDetails'>
                                                            <p>Category: {p.category}</p>
                                                            <p>Bedrooms: {p.bedroom_count}</p>
                                                            <p>{p.has_kitchen ? `Kitchen: ${p.kitchen_count}` : 'No Kitchen'}</p>
                                                            <p>Bathrooms: {p.bathroom_count}</p>
                                                            <p>Max Occupants: {p.max_occupants}</p>
                                                            <p>{p.pets_allowed ? `Pets Allowed: ${p.pet_count}` : 'Pets not allowed'}</p>
                                                            <p>{p.description ? `${p.description}` : 'No description available'}</p>
                                                        </div>

                                                        <div className='btnWrapper'>
                                                            <button className='detailBtn' onClick={() => viewPropertyDetails(p)}>
                                                                View Details
                                                            </button>

                                                            <button className='deleteBtn' onClick={() => deleteProperty(p.id)}>
                                                                Delete Property
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    }
                                </div>

                                <button className='addBtn' onClick={addProperty}>+ Add New Property</button>
                            </section>
                        )}

                        {userRole === 'tenant' && (
                            <section className='tenantView'>
                                <h2>Your Current Rentals</h2>    
                                <div className='propertyGrid'>
                                    {properties.length > 0 ? 
                                        <p>You have no current rentals. Start looking for your next home!</p>
                                    :   
                                        <>
                                            {properties
                                                .filter(p => Number(p.tenant_id) === Number(userId))
                                                .map(p => (
                                                    <div key={p.id} className='propertyCard rented'>
                                                        <h3>{p.property_name}</h3>

                                                        <div className='propertyInfo'>
                                                            <p>Active Lease: ₱{p.price}</p>
                                                        </div>

                                                        <div className='propertyDetails'>
                                                            <p>Category: {p.category}</p>
                                                            <p>Bedrooms: {p.bedroom_count}</p>
                                                            <p>{p.has_kitchen ? `Kitchen: ${p.kitchen_count}` : 'No Kitchen'}</p>
                                                            <p>Bathrooms: {p.bathroom_count}</p>
                                                            <p>Max Occupants: {p.max_occupants}</p>
                                                            <p>{p.pets_allowed ? `Pets Allowed: ${p.pet_count}` : 'Pets not allowed'}</p>
                                                        </div>

                                                        <div className='btnWrapper'>
                                                            <button className='detailBtn' onClick={() => viewPropertyDetails(p)}>
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    }
                                </div>

                                <h2>Marketplace</h2>
                                <div className='propertyGrid'>
                                    {properties.length > 0 ? 
                                        <p>Currently no available properties.</p>
                                    :   
                                        <>
                                            {properties
                                                .filter(p => String(p.status) === 'Available')
                                                .map(p => (
                                                    <div key={p.id} className='propertyCard'>
                                                        <h3>{p.property_name}</h3>

                                                        <div className='propertyInfo'>
                                                            <p>Price: ₱{p.price}</p>
                                                            <p>Status: <strong>{p.status}</strong></p>
                                                        </div>

                                                        <div className='propertyDetails'>
                                                            <p>Category: {p.category}</p>
                                                            <p>Bedrooms: {p.bedroom_count}</p>
                                                            <p>{p.has_kitchen ? `Kitchen: ${p.kitchen_count}` : 'No Kitchen'}</p>
                                                            <p>Bathrooms: {p.bathroom_count}</p>
                                                            <p>Max Occupants: {p.max_occupants}</p>
                                                            <p>{p.pets_allowed ? `Pets Allowed: ${p.pet_count}` : 'Pets not allowed'}</p>
                                                        </div>

                                                        <div className='btnWrapper'>
                                                            <button className='applyBtn'>Apply Now</button>
                                                            <button className='detailBtn' onClick={() => viewPropertyDetails(p)}>
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    }
                                </div>
                            </section>
                        )}

                        {!userRole && (
                            <section className='guestView'>
                                <h2>Marketplace</h2>
                                <div className='propertyGrid'>
                                    {properties.length > 0 ? 
                                        <p>Currently no available properties.</p>
                                    :   
                                        <>
                                            {properties
                                                .filter(p => String(p.status) === 'Available')
                                                .map(p => (
                                                    <div key={p.id} className='propertyCard'>
                                                        <h3>{p.property_name}</h3>

                                                        <div className='propertyInfo'>
                                                            <p>Price: ₱{p.price}</p>
                                                            <p>Status: <strong>{p.status}</strong></p>
                                                        </div>

                                                        <div className='propertyDetails'>
                                                            <p>Category: {p.category}</p>
                                                            <p>Bedrooms: {p.bedroom_count}</p>
                                                            <p>{p.has_kitchen ? `Kitchen: ${p.kitchen_count}` : 'No Kitchen'}</p>
                                                            <p>Bathrooms: {p.bathroom_count}</p>
                                                            <p>Max Occupants: {p.max_occupants}</p>
                                                            <p>{p.pets_allowed ? `Pets Allowed: ${p.pet_count}` : 'Pets not allowed'}</p>
                                                        </div>

                                                        <div className='btnWrapper'>
                                                            <button className='applyBtn'>Apply Now</button>
                                                            <button className='detailBtn' onClick={() => viewPropertyDetails(p)}>
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    }
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </section>
    )
}

export default Properties