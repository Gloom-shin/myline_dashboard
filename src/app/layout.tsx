import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link"; // Next.js Link 컴포넌트 import

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* 상단 네비게이션 바 */}
        <header className="bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* 로고 혹은 제목 */}
            <div className="text-white text-2xl font-bold">My Dashboard</div>
            {/* 메인화면으로 돌아가는 Link */}
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              메인화면으로 돌아가기
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}