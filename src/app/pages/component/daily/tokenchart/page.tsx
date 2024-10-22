"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyData {
  [key: string]: {
    totalTokens: number;
    totalPrice: number;
  };
}
const getKoreanYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); // 어제로 날짜 설정

  // 한국 시간대로 변환하여 어제 날짜 생성
  const koreanYesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(yesterday);

  return koreanYesterday; // YYYY-MM-DD 형식
};

export default function DailyTokenChart() {
  const [todayData, setTodayData] = useState<{
    totalTokens: number;
    totalPrice: number;
  } | null>(null);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const res = await fetch("/api/getDailyTokens"); // 일별 데이터를 가져오는 API 호출
        if (!res.ok) {
          throw new Error("일별 데이터를 가져오는데 실패했습니다.");
        }
        const data = await res.json();
        setDailyData(data.dailyData);

        // 전날 날짜 계산
        const yesterdayString = getKoreanYesterday();
        if (data.dailyData[yesterdayString]) {
          setTodayData({
            totalTokens: data.dailyData[yesterdayString].totalTokens,
            totalPrice: data.dailyData[yesterdayString].totalPrice,
          });
        } else {
          setTodayData({ totalTokens: 0, totalPrice: 0 }); // 금일 데이터가 없으면 0으로 설정
        }

        setLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
        setLoading(false);
      }
    };

    fetchDailyData(); // 일별 데이터를 가져옴
  }, []);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">오류: {error}</p>;

  // Chart.js 데이터 구성
  const days = dailyData ? Object.keys(dailyData) : [];
  const totalTokens = dailyData
    ? days.map((day) => dailyData[day].totalTokens)
    : [];
  const totalPrices = dailyData
    ? days.map((day) => dailyData[day].totalPrice)
    : [];

  const data = {
    labels: days, // X축에 표시할 일 정보 (YYYY-MM-DD 형식)
    datasets: [
      {
        label: "총 토큰 수",
        data: totalTokens,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "총 비용 (USD)",
        data: totalPrices,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "일별 토큰 사용량 및 비용",
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 두 칸으로 나눈 레이아웃 */}
      <div className="flex justify-between space-x-4 mb-8">
        {/* 왼쪽: 전날 사용한 총 비용 */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            전날 사용한 총 비용
          </h2>
          <p className="text-2xl font-bold text-blue-600">
            ${todayData?.totalPrice.toLocaleString() || 0}
          </p>
        </div>

        {/* 오른쪽: 전날 사용한 총 토큰 */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            전날 사용한 총 토큰
          </h2>
          <p className="text-2xl font-bold text-green-600">
            {todayData?.totalTokens.toLocaleString() || 0} Tokens
          </p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        일별 토큰 사용량 및 비용
      </h1>
      <Line data={data} options={options} />
    </div>
  );
}
