export interface Location {
    country: string;
    international: boolean;
}

export interface Service {
    name: string;
    description: string;
}

export interface ExperienceHighlight {
    title: string;
    value: string;
}

export interface SocialLinks {
    website?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
}

export interface AppointmentInfo {
    bookingLink?: string;
    beforeAfterGallery: string[];
    consultationFee?: number;
    availability?: {
        days: string[];
        hours: string;
    };
}

export interface Doctor {
    _id?: string;
    personalInfo: {
        name: string;
        title?: string;
        email: string;
        phone?: string;
        specialty: string;
        licenseNumber?: string;
        yearsOfExperience?: number;
        image?: string;
        bannerImage?: string;
        location?: Location;
    };
    professionalInfo: {
        bio?: string;
        shortDescription?: string;
        tagline?: string;
        education: string[];
        certifications: string[];
        languages: string[];
        services: [
            {
                name: String,
                description: String,
            },
        ];
        experienceHighlights: [
            {
                title: String,
                value: String,
            },
        ];
        socialLinks: SocialLinks;
    };
    appointmentInfo: AppointmentInfo;
    statistics: {
        totalOperations: number;
        completedOperations: number;
        successRate: number;
        patientSatisfaction: number;
    };
    isActive: boolean;
    isVerified: boolean;
    featured: boolean;
    createdAt: Date;
}