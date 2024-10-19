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

export default function DailyTokenChart() {
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

    fetchDailyData();
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        일별 토큰 사용량 및 비용
      </h1>
      <Line data={data} options={options} />
    </div>
  );
}
