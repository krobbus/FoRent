import { useEffect, useState } from 'react'
import type { Property, PropertiesProps} from './props'
import AddProperty from './AddProperty'

function Properties({ userRole, userId }: PropertiesProps) {
    const [properties, setProperties] = useState<Property[]>([])
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
        return <AddProperty goBack={() => setShowAddProperty(false)} userId={userId} />
    }

    return (
        <section id='propertiesContainer'>
            <header>
                {userRole === 'landlord' && (<h1 className='mainTitle'>My Properties</h1>)} 
                {userRole === 'tenant' && (<h1 className='mainTitle'>My Rentals</h1>)}
                {!userRole && (<h1 className='mainTitle'>Available Properties</h1>)}
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
                                        .filter(p => p.tenant_id === 1)
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
                                        .filter(p => p.status === 'Available')
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
                                        .filter(p => p.status === 'Available')
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