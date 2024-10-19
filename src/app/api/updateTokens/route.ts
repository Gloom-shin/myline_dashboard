// pages/api/updateTokens.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "", // 기본값으로 빈 문자열 추가
});

export async function GET() {
  try {
    // 1. Supabase에서 오늘 날짜 데이터를 가져옴
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 포맷으로 오늘 날짜 생성
    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .gte("created_at", `${today}T00:00:00.000Z`) // 오늘 날짜의 0시부터
      .lte("created_at", `${today}T23:59:59.999Z`); // 오늘 날짜의 23시 59분 59초까지

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data for today" });
    }

    // 2. OpenAI API를 사용하여 토큰 계산
    let totalTokens = 0;
    for (const row of data) {
      const runs = await openai.beta.threads.runs.list(row.thread_id);
      if (runs.data) {
        for (const run of runs.data) {
          if (run.usage && run.usage.total_tokens)
            // 사용량이 있는지 확인
            totalTokens += run.usage.total_tokens;
        }
      }
    }
    console.log(`Total tokens for today: ${totalTokens}`);

    // 3. 계산한 토큰 값을 Supabase에 저장
    const { error: insertError } = await supabase
      .from("tokens")
      .insert([{ date: today, token_cnt: totalTokens, token_type: "total" }]);

    if (insertError) {
      throw new Error(`Supabase insert error: ${insertError.message}`);
    }

    return NextResponse.json({
      message: "Tokens updated successfully",
      totalTokens,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
