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

    // Generate username from email (everything before @)
    const generatedUsername = primaryEmail.split('@')[0] || "";
    
    // Sanitize username: remove dots, special chars, make lowercase
    const sanitizedUsername = generatedUsername
      .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
      .toLowerCase() // Convert to lowercase
      .substring(0, 20); // Limit length to 20 characters

    // Generate unique username by checking for conflicts
    let finalUsername = sanitizedUsername;
    let counter = 1;
    
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${sanitizedUsername}${counter}`;
      counter++;
      
      // Prevent infinite loop with very long usernames
      if (finalUsername.length > 25) {
        finalUsername = `${sanitizedUsername}${Date.now().toString().slice(-4)}`;
        break;
      }
    }

    try {
      await dbConnect();
      
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
    } catch (err: any) {
      console.error("⚠️ Error upserting user:", err);
      throw err;
    }
  }

  return NextResponse.json({}, { status: 200 });
}