import { useState, useEffect } from 'react'
import type { RentalApplicationsProps, RentalApplicationDataProps } from './props'

function RentalApplications({ goBack, userId, userRole }: RentalApplicationsProps) {
    const [applications, setApplications] = useState<RentalApplicationDataProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/viewapplications?userId=${userId}&role=${userRole}`);
                const data = await response.json();
                setApplications(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load applications", error);
                setLoading(false);
            }
        };

        if (userId) fetchApplications();
    }, [userId, userRole]);

    const handleStatusUpdate = (appId: number, newStatus: string) => {
        setApplications(prev => 
            prev.map(app => app.id === appId ? { ...app, status: newStatus as any } : app)
        );
    };

    return (
        <section id='rentalApplicationsContainer'>
            <header>
                <h1 className='mainTitle'>{userRole === 'landlord' ? 'MANAGE APPLICATIONS' : 'MY APPLICATIONS'}</h1>
                <p className='subTitle'>
                    {userRole === 'landlord' 
                        ? 'Review potential tenants for your properties.' 
                        : 'Track the status of your rental requests.'
                    }
                </p>
            </header>

            <main className="appGrid">
                {loading ? (
                    <p>Loading applications...</p>
                ) : applications.length === 0 ? (
                    <p>No applications found.</p>
                ) : (
                    <table className="appTable">
                        <thead>
                            <tr>
                                <th>Property</th>
                                {userRole === 'landlord' && <th>Applicant</th>}
                                <th>Date Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>{app.property_name}</td>
                                    <td>{userRole === 'landlord' && app.applicant_name}</td>
                                    <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`statusBadge ${app.status}`}>{app.status}</span>
                                    </td>
                                    <td>
                                        {userRole === 'landlord' && app.status === 'pending' ? (
                                            <div className="btnWrapper">
                                                <button className="approveBtn" onClick={() => handleStatusUpdate(app.id, 'approved')}>Approve</button>
                                                <button className="rejectBtn" onClick={() => handleStatusUpdate(app.id, 'rejected')}>Reject</button>
                                            </div>
                                        ) : (
                                            <button className="viewBtn">View Details</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="btnWrapper">
                    <button type="button" className="backBtn" onClick={goBack}>Go Back</button>
                </div>
            </main>
        </section>
    )
}

export default RentalApplications