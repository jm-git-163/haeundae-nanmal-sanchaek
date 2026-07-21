/* ============================================================
   update.js — 새 판이 나오면 알아서 갈아입기

   지금까지는 앱을 고쳐 올려도 폰에서는 옛 화면이 그대로였습니다.
   저장해 둔 파일을 먼저 보여 주고 새 파일은 뒤에서 받아 두기
   때문에(stale-while-revalidate), 앱을 두 번 열어야 바뀌었습니다.
   그 사이에 「고쳤다는데 왜 그대로냐」가 생깁니다.

   그래서 새 판이 자리를 잡는 순간 화면을 한 번만 다시 그립니다.
     · 딱 한 번만 — 그러지 않으면 새로고침이 끝없이 돕니다
     · 놀이 중에는 하지 않습니다 — 풀던 판이 날아가면 안 됩니다
       (그때는 다음에 여실 때 바뀝니다)

   ※ 앱을 처음 여는 경우에도 서비스워커가 자리를 잡습니다.
     그때는 이미 최신이므로 다시 그리지 않습니다.
   ============================================================ */
(function (global) {
  'use strict';
  if (!('serviceWorker' in global.navigator)) return;

  const KEY = 'nanmal.justUpdated';

  // 페이지가 열릴 때 이미 서비스워커가 있었는가.
  // 없었다면 이번이 첫 설치이므로 다시 그릴 까닭이 없습니다.
  const hadOne = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadOne) return;
    try {
      if (sessionStorage.getItem(KEY)) return;   // 한 번만
      sessionStorage.setItem(KEY, '1');
    } catch (e) { return; }

    // 낱말을 풀고 계시면 건드리지 않습니다
    if (document.body && document.body.classList.contains('playing')) return;

    global.location.reload();
  });
})(window);
