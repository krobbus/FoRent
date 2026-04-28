import { useState, useEffect } from 'react'
import type { UpdateProfileProps } from './props'

function UpdateProfile({ goBack, userRole, userId, onSuccess }: UpdateProfileProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',    
        last_name: '',
        ext_name: '',
        email: '',
        contact_num: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const endpoint = userRole === 'landlord' ? '/api/landlords' : '/api/tenants';
            try {
                const response = await fetch(`http://localhost:5000${endpoint}/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        first_name: data.first_name || '',
                        middle_name: data.middle_name || '',
                        last_name: data.last_name || '',
                        ext_name: data.ext_name || '',
                        email: data.email || '',
                        contact_num: data.contact_num || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, userRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('token');

        const endpoint = userRole === 'landlord' ? '/api/landlords' : '/api/tenants';
        try {
            const response = await fetch(`http://localhost:5000${endpoint}/${userId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Profile updated successfully!");
                onSuccess();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to update profile'}`);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <section id='updateProfileContainer'>
            <header>
                <h2>Update Profile</h2>
            </header>

            <main>
                <form onSubmit={handleSubmit}>
                    <label>First Name:</label>
                    <input name='first_name' type='text' placeholder="Enter your first name" value={formData.first_name} autoComplete='firstName' onChange={handleChange} required />

                    <label>Middle Name:</label>
                    <input name='middle_name' type='text' placeholder="Enter your middle name" value={formData.middle_name} autoComplete='middleName' onChange={handleChange} />

                    <label>LastName:</label>
                    <input name='last_name' type='text' placeholder="Enter your last name" value={formData.last_name} autoComplete='lastName' onChange={handleChange} required />

                    <label>Extension:</label>
                    <input name='ext_name' type='text' placeholder="e.g. jr., sr., III" value={formData.ext_name} autoComplete='extenstion' onChange={handleChange} />

                    <label>Email:</label>
                    <input name='email' type='email' placeholder="e.g. XXXXXXX@XXXXX.com" value={formData.email} autoComplete='email' onChange={handleChange} required />

                    <label>Contact Number:</label>
                    <input name='contact_num' type='text' placeholder="09XXXXXXXXX" value={formData.contact_num} autoComplete='contactNumber' onChange={handleChange} />

                    <div className='btnWrapper'>
                        <button type='submit' className='saveBtn' disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type='button' className='cancelBtn' onClick={goBack}>Cancel</button>
                    </div>
                </form>
            </main>
        </section>
    );
}

export default UpdateProfile;