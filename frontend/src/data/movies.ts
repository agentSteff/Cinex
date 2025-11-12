export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
  director: string;
  duration: string;
  description: string;
  image: string;
  rating: number;
  userRating?: number;
  reviews: Review[];
  isWatchlist?: boolean;
  isWatched?: boolean;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    genre: "Ciencia Ficción",
    director: "Christopher Nolan",
    duration: "2h 28min",
    description: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños recibe la tarea inversa de plantar una idea en la mente de un CEO.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    rating: 4.5,
    reviews: [
      {
        id: 1,
        user: "María García",
        rating: 5,
        comment: "Una obra maestra del cine moderno. La trama es compleja pero fascinante.",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "Carlos López",
        rating: 4,
        comment: "Excelente película, aunque requiere atención total para entenderla.",
        date: "2024-01-10"
      }
    ]
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    director: "Frank Darabont",
    duration: "2h 22min",
    description: "Dos hombres encarcelados forjan una amistad a lo largo de varios años, encontrando consuelo y eventual redención a través de actos de decencia común.",
    image: "https://images.unsplash.com/photo-1574267432644-f610a4fc8e80?w=800&q=80",
    rating: 4.8,
    reviews: [
      {
        id: 3,
        user: "Ana Martínez",
        rating: 5,
        comment: "La mejor película que he visto. Una historia de esperanza y amistad.",
        date: "2024-01-20"
      }
    ]
  },
  {
    id: 3,
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crimen",
    director: "Quentin Tarantino",
    duration: "2h 34min",
    description: "Las vidas de dos sicarios, un boxeador, la esposa de un gánster y dos bandidos se entrelazan en cuatro historias de violencia y redención.",
    image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&q=80",
    rating: 4.6,
    reviews: [
      {
        id: 4,
        user: "Diego Ruiz",
        rating: 5,
        comment: "Tarantino en su mejor momento. Diálogos brillantes y una narrativa única.",
        date: "2024-01-18"
      }
    ]
  },
  {
    id: 4,
    title: "The Dark Knight",
    year: 2008,
    genre: "Acción",
    director: "Christopher Nolan",
    duration: "2h 32min",
    description: "Cuando la amenaza conocida como el Joker causa estragos en Gotham, Batman debe aceptar una de las mayores pruebas psicológicas y físicas.",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80",
    rating: 4.7,
    reviews: [
      {
        id: 5,
        user: "Laura Sánchez",
        rating: 5,
        comment: "Heath Ledger como el Joker es inolvidable. Película perfecta.",
        date: "2024-01-22"
      }
    ]
  },
  {
    id: 5,
    title: "Forrest Gump",
    year: 1994,
    genre: "Drama",
    director: "Robert Zemeckis",
    duration: "2h 22min",
    description: "Las presidencias de Kennedy y Johnson, la guerra de Vietnam y otros eventos históricos se desarrollan desde la perspectiva de un hombre de Alabama.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    rating: 4.4,
    reviews: [
      {
        id: 6,
        user: "Pedro Gómez",
        rating: 4,
        comment: "Emotiva y hermosa. Tom Hanks en uno de sus mejores papeles.",
        date: "2024-01-12"
      }
    ]
  },
  {
    id: 6,
    title: "Interstellar",
    year: 2014,
    genre: "Ciencia Ficción",
    director: "Christopher Nolan",
    duration: "2h 49min",
    description: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad.",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80",
    rating: 4.5,
    reviews: [
      {
        id: 7,
        user: "Carmen Díaz",
        rating: 5,
        comment: "Visualmente impresionante. La ciencia y la emoción se combinan perfectamente.",
        date: "2024-01-25"
      }
    ]
  },
  {
    id: 7,
    title: "The Matrix",
    year: 1999,
    genre: "Ciencia Ficción",
    director: "Lana Wachowski, Lilly Wachowski",
    duration: "2h 16min",
    description: "Un hacker descubre que la realidad que conoce es una simulación creada por máquinas inteligentes.",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&q=80",
    rating: 4.6,
    reviews: [
      {
        id: 8,
        user: "Roberto Fernández",
        rating: 5,
        comment: "Revolucionó el cine de ciencia ficción. Un clásico instantáneo.",
        date: "2024-01-08"
      }
    ]
  },
  {
    id: 8,
    title: "Gladiator",
    year: 2000,
    genre: "Acción",
    director: "Ridley Scott",
    duration: "2h 35min",
    description: "Un general romano traicionado busca venganza contra el emperador corrupto que asesinó a su familia.",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    rating: 4.5,
    reviews: [
      {
        id: 9,
        user: "Isabel Torres",
        rating: 4,
        comment: "Épica en todos los sentidos. Russell Crowe brillante.",
        date: "2024-01-14"
      }
    ]
  }
];
