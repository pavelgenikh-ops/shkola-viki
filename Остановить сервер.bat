@echo off
rem Stops only the Shkola Viki server (port 8128), other apps keep running.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=(Get-NetTCPConnection -LocalPort 8128 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess; if ($p) { Stop-Process -Id $p -Force; Write-Host 'Server stopped.' } else { Write-Host 'Server was not running.' }"
timeout /t 2 >nul
