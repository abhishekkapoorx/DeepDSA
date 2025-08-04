// src/app/api/clerk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/prisma";

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
      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email:     primaryEmail,
          firstName: data.first_name  || "",
          lastName:  data.last_name   || "",
          username:  data.username    || "",
          imageUrl:  data.image_url   || "",
          role:      "USER",
        },
        create: {
          clerkId:   data.id,
          email:     primaryEmail,
          firstName: data.first_name  || "",
          lastName:  data.last_name   || "",
          username:  data.username    || "",
          imageUrl:  data.image_url   || "",
          role:      "USER",
        },
      });
      console.log(`✅ User ${type}: ${data.id}`);
    } catch (err: any) {
      if (err.code === "P2002") {
        console.warn("⚠️ Duplicate key conflict on upsert:", err.meta?.target);
      } else {
        console.error(`❌ Error in user ${type}:`, err);
        throw err;
      }
    }
  } else if (type === "user.deleted") {
    try {
      await prisma.user.delete({
        where: { clerkId: data.id },
      });
      console.log(`✅ User deleted: ${data.id}`);
    } catch (err: any) {
      if (err.code === "P2025") {
        console.warn("⚠️ User not found for deletion:", data.id);
      } else {
        console.error(`❌ Error deleting user:`, err);
        throw err;
      }
    }
  }

  return NextResponse.json({}, { status: 200 });
}