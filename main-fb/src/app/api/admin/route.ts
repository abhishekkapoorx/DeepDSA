import { exampleUsage } from "@/utils/CodeGenerator/example-usage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    return NextResponse.json(exampleUsage())

}