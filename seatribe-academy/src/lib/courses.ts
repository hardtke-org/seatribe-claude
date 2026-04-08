export interface Course {
  id: string;
  title: string;
  description: string;
  price: number; // in cents
  type: "live" | "download";
  // Nach erfolgreicher Zahlung angezeigt
  accessInfo: {
    zoomLink?: string;
    zoomPassword?: string;
    youtubeLink?: string;
    downloadLink?: string;
    date?: string; // für Live-Kurse
  };
  image?: string;
  featured?: boolean;
}

// Hier deine Kurse eintragen
export const courses: Course[] = [
  {
    id: "kurs-1",
    title: "Segeln Grundkurs - Live Session",
    description:
      "Lerne die Grundlagen des Segelns in dieser interaktiven Live-Session. Perfekt für Einsteiger!",
    price: 4900, // 49,00 EUR
    type: "live",
    accessInfo: {
      zoomLink: "https://zoom.us/j/example",
      zoomPassword: "seatribe2024",
      date: "15. April 2024, 18:00 Uhr",
    },
    featured: true,
  },
  {
    id: "kurs-2",
    title: "Navigation auf See - Video-Kurs",
    description:
      "Umfassender Video-Kurs zur Navigation. Lerne Kartenlesen, GPS-Navigation und traditionelle Methoden.",
    price: 7900, // 79,00 EUR
    type: "download",
    accessInfo: {
      youtubeLink: "https://youtube.com/playlist?list=example",
    },
  },
  {
    id: "kurs-3",
    title: "Wetterkunde für Segler",
    description:
      "Verstehe das Wetter auf See. Wolkenformationen, Windvorhersagen und sichere Routenplanung.",
    price: 5900, // 59,00 EUR
    type: "download",
    accessInfo: {
      youtubeLink: "https://youtube.com/playlist?list=example2",
    },
  },
  {
    id: "kurs-4",
    title: "Knoten & Seemannschaft - Live Workshop",
    description:
      "Praktischer Workshop: Die wichtigsten Knoten und Seemannschaft-Grundlagen live erklärt und geübt.",
    price: 3900, // 39,00 EUR
    type: "live",
    accessInfo: {
      zoomLink: "https://zoom.us/j/example2",
      zoomPassword: "knoten2024",
      date: "22. April 2024, 19:00 Uhr",
    },
  },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((course) => course.id === id);
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(priceInCents / 100);
}
