import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCourseById } from "@/lib/courses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Kurs nicht gefunden" }, { status: 404 });
    }

    const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
      cancel_url: `${domain}?cancelled=true`,
      metadata: {
        courseId: course.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Checkout-Session" },
      { status: 500 }
    );
  }
}
