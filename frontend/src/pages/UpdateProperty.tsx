import React, { useState } from "react";
import type { UpdatePropertyProps } from "./props";

function UpdateProperty({ goBack, property, onSuccess }: UpdatePropertyProps) {
    const existingAmenities = Array.isArray(property.amenities) ? (property.amenities as string[]) : [];
    const knownAmenities = ['Wifi', 'Aircon', 'Parking'];

    const [formData, setFormData] = useState({
        name: property.property_name || '',
        address: property.address || '',
        price: property.price?.toString() || '',
        description: property.description || '',
        category: property.category || '',
        bedroom_count: property.bedroom_count || 0,
        kitchen_count: property.kitchen_count || 0,
        bathroom_count: property.bathroom_count || 0,
        other_rooms: property.other_rooms ? property.other_rooms.split(', ') : [] as string[],
        other_rooms_count: property.other_rooms ? property.other_rooms.split(', ').length : 0,
        max_occupants: property.max_occupants || 1,
        pets_allowed: property.pets_allowed || false,
        pet_count: property.pet_count || 1,
        amenities: {
            wifi: existingAmenities.includes('Wifi'),
            aircon: existingAmenities.includes('Aircon'),
            parking: existingAmenities.includes('Parking'),
        },
        other_amenities: existingAmenities.filter(a => !knownAmenities.includes(a)),
        other_amenities_count: existingAmenities.filter(a => !knownAmenities.includes(a)).length,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCapitalize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, [e.target.name]: value.charAt(0).toUpperCase() + value.slice(1) });
    };

    const adjustCount = (field: string, delta: number) => {
        setFormData(prev => ({
            ...prev, [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + delta)
        }));
    };

    const handleOtherRoomChange = (index: number, value: string) => {
        const updated = [...formData.other_rooms];
        updated[index] = value.charAt(0).toUpperCase() + value.slice(1);
        setFormData({ ...formData, other_rooms: updated });
    };

    const handleOtherAmenityChange = (index: number, value: string) => {
        const updated = [...formData.other_amenities];
        updated[index] = value.charAt(0).toUpperCase() + value.slice(1);
        setFormData({ ...formData, other_amenities: updated });
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/properties/${property.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    amenities: {
                        ...formData.amenities,
                        other_amenities: formData.other_amenities.join(', ')
                    }
                })
            });

            if (response.ok) {
                alert("Property updated successfully!");
                onSuccess();
            } else {
                const errorData = await response.json();
                alert("Failed to update property: " + errorData.error);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    return (
        <section id='addPropertiesContainer'>
            <header>
                <h2>Update Property</h2>
                <p>Modify the details of your listed property. All changes will be reflected immediately upon saving.</p>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <label>Property Name:</label>
                    <input name='name' type='text' value={formData.name} onChange={handleCapitalize} required />

                    <label>Address:</label>
                    <input name='address' type='text' value={formData.address} onChange={handleChange} required />

                    <label>Price:</label>
                    <input name='price' type='number' step='0.01' value={formData.price} onChange={handleChange} required />

                    <label>Description:</label>
                    <input name='description' type='text' value={formData.description} onChange={handleChange} required />

                    <label>Category:</label>
                    <select name='category' value={formData.category} onChange={handleChange} required>
                        <option value=''>Select Category</option>
                        <option value='apartment'>Apartment</option>
                        <option value='house'>House</option>
                        <option value='condo'>Condo</option>
                    </select>

                    <fieldset>
                        <legend>Select Type of Rooms</legend>

                        {(['bedroom_count', 'kitchen_count', 'bathroom_count'] as const).map((field, i) => (
                            <div key={field} className="counterRow">
                                <input type="checkbox" checked={formData[field] > 0} readOnly />
                                <label>{['Bedrooms', 'Kitchen', 'Bathrooms'][i]}</label>
                                <div className="stepper">
                                    <button type="button" onClick={() => adjustCount(field, -1)}>-</button>
                                    <span>{formData[field]}</span>
                                    <button type="button" onClick={() => adjustCount(field, 1)}>+</button>
                                </div>
                            </div>
                        ))}

                        <fieldset>
                            <legend>Other Rooms</legend>
                            <div className="counterRow">
                                <label>How many other rooms?</label>
                                <div className="stepper">
                                    <button type="button" onClick={() => adjustCount('other_rooms_count', -1)}>-</button>
                                    <span>{formData.other_rooms_count}</span>
                                    <button type="button" onClick={() => adjustCount('other_rooms_count', 1)}>+</button>
                                </div>
                            </div>
                            {Array.from({ length: formData.other_rooms_count }).map((_, i) => (
                                <div key={i} className="inputRow" style={{ marginTop: '10px' }}>
                                    <label>Room {i + 1} Name:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Balcony, Attic"
                                        value={formData.other_rooms[i] || ''}
                                        onChange={(e) => handleOtherRoomChange(i, e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </fieldset>
                    </fieldset>

                    <fieldset>
                        <legend>Occupants & Pets</legend>
                        <div className="counterRow">
                            <label>Max Persons</label>
                            <div className="stepper">
                                <button type="button" onClick={() => adjustCount('max_occupants', -1)}>-</button>
                                <span>{formData.max_occupants}</span>
                                <button type="button" onClick={() => adjustCount('max_occupants', 1)}>+</button>
                            </div>
                        </div>
                        <div className="counterRow">
                            <input type="checkbox" checked={formData.pets_allowed} onChange={(e) => setFormData({...formData, pets_allowed: e.target.checked})} />
                            <label>Pets Allowed</label>
                            {formData.pets_allowed && (
                                <div className="stepper">
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, pet_count: Math.max(1, prev.pet_count - 1)}))}>-</button>
                                    <span>{formData.pet_count}</span>
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, pet_count: prev.pet_count + 1}))}>+</button>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Amenities</legend>
                        <div className="checkboxGrid">
                            <label>
                                <input type="checkbox" checked={formData.amenities.wifi} onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, wifi: e.target.checked}})} /> Wifi
                            </label>

                            <label>
                                <input type="checkbox" checked={formData.amenities.aircon} onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, aircon: e.target.checked}})} /> Aircon
                            </label>

                            <label>
                                <input type="checkbox" checked={formData.amenities.parking} onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, parking: e.target.checked}})} /> Parking
                            </label>

                            <fieldset>
                                <legend>Other Amenities</legend>
                                <div className="counterRow">
                                    <label>How many other amenities?</label>
                                    <div className="stepper">
                                        <button type="button" onClick={() => adjustCount('other_amenities_count', -1)}>-</button>
                                        <span>{formData.other_amenities_count}</span>
                                        <button type="button" onClick={() => adjustCount('other_amenities_count', 1)}>+</button>
                                    </div>
                                </div>
                                {Array.from({ length: formData.other_amenities_count }).map((_, i) => (
                                    <div key={i} className="inputRow" style={{ marginTop: '10px' }}>
                                        <label>Amenity {i + 1}:</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Appliances, 24/7 Gym, Pool, etc."
                                            value={formData.other_amenities[i] || ''}
                                            onChange={(e) => handleOtherAmenityChange(i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </fieldset>
                        </div>
                    </fieldset>

                    <div className='btnWrapper'>
                        <button type='submit' className='submitBtn'>Save Changes</button>
                        <button type='button' className='cancelBtn' onClick={goBack}>Cancel</button>
                    </div>
                </form>
            </main>
        </section>
    );
}

export default UpdateProperty;