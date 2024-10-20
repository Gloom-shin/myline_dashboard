"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TokenTypeData {
  token_type: string;
  date: string;
  input_token_cnt: number;
  output_token_cnt: number;
  total_token_cnt: number;
  input_price: number;
  output_price: number;
  total_price: number;
}

export default function AdminPage() {
  const [tokenTypeData, setTokenTypeData] = useState<TokenTypeData[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const res = await fetch("/api/getTokenTypeData");
        if (!res.ok) {
          throw new Error("토큰 타입별 데이터를 가져오는데 실패했습니다.");
        }
        const data = await res.json();
        setTokenTypeData(data.tokenTypeData);
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

    fetchTokenData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500">오류: {error}</p>;

  // Chart.js 데이터 필터링 함수
  const getChartData = (type: string) => {
    const filteredData =
      tokenTypeData?.filter((d) => d.token_type === type) || [];
    // console.log(filteredData);

    // 날짜 순으로 정렬
    const sortedData = filteredData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    console.log(sortedData);

    return {
      labels: sortedData.map((d) => d.date), // X축에 날짜 표시
      datasets: [
        {
          label: "총 입력 토큰 수",
          data: sortedData.map((d) => d.input_token_cnt),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "총 출력 토큰 수",
          data: sortedData.map((d) => d.output_token_cnt),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "총 입력 비용 (USD)",
          data: sortedData.map((d) => d.input_price),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
          hidden: true, // 디폴트로 숨김
        },
        {
          label: "총 출력 비용 (USD)",
          data: sortedData.map((d) => d.output_price),
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
          hidden: true, // 디폴트로 숨김
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "토큰 타입별 입력/출력 토큰 수 및 비용",
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        토큰 타입별 입력/출력 토큰 및 비용
      </h1>

      {/* Goal_Setting 그래프 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">나의 목표</h2>
        <Bar data={getChartData("Goal_Setting")} options={options} />
      </div>

      {/* Motivation_Feedback 그래프 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">나의 동기</h2>
        <Bar data={getChartData("Motivation_Feedback")} options={options} />
      </div>

      {/* checklistRecommand 그래프 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">체크리스트 추천</h2>
        <Bar data={getChartData("checklistRecommand")} options={options} />
      </div>

      {/* Achievement_Setting 그래프 */}
      <div>
        <h2 className="text-xl font-bold mb-4">성과 및 배운점</h2>
        <Bar data={getChartData("Achievement_Setting")} options={options} />
      </div>
      {/* RoadMapRecommand 그래프 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">경험 로드맵 추천</h2>
        <Bar data={getChartData("RoadMapRecommand")} options={options} />
      </div>
    </div>
  );
}
