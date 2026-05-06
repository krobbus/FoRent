import { useState } from 'react';
import type { FilterState, PropertySearchProps } from '../utils/props';
import { defaultFilters } from '../utils/filter';

function PropertySearch({ query, onQueryChange, filters, onFiltersChange }: PropertySearchProps) {
    const [showFilters, setShowFilters] = useState(false);

    const activeFilterCount = [
        filters.priceMin, filters.priceMax, filters.category,
        filters.hasWifi, filters.hasAircon, filters.hasParking,
        filters.hasBedroom, filters.hasKitchen, filters.hasBathroom,
        filters.occupancy, filters.hasPets
    ].filter(Boolean).length;

    const resetFilters = () => onFiltersChange(defaultFilters);

    const toggle = (key: keyof FilterState) => {
        onFiltersChange({ ...filters, [key]: !filters[key as keyof FilterState] });
    };

    return (
        <div className='propertySearchWrapper'>
            <div className='searchBar'>
                <input
                    type='text'
                    placeholder='Search by name, room, amenity, location... (e.g. "2 bedroom with wifi near Makati")'
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    className='searchInput'
                />
                {query && (
                    <button className='clearSearch' onClick={() => onQueryChange('')}>✕</button>
                )}
                <button
                    className={`filterToggleBtn ${activeFilterCount > 0 ? 'hasActive' : ''}`}
                    onClick={() => setShowFilters(prev => !prev)}
                >
                    ⚙ Filters {activeFilterCount > 0 && <span className='filterBadge'>{activeFilterCount}</span>}
                </button>
            </div>

            {showFilters && (
                <div className='filterPanel'>
                    <div className='filterHeader'>
                        <h4>Filter Properties</h4>
                        {activeFilterCount > 0 && (
                            <button className='resetFilters' onClick={resetFilters}>Reset All</button>
                        )}
                    </div>

                    <div className='filterGrid'>
                        <div className='filterGroup'>
                            <label className='filterLabel'>Price Range (₱)</label>
                            <div className='priceInputs'>
                                <input
                                    type='number'
                                    placeholder='Min'
                                    value={filters.priceMin}
                                    onChange={e => onFiltersChange({ ...filters, priceMin: e.target.value })}
                                />
                                <span>—</span>
                                <input
                                    type='number'
                                    placeholder='Max'
                                    value={filters.priceMax}
                                    onChange={e => onFiltersChange({ ...filters, priceMax: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='filterGroup'>
                            <label className='filterLabel'>Category</label>
                            <select
                                value={filters.category}
                                onChange={e => onFiltersChange({ ...filters, category: e.target.value })}
                            >
                                <option value=''>All Categories</option>
                                <option value='apartment'>Apartment</option>
                                <option value='house'>House</option>
                                <option value='condo'>Condo</option>
                            </select>
                        </div>

                        <div className='filterGroup'>
                            <label className='filterLabel'>Occupancy</label>
                            <select
                                value={filters.occupancy}
                                onChange={e => onFiltersChange({ ...filters, occupancy: e.target.value })}
                            >
                                <option value=''>Any</option>
                                <option value='solo'>Solo (1 person)</option>
                                <option value='couple'>Couple (2 persons)</option>
                                <option value='small'>Small Group (3–4)</option>
                                <option value='family'>Family (5–6)</option>
                                <option value='large'>Large Group (7+)</option>
                            </select>

                            <label><input type='checkbox' checked={filters.hasPets} onChange={() => toggle('hasPets')} /> Allowed Pets</label>
                        </div>

                        <div className='filterGroup'>
                            <label className='filterLabel'>Rooms</label>
                            <div className='checkboxGroup'>
                                <label><input type='checkbox' checked={filters.hasBedroom} onChange={() => toggle('hasBedroom')} /> Bedroom</label>
                                <label><input type='checkbox' checked={filters.hasKitchen} onChange={() => toggle('hasKitchen')} /> Kitchen</label>
                                <label><input type='checkbox' checked={filters.hasBathroom} onChange={() => toggle('hasBathroom')} /> Bathroom</label>
                            </div>
                        </div>

                        <div className='filterGroup'>
                            <label className='filterLabel'>Amenities</label>
                            <div className='checkboxGroup'>
                                <label><input type='checkbox' checked={filters.hasWifi} onChange={() => toggle('hasWifi')} /> WiFi</label>
                                <label><input type='checkbox' checked={filters.hasAircon} onChange={() => toggle('hasAircon')} /> Aircon</label>
                                <label><input type='checkbox' checked={filters.hasParking} onChange={() => toggle('hasParking')} /> Parking</label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertySearch;