import { formatEllipsisText } from './format-truncate-text'
// 창 너비에 따른 값들을 배열로 관리
const breakpoints = [430, 500, 600, 700, 820, 900, 1030, 1200, 1300, 1400, 1530]
const values = [12, 14, 16, 18, 20, 26, 22, 26, 12, 14, 18]

// 기본값
const defaultValue = 22

// 캐싱을 위한 변수
let cachedWindowSize

export const resizeFormater = (tx) => {
  // 캐싱된 창 너비가 없거나 변경되었다면 다시 계산
  if (!cachedWindowSize || cachedWindowSize !== window.innerWidth) {
    cachedWindowSize = window.innerWidth
  }

  // 창 너비를 기준으로 현재 사용할 값 찾기
  let currentValue = defaultValue
  for (let i = 0; i < breakpoints.length; i++) {
    if (cachedWindowSize < breakpoints[i]) {
      currentValue = values[i]
      break
    }
  }

  // formatEllipsisText에 사용할 값 반환
  return formatEllipsisText(tx, currentValue)
}
