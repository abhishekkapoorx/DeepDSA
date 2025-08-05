// src/app/api/clerk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import dbConnect from "@/lib/mongoose";
import { User, Role } from "@/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
    });
  } catch (err) {
    console.error("🔒 Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { type, data } = evt;
  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e: any) => e.id === data.primary_email_address_id
    )?.email_address || "";

    try {
      await dbConnect();
      
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: primaryEmail,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          username: data.username || "",
          imageUrl: data.image_url || "",
          role: Role.USER,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (err: any) {
      console.error("⚠️ Error upserting user:", err);
      throw err;
    }
  }

  return NextResponse.json({}, { status: 200 });
}