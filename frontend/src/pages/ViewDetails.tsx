import { useEffect, useState } from 'react'
import type { PropertyDataProps, ViewDetailsProps } from './props'

function ViewDetails({ onViewApplyRental, goBack, property }: ViewDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<PropertyDataProps[]>([])

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
                <p></p>
            </header>

            {loading ? (
                <p>Loading property details...</p>
            ) : (
                <>
                    {properties.length > 0 &&
                        <>
                            <div className='fullDetailsView'>
                                <h1>{property.property_name}</h1>
                                <p>{property.address ? `Address: ${property.address}` : 'No address available'}</p>
                                <p>{property.description ? `Description: ${property.description}` : 'No description available'}</p>

                                <div className='pricing'>
                                    <p>Price: ₱{property.price}</p>
                                    <p>Status: <strong>{property.status}</strong></p>
                                </div>
                                
                                <div className='rooms'>
                                    <p>Category: {property.category.charAt(0).toUpperCase() + property.category.slice(1)}</p>
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

                            <div className='btnWrapper'>
                                <button className='applyBtn' onClick={onViewApplyRental}>Apply Now</button>
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