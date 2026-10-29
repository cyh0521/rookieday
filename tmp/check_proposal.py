from html.parser import HTMLParser
from pathlib import Path
import re

class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.refs = []
        self.tabs = 0
        self.panels = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if a.get('href', '').startswith('#'):
            self.refs.append(a['href'][1:])
        self.tabs += a.get('role') == 'tab'
        self.panels += a.get('role') == 'tabpanel'

p = Path('高中軍訓虛擬靶場-設計企畫.html')
text = p.read_text(encoding='utf-8')
a = Audit()
a.feed(text)
assert len(a.ids) == len(set(a.ids))
assert set(a.refs) <= set(a.ids)
assert a.tabs == a.panels == 3
assert Path('book/乙版下冊.pdf').is_file()
assert Path('M4A1-互動展示.html').is_file()
Path('tmp/proposal-script-check.js').write_text(re.search(r'<script>(.*?)</script>', text, re.S).group(1), encoding='utf-8')
print('PASS: HTML IDs, anchors, tab associations, and local linked files')
print('HTML bytes:', p.stat().st_size)
