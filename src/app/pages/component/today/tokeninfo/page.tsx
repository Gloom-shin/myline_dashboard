"use client";

import { useEffect, useState } from "react";

export default function TodayTokenInfo() {
  const [todayTokens, setTodayTokens] = useState<number | null>(null);
  const [todayCost, setTodayCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayTokens = async () => {
      try {
        const res = await fetch("/api/getTodayTokens", {
          next: { revalidate: 10 }, // 10초 후 데이터 재검증
        });
        if (!res.ok) {
          throw new Error("Failed to fetch today's token data");
        }
        const data = await res.json();
        setTodayTokens(data.totalTokens);
        setTodayCost(data.totalCost);
        setLoading(false); // 데이터가 로드된 후 로딩 상태 해제
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
        setLoading(false); // 에러 발생 시에도 로딩 상태 해제
      }
    };

    fetchTodayTokens();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-2xl font-bold text-gray-700">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-2xl font-bold text-red-500">오류: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-between space-x-4 mb-8">
      {/* 왼쪽: 금일 사용한 총 비용 */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          금일 현재까지 사용한 총 비용
        </h2>
        <p className="text-2xl font-bold text-blue-600">
          ${todayCost ? todayCost.toLocaleString() : 0}
        </p>
      </div>

      {/* 오른쪽: 금일 사용한 총 토큰 */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          금일 현재까지 사용한 총 토큰
        </h2>
        <p className="text-2xl font-bold text-green-600">
          {todayTokens ? todayTokens.toLocaleString() : 0} Tokens
        </p>
      </div>
    </div>
  );
}
