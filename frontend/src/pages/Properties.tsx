import { useEffect, useState } from 'react'
import type { PropertyDataProps, PropertiesProps} from './props'
import AddProperty from './AddProperty'

function Properties({ goBack, userRole, userId, onViewDetails }: PropertiesProps) {
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddProperty, setShowAddProperty] = useState(false)
    
    const addProperty = () => setShowAddProperty(true)
    const viewPropertyDetails = (property: PropertyDataProps) => { onViewDetails(property) };

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

    if (showAddProperty) return <AddProperty goBack={() => setShowAddProperty(false)} userId={userId} />;

    const landlordProperties = properties.filter(p => Number(p.landlord_id) === Number(userId));
    const tenantRentals = properties.filter(p => Number(p.tenant_id) === Number(userId));

    return (
        <section id='propertiesContainer'>
            <header>
                <h1 className='mainTitle'>{userRole === 'landlord' ? 'MY PROPERTIES' : 'MY RENTALS'}</h1>
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
                                    {landlordProperties.length === 0 ?
                                        <p>You have no properties listed. Start by adding a new property.</p>
                                    :
                                        <>
                                            {landlordProperties.map(p => (
                                                <div key={p.id} className='propertyCard'>
                                                    <h3>{p.property_name}</h3>

                                                    <div className='propertyInfo'>
                                                        <p>Price: ₱{p.price}</p>
                                                        <p>Status: <strong>{p.status}</strong></p>
                                                    </div>

                                                    <div className='propertyDetails'>
                                                        <p>Category: {p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
                                                        <p>{p.bedroom_count > 0 ? `Bedroom/s: ${p.bedroom_count}` : 'No available bedrooms'}</p>
                                                        <p>{p.kitchen_count > 0 ? `Kitchen/s: ${p.kitchen_count}` : 'No available kitchens'}</p>
                                                        <p>{p.bathroom_count > 0 ? `Bathroom/s: ${p.bathroom_count}` : 'No available bathrooms'}</p>
                                                        <p>Max Occupants: {p.max_occupants}</p>
                                                        <p>{p.pets_allowed ? `Only ${p.pet_count} pet/s allowed` : 'Pets not allowed'}</p>
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
                                            ))}
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
                                    {tenantRentals.length === 0 ?
                                        <p>You have no current rentals. Start looking for your next home!</p>
                                    :   
                                        <>
                                            {tenantRentals.map(p => (
                                                <div key={p.id} className='propertyCard rented'>
                                                    <h3>{p.property_name}</h3>

                                                    <div className='propertyInfo'>
                                                        <p>Active Lease: ₱{p.price}</p>
                                                    </div>

                                                    <div className='propertyDetails'>
                                                        <p>Category: {p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
                                                        <p>{p.bedroom_count > 0 ? `Bedroom/s: ${p.bedroom_count}` : 'No available bedrooms'}</p>
                                                        <p>{p.kitchen_count > 0 ? `Kitchen/s: ${p.kitchen_count}` : 'No available kitchens'}</p>
                                                        <p>{p.bathroom_count > 0 ? `Bathroom/s: ${p.bathroom_count}` : 'No available bathrooms'}</p>
                                                        <p>Max Occupants: {p.max_occupants}</p>
                                                        <p>{p.pets_allowed ? `Only ${p.pet_count} pet/s allowed` : 'Pets not allowed'}</p>
                                                    </div>

                                                    <div className='btnWrapper'>
                                                        <button className='detailBtn' onClick={() => viewPropertyDetails(p)}>
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    }
                                </div>
                            </section>
                        )}
                    </>
                )}

                <div className="btnWrapper">
                    <button type="button" className="backBtn" onClick={goBack}>Go Back</button>
                </div>
            </main>
        </section>
    )
}

export default Properties