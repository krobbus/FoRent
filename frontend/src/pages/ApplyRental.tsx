import { useState, useEffect, useMemo } from 'react';
import { authFetch } from '../utils/api';
import type { ProfileDataProps, ApplyRentalProps } from './props';

function ApplyRental({ property, userId, userRole, onSuccess, onCancel, editMode = false, existingApplication = null }: ApplyRentalProps) {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<ProfileDataProps | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        moveInDate: existingApplication?.move_in_date ? existingApplication.move_in_date.slice(0, 10) : '',
        leaseTerm: existingApplication?.lease_term != null ? String(existingApplication.lease_term) : '12',
        message: existingApplication?.message ?? '',
        tenantContact: existingApplication?.tenant_contact ?? '',
        tenantEmail: existingApplication?.tenant_email ?? ''
    });

    const full_name = useMemo(() => {
        return[
            profile?.first_name, 
            profile?.middle_name, 
            profile?.last_name, 
            profile?.ext_name
        ].filter(Boolean).join(' ');
    }, [profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authFetch(`http://localhost:5000/api/tenants/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    if (!editMode) {
                        setFormData(prev => ({ 
                            ...prev, tenantContact: data.contact_num || '', tenantEmail: data.email || '' 
                        }))
                    };
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
            move_in_date: formData.moveInDate,
            tenant_contact: formData.tenantContact,
            tenant_email: formData.tenantEmail,
            lease_term: formData.leaseTerm,
            message: formData.message,
        };

        try {
            const url = editMode
                ? `http://localhost:5000/api/applications/${existingApplication?.id}`
                : 'http://localhost:5000/api/applications';
            
            const method = editMode ? 'PATCH' : 'POST';
            const body = editMode ? applicationData : {
                property_id: property?.id,
                tenant_id: userId,
                tenant_fullname: full_name,
                status: 'pending',
                ...applicationData,
            };

            const response = await authFetch(url, {
                method,
                body: JSON.stringify(body),
            });

            if (response.ok) {
                alert(editMode 
                    ? 'Application updated successfully!' 
                    : `Application for ${property?.property_name} submitted successfully!`
                );
                onSuccess();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to submit'}`);
            }
        } catch (error) {
            console.error("Submission failed", error);
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
                        <h2>{editMode ? 'Update Application' : 'Apply For Rental'}</h2>
                        <p>You're applying for <strong>{property?.property_name ?? 'this Property'}</strong></p>
                    </header>

                    {property && (
                        <div key={property.id} className='propertyCard'>
                            <h3>{property.property_name}</h3>

                            <div className='propertyInfo'>
                                <p>Price: {property.price != null ? `₱${property.price.toLocaleString()}` : 'N/A'}</p>
                                <p>Status: <strong>{property.status || 'N/A'}</strong></p>
                            </div>

                            <div className='propertyDetails'>
                                <p>Category: {property.category != null ? property.category.charAt(0).toUpperCase() + property.category.slice(1) : 'N/A'}</p>
                                <p>{property.bedroom_count > 0 ? `Bedroom/s: ${property.bedroom_count}` : 'No available bedrooms'}</p>
                                <p>{property.kitchen_count > 0 ? `Kitchen/s: ${property.kitchen_count}` : 'No available kitchens'}</p>
                                <p>{property.bathroom_count > 0 ? `Bathroom/s: ${property.bathroom_count}` : 'No available bathrooms'}</p>
                                <div className='otherRooms'>
                                    {property.other_rooms && property.other_rooms.length > 0 ? (
                                        <p>Other Rooms: {
                                            Array.isArray(property.other_rooms) 
                                                ? property.other_rooms.join(', ')
                                                : property.other_rooms
                                        }</p>
                                    ) : (
                                        <p>Other Rooms: No other rooms listed</p>
                                    )}
                                </div>
                                <p>Max Occupants: {property.max_occupants || 0}</p>
                                <p>{property.pets_allowed ? `Only ${property.pet_count} pet/s allowed` : 'Pets not allowed'}</p>
                            </div>

                             <div className='amenitiesDetails'>
                                {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                                    <p>Amenities: {property.amenities.join(', ')}</p>
                                ) : (
                                    <p>Amenities: No amenities listed</p>
                                )}
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
                                    value={full_name} 
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
                                <label>Preferred Move-in Date <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.moveInDate}
                                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                                />
                            </div>

                            <div className="formGroup">
                                <label>Lease Duration (Months) <span style={{ color: 'red' }}>*</span></label>
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
                                <label>Application Contact Number (Optional)</label>
                                <input 
                                    type="tel" 
                                    placeholder="09XXXXXXXXX"
                                    value={formData.tenantContact}
                                    onChange={(e) => setFormData({...formData, tenantContact: e.target.value})}
                                />
                            </div>

                            <div className="formGroup">
                                <label>Application Email <span style={{ color: 'red' }}>*</span></label>
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
                                {submitting 
                                ? 'Saving...' : editMode 
                                ? 'Save Changes' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </section>
    );
}

export default ApplyRental