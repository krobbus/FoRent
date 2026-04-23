import React, { useState, type ChangeEvent } from 'react'
import type { AddPropertyProps } from './props'

function AddProperty({ goBack, userId }: AddPropertyProps){
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        category: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                setFormData({ name: '', address: '', price: '', category: '' });
                goBack();
            } else {
                const errorData = await response.json();
                console.error("Server says:", errorData.error);
                alert("Failed to add property: " + errorData.error);
            }
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    return (
        <section id='addPropertiesContainer'>
            <span>
                &gt;<a onClick={() => { goBack(); goBack(); }}> Home </a> 
                &gt;<a onClick={goBack}> My Properties </a> 
                &gt;<span className="activeCrumb"> My Properties </span>
            </span>

            <header>
                <h1 className='mainTitle'>Add New Property</h1>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <label>Property Name:</label>
                    <input name='name' type='text' onChange={handleChange} required />
                    
                    <label>Address:</label>
                    <input name='address' type='text' onChange={handleChange} required />

                    <label>Price:</label>
                    <input name='price' type='number' step='0.01' onChange={handleChange} required />

                    <label>Category:</label>
                    <select name='category' onChange={handleChange} required>
                        <option value=''>Select Category</option>
                        <option value='apartment'>Apartment</option>
                        <option value='house'>House</option>
                        <option value='condo'>Condo</option>
                    </select>

                    <div className='btnWrapper'>
                        <button type='submit'>+ Add Property</button>
                        <button type='button' onClick={goBack}>Cancel</button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default AddProperty