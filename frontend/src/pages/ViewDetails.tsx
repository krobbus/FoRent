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
                                            images={Array.isArray(property.images) 
                                                ? property.images 
                                                : JSON.parse(property.images || '[]'
                                            )}
                                        />
                                    </div>

                                    <h3>{property.property_name}</h3>
                                    <p>{property.address ? `Address: ${property.address}` : 'No address available'}</p>
                                    <p>Category: {property.category.charAt(0).toUpperCase() + property.category.slice(1)}</p>
                                    <p>Price: ₱{Number(property.price).toLocaleString()}</p>
                                    <p>Status: <strong>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</strong></p>
                                    {property.status === 'rented' && property.tenant_first_name && (
                                        <p>Current Tenant: <strong>
                                            {[property.tenant_first_name, property.tenant_last_name, property.tenant_ext_name]
                                                .filter(Boolean).join(' ')}
                                        </strong></p>
                                    )}   
                                </div>
                                
                                <div className='propertyDetails'>
                                    <p>{property.description ? `Description: ${property.description}` : 'No description available'}</p>
                                    <p>{property.bedroom_count > 0 ? `Bedroom/s: ${property.bedroom_count}` : 'No available bedrooms'}</p>
                                    <p>{property.kitchen_count > 0 ? `Kitchen/s: ${property.kitchen_count}` : 'No available kitchens'}</p>
                                    <p>{property.bathroom_count > 0 ? `Bathroom/s: ${property.bathroom_count}` : 'No available bathrooms'}</p>
                                    <div className='otherRooms'>
                                        {property.other_rooms && property.other_rooms.length > 0 ? (
                                            <p>Other Rooms: {
                                                Array.isArray(property.other_rooms) 
                                                    ? property.other_rooms.join(', ')
                                                    : property.other_rooms
                                            }</p>
                                        ) : (
                                            <p>Other Rooms: No other rooms listed</p>
                                        )}
                                    </div>

                                    <div className='occupants'>
                                        <p>Max Occupants: {property.max_occupants}</p>
                                        <p>{property.pets_allowed ? `Pets Allowed: ${property.pet_count}` : 'Pets not allowed'}</p>
                                    </div>

                                    <div className='amenities'>
                                        {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                                            <p>Amenities: {property.amenities.join(', ')}</p>
                                        ) : (
                                            <p>Amenities: No amenities listed</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='btnWrapper'>
                                {applications.some(app => app.property_id === property.id) ?
                                    <button className='applyBtn' onClick={onViewRentalApplications}>Check Application</button>
                                    :
                                    <button className='applyBtn' onClick={onViewApplyRental}>Apply Now</button>
                                }
                                <button className='detailBtn' onClick={goBack}>Go Back</button>
                            </div>
                        </>
                    }
                </>
            )}
        </section>
    )
}

export default ViewDetails