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
                const response = await authFetch(
                    `http://localhost:5000${endpoint}/${userId}`,
                    {},
                    onAuthError
                );
                if (!response.ok) return;

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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <section id='viewProfileContainer'>
            <header>
                <h2>My Profile</h2>
                <p>Review your account details and personal information on file.</p>
            </header>

            <main>
                {loading ? (
                    <p>Loading profile...</p>
                ) : (
                    <>
                        <fieldset>
                            <legend>Account Details</legend>

                            <p><strong>Member Since:</strong> {user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
                            <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
                            <p><strong>Role:</strong> {user?.role ? user?.role.charAt(0).toUpperCase() + user?.role.slice(1) : 'N/A'}</p>
                        </fieldset>

                        <fieldset>
                            <legend>{userRole === 'landlord' ? 'Landlord' : 'Tenant'} Information</legend>

                            <p><strong>Account ID:</strong> {profile?.user_id || 'N/A'}</p>
                            <p><strong>Full Name:</strong> {profile?.first_name || ''} {profile?.middle_name || ''} {profile?.last_name || ''} {profile?.ext_name || ''}</p>
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