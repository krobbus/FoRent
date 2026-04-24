export type Role = 'landlord' | 'tenant' | null;

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
    onViewDetails: (property: any) => void;
}

export interface PropertyDataProps {
    id: number;
    property_name: string;
    landlord_id: number;
    tenant_id: number | null;
    status: string;
    price: number;
    description: string;
    category: string;
    bedroom_count: number;
    kitchen_count: number;
    bathroom_count: number;
    other_rooms: string;
    max_occupants: number;
    pets_allowed: boolean;
    pet_count: number;
    amenities: {
        aircon: boolean;
        parking: boolean;
        other_amenities: string;
    };
}

export interface AddPropertyProps {
    goBack: () => void;
    userRole: Role;
    userId: number;
}

export interface ViewDetailsProps {
    goBack: () => void;
    property: PropertyDataProps;
    userRole: Role;
}