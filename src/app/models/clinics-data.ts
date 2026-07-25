export interface Clinic {
    id: number;
    name: string;
    location: string;
    image: string; // Pour le carrousel
    mainImage: string; // Image principale pour la page détail
    images: string[]; // Gallerie
    description: string;
    rating: number;
    specialties: string[];
    highlights: Highlight[];
    rooms: number;
    operationRooms: number;
    doctors: number;
    nurses: number;
    facilities: string[];
    openingHours: OpeningHour[];
    address: string;
    phone: string;
    email: string;
}

export interface Highlight {
    icon: string;
    text: string;
}

export interface OpeningHour {
    day: string;
    hours: string;
}

export const CLINICS_DATA: Clinic[] = [
    {
        id: 1,
        name: 'El Yosr Internationale',
        location: 'Sousse, Tunisia',
        address: 'Avenue Ibn El Jazzar 4000 Sousse - Tunisia',
        image: 'assets/img/clinics/clinique1.png',
        mainImage: 'assets/img/clinics/clinique1.png',
        images: [
            'assets/img/clinics/clinique1.png',
            'assets/img/clinics/Yosr/2.jpg',
            'assets/img/clinics/Yosr/3.jpg',
            'assets/img/clinics/Yosr/4.jpg',
            'assets/img/clinics/Yosr/5.jpg',
            'assets/img/clinics/Yosr/6.jpg',
            'assets/img/clinics/Yosr/1.jpg',
        ],
        description: `El Yosr International Clinic is a private healthcare facility located in Sousse, Tunisia. It is recognized as one of the modern clinics in the Sahel region and welcomes both Tunisian and international patients as part of medical tourism.

The clinic provides multidisciplinary medical services, advanced medical equipment, and comprehensive, personalized patient care from diagnosis to post-treatment follow-up.`,
        rating: 4.9,
        specialties: ['Chirurgie générale', 'Cardiologie', 'Orthopédie', 'Pédiatrie', 'Radiologie', 'Neurologie'],
        highlights: [
            { icon: 'assets/img/clinics/Calque_1.png', text: 'A commitment to excellence' },
            { icon: 'assets/img/clinics/Calque_11.png', text: 'People at the heart of care' },
            { icon: 'assets/img/clinics/Calque_111.png', text: 'Access to innovation' }
        ],
        rooms: 45,
        operationRooms: 8,
        doctors: 35,
        nurses: 70,
        facilities: [
            'Parking sécurisé',
            'Wi-Fi gratuit',
            'Cafétéria',
            'Pharmacie interne',
            'Radiologie 24/7',
            'Laboratoire d\'analyses',
            'Chambres VIP'
        ],
        openingHours: [
            { day: 'Lundi - Vendredi', hours: '8h00 - 20h00' },
            { day: 'Samedi', hours: '9h00 - 18h00' },
            { day: 'Dimanche', hours: 'Urgences uniquement' }
        ],
        phone: '+216 73 000 000',
        email: 'contact@elyosr-clinic.tn'
    },
    {
        id: 2,
        name: 'Clinic Kantaoui Sousse',
        location: 'Hammam Sousse, Tunisia',
        address: 'Boulevard du 14 Janvier, Hammam Sousse, Sousse, Tunisia, 4002',
        image: 'assets/img/clinics/clinique2.jpg',
        mainImage: 'assets/img/clinics/clinique2.jpg',
        images: [
            'assets/img/clinics/clinique2.jpg',
            'assets/img/clinics/Kantaoui/1.jpg',
            'assets/img/clinics/Kantaoui/2.jpg',
            'assets/img/clinics/Kantaoui/3.jpg',
            'assets/img/clinics/Kantaoui/4.jpg',
            'assets/img/clinics/Kantaoui/5.jpg',
            'assets/img/clinics/Kantaoui/6.jpg',
        ],
        description: `The Kantaoui Clinic is a private healthcare facility located in the tourist area of Port El Kantaoui in Sousse. It is one of the well-known clinics in the Tunisian Sahel and welcomes both Tunisian and international patients (medical tourism).

It provides multidisciplinary medical care with modern equipment and comprehensive patient management.`,
        rating: 4.8,
        specialties: ['Soins intensifs', 'Rééducation', 'Neurologie', 'Oncologie', 'Urgences', 'Traumatologie'],
        highlights: [
            { icon: 'assets/img/clinics/Calque_2.png', text: 'Respect for patients and staff.' },
            { icon: 'assets/img/clinics/Calque_22.png', text: 'Medical excellence, using advanced technology.' },
            { icon: 'assets/img/clinics/Calque_222.png', text: 'Ethics and integrity, upholding confidentiality.' }
        ],
        rooms: 65,
        operationRooms: 12,
        doctors: 52,
        nurses: 85,
        facilities: [
            'Héliport',
            'Parking gratuit',
            'Restaurant',
            'Blanchisserie',
            'Salle de conférence',
            'Bibliothèque médicale'
        ],
        openingHours: [
            { day: 'Lundi - Samedi', hours: '7h00 - 22h00' },
            { day: 'Dimanche', hours: 'Urgences 24h/24' }
        ],
        phone: '+216 70 162 500',
        email: 'cliniqueelkantaoui@gmail.com'
    }
];
