import { useState, useEffect } from 'react'
import type { RentalApplicationsProps, RentalApplicationDataProps } from './props'
import ApplyRental from './ApplyRental';

function RentalApplications({ goBack, userId, userRole, onViewDetails }: RentalApplicationsProps) {
    const [applications, setApplications] = useState<RentalApplicationDataProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingApplication, setEditingApplication] = useState<RentalApplicationDataProps | null>(null);
    const [editingProperty, setEditingProperty] = useState<any | null>(null);

    const fetchApplications = async () => {
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/viewapplications?userId=${userId}&role=${userRole}`);
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error("Failed to load applications", error);
        } finally {
            setLoading(false);
        }
    }

    const handleViewDetails = async (propertyId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
            if (response.ok) {
                const propertyData = await response.json();
                onViewDetails(propertyData);
            }
        } catch (error) {
            console.error("Failed to fetch property", error);
        }
    };

    const handleEditApplication = async (app: RentalApplicationDataProps) => {
        try {
            const response = await fetch(`http://localhost:5000/api/properties/${app.property_id}`);
            if (response.ok) {
                const propertyData = await response.json();
                setEditingProperty(propertyData);
                setEditingApplication(app);
            }
        } catch (error) {
            console.error("Failed to fetch property details", error);
        }
    };

    useEffect(() => {
        if (userId) fetchApplications();
    }, [userId, userRole]);

    if (editingApplication) {
        return (
            <ApplyRental
                property={editingProperty}
                userId={userId}
                userRole={userRole}
                editMode={true}
                existingApplication={editingApplication}
                onSuccess={() => { setEditingApplication(null); setEditingProperty(null); fetchApplications(); }}
                onCancel={() => { setEditingApplication(null); setEditingProperty(null); }}
            />
        );
    }

    const handleStatusUpdate = (appId: number, newStatus: string) => {
        setApplications(prev => 
            prev.map(app => app.id === appId ? { ...app, status: newStatus as any } : app)
        );
    };

    const handleDeleteApplication = async (appId: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this application? This cannot be undone.");
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${appId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Application deleted successfully.");
                fetchApplications();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete application'}`);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("An error occurred while deleting the application.");
        }
    };

    return (
        <section id='rentalApplicationsContainer'>
            <header>
                <h2>{userRole === 'landlord' ? 'Manage Applications' : 'My Applications'}</h2>
                <p>
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
                                <th>Property ID</th>
                                <th>Applicant Name</th>
                                <th>Applicant Contact</th>
                                <th>Applicant Email</th>
                                <th>Date Applied</th>
                                <th>Status</th>
                                {userRole === 'landlord' && <th>Message</th>}
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>{app.property_id}</td>
                                    <td>{app.tenant_fullname}</td>
                                    <td>{app.tenant_contact}</td>
                                    <td>{app.tenant_email}</td>
                                    <td>{new Date(app.move_in_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`statusBadge ${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                                    </td>
                                    {userRole === 'landlord' && <td>{!app.message ? "No message from applicant." : app.message }</td>}
                                    <td>
                                        {app.status === 'pending' ?
                                            (userRole === 'landlord' ? (
                                                <div className="btnWrapper">
                                                    <button className="viewDetails" onClick={() => handleViewDetails(app.property_id)}>View Property</button>
                                                    <button className="approveBtn" onClick={() => handleStatusUpdate(app.id, 'approved')}>Approve</button>
                                                    <button className="rejectBtn" onClick={() => handleStatusUpdate(app.id, 'rejected')}>Reject</button>
                                                </div>
                                            ) : (
                                                <div className="btnWrapper">
                                                    <button className="viewDetails" onClick={() => handleViewDetails(app.property_id)}>View Property</button>
                                                    <button className="updateBtn" onClick={() => handleEditApplication(app)}>Update Details</button>
                                                    <button className="deleteBtn" onClick={() => handleDeleteApplication(app.id)}>Delete Application</button>
                                                </div>
                                            ))
                                        :
                                            <div className="btnWrapper">
                                                <button className="viewDetails" onClick={() => handleViewDetails(app.property_id)}>View Property</button>
                                                <button className="deleteBtn" onClick={() => handleDeleteApplication(app.id)}>Delete Application</button>
                                            </div>
                                        }
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