import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

export interface TokenCounts {
  [key: string]: {
    input: number;
    output: number;
    model: string;
  };
}

export async function GET() {
  try {
    // 1. Supabase에서 오늘 날짜 데이터를 가져옴
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 포맷으로 오늘 날짜 생성
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("date", today); // 오늘 날짜 데이터만 선택

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data for today" });
    }

    // 2. 데이터 가공
    const tokenCounts: TokenCounts = {};
    for (const row of data) {
      const threadType = row.token_type || "unknown";
      tokenCounts[threadType] = {
        input: row.input_token_cnt || 0,
        output: row.output_token_cnt || 0,
        model: row.gpt_model || "unknown",
      };
    }
    return NextResponse.json({
      message: "Tokens fetched successfully",
      tokenCounts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
