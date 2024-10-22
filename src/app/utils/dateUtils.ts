// utils/dateUtils.ts

// 한국 시간으로 변환하여 현재 날짜 가져오기
export const getKoreanDate = () => {
  const koreanTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return koreanTime;
};
