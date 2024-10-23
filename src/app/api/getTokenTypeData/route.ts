import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

export async function POST(req: Request) {
  try {
    // 필요 시 요청 본문에서 데이터 처리
    const body = await req.json();
    const { filterCondition } = body; // 요청에 추가 조건이 있는 경우 처리 예시

    // token_type별로 토큰 수와 비용을 집계하는 쿼리 실행
    const { data, error } = await supabase.from("tokens").select("*");

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    console.log(data);
    return NextResponse.json(
      { tokenTypeData: data },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate", // 캐시 방지
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
        },
      }
    );
  }
}
