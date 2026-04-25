import { useEffect, useState } from 'react'
import type { MarketplaceProps, PropertyDataProps } from './props'

function Marketplace({ onViewDetails, onViewApplyRental }: MarketplaceProps) {
    const [properties, setProperties] = useState<PropertyDataProps[]>([])
    const [loading, setLoading] = useState(true)

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

    const availableProperties = properties.filter(p => p.status === 'Available');

    if (loading) return <p>Loading marketplace...</p>;

    return (
        <section className='guestView'>
            <h2>Marketplace</h2>
            <div className='propertyGrid'>
                {availableProperties.length === 0 ?
                    <p>Currently no available properties.</p>
                :   
                    <>
                        {availableProperties.map(p => (
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
                                    <button className='applyBtn' onClick={() => onViewApplyRental(p)}>
                                        Apply Now
                                    </button>
                                    
                                    <button className='detailBtn' onClick={() => onViewDetails(p)}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                }
            </div>
        </section>
    )
}

export default Marketplace;