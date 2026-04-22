export type Role = 'landlord' | 'tenant' | null;

export interface Property {
    id: number;
    property_name: string;
    landlord_id: number;
    tenant_id: number | null;
    status: string;
    price: number;
}

export interface PropertiesProps {
    userRole: Role;
    userId: number;
}

export interface AuthProps {
    goBack: () => void;
    setUserRole: (role: Role) => void;
    setUserId: (id: number) => void;
}

export interface AddPropertyProps {
    goBack: () => void;
    userId: number;
}