import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCourseById } from "@/lib/courses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, courseId } = await request.json();

    // Verify the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Zahlung nicht abgeschlossen" },
        { status: 400 }
      );
    }

    // Verify course ID matches
    if (session.metadata?.courseId !== courseId) {
      return NextResponse.json(
        { error: "Ungueltige Kurs-ID" },
        { status: 400 }
      );
    }

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Kurs nicht gefunden" }, { status: 404 });
    }

    // Return access info only after successful payment verification
    return NextResponse.json({
      success: true,
      course: {
        title: course.title,
        type: course.type,
        accessInfo: course.accessInfo,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Zahlungsverifizierung" },
      { status: 500 }
    );
  }
}
