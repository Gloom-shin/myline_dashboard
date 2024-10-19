// pages/api/updateTokens.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "", // 기본값으로 빈 문자열 추가
});

// 토큰 비용 계산 함수
const calculatePrice = (inputTokens: number, outputTokens: number) => {
  const inputPrice = (inputTokens / 1_000_000) * 2.5; // $2.50 per 1M input tokens
  const outputPrice = (outputTokens / 1_000_000) * 10.0; // $10.00 per 1M output tokens
  return {
    inputPrice: parseFloat(inputPrice.toFixed(2)), // 소수점 둘째 자리까지
    outputPrice: parseFloat(outputPrice.toFixed(2)), // 소수점 둘째 자리까지
    totalPrice: parseFloat((inputPrice + outputPrice).toFixed(2)), // 소수점 둘째 자리까지
  };
};

export async function GET() {
  try {
    // 1. Supabase에서 어제 날짜 데이터를 가져옴
    // const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 포맷으로 오늘 날짜 생성
    const today = "2024-10-14";
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
    const threadTokenCounts: {
      [key: string]: {
        input: number;
        output: number;
        price?: { inputPrice: number; outputPrice: number; totalPrice: number };
      };
    } = {};
    threadTokenCounts["total"] = { input: 0, output: 0 }; // 전체 토큰 수를 저장할 total 키 추가
    for (const row of data) {
      const runs = await openai.beta.threads.runs.list(row.thread_id);
      if (runs.data) {
        for (const run of runs.data) {
          if (
            run.usage &&
            (run.usage.prompt_tokens || run.usage.completion_tokens)
          ) {
            // 해당 로그의 thread_type을 사용하여 토큰 집계
            const threadType = row.page || "unknown";
            if (!threadTokenCounts[threadType]) {
              threadTokenCounts[threadType] = { input: 0, output: 0 };
            }
            threadTokenCounts[threadType].input += run.usage.prompt_tokens || 0;
            threadTokenCounts[threadType].output +=
              run.usage.completion_tokens || 0;
            threadTokenCounts["total"].input += run.usage.prompt_tokens || 0;
            threadTokenCounts["total"].output +=
              run.usage.completion_tokens || 0;
          }
        }
      }
    }
    // 토큰 수에 따른 가격 계산
    for (const threadType in threadTokenCounts) {
      const { input, output } = threadTokenCounts[threadType];
      const price = calculatePrice(input, output);
      threadTokenCounts[threadType].price = price;
    }

    // 3. Supabase에 thread_type별 토큰 수를 저장
    const tokenInsertPromises = Object.entries(threadTokenCounts).map(
      async ([threadType, { input, output, price }]) => {
        const { inputPrice, outputPrice, totalPrice } = price || {
          inputPrice: 0,
          outputPrice: 0,
          totalPrice: 0,
        };
        const { error: insertError } = await supabase.from("tokens").insert([
          {
            date: today,
            input_token_cnt: input,
            output_token_cnt: output,
            total_token_cnt: input + output,
            token_type: threadType, // thread_type별로 저장
            gpt_model: "gpt-4o",
            input_price: inputPrice,
            output_price: outputPrice,
            total_price: totalPrice,
          },
        ]);

        if (insertError) {
          throw new Error(`Supabase insert error: ${insertError.message}`);
        }
      }
    );
    await Promise.all(tokenInsertPromises); // 모든 저장 작업이 완료될 때까지 기다림
    return NextResponse.json({
      message: "Tokens updated successfully by thread_type",
      tokenCounts: threadTokenCounts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
