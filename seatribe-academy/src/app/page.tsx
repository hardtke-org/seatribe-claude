"use client";

import { courses, formatPrice, Course } from "@/lib/courses";
import { useState } from "react";

function CourseCard({ course }: { course: Course }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div
        className={`h-3 ${course.type === "live" ? "bg-blue-500" : "bg-green-500"}`}
      />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              course.type === "live"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {course.type === "live" ? "Live Session" : "Video-Kurs"}
          </span>
          {course.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              Empfohlen
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

        {course.type === "live" && course.accessInfo.date && (
          <p className="text-sm text-blue-600 mb-4 flex items-center gap-2">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {course.accessInfo.date}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(course.price)}
          </span>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Laden..." : "Jetzt kaufen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <span className="text-2xl font-bold text-gray-900">
                SeaTribe Academy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Lerne Segeln mit Leidenschaft
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Entdecke unsere Online-Kurse - Live-Sessions und Video-Kurse von
          erfahrenen Seglern. Flexibel lernen, wann und wo du willst.
        </p>
      </section>

      {/* Courses Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Unsere Kurse</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
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
