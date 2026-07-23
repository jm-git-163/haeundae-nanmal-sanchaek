/* ============================================================
   busan_api.js — 부산광역시 부산축제정보 OpenAPI 연동

   해운대 '행사 소식'을 사람이 아니라 공공데이터에서 자동으로 받아 옵니다.
   · 데이터: 부산광역시_부산축제정보 서비스
     https://www.data.go.kr/data/15063500/openapi.do
   · 인증키(SERVICE_KEY)를 넣으면 실시간(live)으로,
     비어 있으면 아래 SAMPLE(공공데이터 응답 형식 스냅샷)로 동작합니다.
     → 키가 없어도, 인터넷이 끊겨도 앱이 멈추지 않습니다.

   ※ 브라우저에서 data.go.kr 직접 호출은 CORS로 막힐 수 있습니다.
     운영 배포에서는 (1)매일 예약 수집으로 notices.js 갱신,
     또는 (2)작은 프록시를 두는 방식을 권장합니다(docs/소식_업데이트_지침.md).
   ============================================================ */
(function (global) {
  'use strict';

  const SERVICE_KEY = '';   // TODO: data.go.kr 발급 인증키 (비우면 SAMPLE로 동작)
  const ENDPOINT = 'https://apis.data.go.kr/6260000/FestivalService/getFestivalKr';

  function todayYmd() {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  function fmtPeriod(s, e) {
    const p = d => { const m = /(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? Number(m[2]) + '월 ' + Number(m[3]) + '일' : ''; };
    const a = p(s), b = p(e);
    return a && b ? `${a}부터 ${b}까지` : (a || b || '');
  }

  /* 공공데이터 응답(item)에서 우리가 쓰는 값만 정규화 */
  function normalize(it) {
    return {
      title: (it.MAIN_TITLE || it.title || '').trim(),
      gugun: it.GUGUN_NM || it.gugun || '',
      place: it.MAIN_PLACE || it.PLACE || it.place || '',
      start: it.START_DATE || it.start || '',
      end: it.END_DATE || it.end || '',
      desc: String(it.ITEMCNTNTS || it.desc || '').replace(/<[^>]+>/g, '').trim()
    };
  }

  /* 정규화된 축제 → 소식(notice). 발표일은 오늘, 기간은 본문에, 마감은 축제 종료일. */
  function toNotice(f) {
    const period = fmtPeriod(f.start, f.end);
    const body = `${f.place || '해운대'}에서 ${period ? period + ' ' : ''}열립니다.` + (f.desc ? ' ' + f.desc.slice(0, 70) : '');
    return { cat: '행사', title: f.title, body, source: '부산축제정보(공공데이터)', date: todayYmd(), until: f.end, auto: true };
  }

  /* 해운대 관련만 추립니다(구·군 또는 제목/장소로 판단). */
  function pickHaeundae(list) {
    const re = /해운대|송정|청사포|달맞이|동백|오시리아|벡스코|센텀|미포/;
    return list.filter(f => f.gugun.includes('해운대') || re.test(f.title + ' ' + f.place));
  }

  /* 인증키 없이도 데모가 되도록: 공공데이터 응답 형식 스냅샷 */
  const SAMPLE = [
    { MAIN_TITLE: '부산바다축제', GUGUN_NM: '해운대구', MAIN_PLACE: '해운대해수욕장', START_DATE: '2026-08-01', END_DATE: '2026-08-10', ITEMCNTNTS: '바다를 무대로 공연과 물놀이가 펼쳐지는 부산의 대표 여름 축제입니다.' },
    { MAIN_TITLE: '해운대 빛축제', GUGUN_NM: '해운대구', MAIN_PLACE: '구남로 일대', START_DATE: '2026-12-01', END_DATE: '2027-01-31', ITEMCNTNTS: '겨울밤 해운대 거리를 불빛으로 수놓는 빛 축제입니다.' },
    { MAIN_TITLE: '해운대 모래축제', GUGUN_NM: '해운대구', MAIN_PLACE: '해운대해수욕장', START_DATE: '2026-05-22', END_DATE: '2026-05-26', ITEMCNTNTS: '고운 모래로 커다란 조각을 빚어 전시하는 축제입니다.' }
  ];

  async function fetchFestivals() {
    if (!SERVICE_KEY) return SAMPLE.map(normalize);
    try {
      const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(SERVICE_KEY)}&resultType=json&numOfRows=100&pageNo=1`;
      const res = await fetch(url);
      const data = await res.json();
      let items = (((data.getFestivalKr || {}).body || {}).items) || (((data.response || {}).body || {}).items) || [];
      if (items && items.item) items = items.item;
      if (!Array.isArray(items)) items = items ? [items] : [];
      return items.map(normalize);
    } catch (e) {
      console.warn('부산축제 OpenAPI 호출 실패 — 스냅샷으로 대체합니다.', e);
      return SAMPLE.map(normalize);
    }
  }

  global.BusanAPI = {
    /** 해운대 행사 소식(소식 카드 형식)을 돌려줍니다. 라이브 또는 스냅샷. */
    async festivalNotices() {
      const list = await fetchFestivals();
      return pickHaeundae(list).map(toNotice);
    }
  };
})(window);
