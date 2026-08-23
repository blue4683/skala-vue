import axios from 'axios'

// 공공데이터포털(data.go.kr) "해양수산부 국립해양조사원_조석예보(고, 저조)" API.
// 필드명·extrSe 의미(홀수=고조, 짝수=저조)는 실제 인증키로 DT_0001(인천)·DT_0005(부산) 응답을
// 직접 확인해 검증했다 — 문서만 보고 추정하지 않았다.
// https://www.data.go.kr/data/15156018/openapi.do
const BASE = '/khoa/GetTideFcstHghLwApiService'

/**
 * "YYYY-MM-DD HH:mm" → epoch ms. 브라우저 로컬 타임존(KST 실행 가정)으로 파싱한다.
 */
function toEpochMs(predcDt) {
  return new Date(predcDt.replace(' ', 'T')).getTime()
}

/**
 * 조석예보(고, 저조) 원본 응답 → 정규화된 극점 배열
 */
export function normalizeTideResponse(raw) {
  if (raw?.header?.resultCode !== '00') {
    throw new Error(raw?.header?.resultMsg ?? '조석 데이터 응답 형식이 올바르지 않습니다')
  }
  const item = raw.body?.items?.item ?? []
  const rows = Array.isArray(item) ? item : [item]
  return rows.map((row) => ({
    time: toEpochMs(row.predcDt),
    level: row.predcTdlvVl,
    // extrSe: 극치구분 — 홀수(1,3)=고조, 짝수(2,4)=저조 (실응답으로 검증)
    type: parseInt(row.extrSe, 10) % 2 === 1 ? 'high' : 'low',
  }))
}

/**
 * @param {string} obsCode 관측소 코드 (예: DT_0001)
 * @param {string} dateStr YYYYMMDD
 */
export async function fetchTidePreTab(obsCode, dateStr) {
  try {
    const res = await axios.get(BASE, {
      params: {
        // .env에는 data.go.kr이 발급한 "Encoding" 키를 그대로 넣어도, 아직 인코딩되지 않은
        // "Decoding" 키를 넣어도 동작하도록 한 번 디코딩해 axios가 정확히 한 번만 인코딩하게 한다.
        // (이미 인코딩된 키를 axios params에 그대로 넘기면 이중 인코딩되어 인증이 깨진다.)
        serviceKey: decodeURIComponent(import.meta.env.VITE_KHOA_API_KEY),
        obsCode,
        reqDate: dateStr,
        type: 'json',
        numOfRows: 10,
        pageNo: 1,
      },
    })
    return normalizeTideResponse(res.data)
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status
      throw new Error(`조석 정보를 불러오지 못했습니다${status ? ` (${status})` : ''}`, { cause: e })
    }
    throw e // normalizeTideResponse가 던진, resultMsg가 담긴 에러는 그대로 전달
  }
}
