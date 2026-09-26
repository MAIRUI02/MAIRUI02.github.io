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
node -e "fetch('http://127.0.0.1:3000/api/admin/check-auth').then(r=>r.json()).then(d=>process.exit(typeof d.authenticated==='boolean'?0:1)).catch(()=>process.exit(1))"
if not errorlevel 1 (
  start "" "http://127.0.0.1:3000/studio.html"
  exit /b 0
)
start "" "http://127.0.0.1:3000/studio.html"
echo Open http://127.0.0.1:3000/studio.html in your browser.
echo Keep this window open while using Studio. Close it to stop.
node server.js
pause
