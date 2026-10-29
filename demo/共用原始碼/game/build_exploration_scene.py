"""Create the offline, single-file WebGL scene preview."""
from pathlib import Path
import base64

root = Path(__file__).resolve().parent.parent
output = root.parent / '風格設計/靶場見習日'
output.mkdir(parents=True, exist_ok=True)
source = root / 'game/visit/index.html'
three = root / 'viewer/vendor/build/three.module.js'
dest = output / '靶場見習日-單檔場景.html'
html = source.read_text(encoding='utf-8-sig')
css = (source.parent / 'style.css').read_text(encoding='utf-8')
core = (source.parent / 'core.js').read_text(encoding='utf-8').replace('export ', '')
world = (source.parent / 'world.js').read_text(encoding='utf-8').replace("import * as T from 'three';", '').replace('export ', '')
main = (source.parent / 'main.js').read_text(encoding='utf-8')
main = main.replace("import { createWorld } from './world.js';", '')
main = main.replace("import { STATIONS, NOTES, canWalk, findPath, normaliseProgress } from './core.js';", '')
html = html.replace('<link rel="stylesheet" href="./style.css">', '<style>' + css + '</style>')
html = html.replace('<script type="module" src="./main.js"></script>', '<script type="module">\n' + core + world + main + '\n</script>')
html = html.replace('../../viewer/vendor/build/three.module.js', '../../共用原始碼/viewer/vendor/build/three.module.js')
(output / '靶場見習日-可實作場景.html').write_text(html, encoding='utf-8')
encoded = base64.b64encode(three.read_bytes()).decode('ascii')
old = '"three":"../../共用原始碼/viewer/vendor/build/three.module.js"'
new = '"three":"data:text/javascript;base64,' + encoded + '"'
if html.count(old) != 1:
    raise ValueError('Expected exactly one Three.js import-map entry')
dest.write_text(html.replace(old, new), encoding='utf-8')
(output / '靶場見習日-導覽展示版.html').write_text(html.replace(old, new), encoding='utf-8')
print(dest.name, dest.stat().st_size)
