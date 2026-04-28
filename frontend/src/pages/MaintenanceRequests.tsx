import type { MaintenanceRequestsProps } from './props'

function MaintenanceRequests({ goBack }: MaintenanceRequestsProps) {

    return (
        <section id='maintenanceRequestsContainer'>
            <header>
                <h2>Maintenance Requests</h2>
                <p>Submit, track, and manage maintenance concerns related to your property or rental unit.</p>
            </header>

            <main>
                <p>Maintenance requests functionality is under development. Please check back later.</p>

                <div className="btnWrapper">
                    <button type="button" className="cancelBtn" onClick={goBack}>Go Back</button>
                </div>
            </main>
        </section>
    )
}

export default MaintenanceRequests