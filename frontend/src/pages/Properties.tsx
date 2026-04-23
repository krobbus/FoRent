import { useEffect, useState } from 'react'
import type { PropertyDataProps, PropertiesProps} from './props'
import AddProperty from './AddProperty'

function Properties({ goBack, userRole, userId }: PropertiesProps) {
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddProperty, setShowAddProperty] = useState(false)

    const addProperty = () => {
        setShowAddProperty(true)
    }

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

    if (showAddProperty) {
        return <AddProperty goBack={() => setShowAddProperty(false)} userId={userId} userRole={userRole} />;
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
                                    {properties
                                        .filter(p => Number(p.landlord_id) === Number(userId))
                                        .map(p => (
                                            <div key={p.id} className='propertyCard'>
                                                <h3>{p.property_name}</h3>
                                                <p>Price: ₱{p.price}</p>
                                                <p>Status: <strong>{p.status}</strong></p>
                                            </div>
                                        ))
                                    }
                                </div>

                                <button className='addBtn' onClick={addProperty}>+ Add New Property</button>
                            </section>
                        )}

                        {userRole === 'tenant' && (
                            <section className='tenantView'>
                                <h2>Your Current Rentals</h2>    
                                <div className='propertyGrid'>
                                    {properties
                                        .filter(p => Number(p.tenant_id) === Number(userId))
                                        .map(p => (
                                            <div key={p.id} className='propertyCard rented'>
                                                <h3>{p.property_name}</h3>
                                                <span>Active Lease: ₱{p.price}</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                <h2>Marketplace</h2>
                                <div className='propertyGrid'>
                                    {properties
                                        .filter(p => String(p.status) === 'Available')
                                        .map(p => (
                                            <div key={p.id} className='propertyCard'>
                                                <h3>{p.property_name}</h3>
                                                <p>₱{p.price}/mo</p>
                                                <button className='applyBtn'>Apply Now</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </section>
                        )}

                        {!userRole && (
                            <section className='guestView'>
                                <div className='propertyGrid'>
                                    {properties
                                        .filter(p => String(p.status) === 'Available')
                                        .map(p => (
                                            <div key={p.id} className='propertyCard'>
                                                <h3>{p.property_name}</h3>
                                                <p>₱{p.price}/mo</p>
                                                <button className='detailBtn'>View Details</button>
                                            </div>
                                        ))
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