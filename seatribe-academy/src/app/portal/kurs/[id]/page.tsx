import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCourseById } from '@/lib/courses'
import Link from 'next/link'
import { LogoutButton } from '../../LogoutButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PortalKursPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const course = getCourseById(id)
  if (!course) {
    redirect('/portal')
  }

  // Verify purchase
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', id)
    .eq('status', 'paid')
    .single()

  if (!purchase) {
    redirect('/portal')
  }

  const { accessInfo } = course

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">SeaTribe Academy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`${course.type === 'live' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Meine Kurse
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {course.type === 'live' ? 'Live Session' : 'Video-Kurs'}
            </span>
            {course.duration && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{course.duration}</span>
            )}
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              &#10003; Dein Kurs
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
          {course.instructor && (
            <p className="text-white/80">Mit {course.instructor}</p>
          )}
          {course.type === 'live' && accessInfo.date && (
            <div className="mt-4 flex items-center gap-2 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{accessInfo.date}</span>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Description & Modules */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Über diesen Kurs</h2>
              <p className="text-gray-600 leading-relaxed">
                {course.longDescription || course.description}
              </p>
            </div>

            {course.modules && course.modules.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kursinhalt</h2>
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
                        <span className="text-gray-500 text-sm">{module.duration}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Access Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Dein Zugang</h2>

              {/* Live course access */}
              {course.type === 'live' && (
                <div className="space-y-4">
                  {accessInfo.date && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Termin</p>
                        <p className="text-gray-700 text-sm mt-0.5">{accessInfo.date}</p>
                      </div>
                    </div>
                  )}

                  {accessInfo.zoomLink && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <svg className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Zoom-Link</p>
                        <a
                          href={accessInfo.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {accessInfo.zoomLink}
                        </a>
                        {accessInfo.zoomPassword && (
                          <p className="text-gray-600 text-sm mt-1">
                            Passwort:{' '}
                            <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                              {accessInfo.zoomPassword}
                            </code>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {accessInfo.zoomLink && (
                    <a
                      href={accessInfo.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Zoom-Session beitreten
                    </a>
                  )}
                </div>
              )}

              {/* Video / download course access */}
              {course.type === 'download' && (
                <div className="space-y-4">
                  {accessInfo.youtubeLink && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Video-Kurs</p>
                        <a
                          href={accessInfo.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Zur YouTube-Playlist
                        </a>
                      </div>
                    </div>
                  )}

                  {accessInfo.downloadLink && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Download</p>
                        <a
                          href={accessInfo.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Materialien herunterladen
                        </a>
                      </div>
                    </div>
                  )}

                  {accessInfo.youtubeLink && (
                    <a
                      href={accessInfo.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-green-600 text-white text-center font-semibold rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Kurs ansehen
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
