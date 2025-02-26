import { NextResponse } from "next/server";
import { supabase } from "@/lib/";

// GET handler to search for tokens by keyword
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword) {
      return NextResponse.json(
        { error: "keyword is required" },
        { status: 400 }
      );
    }

    // Fetch tokens from the database
    const { data, error } = await supabase
      .from("tokens_base")
      .select("*")
      .ilike("symbol", `${keyword}%`)
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error searching for tokens:", error);
    return NextResponse.json(
      { error: "Failed to search for tokens" },
      { status: 500 }
    );
  }
}
