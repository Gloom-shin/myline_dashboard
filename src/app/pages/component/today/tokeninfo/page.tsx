"use client";

import { useEffect, useState } from "react";

export default function TodayTokenInfo() {
  const [todayTokens, setTodayTokens] = useState<number | null>(null);
  const [todayCost, setTodayCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 가져오기 함수
  const fetchTodayTokens = async () => {
    try {
      setLoading(true); // 로딩 상태 활성화

      const res = await fetch(`/api/getTodayTokens`, {
        method: "POST", // POST 요청으로 변경
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch today's token data");
      }
      const data = await res.json();
      setTodayTokens(data.totalTokens);
      setTodayCost(data.totalCost);
      setLoading(false); // 데이터 로딩 후 로딩 상태 비활성화
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false); // 에러 발생 시에도 로딩 상태 비활성화
    }
  };

  // 컴포넌트가 처음 렌더링될 때 데이터 가져오기
  useEffect(() => {
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
    <div className="max-w-4xl px-6">
      <div className="flex flex-col items-center">
        {/* 데이터 새로고침 버튼 */}
        <button
          onClick={fetchTodayTokens}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          실시간 데이터 받아오기
        </button>

        <div className="flex justify-between space-x-4 mb-8 w-full">
          <div className="flex-1 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              금일 사용한 총 비용
            </h2>
            <p className="text-2xl font-bold text-blue-600">
              ${todayCost ? todayCost.toLocaleString() : 0}
            </p>
          </div>

          <div className="flex-1 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              금일 사용한 총 토큰
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {todayTokens ? todayTokens.toLocaleString() : 0} Tokens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
