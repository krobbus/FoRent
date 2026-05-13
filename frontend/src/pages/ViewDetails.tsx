import { useEffect, useState } from 'react';
import { authFetch } from '../utils/api';
import type { PropertyDataProps, RentalApplicationDataProps, ViewDetailsProps } from '../utils/props';
import PropertyGallery from '../component/PropertyGallery';

function ViewDetails({ goBack, userRole, userId, property, onViewApplyRental, onViewRentalApplications }: ViewDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [applications, checkApplications] = useState<RentalApplicationDataProps[]>([])

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
        const fetchApplications = async () => {
            setLoading(true);

            try {
                const response = await authFetch(`http://localhost:5000/api/applications/view?userId=${userId}&userRole=${userRole}`);
                const data = await response.json();
                checkApplications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load applications", error);
            } finally {
                setLoading(false);
            }
        }

        fetchApplications();
    }, []);

    useEffect(() => {
        if (!property?.id) return;

        fetch(`http://localhost:5000/api/analytics/properties/${property.id}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewer_user_id: userId || null }),
        }).catch(() => {});
    }, [property?.id]);

    if (!property) {
        return (
            <section id='viewDetailsContainer'>
                <p>No property selected.</p>
                <button onClick={goBack}>Go Back</button>
            </section>
        );
    }

    return (
        <section id='viewDetailsContainer'>
            <header>
                <h2>View Property Details</h2>
                <p>Review the complete information and specifications of this property listing.</p>
            </header>

            {loading ? (
                <p>Loading property details...</p>
            ) : (
                <>
                    {properties.length > 0 &&
                        <>
                            <div className='fullDetailsView'>
                                <div className='propertyInfo'>
                                    <div className='fullGalleryWrapper'>
                                        <PropertyGallery
                                            variant='details'
                                            images={Array.isArray(property.images) 
                                                ? property.images 
                                                : JSON.parse(property.images || '[]'
                                            )}
                                        />
                                    </div>
                                    
                                    <div className='columnGroup'>
                                        <h1>{property.property_name}</h1>
                                        <h3>{property.address ? `${property.address}` : 'No address available'}</h3>
                                        <h3>{property.category.charAt(0).toUpperCase() + property.category.slice(1)}</h3>
                                    </div>

                                    <div className='rowGroup'>
                                        <div className='priceLabel'>
                                            <i className='fa-solid fa-tag' />
                                            <p>₱ {Number(property.price).toLocaleString()}</p>
                                        </div>

                                        <div className='statusLabel'>
                                            <i className='fa-solid fa-bullhorn' />
                                            <p>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</p>
                                        </div>

                                        {property.status === 'rented' && property.tenant_first_name && (
                                        <div className='tenantLabel'>
                                            <i className='fa-solid fa-user' />
                                            <p><strong>
                                                {[property.tenant_first_name, property.tenant_last_name, property.tenant_ext_name]
                                                    .filter(Boolean).join(' ')}
                                            </strong></p>
                                        </div>
                                        )}  
                                    </div> 
                                </div>
                                
                                <div className='propertyDetails'>
                                    <div className='description'>
                                        <h3>Description</h3>
                                        <p>{property.description ? `${property.description}` : 'No description available'}</p>
                                    </div>

                                    <div className='rooms'>
                                        <h3>Available Rooms</h3>

                                        <div className='pillRow'>
                                            <div className='bedroom'>
                                                <i className='fa-solid fa-bed' />
                                                <p>{property.bedroom_count > 0 ? `${property.bedroom_count}` : 'No available bedrooms'}</p>
                                            </div>
                                            
                                            <div className='kitchen'>
                                                <i className='fa-solid fa-cutlery' />
                                                <p>{property.kitchen_count > 0 ? `${property.kitchen_count}` : 'No available kitchens'}</p>
                                            </div>
                                            
                                            <div className='bathroom'>
                                                <i className='fa-solid fa-bath' />
                                                <p>{property.bathroom_count > 0 ? `${property.bathroom_count}` : 'No available bathrooms'}</p>
                                            </div>

                                            {property.other_rooms && property.other_rooms.length > 0 ? (
                                                <>
                                                    {(Array.isArray(property.other_rooms)
                                                        ? property.other_rooms
                                                        : property.other_rooms.split(',')
                                                    ).map((room: string, i: number) => (
                                                        <div key={i} className='otherRooms'>
                                                            <i className='fa-solid fa-door-open' />
                                                            <p>{room.trim()}</p>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className='otherRooms'>
                                                    <i className='fa-solid fa-door-open' />
                                                    <p>No other rooms listed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className='occupants'>
                                        <div className='columnGroup'>
                                            <h3>Number of Max Occupants</h3>

                                            <div className='pill'>
                                                <i className='fa-solid fa-users' />
                                                <p>{property.max_occupants}</p>
                                            </div>
                                        </div>

                                        <div className='columnGroup'>
                                            <h3>Number of Allowed Pets</h3>

                                            <div className='pill'>
                                                <i className='fa-solid fa-paw' />
                                                <p>{property.pets_allowed ? `${property.pet_count}` : 'Pets not allowed'}</p>
                                            </div>
                                        </div>
                                    </div>
                                                
                                    <div className='amenities'>
                                        <h3>Amenities</h3>
                                        
                                        <div className='pillRow'>
                                            {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                                                property.amenities
                                                    .flatMap((a: string) => a.split(','))
                                                    .map((a: string, i: number) => (
                                                        <div key={i} className='amenities'>
                                                            <i className='fa-solid fa-star' />
                                                            <p>{a.trim()}</p>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className='amenities'>
                                                    <i className='fa-solid fa-star' />
                                                    <p>No amenities listed</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='actionBtnWrapper'>
                                {applications.some(app => app.property_id === property.id) ?
                                    <button className='applyBtn' onClick={onViewRentalApplications}>Check Application</button>
                                    :
                                    <button className='applyBtn' onClick={onViewApplyRental}>Apply Now</button>
                                }
                                <button className='backBtn' onClick={goBack}>Go Back</button>
                            </div>
                        </>
                    }
                </>
            )}
        </section>
    )
}

export default ViewDetails