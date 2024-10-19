import { NextResponse } from "next/server";
import { supabase } from "@/supabaseClient";

export async function GET() {
  try {
    // 현재 날짜 기준으로 월의 시작일과 마지막일 계산
    const today = new Date();
    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    ).toISOString(); // 해당 월의 첫 번째 날
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).toISOString(); // 해당 월의 마지막 날

    // Supabase에서 해당 월의 token_type이 'total'인 일별 데이터를 가져옴
    const { data, error } = await supabase
      .from("tokens")
      .select("date, total_token_cnt, total_price")
      .eq("token_type", "total")
      .gte("date", firstDayOfMonth) // 해당 월의 첫날부터
      .lte("date", lastDayOfMonth) // 해당 월의 마지막 날까지
      .order("date", { ascending: true });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: "No data available" });
    }

    // 데이터 처리
    const dailyData: {
      [key: string]: { totalTokens: number; totalPrice: number };
    } = {};

    data.forEach(
      (row: { date: string; total_token_cnt: number; total_price: number }) => {
        const day = row.date.slice(0, 10); // YYYY-MM-DD 포맷으로 날짜 추출
        if (!dailyData[day]) {
          dailyData[day] = { totalTokens: 0, totalPrice: 0 };
        }

        // 날짜별로 총 토큰 수 및 총 비용 누적
        dailyData[day].totalTokens += row.total_token_cnt;
        dailyData[day].totalPrice += row.total_price;
      }
    );

    return NextResponse.json({
      message: "Daily token data fetched successfully",
      dailyData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
