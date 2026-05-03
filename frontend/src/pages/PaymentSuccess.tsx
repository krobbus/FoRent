import { useEffect } from 'react';
import type { PaymentHistoryProps } from './props';

function PaymentSuccess({goBack} : PaymentHistoryProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.history.replaceState({}, '', '/');
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="paymentSuccessContainer">
            <header>
                <h2>Payment Successful!</h2>
                <p>Your payment has been confirmed. A record has been saved to your payment history.</p>
            </header>

            <div className="btnWrapper">
                <button className="backBtn" onClick={goBack}>Go Back</button>
            </div>
        </section>
    );
}

export default PaymentSuccess;