@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==========================================
echo   閲読器作品記録 - 封面一键上传
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有检测到 Git。
  echo 请先安装 Git for Windows: https://git-scm.com/
  pause
  exit /b 1
)

if not exist ".git" (
  echo [错误] 当前文件夹不是 Git 仓库。
  echo 请先用 GitHub Desktop 或 git clone 下载仓库。
  pause
  exit /b 1
)

if not exist "new-cover-mapping.json" (
  echo [错误] 找不到 new-cover-mapping.json
  pause
  exit /b 1
)

echo [1/5] 合并新的封面映射...
python scripts\merge-cover-mapping.py
if errorlevel 1 (
  echo.
  echo [停止] 映射合并失败，请按上面的提示修正。
  pause
  exit /b 1
)

echo.
echo [2/5] 检查映射文件...
python scripts\validate-cover-mapping.py
if errorlevel 1 (
  echo.
  echo [停止] 映射检查失败，请按上面的提示修正后再上传。
  pause
  exit /b 1
)

echo.
echo [3/5] 同步 GitHub 最新版本...
git pull --rebase
if errorlevel 1 (
  echo [错误] git pull 失败，请先处理 Git 冲突。
  pause
  exit /b 1
)

echo.
echo [4/5] 加入封面与映射文件...
git add new-cover-mapping.json cover-overrides.json assets/covers mapping-imported
git diff --cached --quiet
if not errorlevel 1 (
  echo 没有需要上传的封面变更。
  pause
  exit /b 0
)

set /p MSG=提交说明（直接回车使用默认说明）: 
if "%MSG%"=="" set MSG=Update cover mapping and images

git commit -m "%MSG%"
if errorlevel 1 (
  echo [错误] commit 失败。
  pause
  exit /b 1
)

echo.
echo [5/5] 上传到 GitHub...
git push
if errorlevel 1 (
  echo [错误] push 失败。
  pause
  exit /b 1
)

echo.
echo ==========================================
echo 上传完成。GitHub Pages 会自动更新网站。
echo ==========================================
pause
