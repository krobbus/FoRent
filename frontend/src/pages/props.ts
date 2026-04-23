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
    role: string;
}

export interface PropertiesProps {
    goBack: () => void;
    userRole: Role;
    userId: number;
}

export interface PropertyDataProps {
    id: number;
    property_name: string;
    landlord_id: number;
    tenant_id: number | null;
    status: string;
    price: number;
}

export interface AddPropertyProps {
    goBack: () => void;
    userRole: Role;
    userId: number;
}