export interface ClientInfo {
    name: string;
    email: string;
    phone: string;
    address?: string;
    zipCode?: string;
    country?: string;
    state?: string;
    dateBirth?: string;
    weight?: number;
    height?: number;
    age?: number;
}

export interface MedicalInfo {
    smokes: 'yes' | 'no';
    alcoholConsumption?: string;
    contagiousDisease?: string;
    previousOperations: 'yes' | 'no';
    previousOperationsDetails?: string;
    woundHealingAbnormality?: string;
    bleedingClottingAbnormality?: string;
    chronicMedication: 'yes' | 'no';
    allergies: 'yes' | 'no';
    allergiesDetails?: string;
    expectations?: string;
}

export interface Order {
    clientInfo: ClientInfo;
    medicalInfo: MedicalInfo;
    category: string;
    pack: 'bronze' | 'silver' | 'gold';
    photos?: string[];
    arrivalDate?: string;
}