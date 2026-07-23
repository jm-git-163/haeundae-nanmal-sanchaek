/* ============================================================
   haeundae_media.js — 해운대 정보의 '삽화 + 쉬운 안내 + 실행법'

   근거(설계 원칙):
   · 그림 우월효과 — 글보다 그림이 어르신 회상에 도움.
   · 즉시 피드백 — 퀴즈 직후 '왜/어떻게'를 바로 보여 주면 기억이 오래갑니다.
   · 짧고 쉬운 말 + 실행 가능한 단계 — 진짜 '유용함'은 실행법에서 나옵니다.

   ILLUST : 키 → 앱 그림체 원본 SVG (사진 아님 · 저작권 안전 · 오프라인)
   TIPS   : 퀴즈 정답(back) → { ill, tip } (퀴즈 맞힌 뒤 보여 줄 실행 팁)
   GUIDE  : '해운대 알아두기' 정보 카드 (삽화 + 요지 + 좋은점 + 이렇게하세요)
   ============================================================ */
(function (global) {
  'use strict';

  /* ── 삽화 (viewBox 0 0 100 72, 큰 화면에서도 또렷) ── */
  const I = {};
  I.sea = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#dff1f6"/><circle cx="78" cy="20" r="9" fill="#ffd98a"/><path d="M0 44h100v28H0z" fill="#7cc4dd"/><path d="M0 44q12-6 24 0t24 0 24 0 24 0v6H0z" fill="#a7dcec"/><path d="M8 40q4-4 8 0M30 42q4-4 8 0M60 40q4-4 8 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M0 60h100v12H0z" fill="#f2e4c7"/></svg>`;
  I.lighthouse = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#dff1f6"/><path d="M0 52h100v20H0z" fill="#7cc4dd"/><path d="M44 20h12l3 32H41z" fill="#fff" stroke="#e46a5a" stroke-width="0"/><path d="M44 30h12M43 40h14" stroke="#e46a5a" stroke-width="4"/><rect x="45" y="12" width="10" height="9" rx="2" fill="#ffd98a"/><path d="M55 16l16-5M55 18l16 4" stroke="#ffcf6b" stroke-width="2"/></svg>`;
  I.subway = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#eef3f5"/><rect x="18" y="14" width="64" height="42" rx="9" fill="#4f93c4"/><rect x="24" y="20" width="22" height="16" rx="3" fill="#dff1f6"/><rect x="54" y="20" width="22" height="16" rx="3" fill="#dff1f6"/><circle cx="32" cy="58" r="6" fill="#33414a"/><circle cx="68" cy="58" r="6" fill="#33414a"/><path d="M14 44h72" stroke="#2c6f9e" stroke-width="3"/></svg>`;
  I.clinic = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#eaf6ee"/><rect x="26" y="18" width="48" height="42" rx="6" fill="#fff" stroke="#cfe6d6" stroke-width="2"/><path d="M50 26v20M40 36h20" stroke="#4caf7d" stroke-width="6" stroke-linecap="round"/><rect x="34" y="60" width="32" height="6" fill="#cfe6d6"/></svg>`;
  I.shelter = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#fff4e0"/><path d="M50 16l30 20H20z" fill="#4caf7d"/><rect x="48" y="34" width="4" height="26" fill="#8a6d4b"/><path d="M20 60h60" stroke="#e0c79a" stroke-width="4"/><circle cx="76" cy="22" r="7" fill="#ffd98a"/></svg>`;
  I.market = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#fdeede"/><rect x="18" y="30" width="64" height="30" fill="#fff" stroke="#e9cdb0" stroke-width="2"/><path d="M14 30h72l-6-12H20z" fill="#e46a5a"/><path d="M20 30v-12M32 30v-12M44 30v-12M56 30v-12M68 30v-12M80 30v-12" stroke="#fff" stroke-width="3"/><rect x="30" y="40" width="14" height="12" fill="#ffd98a"/><rect x="54" y="40" width="14" height="12" fill="#a7dcec"/></svg>`;
  I.festival = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#1f2a44"/><path d="M50 60V30" stroke="#ffd98a" stroke-width="2"/><g fill="none" stroke-width="2"><path d="M50 30l-14-14M50 30l14-14M50 30l-18 4M50 30l18 4" stroke="#ffcf6b"/></g><circle cx="36" cy="16" r="2.4" fill="#ffe9a8"/><circle cx="64" cy="16" r="2.4" fill="#a7dcec"/><circle cx="32" cy="34" r="2.4" fill="#f6a6b2"/><circle cx="68" cy="34" r="2.4" fill="#fff"/><circle cx="20" cy="24" r="1.8" fill="#fff"/><circle cx="82" cy="26" r="1.8" fill="#fff"/></svg>`;
  I.phone = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#fdeaea"/><rect x="36" y="14" width="28" height="46" rx="6" fill="#33414a"/><rect x="40" y="20" width="20" height="30" rx="2" fill="#dff1f6"/><path d="M74 14l14 14M88 14L74 28" stroke="#e4463a" stroke-width="5" stroke-linecap="round"/></svg>`;
  I.money = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#eef6ea"/><rect x="20" y="24" width="60" height="30" rx="5" fill="#a7d8a0" stroke="#7cbf78" stroke-width="2"/><circle cx="50" cy="39" r="9" fill="#fff"/><text x="50" y="44" font-size="12" text-anchor="middle" fill="#4c9a4a" font-family="sans-serif">₩</text></svg>`;
  I.camellia = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#eaf6ee"/><g transform="translate(50 36)"><circle r="14" fill="#e4586a"/><circle cx="-8" cy="-6" r="8" fill="#ef7183"/><circle cx="8" cy="-6" r="8" fill="#ef7183"/><circle cx="-8" cy="6" r="8" fill="#d94d60"/><circle cx="8" cy="6" r="8" fill="#d94d60"/><circle r="6" fill="#ffd98a"/></g><path d="M50 50v14M50 58l10-4" stroke="#4c9a4a" stroke-width="3" fill="none"/></svg>`;
  I.bridge = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#1f2a44"/><path d="M0 52h100" stroke="#3a4a6a" stroke-width="4"/><path d="M8 52V36q42-22 84 0v16" fill="none" stroke="#7fb3d5" stroke-width="2"/><path d="M20 44v8M34 40v12M50 38v14M66 40v12M80 44v8" stroke="#ffd98a" stroke-width="2"/><path d="M0 58h100v14H0z" fill="#12203c"/></svg>`;
  I.hall = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#eef3f5"/><path d="M24 30l26-14 26 14z" fill="#c9a55c"/><rect x="28" y="30" width="44" height="26" fill="#f4dca0"/><rect x="36" y="38" width="8" height="18" fill="#8a6d4b"/><rect x="56" y="38" width="8" height="18" fill="#8a6d4b"/><rect x="20" y="56" width="60" height="6" fill="#c9a55c"/></svg>`;
  I.mountain = `<svg viewBox="0 0 100 72"><rect width="100" height="72" fill="#e7f0e9"/><circle cx="80" cy="18" r="8" fill="#ffd98a"/><path d="M0 62h100v10H0z" fill="#bfe0c4"/><path d="M4 62L34 20l16 22 10-13 32 33z" fill="#8bbf8f"/><path d="M34 20l8 11-7 8-7-9z" fill="#fff" opacity=".75"/></svg>`;
  I.market2 = I.market;

  /* ── 퀴즈 정답 → 실행 팁 (맞힌 뒤 '이렇게 하세요') ── */
  const TIPS = {
    '무료':      { ill: 'subway', tip: '신분증만 있으면 됩니다. 지하철역 창구나 무인기에서 「경로 우대」를 고르세요.' },
    '도시철도':  { ill: 'subway', tip: '만 65세 이상은 무료입니다. 처음 한 번 역에서 등록해 두면 편합니다.' },
    '마을버스':  { ill: 'subway', tip: '큰길에서 안쪽 동네까지 이어 줍니다. 정류장 노선도의 번호를 확인하세요.' },
    '동백전':    { ill: 'money',  tip: '카드형이 편합니다. 주민센터나 은행에서 만들고 충전해 쓰면 캐시백을 돌려줍니다.' },
    '경로당':    { ill: 'shelter',tip: '동네 경로당은 누구나 갈 수 있어요. 여름엔 시원한 무더위쉼터가 됩니다.' },
    '노인복지관':{ ill: 'clinic', tip: '무료 강좌·상담·급식이 있습니다. 가까운 복지관에 전화로 신청하세요.' },
    '보건소':    { ill: 'clinic', tip: '혈압 측정·예방접종을 무료로 해 줍니다. 신분증을 챙겨 가세요.' },
    '치매안심센터':{ ill:'clinic', tip: '기억이 깜빡하면 무료 검사부터 받아 보세요. 구 보건소 안에 있습니다.' },
    '보이스피싱':{ ill: 'phone',  tip: '「돈을 보내라」는 전화는 일단 끊으세요. 112 또는 가족에게 먼저 확인!' },
    '해운대구청':{ ill: 'hall',   tip: '복지·민원은 구청 또는 가까운 행정복지센터(주민센터)에서 봅니다.' },
    '해운대해수욕장': { ill: 'sea', tip: '여름엔 그늘막과 물놀이 안전요원이 있습니다. 한낮 더위는 피하세요.' },
    '동백섬':    { ill: 'camellia', tip: '평지 산책로라 걷기 편합니다. 누리마루와 등대를 함께 둘러보세요.' },
    '청사포':    { ill: 'lighthouse', tip: '붉은·흰 등대가 명물입니다. 해변열차·다릿돌 전망대와 가깝습니다.' },
    '등대':      { ill: 'lighthouse', tip: '밤배의 길을 밝힙니다. 청사포·동백섬 등대가 사진 찍기 좋아요.' },
    '광안대교':  { ill: 'bridge', tip: '밤에 불빛이 켜집니다. 광안리·이기대에서 잘 보입니다.' },
    '전통시장':  { ill: 'market', tip: '회·국밥·씨앗호떡이 유명합니다. 현금과 장바구니를 챙기면 편해요.' },
    '부산바다축제': { ill: 'festival', tip: '해운대 백사장에서 여름에 열립니다. 입장 무료, 저녁이 시원해요.' },
    '불꽃축제':  { ill: 'festival', tip: '가을 광안리에서 열립니다. 사람이 많으니 지하철 이용을 권합니다.' },
    '북극곰축제':{ ill: 'sea',      tip: '한겨울 바닷물에 뛰어드는 이색 행사입니다. 무리하지 말고 구경만 하셔도 좋아요.' },
    '모래축제':  { ill: 'sea',      tip: '백사장에 모래 조각을 전시하는 봄 축제입니다. 낮보다 해질녘이 시원해요.' },
    '산신제':    { ill: 'mountain', tip: '정월 대보름 장산에서 한 해 평안을 비는 전통 행사입니다.' },
    '어묵':      { ill: 'market',   tip: '뜨끈한 국물까지 함께 드세요. 겨울 해운대 시장 골목에서 맛볼 수 있어요.' },
    '밀면':      { ill: 'market',   tip: '더운 날 시원하게 드시기 좋아요. 부산 곳곳 밀면집에서 팝니다.' },
    '돼지국밥':  { ill: 'market',   tip: '뽀얀 국물에 밥을 말고 부추·새우젓으로 간을 맞춰 드세요.' },
    '씨앗호떡':  { ill: 'market',   tip: '남포동 길거리 간식입니다. 갓 구운 것이 가장 맛있어요.' },
    '갈맷길':    { ill: 'sea',      tip: '바다를 따라 걷는 부산 둘레길입니다. 구간을 나눠 무리 없이 걸으세요.' },
    '해수온천':  { ill: 'shelter',  tip: '해운대의 오래된 바닷물 온천입니다. 온천욕 뒤엔 물을 충분히 드세요.' },
    '해운':      { ill: 'sea',      tip: '신라 학자 최치원의 호에서 「해운대」 이름이 나왔습니다.' },
    '누리마루':  { ill: 'hall',     tip: '동백섬의 한옥 모양 국제회의장입니다. 바다 전망 산책 코스로 좋아요.' },
    '달맞이길':  { ill: 'camellia', tip: '벚꽃과 보름달로 이름난 언덕길입니다. 봄에 특히 아름다워요.' },
    '장산':      { ill: 'mountain', tip: '해운대를 굽어보는 큰 산입니다. 낮은 둘레길부터 천천히 걸어 보세요.' },
    '해변열차':  { ill: 'subway',   tip: '미포~청사포~송정을 잇는 관광 열차입니다. 창밖 바다 풍경이 일품이에요.' },
    '아쿠아리움':{ ill: 'sea',      tip: '해운대 바닷속 생물을 보는 실내 수족관입니다. 덥거나 비 오는 날 좋아요.' },
    '문탠로드':  { ill: 'camellia', tip: '달빛 아래 솔숲을 걷는 산책로입니다. 평탄해서 걷기 편해요.' },
    '오시리아':  { ill: 'sea',      tip: '테마파크와 바닷가 절경이 모인 새 관광지입니다.' },
    '벡스코':    { ill: 'hall',     tip: '영화제·박람회가 열리는 큰 전시장입니다. 지하철 센텀시티역과 가깝습니다.' },
    '끊는다':      { ill: 'phone',  tip: '돈·계좌 이야기가 나오면 바로 끊고, 112나 가족에게 먼저 확인하세요.' },
    '누르지 않는다': { ill: 'phone', tip: '문자 속 링크는 절대 누르지 마세요. 눌렀다면 즉시 통신사·은행에 알리세요.' },
    '한 달 전':   { ill: 'money',   tip: '만 예순다섯 생일 달의 한 달 전부터 주민센터에서 기초연금을 신청하세요.' },
    '신분증':     { ill: 'subway',  tip: '지하철 무료 승차는 신분증으로 나이를 확인합니다. 늘 지니고 다니세요.' }
  };

  /* ── 해운대 알아두기 (공식 원문요지 → 쉽게 풀기 → 이렇게 하세요) ──
     official: 공문/공지의 어려운 원문 요지 (있는 그대로)
     lead    : 그걸 어르신 눈높이로 쉽게 풀어 쓴 한 줄
     이 둘을 나란히 보여 주어 '어려운 정보를 쉽게'를 눈에 보이게 합니다. */
  const GUIDE = [
    {
      ill: 'subway', cat: '생활', for65: true,
      source: '부산교통공사', sourceUrl: 'https://www.humetro.busan.kr/homepage/default/stationtime/page/list.do?menu_no=10010103',
      title: '지하철·버스, 이렇게 공짜로 타요',
      official: '만 65세 이상 어르신은 「경로우대」에 따라 도시철도 운임이 면제되며, 최초 1회 우대용 교통카드 등록이 필요합니다.',
      lead: '예순다섯이 넘으면 부산 지하철을 공짜로 타실 수 있어요.',
      good: '병원·시장·자녀 집에 갈 때 교통비 걱정이 줄어듭니다.',
      how: ['신분증(주민등록증)을 챙깁니다.', '지하철역 창구나 무인 발매기에서 「경로 우대」를 고릅니다.', '처음 한 번만 등록해 두면 다음부터 편합니다.']
    },
    {
      ill: 'money', cat: '복지', for65: true,
      source: '보건복지부·국민연금공단', sourceUrl: 'https://basicpension.mohw.go.kr',
      title: '기초연금 신청, 어렵지 않아요',
      official: '만 65세 이상, 소득인정액이 선정기준액 이하인 어르신에게 기초연금을 지급하며, 만 65세 생일이 속한 달의 1개월 전부터 신청이 가능합니다.',
      lead: '예순다섯 되기 한 달 전부터 신청하면 매달 연금을 받아요.',
      good: '매달 나오는 연금으로 생활에 보탬이 됩니다.',
      how: ['가까운 주민센터 또는 국민연금공단을 찾습니다.', '신분증과 통장을 가져갑니다.', '잘 모르면 창구 직원에게 도움을 청하세요.']
    },
    {
      ill: 'phone', cat: '안전',
      source: '경찰청 사이버안전국', sourceUrl: 'https://cyberbureau.police.go.kr',
      title: '보이스피싱, 이렇게 막아요',
      official: '공공기관·금융기관을 사칭해 계좌이체·현금전달을 요구하는 전기통신금융사기가 지속 발생하고 있으니 각별한 주의가 필요합니다.',
      lead: '「돈을 보내라」는 전화는 사기일 수 있으니 일단 끊으세요.',
      good: '전화 한 통을 조심하면 평생 모은 돈을 지킬 수 있습니다.',
      how: ['돈·계좌를 말하면 일단 전화를 끊습니다.', '112 또는 가족에게 먼저 확인합니다.', '문자 속 링크는 절대 누르지 않습니다.']
    },
    {
      ill: 'clinic', cat: '건강',
      source: '해운대구보건소', sourceUrl: 'https://www.haeundae.go.kr/health/index.do?menuCd=DOM_000000805001000000',
      title: '보건소를 알뜰하게 쓰는 법',
      official: '보건소는 혈압·혈당 측정, 어르신 대상 인플루엔자 예방접종, 만성질환 상담 등을 무료 또는 저비용으로 제공합니다.',
      lead: '혈압 재기, 독감 주사, 건강 상담을 공짜로 받을 수 있어요.',
      good: '큰 병원에 가지 않아도 가까이서 건강을 챙길 수 있습니다.',
      how: ['가까운 해운대구보건소 위치를 확인합니다.', '신분증을 가지고 방문합니다.', '독감철에는 미리 전화로 접종일을 물어보세요.']
    },
    {
      ill: 'shelter', cat: '안전',
      source: '행정안전부 생활안전지도', sourceUrl: 'https://www.safemap.go.kr',
      title: '여름 무더위, 쉼터에서 나요',
      official: '폭염 대응을 위해 경로당·주민센터 등을 무더위쉼터로 지정·운영하며, 폭염특보 시 운영시간이 연장될 수 있습니다.',
      lead: '한낮엔 경로당·주민센터가 시원한 쉼터로 열려요.',
      good: '냉방비 걱정 없이 시원하게 쉬며 이웃과 어울릴 수 있습니다.',
      how: ['가장 더운 낮 12시~5시엔 바깥 활동을 줄입니다.', '가까운 경로당·주민센터 쉼터로 갑니다.', '물을 자주 마시고, 어지러우면 바로 그늘에서 쉽니다.']
    },
    {
      ill: 'camellia', cat: '나들이',
      source: '해운대구 문화관광', sourceUrl: 'https://www.haeundae.go.kr/tour/board/view.do?boardId=BBS_0000103&menuCd=DOM_000000301001000000&dataSid=3000150',
      title: '걷기 좋은 동백섬 한 바퀴',
      official: '동백섬은 해운대해수욕장과 연결된 순환 산책로로, APEC하우스(누리마루)와 등대 조망 구간을 포함합니다.',
      lead: '동백나무 우거진 평지 길이라 어르신도 걷기 편해요.',
      good: '바다 바람을 쐬며 가볍게 운동하기 좋습니다.',
      how: ['해운대해수욕장 끝에서 동백섬으로 들어갑니다.', '누리마루와 등대를 천천히 둘러봅니다.', '벤치에서 쉬어 가며 한 바퀴(약 30분) 걷습니다.']
    }
  ];

  global.Haeundae = { ILLUST: I, TIPS, GUIDE };
})(window);
