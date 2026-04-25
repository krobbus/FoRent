import { useState, useEffect } from 'react';
import type { ProfileDataProps, ApplyRentalProps } from './props';

function ApplyRental({ property, userId, userRole, onSuccess, onCancel }: ApplyRentalProps) {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<ProfileDataProps | null>(null);
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        moveInDate: '',
        leaseTerm: '12',
        message: '',
        tenantContact: '',
        tenantEmail: ''
    });

    const full_name = [
        profile?.first_name, 
        profile?.middle_name, 
        profile?.last_name, 
        profile?.ext_name
    ].filter(Boolean).join(' ');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/tenants/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    setFormData(prev => ({ ...prev, tenantContact: data.contact_num || '', tenantEmail: data.email || '' }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        userId ? fetchProfile() : setLoading(false);
    }, [userId]);
   
    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const applicationData = {
            property_id: property?.id,
            tenant_id: userId,
            move_in_date: formData.moveInDate,
            tenant_contact: formData.tenantContact,
            tenant_email: formData.tenantEmail,
            lease_term: formData.leaseTerm,
            message: formData.message,
            status: 'pending'
        };

        try {   
            const response = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData), 
            }); 

            if (response.ok) {
                alert(`Application for ${property?.property_name} submitted successfully!`);
                onSuccess();
            } else {
                const errorData = await response.json();
                console.error(`Error: ${errorData.message}`);
                alert(`Error: ${errorData.message || 'Failed to submit application'}`);
            }
        } catch (error) {
            console.error("Submission failed", error);
            setSubmitting(false);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (userRole !== 'tenant') {
        return (
            <div className="errorContainer">
                <p>Only verified tenants are allowed to apply for properties.</p>
                <button onClick={onCancel}>Go Back</button>
            </div>
        );
    }

    return (
        <section id="applyRentalContainer">
            {loading ? (
                <p>Loading Details...</p>
            ) : (
                <>
                    <header>
                        <h1 className="mainTitle">APPLY FOR RENTAL</h1>
                        <p className="subTitle">
                            You're applying for <strong>{property?.property_name ?? 'this Property'}</strong>
                        </p>
                    </header>

                    {property && (
                        <div key={property.id} className='propertyCard'>
                            <h3>{property.property_name}</h3>

                            <div className='propertyInfo'>
                                <p>Price: ₱{property.price.toLocaleString()}</p>
                                <p>Status: <strong>{property.status}</strong></p>
                            </div>

                            <div className='propertyDetails'>
                                <p>Category: {property.category.charAt(0).toUpperCase() + property.category.slice(1)}</p>
                                <p>{property.bedroom_count > 0 ? `Bedroom/s: ${property.bedroom_count}` : 'No available bedrooms'}</p>
                                <p>{property.kitchen_count > 0 ? `Kitchen/s: ${property.kitchen_count}` : 'No available kitchens'}</p>
                                <p>{property.bathroom_count > 0 ? `Bathroom/s: ${property.bathroom_count}` : 'No available bathrooms'}</p>
                                <p>Max Occupants: {property.max_occupants}</p>
                                <p>{property.pets_allowed ? `Only ${property.pet_count} pet/s allowed` : 'Pets not allowed'}</p>
                            </div>
                        </div>
                    )}

                    <form className="applyForm" onSubmit={handleSubmit}>
                        <fieldset className="verificationSection">
                            <legend>Account Verification</legend>
                            
                            <div className="formGroup">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={full_name || 'Loading...'} 
                                    disabled 
                                    className="disabledInput"
                                />
                            </div>

                            <div className="formGroup">
                                <label>Tenant ID</label>
                                <input 
                                    type="text" 
                                    value={userId} 
                                    disabled 
                                    className="disabledInput"
                                />
                            </div>
                        </fieldset>

                        <fieldset className="applicationDetails">
                            <legend>Lease Information</legend>

                            <div className="formGroup">
                                <label>Preferred Move-in Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.moveInDate}
                                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                                />
                            </div>

                            <div className="formGroup">
                                <label>Lease Duration (Months)</label>
                                <select 
                                    value={formData.leaseTerm}
                                    onChange={(e) => setFormData({...formData, leaseTerm: e.target.value})}
                                >
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months</option>
                                    <option value="24">24 Months</option>
                                </select>
                            </div>

                            <div className="formGroup">
                                <label>Application Contact Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="09XXXXXXXXX"
                                    value={formData.tenantContact}
                                    onChange={(e) => setFormData({...formData, tenantContact: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="formGroup">
                                <label>Application Email</label>
                                <input 
                                    type="email" 
                                    placeholder="XXXXXXX@XXXXX.com"
                                    value={formData.tenantEmail}
                                    onChange={(e) => setFormData({...formData, tenantEmail: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="formGroup">
                                <label>Message to Landlord (Optional)</label>
                                <textarea 
                                    placeholder="Tell the landlord a bit about yourself..."
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                />
                            </div>
                        </fieldset>

                        <div className="btnWrapper">
                            <button type="button" className="cancelBtn" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="submitBtn" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </section>
    );
}

export default ApplyRental