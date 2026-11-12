@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync-source.ps1"
set "saveResult=%ERRORLEVEL%"
if not "%saveResult%"=="0" (echo Save failed. Review the error above.) else (echo Source saved to GitHub.)
pause
exit /b %saveResult%
