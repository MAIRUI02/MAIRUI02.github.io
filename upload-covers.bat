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

where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有检测到 Python。
  pause
  exit /b 1
)

if not exist ".git" (
  echo [错误] 当前文件夹不是 Git 仓库。
  pause
  exit /b 1
)

if not exist "new-cover-mapping.json" (
  echo [错误] 找不到 new-cover-mapping.json
  pause
  exit /b 1
)

echo [1/5] 安全同步 GitHub 最新版本...
git diff --quiet
if errorlevel 1 (
  echo [INFO] 检测到本地修改，先临时保存...
  git stash push -u -m "cover-upload-auto-stash"
  if errorlevel 1 (
    echo [错误] 无法临时保存本地修改。
    pause
    exit /b 1
  )
  set HAD_STASH=1
) else (
  set HAD_STASH=0
)

git pull --rebase
if errorlevel 1 (
  echo [错误] git pull 失败。
  if "%HAD_STASH%"=="1" git stash pop
  pause
  exit /b 1
)

if "%HAD_STASH%"=="1" (
  echo [INFO] 恢复刚才的本地封面修改...
  git stash pop
  if errorlevel 1 (
    echo [错误] 恢复本地修改时发生冲突，请不要继续操作。
    pause
    exit /b 1
  )
)

echo.
echo [2/5] 合并新的封面映射...
python scripts\merge-cover-mapping.py
if errorlevel 1 (
  echo.
  echo [停止] 映射合并失败，请按上面的提示修正。
  pause
  exit /b 1
)

echo.
echo [3/5] 检查映射与裁剪文件...
python scripts\validate-cover-mapping.py
if errorlevel 1 (
  echo.
  echo [停止] 检查失败，请按上面的提示修正后再上传。
  pause
  exit /b 1
)

echo.
echo [4/5] 准备提交...
git add new-cover-mapping.json cover-overrides.json assets/covers mapping-imported
git diff --cached --quiet
if not errorlevel 1 (
  echo 没有需要上传的封面变更。
  pause
  exit /b 0
)

set /p MSG=提交说明（直接回车使用默认说明）: 
if "%MSG%"=="" set MSG=Update cover mapping, crop settings and images

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
