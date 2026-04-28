import { useState, useEffect } from 'react'
import { authFetch } from '../utils/api'
import type { UserDataProps, ProfileDataProps, ViewProfileProps } from './props'

function ViewProfile({ goBack, userRole, userId, onUpdateProfile }: ViewProfileProps){
    const [user, setUser] = useState<UserDataProps | null>(null);
    const [profile, setProfile] = useState<ProfileDataProps | null>(null);
    const [loading, setLoading] = useState(true);

    const onAuthError = () => { goBack(); };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authFetch(
                    `http://localhost:5000/api/users/${userId}`,
                    {},
                    onAuthError
                );
                if (!response.ok) return;

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    useEffect(() => {
        const fetchProfile = async () => {
            const endpoint = userRole === 'landlord' ? `/api/landlords` : `/api/tenants`;

            try {
                const response = await fetch(`http://localhost:5000${endpoint}/${userId}`);
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, userRole]);

    return (
        <section id='viewProfileContainer'>
            <header>
                <h2>My Profile</h2>
                <p></p>
            </header>

            <main>
                {loading ? (
                    <p>Loading profile...</p>
                ) : (
                    <>
                        <fieldset>
                            <legend>Account Details</legend>
                            <p><strong>Created At:</strong> {user?.created_at || ''}</p>
                            <p><strong>Userame:</strong> {user?.username || 'N/A'}</p>
                            <p><strong>Role:</strong> {user?.role ? user?.role.charAt(0).toUpperCase() + user?.role.slice(1) : 'N/A'}</p>
                        </fieldset>

                        <fieldset>
                            <legend>{userRole === 'landlord' ? 'Landlord' : 'Tenant'} Information</legend>
                            <p><strong>{userRole === 'landlord' ? 'Landlord' : 'Tenant'} ID:</strong> {profile?.user_id}</p>
                            <p><strong>Name:</strong> {profile?.first_name || ''} {profile?.middle_name || ''} {profile?.last_name || ''} {profile?.ext_name || ''}</p>
                            <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
                            <p><strong>Contact Number:</strong> {profile?.contact_num || 'N/A'}</p>
                        </fieldset>

                        <div className="btnWrapper">
                            <button type="button" className="updateBtn" onClick={() => onUpdateProfile()}>Modify Details</button>
                            <button type="button" className="cancelBtn" onClick={goBack}>Go Back</button>
                        </div>
                    </>
                )}
            </main>
        </section>
    )
}

export default ViewProfile