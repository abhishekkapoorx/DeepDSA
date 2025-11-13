// src/app/api/clerk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import dbConnect from "@/lib/mongoose";
import { User, Role } from "@/models";

export const runtime = "nodejs";

/**
 * POST /api/clerk/webhook - Handle Clerk authentication webhooks
 * Processes user.created and user.updated events from Clerk. Creates or updates
 * user records in database with auto-generated unique username. Verifies webhook signature.
 */
export async function POST(req: NextRequest) {
  console.log("🔔 Clerk webhook received");
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
    });
    console.log("✅ Clerk webhook signature verified successfully");
  } catch (err) {
    console.error("🔒 Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { type, data } = evt;
  console.log(`📋 Webhook event type: ${type}`);
  
  if (type === "user.created" || type === "user.updated") {
    console.log("👤 Processing user creation/update event");
    const primaryEmail = data.email_addresses.find(
      (e: any) => e.id === data.primary_email_address_id
    )?.email_address || "";
    console.log(`📧 Primary email: ${primaryEmail}`);

    // Generate username from email (everything before @)
    const generatedUsername = primaryEmail.split('@')[0] || "";
    console.log(`🔤 Generated username: ${generatedUsername}`);
    
    // Sanitize username: remove dots, special chars, make lowercase
    const sanitizedUsername = generatedUsername
      .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric characters
      .toLowerCase() // Convert to lowercase
      .substring(0, 20); // Limit length to 20 characters
    console.log(`🧹 Sanitized username: ${sanitizedUsername}`);

    // Generate unique username by checking for conflicts
    let finalUsername = sanitizedUsername;
    let counter = 1;
    
    while (await User.findOne({ username: finalUsername })) {
      console.log(`⚠️ Username conflict found: ${finalUsername}, trying alternative`);
      finalUsername = `${sanitizedUsername}${counter}`;
      counter++;
      
      // Prevent infinite loop with very long usernames
      if (finalUsername.length > 25) {
        finalUsername = `${sanitizedUsername}${Date.now().toString().slice(-4)}`;
        console.log(`🔄 Generated fallback username: ${finalUsername}`);
        break;
      }
    }
    console.log(`✅ Final username: ${finalUsername}`);

    try {
      console.log("🔌 Connecting to database...");
      await dbConnect();
      console.log("✅ Database connected successfully");
      
      console.log(`💾 Upserting user with Clerk ID: ${data.id}`);
      const user = await User.findOneAndUpdate(
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
      console.log(`✅ User upserted successfully: ${user?.username || 'Unknown'}`);
    } catch (err: any) {
      console.error("⚠️ Error upserting user:", err);
      throw err;
    }
  } else {
    console.log(`ℹ️ Unhandled webhook event type: ${type}`);
  }

  console.log("✅ Webhook processing completed successfully");
  return NextResponse.json({}, { status: 200 });
}