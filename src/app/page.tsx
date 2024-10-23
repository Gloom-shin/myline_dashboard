// pages/index.tsx
"use client";

import Link from "next/link";
import DailyTokenChart from "./pages/component/daily/tokenchart/page";
import TodayTokenInfo from "./pages/component/today/tokeninfo/page";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        대시보드
      </h1>

      {/* 금일 사용한 토큰 수 및 비용 */}
      <TodayTokenInfo />

      <DailyTokenChart />

      <div className="flex justify-center space-x-4 mb-8">
        {/* 월별 누적 차트 페이지로 이동하는 버튼 */}
        <Link
          href="/pages/MonthlyTokenChart"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          월별 누적 차트 보러가기
        </Link>

        {/* 타입별 누적 차트 페이지로 이동하는 버튼 */}
        <Link
          href="/pages/type"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          타입별 누적 차트 보러가기
        </Link>
      </div>
    </main>
  );
}
