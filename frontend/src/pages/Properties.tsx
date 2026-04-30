import { useEffect, useState } from 'react'
import { authFetch } from '../utils/api'
import type { PropertyDataProps, PropertiesProps} from './props'
import AddProperty from './AddProperty'

function Properties({ goBack, userId, userRole,  onViewDetails, onCreateRequest, onUpdateProperty }: PropertiesProps) {
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddProperty, setShowAddProperty] = useState(false)
    
    const addProperty = () => setShowAddProperty(true)

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties');
                const data = await response.json();
                setProperties(Array.isArray(data) ? data : []);
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
                const response = await authFetch(`http://localhost:5000/api/properties/${propertyId}`, {
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
    const getOccupancyLabel = (max: number) => {
        if (max <= 1) return 'Solo-friendly';
        if (max <= 2) return 'Couple-friendly';
        if (max <= 4) return 'Small group-friendly';
        if (max <= 6) return 'Family-friendly';
        if (max <= 10) return 'Large family-friendly';
        return 'Group-friendly';
    };

    return (
        <section id='propertiesContainer'>
            <header>
                <h2>{userRole === 'landlord' ? 'My Properties' : 'My Current Rentals'}</h2>
                <p>
                    {userRole === 'landlord'
                        ? 'Oversee and manage all properties listed under your account.'
                        : 'View and manage the properties you are currently renting.'
                    }
                </p>
            </header>

            <main>
                {loading ? (
                    <p>Loading properties...</p>
                ) : (
                    <>
                        {userRole === 'landlord' && (
                            <section className='landlordView'>
                                <div className='propertyGrid'>
                                    {landlordProperties.length === 0 ?
                                        <p>You have no properties listed. Start by adding a new property.</p>
                                    :
                                        <>
                                            {landlordProperties.map(p => (
                                                <div key={p.id} className='propertyCard'>
                                                    <div className='propertyInfo'>
                                                        <h3>{p.property_name}</h3>
                                                        <p>{p.address ? `Address: ${p.address}` : 'No address available'}</p>
                                                        <p>Price: ₱{p.price}</p>
                                                        <p>Status: <strong>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</strong></p>
                                                        {p.status === 'rented' && p.tenant_first_name && (
                                                            <p>Current Tenant: <strong>
                                                                {[p.tenant_first_name, p.tenant_last_name, p.tenant_ext_name]
                                                                    .filter(Boolean).join(' ')}
                                                            </strong></p>
                                                        )}
                                                    </div>

                                                    <div className='propertyDetails'>
                                                        <p>Category: {p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>

                                                        <p>Available Rooms: 
                                                            {[ 
                                                                p.bedroom_count > 0 ? 'Bedroom' : '',
                                                                p.kitchen_count > 0 ? 'Kitchen' : '',
                                                                p.bathroom_count > 0 ? 'Bathroom' : '',
                                                                p.other_rooms ? p.other_rooms : ''
                                                            ].filter(Boolean).join(', ') || 'No rooms listed'}
                                                        </p>

                                                        <p>Occupancy: 
                                                            {[ p.pets_allowed ? 'Pet-friendly' : '',
                                                                getOccupancyLabel(p.max_occupants)
                                                            ].filter(Boolean).join(' and ')}
                                                        </p>

                                                        <p>Amenities: 
                                                            { Array.isArray(p.amenities) && p.amenities.length > 0
                                                                ? p.amenities.join(', ')
                                                                : 'No amenities listed'
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className='btnWrapper'>
                                                        <button className='detailBtn' onClick={() => onViewDetails(p)}>
                                                            View Details
                                                        </button>

                                                        <button className='updateBtn' onClick={() => onUpdateProperty(p)}>
                                                            Update Details
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
                                <div className='propertyGrid'>
                                    {tenantRentals.length === 0 ?
                                        <p>You have no current rentals. Start looking for your next home!</p>
                                    :   
                                        <>
                                            {tenantRentals.map(p => (
                                                <div key={p.id} className='propertyCard rented'>
                                                    <div className='propertyInfo'>
                                                        <h3>{p.property_name}</h3>
                                                        <p>{p.address ? `Address: ${p.address}` : 'No address available'}</p>
                                                        <p>Price: ₱{p.price}</p>
                                                        <p>Status: <strong>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</strong></p>
                                                    </div>

                                                    <div className='propertyDetails'>
                                                        <p>Category: {p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>

                                                        <p>Available Rooms: 
                                                            {[ 
                                                                p.bedroom_count > 0 ? 'Bedroom' : '',
                                                                p.kitchen_count > 0 ? 'Kitchen' : '',
                                                                p.bathroom_count > 0 ? 'Bathroom' : '',
                                                                p.other_rooms ? p.other_rooms : ''
                                                            ].filter(Boolean).join(', ') || 'No rooms listed'}
                                                        </p>

                                                        <p>Occupancy: 
                                                            {[ p.pets_allowed ? 'Pet-friendly' : '',
                                                                getOccupancyLabel(p.max_occupants)
                                                            ].filter(Boolean).join(' and ')}
                                                        </p>

                                                        <p>Amenities: 
                                                            { Array.isArray(p.amenities) && p.amenities.length > 0
                                                                ? p.amenities.join(', ')
                                                                : 'No amenities listed'
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className='btnWrapper'>
                                                        <button className='detailBtn' onClick={() => onViewDetails(p)}>
                                                            View Details
                                                        </button>
                                                        <button className='paymentBtn'>
                                                            Check Payment
                                                        </button>
                                                        <button className='requestBtn' onClick={() => onCreateRequest(p)}>
                                                            Request Maintenance
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