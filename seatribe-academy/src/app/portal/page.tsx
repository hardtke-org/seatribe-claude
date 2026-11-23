import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCourseById, Course } from '@/lib/courses'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: purchases } = await supabase
    .from('purchases')
    .select('course_id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')

  const purchasedCourses = (purchases ?? [])
    .map((p) => getCourseById(p.course_id))
    .filter((c): c is Course => c !== undefined)

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

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Kurse</h1>
        <p className="text-gray-600 mb-8">Hier findest du alle deine gekauften Kurse.</p>

        {purchasedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Kurse</h2>
            <p className="text-gray-500 mb-6">Du hast noch keine Kurse gekauft.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Kurse entdecken
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {purchasedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/portal/kurs/${course.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow block"
              >
                <div className={`h-3 ${course.type === 'live' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.type === 'live' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {course.type === 'live' ? 'Live Session' : 'Video-Kurs'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      &#10003; Gekauft
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {course.duration && (
                      <span className="text-sm text-gray-500">{course.duration}</span>
                    )}
                    <span className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl ml-auto">
                      Zum Kurs &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
