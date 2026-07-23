@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ============================================
echo  해운대 정보 갱신 — 구청·문화회관·도서관 등
echo ============================================
echo.
echo [1/2] 새 글 수집 중... (기관 서버에 예의 있게 2초 간격으로 요청합니다)
node tools\collect.mjs
if errorlevel 1 goto :err
echo.
echo [2/2] 어르신에게 쓸모 있는 것만 골라 앱에 올리는 중...
node tools\promote.mjs
if errorlevel 1 goto :err
echo.
echo ============================================
echo  갱신 완료! 앱을 새로고침하면 최신 소식이 보입니다.
echo ============================================
goto :end
:err
echo.
echo [!] 문제가 생겼습니다. 인터넷 연결과 Node 설치를 확인해 주세요.
:end
pause
