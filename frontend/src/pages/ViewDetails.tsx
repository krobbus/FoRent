import { useEffect, useState } from 'react'
import type { PropertyDataProps } from './props'

function ViewDetails({ goBack, property }: { goBack: () => void; property: PropertyDataProps }) {
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

    return (
        <section id='viewDetailsContainer'>
            <span>
                &gt;<a onClick={goBack}> Home </a> 
                &gt;<span className='activeCrumb'> My Properties </span>
            </span>
            
            {loading ? (
                <p>Loading property details...</p>
            ) : (
                <>
                    {properties.length > 0 &&
                        <div className='fullDetailsView'>
                            <h1>{property.property_name}</h1>
                            <p>{property.description ? `Description: ${property.description}` : 'No description available'}</p>

                            <div className='pricing'>
                                <p>Price: ₱{property.price}</p>
                                <p>Status: <strong>{property.status}</strong></p>
                            </div>
                            
                            <div className='rooms'>
                                <p>Category: {property.category}</p>
                                <p>Bedrooms: {property.bedroom_count}</p>
                                <p>{property.has_kitchen ? `Kitchen: ${property.kitchen_count}` : 'No Kitchen'}</p>
                                <p>Bathrooms: {property.bathroom_count}</p>
                            </div>
                            
                            <div className='occupants'>
                                <p>Max Occupants: {property.max_occupants}</p>
                                <p>{property.pets_allowed ? `Pets Allowed: ${property.pet_count}` : 'Pets not allowed'}</p>
                            </div>

                            <div className='amenities'>
                                <h3>Amenities:</h3>
                                <p>{property.amenities.aircon ? 'Air Conditioning' : 'No Air Conditioning'}</p>
                                <p>{property.amenities.parking ? 'Parking Available' : 'No Parking'}</p>
                                <p>{property.amenities.other ? `Other Amenities: ${property.amenities.other}` : 'No other amenities listed'}</p>
                            </div>
                        </div>
                    }
                </>
            )}
        </section>
    )
}

export default ViewDetails