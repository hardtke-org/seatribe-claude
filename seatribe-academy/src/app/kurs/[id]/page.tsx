"use client";

import { useParams } from "next/navigation";
import { getCourseById, formatPrice } from "@/lib/courses";
import Link from "next/link";
import { useState } from "react";

export default function KursDetail() {
  const params = useParams();
  const courseId = params.id as string;
  const course = getCourseById(courseId);
  const [loading, setLoading] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kurs nicht gefunden
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  async function handleBuy() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course!.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Fehler: " + (data.error || "Unbekannter Fehler"));
        setLoading(false);
      }
    } catch {
      alert("Verbindungsfehler. Bitte versuche es erneut.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              SeaTribe Academy
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className={`${course.type === "live" ? "bg-blue-600" : "bg-green-600"} text-white`}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Alle Kurse
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {course.type === "live" ? "Live Session" : "Video-Kurs"}
            </span>
            {course.duration && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {course.duration}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>

          {course.instructor && (
            <p className="text-white/80">Mit {course.instructor}</p>
          )}

          {course.type === "live" && course.accessInfo.date && (
            <div className="mt-6 flex items-center gap-2 text-white/90">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{course.accessInfo.date}</span>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Description & Modules */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Über diesen Kurs
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {course.longDescription || course.description}
              </p>
            </div>

            {/* Modules */}
            {course.modules && course.modules.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Kursinhalt
                </h2>
                <ul className="space-y-3">
                  {course.modules.map((module, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{module.title}</span>
                      </div>
                      {module.duration && (
                        <span className="text-gray-500 text-sm">
                          {module.duration}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Purchase Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(course.price)}
                </span>
                <p className="text-gray-500 mt-1">Einmalzahlung</p>
              </div>

              <button
                onClick={handleBuy}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  course.type === "live"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Laden..." : "Jetzt kaufen"}
              </button>

              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Sofortiger Zugang nach Kauf
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {course.type === "live"
                    ? "Live-Session mit Fragen & Antworten"
                    : "Lebenslanger Zugriff"}
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Sichere Zahlung via Stripe
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} SeaTribe Academy. Alle Rechte
            vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
