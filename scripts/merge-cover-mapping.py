from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "new-cover-mapping.json"

# Incremental exports such as:
# new-cover-mapping (1).json / new-cover-mapping (1)(1).json
pattern = re.compile(r"^new-cover-mapping\s*\(.+\)\.json$", re.I)
exports = sorted(
    [p for p in ROOT.glob("new-cover-mapping*.json") if p.name != MASTER.name and pattern.match(p.name)],
    key=lambda p: p.stat().st_mtime
)

if not exports:
    print("[INFO] 没有发现新的增量映射文件，跳过合并。")
    sys.exit(0)

try:
    master = json.loads(MASTER.read_text(encoding="utf-8")) if MASTER.exists() else {}
except json.JSONDecodeError as exc:
    print(f"[ERROR] 主映射 JSON 格式错误：{exc}")
    sys.exit(1)

if not isinstance(master, dict):
    print("[ERROR] new-cover-mapping.json 最外层必须是对象。")
    sys.exit(1)

merged_count = 0
for export in exports:
    try:
        incoming = json.loads(export.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"[ERROR] {export.name} JSON 格式错误：{exc}")
        sys.exit(1)
    if not isinstance(incoming, dict):
        print(f"[ERROR] {export.name} 最外层必须是对象。")
        sys.exit(1)

    master.update(incoming)
    merged_count += len(incoming)
    print(f"[MERGE] {export.name}: 合并 {len(incoming)} 条映射")

MASTER.write_text(
    json.dumps(master, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)

# Rename processed exports instead of deleting them, so the user can recover them.
done_dir = ROOT / "mapping-imported"
done_dir.mkdir(exist_ok=True)
for export in exports:
    target = done_dir / export.name
    counter = 1
    while target.exists():
        target = done_dir / f"{export.stem}-{counter}{export.suffix}"
        counter += 1
    export.replace(target)

print(f"[OK] 已合并 {len(exports)} 个增量文件，共 {merged_count} 条；主映射现有 {len(master)} 条。")
print("[INFO] 已处理的导出文件移动到 mapping-imported 文件夹。")
