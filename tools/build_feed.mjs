/* ============================================================
   build_feed.mjs — 공식 공공정보를 수집·가공·검수해 data/feed.json 을 만든다.

   흐름:  수집(공식 소스) → AI 쉬운말 변환 → (사람 검수) → feed.json 저장
   앱은 이 feed.json 을 실시간으로 받아 화면에 올린다.

   실행:  ANTHROPIC_API_KEY=... BUSAN_SERVICE_KEY=... node tools/build_feed.mjs
   자동:  .github/workflows/update-feed.yml 이 매일 이 스크립트를 돌려
          feed.json 을 갱신·커밋한다.

   ※ 원칙(논문 근거): LLM 단순화는 사실 왜곡 위험이 있으므로
     - 원문 요지(official)를 반드시 함께 보관하고
     - 수치·자격요건은 원문에서 그대로 옮기며
     - 게시 전 사람이 검수한다(REVIEW=1 이 아니면 review 플래그만 세워 둔다).
   ============================================================ */
import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'data', 'feed.json');
const BUSAN_KEY = process.env.BUSAN_SERVICE_KEY || '';     // data.go.kr 발급 인증키
const anthropic = new Anthropic();                          // ANTHROPIC_API_KEY 환경변수 사용

/* ── 1) 수집: 부산축제정보 OpenAPI (행사) ───────────────── */
async function fetchFestivals() {
  if (!BUSAN_KEY) return [];
  const url = `https://apis.data.go.kr/6260000/FestivalService/getFestivalKr`
    + `?serviceKey=${encodeURIComponent(BUSAN_KEY)}&resultType=json&numOfRows=100&pageNo=1`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    let items = j?.getFestivalKr?.item || j?.response?.body?.items?.item || [];
    if (!Array.isArray(items)) items = items ? [items] : [];
    return items
      .filter(it => /해운대|송정|청사포|달맞이|동백|오시리아|벡스코|센텀|미포/.test(`${it.MAIN_TITLE} ${it.MAIN_PLACE} ${it.GUGUN_NM}`))
      .map(it => ({
        title: (it.MAIN_TITLE || '').trim(),
        place: it.MAIN_PLACE || it.PLACE || '',
        start: it.START_DATE || '', end: it.END_DATE || '',
        desc: String(it.ITEMCNTNTS || '').replace(/<[^>]+>/g, '').trim(),
        source: '부산축제정보(공공데이터)'
      }));
  } catch (e) { console.warn('부산축제 API 실패:', e.message); return []; }
}

/* ── 1) 수집: 구청/주민센터 공지 ───────────────────────────
   기관별로 RSS 또는 공지 목록 페이지를 받아 온다.
   robots.txt·이용약관을 준수하고, 요청 간격을 두며, 원문 출처를 보관한다.
   (사이트마다 구조가 달라 어댑터를 하나씩 추가한다. 여기서는 자리만 둔다) */
async function fetchGuNotices() {
  // TODO: 해운대구청 고시·공고, 행정복지센터 알림 어댑터 추가.
  //   예) RSS 가 있으면 파싱, 없으면 목록 페이지에서 제목·본문·게시일 추출.
  //   각 항목: { rawTitle, rawBody(공문 원문), source, date, until? }
  // 수동 보강 파일이 있으면 함께 읽어 온다(검수자가 직접 넣는 항목).
  try {
    const manual = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'manual_notices.json'), 'utf8'));
    return Array.isArray(manual) ? manual : [];
  } catch { return []; }
}

/* ── 2) AI 쉬운말 변환 (SimplifyMyText 방식 + 정확성 가드레일) ── */
async function simplify(item) {
  const prompt = `당신은 부산 해운대 어르신(65세 이상)에게 공공정보를 아주 쉽게 전하는 편집자입니다.
아래 '공문 원문'을 어르신 눈높이로 바꾸되, 사실(수치·자격·날짜)은 절대 바꾸거나 지어내지 마세요.
JSON 하나만 출력하세요. 형식:
{"cat":"복지|건강|안전|생활|나들이|행사","for65":true|false,
 "lead":"쉽게 한 줄(15자 내외, 존댓말, 숫자는 되도록 한글)",
 "good":"왜 어르신에게 좋은지 한 줄",
 "how":["이렇게 하세요 단계1","단계2","단계3(구체 장소·전화·준비물)"],
 "quiz":{"q":"이 정보에서 실제로 알아야 할 것을 묻는 질문(빈칸 이어가기 식)","a":"정답(순수 한글, 숫자·영문 금지)","tip":"맞힌 뒤 실행 팁"}}

공문 원문:
${item.rawBody || item.desc || item.rawTitle || item.title}`;

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-5',      // 단순화·요약엔 sonnet/haiku가 비용 대비 적합
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = res.content.map(b => b.text || '').join('');
  const m = text.match(/\{[\s\S]*\}/);
  const parsed = m ? JSON.parse(m[0]) : {};
  return {
    ...parsed,
    title: item.rawTitle || item.title,
    official: item.rawBody || item.desc || '',   // 원문 요지 보관(대조용)
    source: item.source,
    date: item.date || new Date().toISOString().slice(0, 10),
    until: item.until || undefined,
    review: process.env.REVIEW === '1' ? 'approved' : 'pending'  // 검수 전이면 pending
  };
}

/* ── 3) 조립·저장 ─────────────────────────────────────────── */
async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const festivals = await fetchFestivals();
  const guRaw = await fetchGuNotices();

  // 행사 → 소식(간단), 구청 공지 → 알아두기(AI 쉬운말) 로 가공
  const festivalNotices = festivals.map(f => ({
    cat: '행사', title: f.title,
    body: `${f.place || '해운대'}에서 ${f.start?.slice(5)}~${f.end?.slice(5)} 열립니다. ${f.desc.slice(0, 70)}`,
    source: f.source, date: today, until: f.end, auto: true
  }));

  const guides = [];
  for (const it of guRaw) {
    try { guides.push(await simplify(it)); }
    catch (e) { console.warn('변환 실패:', it.rawTitle, e.message); }
  }

  // 기존 feed 를 읽어 사람이 손본 항목은 유지하고, 자동 항목만 갱신하는 병합도 가능.
  const feed = {
    meta: {
      lastUpdated: today,
      note: '공식 소스에서 자동 수집·가공, 검수 후 게시.',
      sources: ['부산축제정보 OpenAPI', '해운대구청 고시·공고', '행정복지센터 알림', '보건복지부·정부24', '질병관리청']
    },
    notices: festivalNotices,           // + 검수 통과한 구청 소식
    guides: guides.filter(g => g.review === 'approved' || process.env.REVIEW === '1')
  };

  await fs.writeFile(OUT, JSON.stringify(feed, null, 2), 'utf8');
  console.log(`feed.json 갱신: 소식 ${feed.notices.length} · 알아두기 ${feed.guides.length} (${today})`);
}

main().catch(e => { console.error(e); process.exit(1); });
