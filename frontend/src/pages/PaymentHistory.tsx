import type { PaymentHistoryProps } from './props'

function PaymentHistory({ goBack }: PaymentHistoryProps) {
    return (
        <section id='paymentHistoryContainer'>
            <header>
                <h2>Payment History</h2>
                <p>Access and review a complete record of your past transactions and rental payments.</p>
            </header>

            <main>
                <p>Payment history functionality is currently under development. Please check back later.</p>
                <div className='btnWrapper'>
                    <button type='button' className='backBtn' onClick={goBack}>Go Back</button>
                </div>
            </main>
        </section>
    );
}

export default PaymentHistory;