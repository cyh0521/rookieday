"""Bundle local Three.js modules and authorized assets into an offline HTML file."""
from pathlib import Path
import base64, json, re
root=Path(__file__).resolve().parent.parent
game=root/'game'
modules={}
paths={'three':root/'viewer/vendor/build/three.module.js'}
for name in ['main','core','world','weapon']:
    paths['range/'+name]=game/(name+'.js')
def spec_for(path):
    path=path.resolve()
    if path==paths['three'].resolve(): return 'three'
    if path.parent==game: return 'range/'+path.stem
    return 'three/addons/'+path.relative_to(root/'viewer/vendor/examples/jsm').as_posix()
def gather(key,path):
    if key in modules:return
    modules[key]=''
    source=path.read_text(encoding='utf-8')
    deps=[]
    def replace(m):
        raw=m.group(2)
        if raw=='three': target=paths['three']
        elif raw.startswith('three/addons/'): target=root/'viewer/vendor/examples/jsm'/raw[len('three/addons/'):]
        elif raw.startswith('.'): target=(path.parent/raw).resolve()
        else: raise ValueError('Unexpected import '+raw)
        alias=spec_for(target);deps.append((alias,target))
        return m.group(1)+m.group(3)+alias+m.group(3)
    # Static imports only; module paths are mapped to generated Blob URLs at runtime.
    source=re.sub(r"(from\s+)(?:([\"'])(.*?)\2)",lambda m:m.group(0),source) if False else source
    pattern=r"(from\s+)([\"'])([^\"']+)\2"
    def rewrite(m):
        raw=m.group(3)
        if raw=='three':target=paths['three']
        elif raw.startswith('three/addons/'):target=root/'viewer/vendor/examples/jsm'/raw[len('three/addons/'):]
        elif raw.startswith('.'):target=(path.parent/raw).resolve()
        else:raise ValueError('Unexpected import '+raw)
        alias=spec_for(target);deps.append((alias,target));return m.group(1)+m.group(2)+alias+m.group(2)
    source=re.sub(pattern,rewrite,source)
    modules[key]=source
    for alias,target in deps:gather(alias,target)
gather('range/main',paths['range/main'])
assets={}
for name in ['M4A1.fbx','M4A1_Base_Color.png','M4A1_Normal.png','M4A1_Metallic.png','M4A1_Roughness.png']:
    assets[name]=base64.b64encode((root/'viewer/assets'/name).read_bytes()).decode('ascii')
css=(game/'style.css').read_text(encoding='utf-8')
font=base64.b64encode((root/'viewer/fonts/BarlowCondensed-Bold.ttf').read_bytes()).decode('ascii')
css=css.replace('../viewer/fonts/BarlowCondensed-Bold.ttf','data:font/ttf;base64,'+font)
html=(game/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=re.sub(r'<script type="importmap">.*?</script>','',html)
payload=json.dumps({'modules':modules,'assets':assets},ensure_ascii=False).replace('</','<\\/')
bootstrap='''<script>
const bundle=BUNDLE_DATA;
const imports={};for(const [key,source] of Object.entries(bundle.modules))imports[key]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
window.__RANGE_ASSETS__={};for(const [name,b64] of Object.entries(bundle.assets)){const raw=atob(b64),data=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)data[i]=raw.charCodeAt(i);window.__RANGE_ASSETS__[name]=URL.createObjectURL(new Blob([data],{type:name.endsWith('.png')?'image/png':'application/octet-stream'}));}
const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.append(map);
const main=document.createElement('script');main.type='module';main.textContent="import 'range/main';";document.body.append(main);
</script>'''.replace('BUNDLE_DATA',payload)
html=html.replace('<script type="module" src="main.js"></script>',bootstrap)
out=root.parent/'B流程展示版'/'B流程-臥姿靶場.html';out.parent.mkdir(exist_ok=True);out.write_text(html,encoding='utf-8')
print('Built:',out.name,'bytes:',out.stat().st_size,'modules:',len(modules))
