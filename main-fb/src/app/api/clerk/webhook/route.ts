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
    console.log("Clerk webhook signature verified");
  } catch (error) {
    console.error("Clerk webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  await dbConnect();
  console.log("Database connected for Clerk webhook processing...");
  
  const { type, data } = evt;
  console.log("Clerk webhook event:", type);

  if (type !== "user.created" && type !== "user.updated") {
    console.log("Unhandled Clerk event type:", type);
    return NextResponse.json({}, { status: 200 });
  }

  const primaryEmail =
    data.email_addresses.find((email: any) => email.id === data.primary_email_address_id)?.email_address || "";

  const generatedUsername = primaryEmail.split("@")[0] || "";
  const sanitizedUsername = generatedUsername.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 20);

  console.log("Generated username candidates:", { generatedUsername, sanitizedUsername, primaryEmail });

  const finalUsername = (data.username || sanitizedUsername || `user${Date.now().toString().slice(-6)}`)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 20);

  console.log("Final username selected:", finalUsername);

  try {
    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: primaryEmail,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        username: data.username || finalUsername,
        imageUrl: data.image_url || "",
        role: Role.USER,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("User upserted successfully for Clerk ID:", data.id);
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }

  return NextResponse.json({}, { status: 200 });
}