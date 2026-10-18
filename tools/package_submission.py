"""Package team sources; never includes local connection credentials or server data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'delivery'
OUT.mkdir(exist_ok=True)
EXCLUDED = {'node_modules', '.git', '.angular', '.runtime', '.npm-cache', 'out-tsc'}

def add_tree(archive, folder, prefix):
    for file in sorted(folder.rglob('*')):
        if not file.is_file():
            continue
        relative = file.relative_to(folder)
        if any(part in EXCLUDED for part in relative.parts):
            continue
        if file.name == '.env' or file.suffix == '.log':
            continue
        archive.write(file, str(Path(prefix) / relative).replace('\\', '/'))

hashes = {}
for person, prefix in [('满', 'whw343'), ('肖', 'daitongxiao')]:
    destination = OUT / person
    destination.mkdir(exist_ok=True)
    for kind, source in [('clientside', 'clientside'), ('api', 'api'), ('adminside', 'database-admin')]:
        target = destination / f'{prefix}A3-{kind}.zip'
        with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
            add_tree(archive, ROOT / source, kind)
            if kind == 'adminside':
                archive.write(ROOT / 'api/database/charityevents-a3.sql', 'adminside/charityevents-a3.sql')
                for name in ['ARCHITECTURE.md', 'VERIFICATION.md', 'PACKAGE-VERIFICATION.json', 'browser-edge-results.json', 'browser-chrome-results.json', 'DEMO-GUIDE.zh-CN.md', 'backend-test-output.txt']:
                    archive.write(ROOT / 'docs' / name, 'adminside/docs/' + name)
        with ZipFile(target) as archive:
            assert archive.testzip() is None
            assert not any('/node_modules/' in n or '/.runtime/' in n or n.endswith('/.env') for n in archive.namelist())
        hashes[str(target.relative_to(OUT))] = hashlib.sha256(target.read_bytes()).hexdigest()
        print(target.name, target.stat().st_size)
(OUT / 'sha256.json').write_text(json.dumps(hashes, ensure_ascii=False, indent=2), encoding='utf-8')
