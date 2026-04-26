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
    const getOccupancyLabel = (max: number) => {
        if (max <= 1) return 'Solo-friendly';
        if (max <= 2) return 'Couple-friendly';
        if (max <= 4) return 'Small group-friendly';
        if (max <= 6) return 'Family-friendly';
        if (max <= 10) return 'Large family-friendly';
        return 'Group-friendly';
    };

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
                                <div className='propertyInfo'>
                                    <h3>{p.property_name}</h3>
                                    <p>{p.address ? `Address: ${p.address}` : 'No address available'}</p>
                                    <p>Price: ₱{p.price}</p>
                                    <p>Status: <strong>{p.status}</strong></p>
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