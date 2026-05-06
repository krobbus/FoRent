import { useEffect } from 'react';
import type { PaymentProps } from '../utils/props';

function PaymentCancel({goBack} : PaymentProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.history.replaceState({}, '', '/');
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="paymentCancelContainer">
            <header>
                <h2>Payment Cancelled</h2>
                <p>Your payment was not completed. Your pending record has been saved, you can try again anytime.</p>
            </header>

            <div className="btnWrapper">
                <button className="backBtn" onClick={goBack}>Go Back</button>
            </div>
        </section>
    );
}

export default PaymentCancel;