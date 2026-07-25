// hotel-data.ts
export interface Hotel {
    id: number;
    name: string;
    location: string;
    image: string;
    mainImage: string;
    images: string[];
    description: string;
    rating: number;
    amenities: string[];
    price: number;
    reviews: Review[];
}

export interface Review {
    id: number;
    author: string;
    rating: number;
    comment: string;
    date: string;
}

export const HOTELS_DATA: Hotel[] = [
    {
        id: 1,
        name: 'Tour Khalaf',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/tourkhalaf/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/tourkhalaf/tourkhalaf.jpeg',
            'assets/img/hotels/tourkhalaf/2.jpg',
            'assets/img/hotels/tourkhalaf/3.jpg',
            'assets/img/hotels/tourkhalaf/4.jpg',
            'assets/img/hotels/tourkhalaf/5.jpg',
            'assets/img/hotels/tourkhalaf/6.jpg',
            'assets/img/hotels/tourkhalaf/7.jpg',

        ],
        description: 'JAZ Tour Khalef is one of the most famous hotels in the city of Sousse. Located on the Boulevard du 14 Janvier, directly on the beachfront, it is a high-end hotel that combines seaside tourism, relaxation, and medical tourism.',
        rating: 5,
        amenities: ['Wi-Fi gratuit', 'Spa', 'Piscine', 'Restaurant', 'Room service', 'Parking'],
        price: 450,
        reviews: [
            {
                id: 1,
                author: 'Marie Dupont',
                rating: 5,
                comment: 'Séjour exceptionnel ! Le service est impeccable.',
                date: '2024-01-15'
            }
        ]
    },
    {
        id: 2,
        name: 'Iberostar',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/iberostar/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/iberostar/iberostar.jpeg',
            'assets/img/hotels/iberostar/2.jpg',
            'assets/img/hotels/iberostar/3.jpg',
            'assets/img/hotels/iberostar/4.jpg',
            'assets/img/hotels/iberostar/5.jpg',
            'assets/img/hotels/iberostar/6.jpg',
            'assets/img/hotels/iberostar/7.jpg',
            'assets/img/hotels/iberostar/8.jpg'
        ],
        description: 'Iberostar Selection Diar El Andalous is a luxury beachfront hotel in Port El Kantaoui, Sousse. It offers elegant rooms, outdoor pools, direct beach access, spa facilities, and a variety of international dining options. Perfect for families and couples, the hotel combines comfort, entertainment, and Tunisian hospitality in a relaxing seaside setting.',
        rating: 5,
        amenities: ['Plage privée', 'Spa', 'Piscine infinie', 'Restaurant', 'Excursions'],
        price: 650,
        reviews: []
    },
    {
        id: 3,
        name: 'Marhaba Beach',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/marhababeach/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/marhababeach/marhababeach.jpeg',
            'assets/img/hotels/marhababeach/2.jpg',
            'assets/img/hotels/marhababeach/3.jpg',
            'assets/img/hotels/marhababeach/4.jpg',
            'assets/img/hotels/marhababeach/5.jpg',
            'assets/img/hotels/marhababeach/6.jpg',
            'assets/img/hotels/marhababeach/7.jpg',
        ],
        description: 'Marhaba Beach Hotel is a comfortable beachfront resort located in Sousse, Tunisia. The hotel features cozy rooms, swimming pools, a private sandy beach, and a selection of restaurants and bars. It is ideal for families and couples looking for a relaxing seaside stay with entertainment and easy access to the city center.',
        rating: 4,
        amenities: ['Spa alpin', 'Chalet', 'Randonnée guidée', 'Restaurant de montagne'],
        price: 350,
        reviews: []
    },
    {
        id: 4,
        name: 'Marhaba Royal Salem',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/marhabaroyalselem/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/marhabaroyalselem/marhabaroyalselem.jpeg',
            'assets/img/hotels/marhabaroyalselem/2.jpg',
            'assets/img/hotels/marhabaroyalselem/3.jpg',
            'assets/img/hotels/marhabaroyalselem/4.jpg',
            'assets/img/hotels/marhabaroyalselem/5.jpg',
            'assets/img/hotels/marhabaroyalselem/6.jpg',
            'assets/img/hotels/marhabaroyalselem/7.jpg',
        ],
        description: 'Marhaba Royal Salem is a charming beachfront hotel in Sousse set in a large palm garden. It offers comfortable rooms, multiple swimming pools, direct beach access, and a variety of dining options. Ideal for families and couples, the hotel provides a relaxing atmosphere with entertainment and leisure activities.',
        rating: 4,
        amenities: ['Wi-Fi rapide', 'Gym', 'Terrasse panoramique', 'Bar rooftop'],
        price: 420,
        reviews: []
    },
    {
        id: 5,
        name: 'Mövenpick',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/movenpick/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/movenpick/movenpick.jpeg',
            'assets/img/hotels/movenpick/2.jpg',
            'assets/img/hotels/movenpick/3.jpg',
            'assets/img/hotels/movenpick/4.jpg',
            'assets/img/hotels/movenpick/5.jpg',
            'assets/img/hotels/movenpick/6.jpg',
            'assets/img/hotels/movenpick/7.jpg',
            'assets/img/hotels/movenpick/8.jpg'
        ],
        description: 'Mövenpick Resort & Marine Spa Sousse is a five-star beachfront hotel in the heart of Sousse. It offers stylish rooms and suites, multiple pools, a private beach, and a renowned marine spa. With fine dining restaurants and modern facilities, it’s perfect for both relaxing holidays and business stays.',
        rating: 5,
        amenities: ['Parc aquatique', 'Spa', 'Golf', 'Restaurants internationaux'],
        price: 550,
        reviews: []
    },
    {
        id: 6,
        name: 'Occidental Sousse Marhaba',
        location: 'Sousse, Tunisia',
        image: 'assets/img/hotels/occidental/1.jpg',
        mainImage: 'assets/img/hotels/yellow-suitcase-standing-hotel-room.jpg',
        images: [
            'assets/img/hotels/occidental/occidental.jpeg',
            'assets/img/hotels/occidental/2.jpg',
            'assets/img/hotels/occidental/3.jpg',
            'assets/img/hotels/occidental/4.jpg',
            'assets/img/hotels/occidental/5.jpg',
            'assets/img/hotels/occidental/6.jpg',
            'assets/img/hotels/occidental/7.jpg',
            'assets/img/hotels/occidental/8.jpg',
        ],
        description: 'Occidental Sousse Marhaba is a beachfront resort surrounded by lush gardens in Sousse. The hotel offers comfortable rooms, outdoor pools, a private beach, and a variety of restaurants and entertainment activities. It is ideal for families and couples seeking a relaxing and fun seaside holiday.',
        rating: 4,
        amenities: ['Jardin historique', 'Visites guidées', 'Restaurant gastronomique'],
        price: 500,
        reviews: []
    },

];
