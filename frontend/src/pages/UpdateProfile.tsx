import { useState, useEffect, useRef } from 'react'
import { authFetch } from '../utils/api'
import type { UpdateProfileProps } from '../utils/props'

function UpdateProfile({ goBack, userRole, userId, onSuccess }: UpdateProfileProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCredForm, setShowCredForm] = useState(false);
    const [showInfoForm, setShowInfoForm] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    const [infoData, setInfoData] = useState({
        first_name: '',
        middle_name: '',    
        last_name: '',
        ext_name: '',
        email: '',
        contact_num: '',
    });

    const [credData, setCredData] = useState({
        currentPassword: '',
        pin: '',
        newUsername: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const endpoint = userRole === 'landlord' ? '/api/landlords' : '/api/tenants';
            
            try {
                const response = await authFetch(`http://localhost:5000${endpoint}/${userId}`);
                if (!response.ok) return;

                const data = await response.json();
                setInfoData({
                    first_name: data.first_name || '',
                    middle_name: data.middle_name || '',
                    last_name: data.last_name || '',
                    ext_name: data.ext_name || '',
                    email: data.email || '',
                    contact_num: data.contact_num || '',
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, userRole]);

    const attemptVerify = (password: string, pin: string) => {
        if (!password || !pin) {
            setIsVerified(false);
            setVerifyError('');
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setVerifying(true);
            setVerifyError('');
            try {
                const response = await authFetch(
                    `http://localhost:5000/api/users/${userId}/verify`,
                    {
                        method: 'POST',
                        body: JSON.stringify({ currentPassword: password, pin })
                    },
                );

                if (response.ok) {
                    setIsVerified(true);
                    setVerifyError('');
                } else {
                    setIsVerified(false);
                    const data = await response.json();
                    setVerifyError(data.error || 'Verification failed.');
                }
            } catch {
                setIsVerified(false);
                setVerifyError('Unable to verify. Please try again.');
            } finally {
                setVerifying(false);
            }
        }, 600);
    };

    const handleCredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = { ...credData, [e.target.name]: e.target.value };
        setCredData(updated);

        if (e.target.name === 'currentPassword' || e.target.name === 'pin') {
            setIsVerified(false);
            attemptVerify(
                e.target.name === 'currentPassword' ? e.target.value : credData.currentPassword,
                e.target.name === 'pin' ? e.target.value : credData.pin
            );
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInfoData({ ...infoData, [e.target.name]: e.target.value });
    };

    const handleCredToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowCredForm(e.target.checked);
        if (!e.target.checked) {
            setCredData({
                currentPassword: '', pin: '', newUsername: '',
                newPassword: '', confirmNewPassword: '',
            });
        }
    };

    const handleInfoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowInfoForm(e.target.checked);
        if (!e.target.checked) {
            setInfoData({ first_name: '', middle_name: '', last_name: '', ext_name: '', email: '', contact_num: '' });
        }
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (showCredForm) {
            if (!credData.currentPassword || !credData.pin) {
                alert("Current password and PIN are required.");
                return;
            }
            if (!credData.newUsername && !credData.newPassword) {
                alert("Please provide a new username or new password to update.");
                return;
            }
            if (credData.newPassword && credData.newPassword !== credData.confirmNewPassword) {
                alert("New passwords do not match.");
                return;
            }
        }
        setSubmitting(true);

        try {
            const requests: Promise<Response>[] = [];

            if (showCredForm) {
                requests.push(
                    authFetch(
                        `http://localhost:5000/api/users/${userId}/credentials`,
                        {
                            method: 'PATCH',
                            body: JSON.stringify({
                                currentPassword: credData.currentPassword,
                                pin: credData.pin,
                                newUsername: credData.newUsername || undefined,
                                newPassword: credData.newPassword || undefined,
                            })
                        }
                    )
                );
            }

            if (showInfoForm) {
                const endpoint = userRole === 'landlord' ? '/api/landlords' : '/api/tenants';
                requests.push(
                    authFetch(
                        `http://localhost:5000${endpoint}/${userId}`,
                        { method: 'PATCH', body: JSON.stringify(infoData) },
                    )
                );
            }

            const results = await Promise.all(requests);
            const failed = results.find(r => !r.ok);

            if (failed) {
                const errorData = await failed.json();
                alert(`Error: ${errorData.error || 'One or more updates failed.'}`);
                return;
            }

            if (showCredForm) {
                alert("Updates saved. You will be logged out since your credentials changed.");
                localStorage.removeItem('token');
            } else {
                alert("Profile updated successfully!");
            }

            onSuccess();
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const anySelected = showCredForm || showInfoForm;

    return (
        <section id='updateProfileContainer'>
            <header>
                <h2>Update Profile</h2>
                <p>Manage and update your account credentials and personal information securely.</p>
            </header>

            { loading ? (
                <p>Loading profile...</p>
            ) : (
                <>
                    <main>
                        <div className='toggleField'>
                            <h3>Select What You Would Like to Update</h3>
                            <small>You may update one or both sections simultaneously. Select the applicable option(s) below to proceed.</small>
                            
                            <div className='toggleWrapper'>
                                <label className='toggleCheckbox'>
                                    <input
                                        type='checkbox'
                                        checked={showCredForm}
                                        onChange={handleCredToggle}
                                    />
                                    <p>I would like to update my account credentials <span>(username or password)</span></p>
                                </label>

                                <label className='toggleCheckbox'>
                                    <input
                                        type='checkbox'
                                        checked={showInfoForm}
                                        onChange={handleInfoToggle}
                                    />
                                    <p>I would like to update my personal information</p>
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {showCredForm && (
                                <fieldset className='authField'>
                                    <legend>Change Account Credentials</legend>
                                    <small>For security purposes, please verify your identity before making any changes to your account credentials.</small>

                                    <fieldset className='accountIdentityField'>
                                        <legend>Identity Verification</legend>
                                        <small>Enter your current password and PIN exactly as registered. Verification occurs automatically.</small>

                                        <div className="accountIdentityWrapper">
                                            <div className='currentPass'>
                                                <label>Current Password: <span>*</span></label>
                                                <input
                                                    name='currentPassword'
                                                    type='password'
                                                    placeholder="Enter your current password"
                                                    value={credData.currentPassword}
                                                    autoComplete='current-password'
                                                    onChange={handleCredChange}
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="pin">
                                                <label>PIN: <span>*</span></label>
                                                <input
                                                    name='pin'
                                                    type='password'
                                                    placeholder="Enter your PIN"
                                                    value={credData.pin}
                                                    onChange={handleCredChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="verificationWrapper">
                                            {verifying && <p className='verifying'><small>Verifying credentials...</small></p>}
                                            {!verifying && isVerified && <p className='verified'><small>Identity verified. You may now update your credentials below.</small></p>}
                                            {!verifying && verifyError && <p className='error'><small>{verifyError}</small></p>}
                                        </div>
                                    </fieldset>
                                        
                                    { isVerified && (
                                        <fieldset className='accountDetailsField'>
                                            <legend>Account Details</legend>
                                            <p><small>Leave any field blank to retain its current value.</small></p>
                                            
                                            <div className="accountDetailsWrapper">
                                                <div className="username">
                                                    <label>New Username:</label>
                                                    <input
                                                        name='newUsername'
                                                        type='text'
                                                        placeholder="Enter a new username (optional)"
                                                        value={credData.newUsername}
                                                        autoComplete='username'
                                                        onChange={handleCredChange}
                                                    />
                                                </div>
                                                
                                                <div className="newPassword">
                                                    <label>New Password:</label>
                                                    <input
                                                        name='newPassword'
                                                        type='password'
                                                        placeholder="Enter a new password (optional)"
                                                        value={credData.newPassword}
                                                        autoComplete='new-password'
                                                        onChange={handleCredChange}
                                                    />
                                                </div>

                                                <div className="confirmPassword">
                                                    <label>Confirm New Password:</label>
                                                    <input
                                                        name='confirmNewPassword'
                                                        type='password'
                                                        placeholder="Re-enter your new password"
                                                        value={credData.confirmNewPassword}
                                                        autoComplete='new-password'
                                                        onChange={handleCredChange}
                                                    />
                                                </div>
                                            </div>
                                        </fieldset>
                                    )}
                                </fieldset>
                            )}

                            {showInfoForm && (
                                <fieldset className='infoField'>
                                    <legend>Personal Information</legend>
                                    <small>Ensure all required fields are accurately filled in before submitting your changes.</small>

                                    <div className="infoWrapper">
                                        <div id="firstName">
                                            <label>First Name: <span style={{ color: 'red' }}>*</span></label>
                                            <input name='first_name' type='text' placeholder="Enter your first name" value={infoData.first_name} autoComplete='firstName' onChange={handleInfoChange} required />
                                        </div>

                                        <div id="middleName">
                                            <label>Middle Name:</label>
                                            <input name='middle_name' type='text' placeholder="Enter your middle name" value={infoData.middle_name} autoComplete='middleName' onChange={handleInfoChange} />
                                        </div>

                                        <div id="lastName">
                                            <label>LastName: <span style={{ color: 'red' }}>*</span></label>
                                            <input name='last_name' type='text' placeholder="Enter your last name" value={infoData.last_name} autoComplete='lastName' onChange={handleInfoChange} required />
                                        </div>

                                        <div id="extName">
                                            <label>Extension:</label>
                                            <input name='ext_name' type='text' placeholder="e.g. jr., sr., III" value={infoData.ext_name} autoComplete='extenstion' onChange={handleInfoChange} />
                                        </div>

                                        <div id="email">
                                            <label>Email: <span style={{ color: 'red' }}>*</span></label>
                                            <input name='email' type='email' placeholder="e.g. XXXXXXX@XXXXX.com" value={infoData.email} autoComplete='email' onChange={handleInfoChange} required />
                                        </div>

                                        <div id="contactNumber">
                                            <label>Contact Number:</label>
                                            <input name='contact_num' type='text' placeholder="09XXXXXXXXX" value={infoData.contact_num} autoComplete='contactNumber' onChange={handleInfoChange} />
                                        </div>
                                    </div>
                                </fieldset>
                            )}

                            <div className='actionBtnWrapper'>
                                {anySelected ? (
                                    <>
                                        <button type='submit' className='saveBtn' disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button type='button' className='cancelBtn' onClick={goBack}>Cancel</button>
                                    </>
                                ) : (
                                    <button type='button' className='cancelBtn' onClick={goBack}>Cancel</button>
                                )}
                            </div>
                        </form>
                    </main>
                </>
            )}
        </section>
    );
}

export default UpdateProfile;