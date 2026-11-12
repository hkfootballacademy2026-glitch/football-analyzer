@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync-source.ps1"
if errorlevel 1 (echo Save failed. Review the error above.) else (echo Source saved to GitHub.)
pause
