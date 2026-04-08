export interface CourseModule {
  title: string;
  duration?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string; // Kurze Beschreibung für Übersicht
  longDescription?: string; // Ausführliche Beschreibung für Detailseite
  price: number; // in cents
  type: "live" | "download";
  duration?: string; // z.B. "2 Stunden" oder "6 Module"
  modules?: CourseModule[]; // Kursinhalt
  instructor?: string;
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
    longDescription:
      "In diesem interaktiven Live-Kurs lernst du alles, was du für den Einstieg ins Segeln brauchst. Von der Bootskunde über Windtheorie bis hin zu den ersten Manövern - wir gehen Schritt für Schritt vor und du kannst jederzeit Fragen stellen.",
    price: 4900, // 49,00 EUR
    type: "live",
    duration: "2 Stunden",
    instructor: "Matthias Hardtke",
    modules: [
      { title: "Bootskunde & Terminologie", duration: "20 Min" },
      { title: "Wind & Wetter verstehen", duration: "25 Min" },
      { title: "Grundmanöver: Wende & Halse", duration: "30 Min" },
      { title: "Sicherheit an Bord", duration: "20 Min" },
      { title: "Fragen & Antworten", duration: "25 Min" },
    ],
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
    longDescription:
      "Dieser Video-Kurs macht dich fit in allen Aspekten der Navigation auf See. Du lernst sowohl traditionelle Methoden mit Seekarten und Kompass als auch moderne GPS-Navigation. Ideal zum Selbststudium in deinem eigenen Tempo.",
    price: 7900, // 79,00 EUR
    type: "download",
    duration: "6 Module",
    modules: [
      { title: "Grundlagen der Seekarten", duration: "45 Min" },
      { title: "Kompass & Peilung", duration: "40 Min" },
      { title: "GPS-Navigation", duration: "35 Min" },
      { title: "Gezeitenberechnung", duration: "50 Min" },
      { title: "Routenplanung", duration: "40 Min" },
      { title: "Praxisübungen", duration: "30 Min" },
    ],
    accessInfo: {
      youtubeLink: "https://youtube.com/playlist?list=example",
    },
  },
  {
    id: "kurs-3",
    title: "Wetterkunde für Segler",
    description:
      "Verstehe das Wetter auf See. Wolkenformationen, Windvorhersagen und sichere Routenplanung.",
    longDescription:
      "Das Wetter ist der wichtigste Faktor beim Segeln. In diesem Kurs lernst du, Wolken zu lesen, Wetterberichte zu interpretieren und sichere Entscheidungen auf See zu treffen.",
    price: 5900, // 59,00 EUR
    type: "download",
    duration: "4 Module",
    modules: [
      { title: "Grundlagen der Meteorologie", duration: "35 Min" },
      { title: "Wolken lesen", duration: "40 Min" },
      { title: "Wetterberichte verstehen", duration: "30 Min" },
      { title: "Entscheidungen auf See", duration: "35 Min" },
    ],
    accessInfo: {
      youtubeLink: "https://youtube.com/playlist?list=example2",
    },
  },
  {
    id: "kurs-4",
    title: "Knoten & Seemannschaft - Live Workshop",
    description:
      "Praktischer Workshop: Die wichtigsten Knoten und Seemannschaft-Grundlagen live erklärt und geübt.",
    longDescription:
      "Knoten sind das A und O der Seemannschaft. In diesem praktischen Live-Workshop lernst du die wichtigsten Knoten Schritt für Schritt. Halte ein Stück Seil bereit und übe direkt mit!",
    price: 3900, // 39,00 EUR
    type: "live",
    duration: "1.5 Stunden",
    instructor: "Matthias Hardtke",
    modules: [
      { title: "Palstek", duration: "15 Min" },
      { title: "Kreuzknoten & Schotstek", duration: "15 Min" },
      { title: "Webeleinstek", duration: "10 Min" },
      { title: "Klampe belegen", duration: "10 Min" },
      { title: "Gemeinsam üben", duration: "40 Min" },
    ],
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
