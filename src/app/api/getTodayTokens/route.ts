// pages/api/getTodayTokens.ts
import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";
import OpenAI from "openai";
import { getKoreanDate } from "@/app/utils/dateUtils";

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    // POST 요청 본문에서 필요한 데이터 가져오기 (필요하다면)
    // const body = await req.json();

    // 오늘 날짜 생성 (YYYY-MM-DD 형식) 또는 요청에서 받은 날짜 사용
    const today = getKoreanDate();

    // 1. logs 테이블에서 created_at이 오늘인 thread_id 가져오기
    const { data: logs, error: logsError } = await supabase
      .from("logs")
      .select("thread_id")
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lte("created_at", `${today}T23:59:59.999Z`);

    if (logsError) {
      throw new Error(`Supabase logs error: ${logsError.message}`);
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ totalTokens: 0, totalCost: 0 });
    }

    // 2. OpenAI API를 통해 각 thread_id의 토큰 사용량 계산
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const log of logs) {
      const threadId = log.thread_id;
      const runs = await openai.beta.threads.runs.list(threadId);
      if (runs.data) {
        for (const run of runs.data) {
          if (run.usage) {
            totalInputTokens += run.usage.prompt_tokens || 0;
            totalOutputTokens += run.usage.completion_tokens || 0;
          }
        }
      }
    }

    // 3. 비용 계산
    const inputCostPerMillion = 2.5; // 1M input tokens = $2.50
    const outputCostPerMillion = 10.0; // 1M output tokens = $10.00

    const inputCost = (totalInputTokens / 1_000_000) * inputCostPerMillion;
    const outputCost = (totalOutputTokens / 1_000_000) * outputCostPerMillion;
    const totalCost = inputCost + outputCost;
    const totalTokens = totalInputTokens + totalOutputTokens;

    return NextResponse.json(
      {
        totalTokens,
        totalCost,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate", // 캐시 방지
          "Vercel-CDN-Cache-Control": "max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate", // 캐시 방지
          "Vercel-CDN-Cache-Control": "max-age=0",
        },
      }
    );
  }
}
