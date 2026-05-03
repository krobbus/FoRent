import { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';
import type { PaymentHistoryDataProps, PaymentHistoryProps, PaymentStatus } from './props';

function PaymentHistory({ goBack, userId, userRole }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<PaymentHistoryDataProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rentedProperties, setRentedProperties] = useState<{ id: number; property_name: string }[]>([]);

    const [formData, setFormData] = useState({
        property_id: '',
        amount: '',
        payment_method: '',
        period_covered: '',
        notes: '',
    });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await authFetch(
                `http://localhost:5000/api/payment/view?userId=${userId}&userRole=${userRole}`
            );
            const data = await response.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchPayments();
    }, [userId, userRole]);

    useEffect(() => {
        const fetchRentedProperties = async () => {
            if (userRole !== 'tenant') return;

            try {
                const response = await authFetch(
                    `http://localhost:5000/api/properties/rented?userId=${userId}`
                );
                const data = await response.json();
                setRentedProperties(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load rented properties", error);
            }
        };

        if (userId) fetchRentedProperties();
    }, [userId]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const payment = params.get('payment');

        if (payment) {
            let attempts = 0;
            const interval = setInterval(async () => {
                await fetchPayments();
                attempts++;
                if (attempts >= 5) clearInterval(interval);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, []);

    const getStatusLabel = (status: PaymentStatus) => {
        switch (status) {
            case 'paid': return 'Paid';
            case 'pending': return 'Pending';
            case 'failed': return 'Failed';
            case 'refunded': return 'Refunded';
            default: return '';
        }
    };

    const getMethodLabel = (method: string) => {
        switch (method) {
            case 'cash': return 'Cash';
            case 'bank_transfer': return 'Bank Transfer';
            case 'gcash': return 'GCash';
            case 'card': return 'Card';
            case 'other': return 'Other';
            default: return '';
        }
    };

    const handleStripePayment = async () => {
        if (!formData.property_id || !formData.amount || !formData.period_covered) {
            alert('Please fill in Property, Amount, and Period Covered before paying by card.');
            return;
        }

        const selectedProperty = rentedProperties.find(p => p.id === Number(formData.property_id));

        try {
            const response = await authFetch('http://localhost:5000/api/payment/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({
                    property_id: formData.property_id,
                    tenant_id: userId,
                    amount: formData.amount,
                    period_covered: formData.period_covered,
                    notes: formData.notes,
                    property_name: selectedProperty?.property_name ?? 'Property',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.url;
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to create checkout session'}`);
            }
        } catch (error) {
            console.error("Stripe checkout failed", error);
            alert("An error occurred while initiating payment.");
        }
    };

    const handleStatusUpdate = async (paymentId: number, newStatus: string) => {
        const confirmed = window.confirm(
            `Mark this payment as ${newStatus}? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            const response = await authFetch(
                `http://localhost:5000/api/payment/${paymentId}/status`,
                { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }
            );

            if (response.ok) {
                setPayments(prev =>
                    prev.map(p => p.id === paymentId ? { ...p, status: newStatus as PaymentStatus } : p)
                );
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to update status'}`);
            }
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    const handleDelete = async (paymentId: number) => {
        const confirmed = window.confirm("Delete this payment record? This cannot be undone.");
        if (!confirmed) return;

        try {
            const response = await authFetch(
                `http://localhost:5000/api/payment/${paymentId}`,
                { method: 'DELETE' }
            );
            if (response.ok) {
                fetchPayments();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete'}`);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleSubmit = async (e: React.ChangeEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await authFetch('http://localhost:5000/api/payment', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    tenant_id: userId,
                    recorded_by: userRole,
                }),
            });

            if (response.ok) {
                alert('Payment record submitted successfully!');
                setShowForm(false);
                setFormData({ property_id: '', amount: '', payment_method: 'cash', period_covered: '', notes: '' });
                fetchPayments();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to submit'}`);
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id='paymentHistoryContainer'>
            <header>
                <h2>{userRole === 'landlord' ? 'Payment History' : 'My Payments'}</h2>
                <p>Access and review a complete record of your past transactions and rental payments.</p>
            </header>

            <main>
                {userRole === 'tenant' && !showForm && (
                    <div className="btnWrapper">
                        <button className="submitBtn" onClick={() => setShowForm(true)}>
                            + Submit Payment
                        </button>
                    </div>
                )}

                {showForm && (
                    <form className="paymentForm" onSubmit={handleSubmit}>
                        <h3>Submit Payment Record</h3>

                        <div className="formGroup">
                            <label>Property <span style={{ color: 'red' }}>*</span></label>
                            <select
                                value={formData.property_id}
                                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                                required
                            >
                                {rentedProperties.length === 0 ?
                                    <>
                                        <option value="">Select Property</option>
                                        <option style={{ color: 'gray' }} value="">No rented properties found.</option>
                                    </>
                                :   
                                    <>
                                        <option value="">Select Property</option>
                                        {rentedProperties.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.property_name}
                                            </option>
                                        ))}
                                    </>
                                }
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Amount (₱) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label>Payment Method <span style={{ color: 'red' }}>*</span></label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                required
                            >
                                <option value="">Select Method</option>
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="gcash">GCash</option>
                                <option value="card">Card</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Period Covered <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="month"
                                value={formData.period_covered}
                                onChange={(e) => setFormData({ ...formData, period_covered: e.target.value })}
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label>Notes (Optional)</label>
                            <textarea
                                rows={3}
                                value={formData.notes}
                                placeholder="Any additional notes..."
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="btnWrapper">
                            <button type="button" className="cancelBtn" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>

                            {formData.payment_method === 'card' ? (
                                <button
                                    type="button"
                                    className="stripeBtn"
                                    onClick={handleStripePayment}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Redirecting...' : 'Pay with Card'}
                                </button>
                            ) : (
                                <button type="submit" className="submitBtn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {loading ? (
                    <p>Loading payments...</p>
                ) : payments.length === 0 ? (
                    <p>No payment records found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Property</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Period Covered</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                                <th>Recorded By</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>#{payment.id}</td>
                                    <td>{payment.property_name || payment.property_id}</td>
                                    <td>₱{Number(payment.amount).toLocaleString()}</td>
                                    <td>{getMethodLabel(payment.payment_method)}</td>
                                    <td>{payment.period_covered || 'N/A'}</td>
                                    <td>{new Date(payment.payment_date || 'N/A').toLocaleDateString()}</td>
                                    <td>
                                        <span className={`statusBadge ${payment.status}`}>
                                            {getStatusLabel(payment.status)}
                                        </span>
                                    </td>
                                    <td>{payment.recorded_by.charAt(0).toUpperCase() + payment.recorded_by.slice(1)}</td>
                                    <td>{payment.notes || '—'}</td>
                                    <td>
                                        {payment.status === 'pending' && userRole === 'landlord' && (
                                            <div className="btnWrapper">
                                                <button className="approveBtn" onClick={() => handleStatusUpdate(payment.id, 'paid')}>
                                                    Confirm Paid
                                                </button>

                                                <button className="rejectBtn" onClick={() => handleStatusUpdate(payment.id, 'failed')}>
                                                    Mark Failed
                                                </button>
                                            </div>
                                        )}

                                        {payment.status === 'paid' && userRole === 'landlord' && (
                                            <div className="btnWrapper">
                                                <button className="cancelledBtn" onClick={() => handleStatusUpdate(payment.id, 'refunded')}>
                                                    Refund
                                                </button>
                                            </div>
                                        )}

                                        {(payment.status === 'failed' || payment.status === 'refunded') && (
                                            <div className="btnWrapper">
                                                <button className="deleteBtn" onClick={() => handleDelete(payment.id)}>
                                                    Delete
                                                </button>
                                            </div>
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
    );
}

export default PaymentHistory;