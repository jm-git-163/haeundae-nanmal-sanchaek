/* ============================================================
   backfill_dong.mjs — 18개 동 소식지를 확실히 채우는 한 번짜리 도구.

   해운대구청 공지 게시판 하나에 18개 동 소식이 섞여 올라옵니다.
   그냥 '최근 몇 쪽'을 보면 인기 없는 동은 밀려서 하나도 안 잡힙니다.
   그래서 이 도구는 그 게시판 하나만 아주 깊이(기본 80쪽) 훑어서,
   제목에 동 이름이 든 글만 추려 pending.json 에 보탭니다.
   (다른 13개 소스는 이미 collect.mjs 가 잘 채워 두었으니 다시 안 건드립니다)

   실행:  node tools/backfill_dong.mjs
          PAGES=120 node tools/backfill_dong.mjs   (더 깊이 보고 싶을 때)
   ============================================================ */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = path.join(ROOT, 'data', 'pending.json');
const LIST_URL = 'https://www.haeundae.go.kr/board/list.do?boardId=BBS_0000038&menuCd=DOM_000000104001001000';
const SOURCE = '해운대구청 공지사항';
const SOURCE_ID = 'gu-notice';
const UA = 'BusanNanmalBot/1.0 (+senior public-info app for Haeundae; non-commercial; 2s delay; contact: app maintainer)';
const PAGES = Number(process.env.PAGES || 80);
const DELAY = 900;

const DONG = ['우1동', '우2동', '우3동', '중1동', '중2동', '좌1동', '좌2동', '좌3동', '좌4동',
  '송정동', '반여1동', '반여2동', '반여3동', '반여4동', '반송1동', '반송2동', '재송1동', '재송2동'];

const sha1 = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const abs = (base, href) => { try { return new URL(href, base).toString(); } catch { return null; } };

