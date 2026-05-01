import { useState, useEffect } from 'react'
import { authFetch } from '../utils/api'
import type { MaintenanceRequestsDataProps, MaintenanceRequestsProps, PriorityLevel } from './props'
import CreateRequests from './CreateRequests'

function MaintenanceRequests({ goBack, userId, userRole, onViewDetails }: MaintenanceRequestsProps) {
    const [requests, setRequests] = useState<MaintenanceRequestsDataProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRequest, setEditingRequest] = useState<MaintenanceRequestsDataProps | null>(null);
    const [editingProperty, setEditingProperty] = useState<any | null>(null);

    const fetchRequests = async () => {
        setLoading(true);

        try{
            const response = await authFetch(`http://localhost:5000/api/maintenance/view?userId=${userId}&userRole=${userRole}`)
            const data = await response.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch(error) {
            console.log("Failed to load requests", error)
        } finally {
            setLoading(false);
        }
    }

    const handleViewDetails = async (propertyId: number) => {
        try {
            const response = await authFetch(`http://localhost:5000/api/properties/${propertyId}`);
            if (response.ok) {
                const propertyData = await response.json();
                onViewDetails(propertyData);
            }
        } catch (error) {
            console.error("Failed to fetch property", error);
        }
    };

    const handleEditRequest = async (req: MaintenanceRequestsDataProps) => {
        try {
            const response = await authFetch(`http://localhost:5000/api/properties/${req.property_id}`);
            if (response.ok) {
                const propertyData = await response.json();
                setEditingProperty(propertyData);
                setEditingRequest(req);
            }
        } catch (error) {
            console.error("Failed to fetch property details", error);
        }
    };

    useEffect(() => {
        if (userId) fetchRequests();
    }, [userId, userRole]);

    if (editingRequest) {
        return (
            <CreateRequests
                property={editingProperty}
                userId={userId}
                userRole={userRole}
                editMode={true}
                existingRequest={editingRequest}
                onSuccess={() => { setEditingRequest(null); setEditingProperty(null); fetchRequests(); }}
                onCancel={() => { setEditingRequest(null); setEditingProperty(null); }}
            />
        );
    }

    const handleStatusUpdate = async (reqId: number, newStatus: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to mark request #${reqId} as ${
                newStatus === 'finished' ? 'finished' :
                newStatus === 'cancelled' ? 'cancelled' : newStatus
            }? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            const response = await authFetch(`http://localhost:5000/api/maintenance/${reqId}/status`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (response.ok) {
                setRequests(prev =>
                    prev.map(req => req.id === reqId ? { ...req, status: newStatus as any } : req)
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to update status'}`);
            }
        } catch (error) {
            console.error("Status update failed", error);
            alert("An error occurred while updating the request status.");
        }
    };

    const handleDeleteRequest = async (reqId: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this request? This cannot be undone.");
        if (!confirmed) return;

        try {
            const response = await authFetch(`http://localhost:5000/api/maintenance/${reqId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Application deleted successfully.");
                fetchRequests();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete request'}`);
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("An error occurred while deleting the request.");
        }
    };

    const getPriorityLabel = (priority: PriorityLevel) => {
        switch (priority) {
            case 'low': return 'Low (Routine)';
            case 'moderate': return 'Moderate (Repair Soon)';
            case 'high': return 'High (Urgent)';
            case 'emergency': return 'Emergency (Critical)';
            default: return 'N/A';
        }
    };

    return (
        <section id='maintenanceRequestsContainer'>
            <header>
                <h2>Maintenance Requests</h2>
                <p>Submit, track, and manage maintenance concerns related to your property or rental unit.</p>
            </header>
            
            <main>
                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Property</th>
                                <th>Title of Issue</th>
                                <th>Field of Issue</th>
                                <th>Description</th>
                                <th>Priority Level</th>
                                <th>Status</th>
                                <th>Date of Request</th>
                                <th>Date of Accomplish</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req?.id}</td>
                                    <td>
                                        {req.property_id || 'N/A'} 
                                        <button className="viewDetails" onClick={() => handleViewDetails(req.property_id)}>
                                            View Property
                                        </button>
                                    </td>
                                    <td>{req.issue_title ? req.issue_title.charAt(0).toUpperCase() + req.issue_title.slice(1) : 'N/A'}</td>
                                    <td>{req.issue_field ? req.issue_field.charAt(0).toUpperCase() + req.issue_field.slice(1) : 'N/A'}</td>
                                    <td>{req.issue_description ? req.issue_description.charAt(0).toUpperCase() + req.issue_description.slice(1) : 'No description of the issue available'}</td>
                                    <td>{getPriorityLabel(req.priority)}</td>
                                    <td>{req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'N/A'}</td>
                                    <td>{req.request_date ? new Date(req.request_date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{req.resolved_date || 'Not yet resolved'}</td>
                                    <td>
                                        {req.status === 'pending' ? (
                                            userRole === 'landlord' ? (
                                                <div className="btnWrapper">
                                                    <button className="finishedBtn" onClick={() => handleStatusUpdate(req.id, 'finished')}>Mark Finished</button>
                                                    <button className="cancelledBtn" onClick={() => handleStatusUpdate(req.id, 'cancelled')}>Mark Cancelled</button>
                                                    <button className="deleteBtn" onClick={() => handleDeleteRequest(req.id)}>Delete Request</button>
                                                </div>
                                            ) : (
                                                <div className="btnWrapper">
                                                    <button className="updateBtn" onClick={() => handleEditRequest(req)}>Update Details</button>
                                                    <button className="cancelRequestBtn" onClick={() => handleStatusUpdate(req.id, 'cancelled')}>Cancel Request</button>
                                                    <button className="deleteBtn" onClick={() => handleDeleteRequest(req.id)}>Delete Request</button>
                                                </div>
                                            )
                                        ) : req.status === 'finished' || req.status === 'cancelled' ? (
                                            <div className="btnWrapper">
                                                <button className="deleteBtn" onClick={() => handleDeleteRequest(req.id)}>Delete Request</button>
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="btnWrapper">
                    <button type="button" className="cancelBtn" onClick={goBack}>Go Back</button>
                </div>
            </main>
        </section>
    )
}

export default MaintenanceRequests