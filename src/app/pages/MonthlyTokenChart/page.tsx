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

interface MonthlyData {
  [key: string]: {
    totalTokens: number;
    totalPrice: number;
  };
}

export default function MonthlyTokenChart() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const res = await fetch("/api/getMonthlyTokens"); // 월별 데이터를 가져오는 API 호출
        if (!res.ok) {
          throw new Error("월별 데이터를 가져오는데 실패했습니다.");
        }
        const data = await res.json();
        setMonthlyData(data.monthlyData);
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

    fetchMonthlyData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">오류: {error}</p>;

  // Chart.js 데이터 구성
  const months = monthlyData ? Object.keys(monthlyData) : [];
  const totalTokens = monthlyData
    ? months.map((month) => monthlyData[month].totalTokens)
    : [];
  const totalPrices = monthlyData
    ? months.map((month) => monthlyData[month].totalPrice)
    : [];

  const data = {
    labels: months, // X축에 표시할 월 정보 (YYYY-MM 형식)
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
        text: "월별 토큰 사용량 및 비용",
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Line data={data} options={options} />
    </div>
  );
}
