import { useState, useEffect } from 'react'
import type { ProfileDataProps, ProfileProps } from './props'

function ViewProfile({ goBack, userRole, userId }: ProfileProps){
    const [profile, setProfile] = useState<ProfileDataProps | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const endpoint = userRole === 'landlord' ? `/api/landlords` : `/api/tenants`;

            try {
                const response = await fetch(`http://localhost:5000${endpoint}/${userId}`);
                const data = await response.json();
                console.log("Fetched Profile:", data);
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <section id='viewProfileContainer'>
            <header>
                <h1 className='mainTitle'>My Profile</h1>
            </header>

            <main>
                {loading ? (
                    <p>Loading profile...</p>
                ) : (
                    <>
                        <div>
                            <p><strong>Name:</strong> {profile?.first_name || 'N/A'} {profile?.middle_name || 'N/A'} {profile?.last_name || 'N/A'} {profile?.ext_name || 'N/A'}</p>
                            <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
                            <p><strong>Contact Number:</strong> {profile?.contact_num || 'N/A'}</p>
                            <p><strong>Role:</strong> {profile?.role || 'N/A'}</p>
                        </div>

                        <div className="btnWrapper">
                            <button type="button" className="cancelBtn" onClick={goBack}>Go Back</button>
                        </div>
                    </>
                )}
            </main>
        </section>
    )
}

export default ViewProfile