async function fetchSafe(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try { return await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

/* 목록 한 쪽에서 '동 이름이 제목에 든 글'만 골라 링크를 뽑는다.
   행(tr) 째로 봅니다 — 상세 페이지에 들어가 날짜를 다시 찾으면
   이미지 한 장뿐인 글에서는 엉뚱한 꼬리말을 날짜로 오인합니다.
   목록 행에는 '부서 | 2026.07.23' 형태로 진짜 게시일이 이미 있습니다. */
function extractDongLinks(html, baseUrl) {
  const out = [];
  for (const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const inner = row[1];
    const link = inner.match(/<a[^>]*href=["']([^"']*view\.do[^"']*)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link) continue;
    const text = strip(link[2]);
    const dong = DONG.find(d => text.includes(d));
    if (!dong) continue;
    const u = abs(baseUrl, link[1].replace(/&amp;/g, '&'));
    if (!u) continue;
    const dateM = inner.match(/(20\d{2})\.(\d{1,2})\.(\d{1,2})/);
    const listDate = dateM ? `${dateM[1]}-${dateM[2].padStart(2, '0')}-${dateM[3].padStart(2, '0')}` : null;
    out.push({ url: u, text, dong, listDate });
  }
  return out;
}

function extractDetail(html, baseUrl) {
  let best = { score: 0, text: '' };
  for (const m of html.matchAll(/<(div|td|article|section)([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const inner = m[3];
    const text = strip(inner);
    if (text.length < 80) continue;
    const links = (inner.match(/<a\b/gi) || []).length;
    const score = text.length / (1 + links * 45);
    if (score > best.score) best = { score, text };
  }
  const body = (best.text || strip(html)).slice(0, 4000);
  const DATE = '(20\\d{2})[.\\-/\\s]+(\\d{1,2})[.\\-/\\s]+(\\d{1,2})';
  const d = (body.match(new RegExp('(?:작성일|등록일|게시일)[^0-9]{0,12}' + DATE)) || body.match(new RegExp(DATE)) || []).slice(1);
  const publishedAt = d.length === 3 ? `${d[0]}-${d[1].padStart(2, '0')}-${d[2].padStart(2, '0')}` : null;
  const image = (html.match(/<img[^>]*src=["']([^"']*\/upload_data\/[^"']*\.(?:jpg|jpeg|png)[^"']*)["']/i) || [])[1];
  return { body, publishedAt, imageUrl: image ? abs(baseUrl, image.replace(/&amp;/g, '&')) : null };
}

async function main() {
  const pending = JSON.parse(await fs.readFile(PENDING, 'utf8').catch(() => '[]'));
  const seen = new Set(pending.map(p => p.uid));
  const foundByDong = {}; DONG.forEach(d => foundByDong[d] = 0);

  const links = [];
  for (let p = 1; p <= PAGES; p++) {
    const u = new URL(LIST_URL);
    if (p > 1) u.searchParams.set('startPage', String(p));
    let res;
    try { res = await fetchSafe(u.href); } catch (e) { console.warn(`쪽 ${p} 실패: ${e.message}`); continue; }
    if (!res.ok) { console.warn(`쪽 ${p}: HTTP ${res.status}`); continue; }
    const html = await res.text();
    const found = extractDongLinks(html, u.href);
    found.forEach(f => links.push(f));
    if (p % 10 === 0) console.log(`… ${p}쪽까지 훑음, 지금까지 동 소식 후보 ${links.length}건`);
    await sleep(DELAY);
  }

  console.log(`총 ${PAGES}쪽에서 동 이름 든 글 후보 ${links.length}건 발견`);

  /* 한 동이 많이 올렸다고 그 동 글로만 채우면 '다양함'이 사라집니다.
     동마다 최신 것 3건만 골라, 18개 동이 고르게 보이게 합니다. */
  const PER_DONG = Number(process.env.PER_DONG || 3);
  const byDong = {};
  links.forEach(l => (byDong[l.dong] = byDong[l.dong] || []).push(l));
  const picked = [];
  for (const d of DONG) {
    const list = (byDong[d] || [])
      .filter(l => l.listDate)                                   // 날짜 모르는 건 최신 판단이 안 되니 제외
      .sort((a, b) => b.listDate.localeCompare(a.listDate))
      .slice(0, PER_DONG);
    picked.push(...list);
  }
  console.log(`동마다 최신 ${PER_DONG}건씩 골라 ${picked.length}건만 상세를 받습니다.`);

  let added = 0;
  const byUrl = new Map(picked.map(l => [l.url, l]));
  for (const [url, link] of byUrl) {
    const uid = sha1(url);
    if (seen.has(uid)) continue;
    await sleep(DELAY);
    let res;
    try { res = await fetchSafe(url); } catch { continue; }
    if (!res.ok) continue;
    const { body, publishedAt, imageUrl } = extractDetail(await res.text(), url);
    if (!body || body.length < 40) continue;
    pending.push({
      uid, source: SOURCE, sourceId: SOURCE_ID, sourceUrl: url,
      trust: 'official', region: '해운대구', topics: ['생활', '복지', '안전', '행사'],
      rawTitle: link.text.slice(0, 120), rawBody: body,
      // 목록 행의 날짜를 최우선으로 믿습니다. 이미지 한 장뿐인 글은 상세
      // 페이지에 진짜 날짜가 없어, 본문에서 찾은 값이 되레 엉뚱한 꼬리말 날짜일 수 있습니다.
      publishedAt: link.listDate || publishedAt || new Date().toISOString().slice(0, 10),
      attachments: [], imageUrl: imageUrl || null, collectedAt: new Date().toISOString(), stage: 'collected'
    });
    seen.add(uid);
    foundByDong[link.dong]++;
    added++;
  }

  await fs.writeFile(PENDING, JSON.stringify(pending, null, 2), 'utf8');
  console.log(`\n새로 보탠 글 ${added}건. 동별 결과:`);
  DONG.forEach(d => console.log(`  ${d}: ${foundByDong[d]}건`));
  const missing = DONG.filter(d => foundByDong[d] === 0);
  if (missing.length) console.log(`\n여전히 0건인 동(더 깊이 보거나 실제로 소식지가 없을 수 있음): ${missing.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
