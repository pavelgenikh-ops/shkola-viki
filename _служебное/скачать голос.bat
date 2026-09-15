@echo off
rem Downloads the neural voice files (about 146 MB) into the "voice" folder.
rem Needed only once and only if the folder is missing (for example after moving the app).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download-voice.ps1"
pause
