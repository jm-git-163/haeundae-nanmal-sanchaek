@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ================================================
echo  해운대 정보 '매일 자동 갱신' 등록
echo ================================================
echo.
echo  컴퓨터가 켜져 있으면 매일 아침 7시에
echo  구청·주민센터·도서관·보건소 등의 새 글을
echo  스스로 받아 옵니다.
echo.
echo  ※ 이 창은 Windows 작업 스케줄러에 일정을 등록합니다.
echo    등록을 원치 않으시면 이 창을 닫으세요.
echo.
pause

schtasks /Create /TN "해운대소식갱신" /SC DAILY /ST 07:00 ^
  /TR "cmd /c cd /d \"%~dp0\" && node tools\collect.mjs && node tools\promote.mjs" ^
  /F

if errorlevel 1 goto :err
echo.
echo ================================================
echo  등록 완료. 매일 아침 7시에 자동으로 갱신됩니다.
echo.
echo  해제하려면 아래를 실행하세요:
echo     schtasks /Delete /TN "해운대소식갱신" /F
echo ================================================
goto :end
:err
echo.
echo [!] 등록에 실패했습니다.
echo     이 파일을 마우스 오른쪽 - "관리자 권한으로 실행" 해 보세요.
:end
pause
