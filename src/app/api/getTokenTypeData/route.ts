import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

export async function GET() {
  try {
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
