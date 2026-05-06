import { useEffect, useState } from 'react';
import { authFetch } from '../utils/api';
import type { MarketplaceProps, PropertyDataProps, RentalApplicationDataProps, FilterState } from '../utils/props';
import { usePropertySearch, defaultFilters } from '../utils/filter';
import { usePagination } from '../utils/pagination';

import PropertyGallery from '../component/PropertyGallery';
import PropertySearch from '../component/PropertySearch';
import Pagination from '../component/Pagination';

function Marketplace({ userId, userRole, onViewDetails, onViewApplyRental, onViewRentalApplications }: MarketplaceProps) {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<PropertyDataProps[]>([]);
    const [applications, checkApplications] = useState<RentalApplicationDataProps[]>([]);
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties');
                const data = await response.json();
                setProperties(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching properties:", error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const { filtered, matchedKeywords } = usePropertySearch(properties, query, filters);
    const [currentPage, setCurrentPage] = useState(1);
    const { paginated, totalPages } = usePagination(filtered, currentPage, 9);

    const handleQueryChange = (q: string) => {
        setQuery(q);
        setCurrentPage(1);
    };

    const handleFiltersChange = (f: FilterState) => {
        setFilters(f);
        setCurrentPage(1);
    };

    const renderSearchSummary = () => {
        if (matchedKeywords.length === 0 && !Object.values(filters).some(Boolean)) return null;
        
        if (filtered.length === 0) {
            return (
                <p className='searchSummary noResults'>
                    No properties found for your search. Try different keywords or filters.
                </p>
            );
        }

        if (matchedKeywords.length > 0) {
            return (
                <p className='searchSummary'>
                    Based on your search{' '}
                    {matchedKeywords.map((kw, i) => (
                        <span key={i} className='searchKeyword'>"{kw}"</span>
                    )).reduce((prev, curr, i) => (
                        <>{prev}{i > 0 ? ' and ' : ''}{curr}</>
                    ) as any)}
                    , we found <strong>{filtered.length}</strong> propert{filtered.length === 1 ? 'y' : 'ies'}.
                </p>
            );
        }

        return (
            <p className='searchSummary'>
                Showing <strong>{filtered.length}</strong> propert{filtered.length === 1 ? 'y' : 'ies'} based on your filters.
            </p>
        );
    };

    useEffect(() => {
        const fetchApplications = async () => {
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

    const availableProperties = properties.filter(p => p.status?.toLowerCase() === 'available');
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
        <section className='marketplaceContainer'>
            <header>
                <h2>Marketplace</h2>
                <p>Explore our wide range of rental properties to find your perfect home.</p>
            </header>

            <PropertySearch
                query={query}
                onQueryChange={handleQueryChange}
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />
            {renderSearchSummary()}

            <div className='propertyGrid'>
                {availableProperties.length === 0 ? (
                    <p>Currently no available properties.</p>
                ) : filtered.length === 0 ? (
                    <p>No properties match your search or filters.</p>
                ) : ( paginated.map((p: PropertyDataProps) => (
                    <div key={p.id} className='propertyCard'>
                        <PropertyGallery
                            images={Array.isArray(p.images) 
                                ? p.images 
                                : JSON.parse(p.images || '[]'
                            )}
                        />
                        
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
                            {applications.some(app => app.property_id === p.id) ?
                                <button className='applyBtn' onClick={onViewRentalApplications}>Check Application</button>
                                :
                                <button className='applyBtn' onClick={() => onViewApplyRental(p)}>Apply Now</button>
                            }
                            
                            <button className='detailBtn' onClick={() => onViewDetails(p)}>
                                View Details
                            </button>
                        </div>
                    </div>
                )))}
            </div>

            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </section>
    )
}

export default Marketplace;