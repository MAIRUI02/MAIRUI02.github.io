@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js first.
  pause
  exit /b 1
)
if not exist "node_modules\express\package.json" (
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

rem Restart an existing Studio Node server so pulled backend changes take effect.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  for /f "tokens=1" %%N in ('tasklist /FI "PID eq %%P" /NH') do (
    if /I "%%N"=="node.exe" (
      echo Restarting existing Studio server on port 3000...
      taskkill /PID %%P /F >nul 2>nul
      timeout /t 1 /nobreak >nul
    )
  )
)

start "" "http://127.0.0.1:3000/studio.html"
echo Open http://127.0.0.1:3000/studio.html in your browser.
echo Keep this window open while using Studio. Close it to stop.
node server.js
pause
