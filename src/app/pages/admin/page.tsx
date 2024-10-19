"use client";

import { TokenCounts } from "@/app/api/getTokens/route";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [tokenData, setTokenData] = useState<TokenCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const res = await fetch("/api/getTokens");
        if (!res.ok) {
          throw new Error("토큰 데이터를 가져오는데 실패했습니다.");
        }
        const data = await res.json();
        setTokenData(data.tokenCounts);
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

  const formatPrice = (inputTokens: number, outputTokens: number) => {
    const inputPrice = (inputTokens / 1_000_000) * 2.5;
    const outputPrice = (outputTokens / 1_000_000) * 10.0;
    return {
      inputPrice: inputPrice.toFixed(2),
      outputPrice: outputPrice.toFixed(2),
      totalPrice: (inputPrice + outputPrice).toFixed(2),
    };
  };

  const totalPrice = formatPrice(
    tokenData?.total.input || 0,
    tokenData?.total.output || 0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        금일 토큰 사용량 관리
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          전체 사용량
        </h2>
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <p className="mb-2">
            입력 토큰:{" "}
            <span className="font-bold">{tokenData?.total.input}</span>
          </p>
          <p className="mb-2">
            출력 토큰:{" "}
            <span className="font-bold">{tokenData?.total.output}</span>
          </p>
          <div className="mt-4">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              비용 정보:
            </p>
            <p className="mb-2">
              <span className="text-green-600 font-extrabold ">
                입력 토큰 비용: ${totalPrice.inputPrice}
              </span>
            </p>
            <p className="mb-2">
              <span className="text-red-600 font-extrabold ">
                출력 토큰 비용: ${totalPrice.outputPrice}
              </span>
            </p>
            <p>
              <span className="text-blue-700 font-extrabold text-2xl">
                총 비용: ${totalPrice.totalPrice}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          각 유형별 사용량
        </h2>
        {tokenData &&
          Object.entries(tokenData)
            .filter(([key]) => key !== "total")
            .map(([threadType, { input, output }]) => {
              const threadPrice = formatPrice(input, output);
              return (
                <div
                  key={threadType}
                  className="bg-blue-50 p-4 rounded-lg shadow mb-4 border border-blue-200"
                >
                  <h3 className="text-lg font-bold text-blue-600 mb-2">
                    유형: {threadType}
                  </h3>
                  <p className="mb-2">
                    입력 토큰: <span className="font-bold">{input}</span>
                  </p>
                  <p className="mb-2">
                    출력 토큰: <span className="font-bold">{output}</span>
                  </p>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      비용 정보:
                    </p>
                    <p className="mb-2">
                      <span className="text-green-600 font-extrabold">
                        입력 토큰 비용: ${threadPrice.inputPrice}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="text-red-600 font-extrabold">
                        출력 토큰 비용: ${threadPrice.outputPrice}
                      </span>
                    </p>
                    <p>
                      <span className="text-blue-700 font-extrabold text-2xl">
                        총 비용: ${threadPrice.totalPrice}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
      </section>
    </div>
  );
}
