import { useState, useEffect, useMemo } from 'react';
import { authFetch } from '../utils/api';
import type { ProfileDataProps, CreateRequestsProps } from './props';

function CreateRequests({ property, userId, userRole, onSuccess, onCancel, editMode = false, existingRequest = null }: CreateRequestsProps) {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<ProfileDataProps | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        priorityLevel: existingRequest?.priority != null ? String(existingRequest.priority) : '',
        issueTitle: existingRequest?.issue_title ?? '',
        issueField: existingRequest?.issue_field != null ? String(existingRequest.issue_field) : '',
        issueDescription: existingRequest?.issue_description ?? '',
        tenantEmail: existingRequest?.tenant_email ?? '',
        tenantContact: existingRequest?.tenant_contact ?? '',
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

        const requestsData = {
            priority: formData.priorityLevel,
            issue_title: formData.issueTitle,
            issue_field: formData.issueField,
            issue_description: formData.issueDescription,
            tenant_contact: formData.tenantContact,
            tenant_email: formData.tenantEmail
        };

        try {
            const url = editMode
                ? `http://localhost:5000/api/maintenance/${existingRequest?.id}`
                : 'http://localhost:5000/api/maintenance';
            
            const method = editMode ? 'PATCH' : 'POST';
            const body = editMode ? requestsData : {
                property_id: property?.id,
                tenant_id: userId,
                tenant_fullname: full_name,
                status: 'pending',
                ...requestsData,
            };

            const response = await authFetch(url, {
                method,
                body: JSON.stringify(body),
            });

            if (response.ok) {
                alert(editMode 
                    ? 'Request updated successfully!' 
                    : `Request for ${property?.property_name} submitted successfully!`
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
                <p>Only verified tenants are allowed to create for requests.</p>
                <button onClick={onCancel}>Go Back</button>
            </div>
        );
    }

    return (
        <section id="applyMaintenanceContainer">
            {loading ? (
                <p>Loading Details...</p>
            ) : (
                <>
                    <header>
                        <h2>{editMode ? 'Update' : 'Create'} Maintenance Request</h2>
                        <p>You're creating maintenance request for <strong>{property?.property_name ?? 'this Property'}</strong></p>
                    </header>

                    {property && (
                        <div key={property.id} className='propertyCard'>
                            <h3>{property.property_name}</h3>

                            <div className='propertyInfo'>
                                <p>Price: {property.price != null ? `₱${property.price.toLocaleString()}` : 'N/A'}</p>
                                <p>Status: <strong>{property.status.charAt(0).toUpperCase() + property.status.slice(1)}</strong></p>
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
                                <label>Tenant ID</label>
                                <input 
                                    type="text" 
                                    value={userId} 
                                    disabled 
                                    className="disabledInput"
                                />
                            </div>
                            
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
                                <label>Application Contact Number (Optional)</label>
                                <input 
                                    type="tel" 
                                    placeholder="09XXXXXXXXX"
                                    value={formData.tenantContact}
                                    onChange={(e) => setFormData({...formData, tenantContact: e.target.value})}
                                />
                            </div>
                        </fieldset>

                        <fieldset className="applicationDetails">
                            <legend>Request Information</legend>
                            
                            <div className="formGroup">
                                <label>Priority Level <span style={{ color: 'red' }}>*</span></label>
                                <select 
                                    value={formData.priorityLevel}
                                    onChange={(e) => setFormData({...formData, priorityLevel: e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="low">Low (Routine)</option>
                                    <option value="moderate">Moderate (Repair Soon)</option>
                                    <option value="high">High (Urgent)</option>
                                    <option value="emergency">Emergency (Safety Risk)</option>
                                </select>
                            </div>

                            <div className="formGroup">
                                <label>Title of Issue <span style={{ color: 'red' }}>*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="Enter the title of your issue..."
                                    value={formData.issueTitle}
                                    onChange={(e) => setFormData({...formData, issueTitle: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="formGroup">
                                <label>Category of Issue <span style={{ color: 'red' }}>*</span></label>
                                <select 
                                    value={formData.issueField}
                                    onChange={(e) => setFormData({...formData, issueField: e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="hvac">Heating/Cooling</option>
                                    <option value="appliances">Appliances</option>
                                    <option value="structural">Structural/Carpentry</option>
                                    <option value="safety">Safety & Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="formGroup">
                                <label>Description of the Issue <span style={{ color: 'red' }}>*</span></label>
                                <textarea 
                                    placeholder="Tell the issue or concern on your property..."
                                    rows={4}
                                    value={formData.issueDescription}
                                    onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                                    required
                                />
                            </div>
                        </fieldset>

                        <div className="btnWrapper">
                            <button type="button" className="cancelBtn" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="submitBtn" disabled={submitting}>
                                {submitting 
                                ? 'Saving...' : editMode 
                                ? 'Save Changes' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </section>
    );
}

export default CreateRequests