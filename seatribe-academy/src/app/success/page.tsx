"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface AccessInfo {
  zoomLink?: string;
  zoomPassword?: string;
  youtubeLink?: string;
  downloadLink?: string;
  date?: string;
}

interface CourseData {
  title: string;
  type: "live" | "download";
  accessInfo: AccessInfo;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const courseId = searchParams.get("course_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId || !courseId) {
        setError("Fehlende Parameter");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, courseId }),
        });

        const data = await response.json();

        if (data.success) {
          setCourseData(data.course);
        } else {
          setError(data.error || "Verifizierung fehlgeschlagen");
        }
      } catch {
        setError("Verbindungsfehler");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Zahlung wird verifiziert...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fehler bei der Verifizierung
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Zurueck zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-2xl mx-auto pt-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
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
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vielen Dank fuer deinen Kauf!
          </h1>
          <p className="text-gray-600">
            Deine Zahlung war erfolgreich. Hier sind deine Zugangsdaten:
          </p>
        </div>

        {/* Course Access Card */}
        {courseData && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div
              className={`p-6 ${
                courseData.type === "live" ? "bg-blue-600" : "bg-green-600"
              } text-white`}
            >
              <span className="text-sm opacity-80">
                {courseData.type === "live" ? "Live Session" : "Video-Kurs"}
              </span>
              <h2 className="text-2xl font-bold mt-1">{courseData.title}</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Live Course Info */}
              {courseData.type === "live" && (
                <>
                  {courseData.accessInfo.date && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-blue-600 mt-0.5"
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
                      <div>
                        <p className="font-semibold text-gray-900">Termin</p>
                        <p className="text-gray-600">
                          {courseData.accessInfo.date}
                        </p>
                      </div>
                    </div>
                  )}

                  {courseData.accessInfo.zoomLink && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-gray-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Zoom-Link</p>
                        <a
                          href={courseData.accessInfo.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {courseData.accessInfo.zoomLink}
                        </a>
                        {courseData.accessInfo.zoomPassword && (
                          <p className="text-gray-600 mt-1">
                            Passwort:{" "}
                            <code className="bg-gray-200 px-2 py-0.5 rounded">
                              {courseData.accessInfo.zoomPassword}
                            </code>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Download Course Info */}
              {courseData.type === "download" && (
                <>
                  {courseData.accessInfo.youtubeLink && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-red-600 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          Video-Kurs
                        </p>
                        <a
                          href={courseData.accessInfo.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          Zur YouTube-Playlist
                        </a>
                      </div>
                    </div>
                  )}

                  {courseData.accessInfo.downloadLink && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                      <svg
                        className="w-6 h-6 text-green-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Download</p>
                        <a
                          href={courseData.accessInfo.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Materialien herunterladen
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Wichtig:</strong> Bitte speichere diese Seite oder
                  mache einen Screenshot. Du erhaeltst diese Zugangsdaten auch
                  per E-Mail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
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
            Zurueck zur Kursübersicht
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
