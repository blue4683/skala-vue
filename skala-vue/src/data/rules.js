// 모드별 판정 규칙.
//
// 낚시 모드의 'flow'(물흐름) 규칙은 조위 미분이 필요한데, 이번 스코프는
// 조석 연동을 포함하지 않아 제외했다.
export const RULES = {
  fishing: [
    { id: 'wind', label: '풍속 6m/s 미만', test: (f) => f.WSD < 6 },
    { id: 'wave', label: '파고 1m 미만', test: (f) => f.WAV < 1.0 },
    { id: 'rain', label: '강수확률 40% 미만', test: (f) => f.POP < 40 },
  ],
}
