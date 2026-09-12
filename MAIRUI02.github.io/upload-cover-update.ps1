$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Host ""
Write-Host "=== 閲読器作品記録・封面更新 ==="
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "未找到 Git。请先安装 Git for Windows。"
    Read-Host "按 Enter 退出"
    exit 1
}

if (-not (Test-Path ".git")) {
    Write-Host "这个脚本必须放在你用 Git clone 下来的 MAIRUI02.github.io 文件夹根目录运行。"
    Read-Host "按 Enter 退出"
    exit 1
}

if (-not (Test-Path "new-cover-mapping.json")) {
    Write-Host "缺少 new-cover-mapping.json"
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host "正在检查 JSON 和封面文件..."
$json = Get-Content "new-cover-mapping.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$missing = @()

foreach ($prop in $json.PSObject.Properties) {
    $workId = $prop.Name
    $file = $prop.Value.file
    if ([string]::IsNullOrWhiteSpace($file)) {
        $missing += "$workId : 没有 file"
        continue
    }

    $coverPath = Join-Path "assets/covers" $file
    if (-not (Test-Path $coverPath)) {
        $missing += "$workId : 缺少 $coverPath"
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "发现问题，已停止上传："
    $missing | ForEach-Object { Write-Host " - $_" }
    Write-Host ""
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host "检查通过。"
Write-Host "正在同步 GitHub 最新版本..."
git pull --rebase origin main

Write-Host "正在加入封面与映射文件..."
git add new-cover-mapping.json assets/covers

$changes = git status --porcelain
if (-not $changes) {
    Write-Host "没有需要上传的变化。"
    Read-Host "按 Enter 退出"
    exit 0
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Update covers $stamp"

Write-Host "正在上传到 GitHub..."
git push origin main

Write-Host ""
Write-Host "完成。GitHub Pages 会自动部署。"
Read-Host "按 Enter 关闭"
