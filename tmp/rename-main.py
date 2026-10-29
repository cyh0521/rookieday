from pathlib import Path
import re
items=[Path('使用說明.txt'),Path('assets/完整場景說明.txt'),Path('DEMO/檔案索引.md'),Path('DEMO/風格設計/檔案索引.md'),Path('tmp/create-root-check.cjs'),Path('tmp/check-root-range.cjs')]
for p in items:
 if p.exists():p.write_text(p.read_text(encoding='utf-8-sig').replace('靶場見習日-全靶場.html','靶場見習日.html'),encoding='utf-8')
h=Path('靶場見習日.html').read_text(encoding='utf-8-sig')
for r in re.findall(r'(?:src|href)="([^"]+)"',h):
 assert Path(r).exists(),r
print('PASS: renamed main file references')
