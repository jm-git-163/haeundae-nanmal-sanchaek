/* ============================================================
   open-outside.js — 카카오톡 안에서 열렸을 때 바깥 브라우저로 내보내기

   카톡에서 링크를 누르면 카톡이 품고 있는 작은 브라우저가 열립니다.
   여기서는 안 되는 일이 셋입니다.
     ① 저장한 자료가 따로 놉니다 — 몇 단계까지 걸었는지, 모은 낱말이
        다음에 열 때 사라집니다. 어르신께는 가장 속상한 일입니다.
     ② 「홈 화면에 추가」가 아예 없습니다. 바탕화면 아이콘을 못 만듭니다.
     ③ 소리가 막히는 일이 있습니다.

   그래서 카톡 안이면 곧바로 바깥 브라우저(크롬 등)로 넘깁니다.
   혹시 넘어가지 않을 때를 대비해 큰 단추도 함께 보여 드립니다.

   ※ 소개 페이지(index.html)와 놀이 화면(play.html) 양쪽에 모두 넣습니다.
     한쪽만 넣어 두면, 카톡으로 보낸 주소가 그 한쪽이 아닐 때
     어머니는 계속 카톡 브라우저에 갇히십니다. 실제로 그랬습니다.
   ============================================================ */
(function () {
  'use strict';
  var ua = (navigator.userAgent || '').toLowerCase();
  var inApp = ua.indexOf('kakaotalk') !== -1;
  if (!inApp) return;

  var here = location.href.split('#')[0];
  var isAndroid = ua.indexOf('android') !== -1;

  /**
   * 바깥 브라우저로 넘기는 길은 둘입니다.
   *
   * ① 안드로이드 — intent:// 로 크롬을 콕 집어 엽니다.
   *    안드로이드가 직접 처리하므로 카톡 버전을 타지 않습니다.
   *    크롬이 없으면 아무 일도 안 일어나므로 ② 를 이어서 시도합니다.
   * ② kakaotalk://web/openExternal — 카카오가 열어 둔 길.
   *    아이폰은 이것뿐이고, 안드로이드에서도 크롬이 없을 때 받아 줍니다.
   *
   * 예전에는 ② 만 썼는데, 카톡 버전에 따라 먹지 않아
   * 어르신이 카톡 브라우저에 갇히는 일이 있었습니다.
   */
  function viaKakao() {
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(here);
  }

  function viaIntent() {
    // intent:// 는 주소에서 scheme 을 뺀 나머지를 씁니다
    var bare = here.replace(/^https?:\/\//, '');
    location.href = 'intent://' + bare +
      '#Intent;scheme=https;package=com.android.chrome;end';
  }

  function jump() {
    if (isAndroid) {
      viaIntent();
      // 크롬이 없어 아무 일도 안 일어났으면 카카오 길로 이어 갑니다
      setTimeout(function () { if (!document.hidden) viaKakao(); }, 900);
    } else {
      viaKakao();
    }
  }
  jump();

  function show() {
    var d = document.createElement('div');
    d.setAttribute('style', [
      'position:fixed;inset:0;z-index:2147483647',
      'background:#faf7f4;color:#29211b',
      "font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'gap:20px;padding:28px;text-align:center;word-break:keep-all'
    ].join(';'));
    d.innerHTML =
      '<img src="images/icon-192.png" alt="" style="width:112px;height:112px;border-radius:26px">' +
      '<p style="font-size:23px;font-weight:800;line-height:1.6;margin:0">' +
      '크롬으로 열어야<br>바탕화면에 놓을 수 있어요' +
      '</p>' +
      '<p style="font-size:18px;color:#5b4e44;line-height:1.7;margin:0">' +
      '아래 단추를 눌러 주세요.<br>' +
      '단추가 안 되면 오른쪽 위 <b>⋯</b> 를 누르고<br><b>다른 브라우저로 열기</b> 를 골라 주세요.' +
      '</p>' +
      '<button id="kkjump" style="min-height:64px;padding:0 34px;font-size:21px;font-weight:800;' +
      'font-family:inherit;color:#3d1f00;background:#ef8f22;border:0;border-radius:999px;' +
      'box-shadow:0 5px 0 #c26c05;cursor:pointer">크롬으로 열기</button>';
    document.body.appendChild(d);
    document.getElementById('kkjump').addEventListener('click', jump);
  }
  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
