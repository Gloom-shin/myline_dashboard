import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Supabase에서 모든 데이터를 월별로 그룹화하여 가져옴
    const { data, error } = await supabase
      .from("tokens")
      .select("date, total_token_cnt, total_price")
      .eq("token_type", "total")
      .order("date", { ascending: true });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data available" });
    }

    // 데이터 집계
    const monthlyData: {
      [key: string]: { totalTokens: number; totalPrice: number };
    } = {};

    data.forEach(
      (row: { date: string; total_token_cnt: number; total_price: number }) => {
        const month = row.date.slice(0, 7); // YYYY-MM 포맷으로 월 추출
        if (!monthlyData[month]) {
          monthlyData[month] = { totalTokens: 0, totalPrice: 0 };
        }

        // 입력 토큰, 출력 토큰 및 총 비용을 월별로 누적
        monthlyData[month].totalTokens += row.total_token_cnt;
        monthlyData[month].totalPrice += row.total_price;
      }
    );

    return NextResponse.json({
      message: "Monthly token data fetched successfully",
      monthlyData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
