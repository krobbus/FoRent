import type { MaintenanceRequestsProps } from './props'

function MaintenanceRequests({ }: MaintenanceRequestsProps) {

    return (
        <section id='maintenanceRequestsContainer'>
            <header>
                <h1 className='mainTitle'>Maintenance Requests</h1>
                <p className='subTitle'>View and manage your maintenance requests here.</p>
            </header>

            <main>
                <p>Maintenance requests functionality is under development. Please check back later.</p>
            </main>
        </section>
    )
}

export default MaintenanceRequests