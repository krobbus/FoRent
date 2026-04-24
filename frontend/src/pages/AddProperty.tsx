import React, { useState, type ChangeEvent } from 'react'
import type { AddPropertyProps } from './props'

function AddProperty({ goBack, userId, userRole }: AddPropertyProps){
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        description: '',
        category: '',
        bedroom_count: 0,
        kitchen_count: 0,
        bathroom_count: 0,
        other_rooms: [] as string[],
        other_rooms_count: 0,
        max_occupants: 1,
        pets_allowed: false,
        pet_count: 1,
        amenities: {
            wifi: false,
            aircon: false,
            parking: false,
            other_amenities: ''
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCapitalize = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
        setFormData({ ...formData, [e.target.name]: capitalized });
    };

    const adjustCount = (field: string, delta: number) => {
        setFormData(prev => ({
            ...prev, [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + delta)
        }));
    };

    const handleOtherRoomCountChange = (index: number, value: string) => {
        const updatedRooms = [...formData.other_rooms];
        updatedRooms[index] = value.charAt(0).toUpperCase() + value.slice(1);
        setFormData({ ...formData, other_rooms: updatedRooms });
    };

    const handleSubmit = async (e: ChangeEvent) => {
        e.preventDefault();

        console.log("Sending Landlord ID:", userId);
        
        try {
            const response = await fetch('http://localhost:5000/api/addproperties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, landlord_id: userId }) 
            });

            if (response.ok) {
                setFormData({ 
                    name: '', 
                    address: '', 
                    price: '',
                    description: '',
                    category: '',
                    bedroom_count: 0,
                    kitchen_count: 0,
                    bathroom_count: 0,
                    other_rooms: [] as string[],
                    other_rooms_count: 0,
                    max_occupants: 1,
                    pets_allowed: false,
                    pet_count: 0,
                    amenities: {
                        wifi: false,
                        aircon: false,
                        parking: false,
                        other_amenities: ''
                    }
                });
                alert("Property added successfully!");
                goBack();
            } else {
                const errorData = await response.json();
                alert("Failed to add property: " + errorData.error);
            }
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    const parentLabel = userRole === 'landlord' ? 'My Properties' : 'My Rentals';

    return (
        <section id='addPropertiesContainer'>
            <span>
                &gt;<a onClick={() => { goBack(); goBack(); }}> Home </a> 
                &gt;<a onClick={goBack}> {parentLabel} </a> 
                &gt;<span className="activeCrumb"> Add New Property </span>
            </span>

            <header>
                <h1 className='mainTitle'>Add New Property</h1>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <label>Property Name:</label>
                    <input name='name' type='text' placeholder={`Type the property name here...`} value={formData.name} onChange={handleCapitalize} required />
                    
                    <label>Address:</label>
                    <input name='address' type='text' placeholder={`Type the complete address here...`} value={formData.address} onChange={handleChange} required />

                    <label>Price:</label>
                    <input name='price' type='number' step='0.01' onChange={handleChange} required />

                    <label>Description:</label>
                    <input 
                        name='description' 
                        type='text' 
                        placeholder={`e.g. Spacious balcony, quiet neighborhood... [Put "N/A" if you don't want to add details]`} 
                        value={formData.description}
                        onChange={handleChange} 
                        required 
                    />

                    <label>Category:</label>
                    <select name='category' onChange={handleChange} required>
                        <option value=''>Select Category</option>
                        <option value='apartment'>Apartment</option>
                        <option value='house'>House</option>
                        <option value='condo'>Condo</option>
                    </select>

                    <fieldset>
                        <legend>Select Type of Rooms</legend>
                        
                        <div className="counterRow">
                            <input type="checkbox" checked={formData.bedroom_count > 0} readOnly />

                            <label>Bedrooms</label>

                            <div className="stepper">
                                <button type="button" onClick={() => adjustCount('bedroom_count', -1)}>-</button>
                                <span>{formData.bedroom_count}</span>
                                <button type="button" onClick={() => adjustCount('bedroom_count', 1)}>+</button>
                            </div>
                        </div>

                        <div className="counterRow">
                            <input type="checkbox" checked={formData.kitchen_count > 0} readOnly />

                            <label>Kitchen</label>

                            <div className="stepper">
                                <button type="button" onClick={() => adjustCount('kitchen_count', -1)}>-</button>
                                <span>{formData.kitchen_count}</span>
                                <button type="button" onClick={() => adjustCount('kitchen_count', 1)}>+</button>
                            </div>
                        </div>

                        <div className="counterRow">
                            <input type="checkbox" checked={formData.bathroom_count > 0} readOnly />

                            <label>Bathrooms</label>

                            <div className="stepper">
                                <button type="button" onClick={() => adjustCount('bathroom_count', -1)}>-</button>
                                <span>{formData.bathroom_count}</span>
                                <button type="button" onClick={() => adjustCount('bathroom_count', 1)}>+</button>
                            </div>
                        </div>

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
                                        placeholder="e.g. Balcony, Attic, Library"
                                        value={formData.other_rooms[i] || ''}
                                        onChange={(e) => handleOtherRoomCountChange(i, e.target.value)}
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
                            <input 
                                type="checkbox" 
                                checked={formData.pets_allowed} 
                                onChange={(e) => setFormData({...formData, pets_allowed: e.target.checked})} 
                            />

                            <label>Pets Allowed</label>

                            {formData.pets_allowed && (
                                <div className="stepper">
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, pet_count: Math.max(1, prev.pet_count - 1)}))}>-</button>
                                    <span>{formData.pet_count}</span>
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, pet_count: Math.max(1, prev.pet_count + 1)}))}>+</button>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Amenities</legend>
                        <div className="checkboxGrid">
                            <label>
                                <input type="checkbox" onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, wifi: e.target.checked}})} /> Wifi
                            </label>
                            <label>
                                <input type="checkbox" onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, aircon: e.target.checked}})} /> Aircon
                            </label>
                            <label>
                                <input type="checkbox" onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, parking: e.target.checked}})} /> Parking
                            </label>
                            <div className="inputRow">
                                <label>Other:</label>
                                <input 
                                    name="other_amenity" 
                                    type="text" 
                                    placeholder="e.g. Gym, Pool, etc."
                                    onChange={(e) => setFormData({...formData, amenities: {...formData.amenities, other_amenities: e.target.value}})} 
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className='btnWrapper'>
                        <button type='submit' className='submitBtn'>+ Add Property</button>
                        <button type='button' className='cancelBtn' onClick={goBack}>Cancel</button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default AddProperty