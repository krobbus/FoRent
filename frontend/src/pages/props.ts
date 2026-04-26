export type Role = 'landlord' | 'tenant' | null;
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface AuthProps {
    goBack: () => void;
    setUserRole: (role: Role) => void;
    setUserId: (id: number) => void;
}

export interface ProfileProps {
    goBack: () => void;
    userRole: Role;
    userId: number;
}

export interface MarketplaceProps {
    property: any;
    onViewDetails: (property: PropertyDataProps) => void;
    onViewApplyRental: (property: PropertyDataProps) => void;
}

export interface ProfileDataProps{
    first_name: string;
    middle_name: string;
    last_name: string;
    ext_name: string;
    email: string;
    contact_num: string;
    role: Role;
}

export interface PropertiesProps {
    goBack: () => void;
    userRole: Role;
    userId: number;
    setUserId: (id: number) => void;
    setUserRole: (role: Role) => void;
    onViewDetails: (property: PropertyDataProps) => void;
    onUpdateProperty: (property: PropertyDataProps) => void;
}

export interface PropertyDataProps {
    id: number;
    property_name: string;
    landlord_id: number;
    tenant_id: number | null;
    address: string,
    status: string;
    price: number;
    description: string;
    category: string;
    bedroom_count: number;
    kitchen_count: number;
    bathroom_count: number;
    other_rooms: string;
    other_rooms_count: number;
    max_occupants: number;
    pets_allowed: boolean;
    pet_count: number;
    amenities: {
        wifi: boolean;
        aircon: boolean;
        parking: boolean;
    };
    other_amenities: string[];
    other_amenities_count: number;
}

export interface UpdatePropertyProps {
    goBack: () => void;
    property: PropertyDataProps;
    onSuccess: () => void;
}

export interface AddPropertyProps {
    goBack: () => void;
    userId: number;
}

export interface ViewDetailsProps {
    onViewApplyRental: () => void;
    goBack: () => void;
    property: PropertyDataProps;
}

export interface ApplyRentalProps {
    property: any;
    userId: number;
    userRole: Role;
    onSuccess: () => void;
    onCancel: () => void;
    editMode?: boolean;
    existingApplication?: RentalApplicationDataProps | null;
}

export interface RentalApplicationDataProps {
    id: number;
    property_id: number;
    status: ApplicationStatus;
    applied_at: string;
    message?: string;
    lease_term: number;
    move_in_date: string;
    tenant_fullname: string;
    tenant_contact: string; 
    tenant_email: string;
}

export interface RentalApplicationsProps {
    goBack: () => void;
    userId: number;
    userRole: Role;
    onViewDetails: (property: PropertyDataProps) => void;
}

export interface MaintenanceRequestsProps {
    userId: number;
}