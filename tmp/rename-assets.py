from pathlib import Path
files=[Path('靶場見習日.html'),Path('使用說明.txt')]
for root in ['assets','DEMO','tmp']:
 for p in Path(root).rglob('*'):
  if p.is_file() and p.suffix.lower() in {'.html','.js','.css','.md','.txt','.cjs','.py','.ps1'}:files.append(p)
count=0
for p in files:
 try:s=p.read_text(encoding='utf-8-sig')
 except (UnicodeError,FileNotFoundError):continue
 if '全靶場資料' not in s:continue
 # Avoid rewriting this migration's own source.
 if p==Path('tmp/rename-assets.py'):continue
 p.write_text(s.replace('全靶場資料','assets'),encoding='utf-8');count+=1
print('Updated references in',count,'files')
