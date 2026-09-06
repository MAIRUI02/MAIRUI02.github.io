from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
MAPPING = ROOT / "new-cover-mapping.json"
COVERS = ROOT / "assets" / "covers"

def fail(message: str) -> None:
    print(f"[ERROR] {message}")
    sys.exit(1)

if not MAPPING.exists():
    fail("找不到 new-cover-mapping.json")

try:
    data = json.loads(MAPPING.read_text(encoding="utf-8"))
except json.JSONDecodeError as exc:
    fail(f"JSON 格式错误：第 {exc.lineno} 行，第 {exc.colno} 列：{exc.msg}")

if not isinstance(data, dict):
    fail("映射文件最外层必须是 JSON 对象")

missing = []
invalid = []

for work_id, entry in data.items():
    if not isinstance(work_id, str) or not work_id.startswith("work-"):
        invalid.append(f"{work_id!r}: 作品 ID 应为 work-001 这种格式")
        continue

    if not isinstance(entry, dict):
        invalid.append(f"{work_id}: 映射内容必须是对象")
        continue

    filename = entry.get("file")
    if not isinstance(filename, str) or not filename.strip():
        invalid.append(f"{work_id}: 缺少有效的 file")
        continue

    if Path(filename).name != filename:
        invalid.append(f"{work_id}: file 只能写文件名，不能写文件夹路径")
        continue

    if not (COVERS / filename).is_file():
        missing.append(f"{work_id} -> assets/covers/{filename}")

if invalid:
    print("[ERROR] 映射格式存在问题：")
    for item in invalid:
        print("  -", item)

if missing:
    print("[ERROR] 以下映射找不到对应封面文件：")
    for item in missing:
        print("  -", item)

if invalid or missing:
    sys.exit(1)

print(f"[OK] 映射检查通过：{len(data)} 条记录，所有封面文件均存在。")
