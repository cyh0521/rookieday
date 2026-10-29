from pathlib import Path
base=Path('DEMO/共用原始碼')
p=base/'game/build_standalone.py';s=p.read_text(encoding='utf-8');s=s.replace("out=root/'B流程展示版'", "out=root.parent/'B流程展示版'");p.write_text(s,encoding='utf-8')
p=base/'game/build_exploration_scene.py';s=p.read_text(encoding='utf-8');s=s.replace("output = root / 'DEMO/靶場見習日'", "output = root.parent / '風格設計/靶場見習日'")
# Only the non-bundled preview requires a relative Three.js import from its output folder.
s=s.replace("html = html.replace('../../viewer/vendor/build/three.module.js', '../../viewer/vendor/build/three.module.js')", "html = html.replace('../../viewer/vendor/build/three.module.js', '../../共用原始碼/viewer/vendor/build/three.module.js')")
s=s.replace("old = '\"three\":\"../../viewer/vendor/build/three.module.js\"'", "old = '\"three\":\"../../共用原始碼/viewer/vendor/build/three.module.js\"'")
p.write_text(s,encoding='utf-8')
p=Path('DEMO/風格設計/靶場見習日/靶場見習日-可實作場景.html');s=p.read_text(encoding='utf-8-sig').replace('../../viewer/vendor/','../../共用原始碼/viewer/vendor/');p.write_text(s,encoding='utf-8')
p=Path('DEMO/風格設計/檔案索引.md');s=p.read_text(encoding='utf-8').replace('(../靶場見習日-全靶場.html)','(../../靶場見習日-全靶場.html)');p.write_text(s,encoding='utf-8')
p=base/'game/README.md';s=p.read_text(encoding='utf-8').replace('python game/build_standalone.py','python DEMO/共用原始碼/game/build_standalone.py').replace('`B流程展示版/','`DEMO/B流程展示版/').replace('`game/index.html`','`DEMO/共用原始碼/game/index.html`');p.write_text(s,encoding='utf-8')
p=base/'game/visit/README.md';s=p.read_text(encoding='utf-8').replace('DEMO/靶場見習日/','DEMO/風格設計/靶場見習日/');p.write_text(s,encoding='utf-8')
