import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: string };
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ reply: "Please type a message so I can help." }, { status: 400 });
    }

    const lowered = message.toLowerCase();

    if (lowered.includes("shipping") || lowered.includes("delivery")) {
      return NextResponse.json({
        reply:
          "Shipping depends on your location and the items in your cart. If you tell me your country and the parts you’re ordering, I can guide you on typical delivery timelines.",
      });
    }

    if (lowered.includes("return") || lowered.includes("refund")) {
      return NextResponse.json({
        reply:
          "For returns/refunds, please share your order number (if you have one) and what item you want to return. I’ll guide you through the next steps.",
      });
    }

    if (lowered.includes("support") || lowered.includes("help") || lowered.includes("agent")) {
      return NextResponse.json({
        reply:
          "You can reach KSR support from the site’s Contact section. If you share what you need help with (order, product fitment, or payment), I’ll point you to the fastest option.",
      });
    }

    return NextResponse.json({
      reply:
        "I can help you find the right performance parts, check fitment questions, and guide you on orders and shipping. What part are you looking for (e.g., turbo, intercooler, cooling, fuel)?",
    });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again." }, { status: 500 });
  }
}
