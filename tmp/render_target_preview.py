from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1200, 900
im = Image.new('RGB', (W, H), '#f2f3ed')
d = ImageDraw.Draw(im)
font_path = 'C:/Windows/Fonts/msjh.ttc'
def font(size, bold=False):
    p = 'C:/Windows/Fonts/msjhbd.ttc' if bold else font_path
    return ImageFont.truetype(p, size)
def label(x, y, s, size=22, fill='#253a30', bold=False):
    d.text((x, y), s, font=font(size, bold), fill=fill)
label(74, 56, 'B 模組 / 靶紙視覺規格', 18, '#557464', True)
label(74, 100, '編號同心圓練習紙靶', 44, bold=True)
label(76, 162, '原創遊戲介面樣式 · 固定紙靶', 22, '#59695e')
d.rounded_rectangle((120,245,540,815), radius=5, fill='#ffffff', outline='#d1d9d0', width=2)
d.rectangle((139,264,521,796), outline='#d1d9d0', width=2)
d.rounded_rectangle((260,278,400,333), radius=8, fill='#304d3d')
d.text((330,305), '01', font=font(35, True), anchor='mm', fill='white')
for r, width in [(187,5),(157,3),(125,3),(94,3),(63,3)]:
    d.ellipse((330-r,540-r,330+r,540+r), outline='#253a30', width=width)
d.ellipse((298,508,362,572), fill='#263c30')
d.ellipse((325,535,335,545), fill='#f7f7f2')
d.text((330,774),'靶位 01 · 版面示意',font=font(17),fill='#77867b',anchor='mm')
for y, head, body in [
    (307,'靶位編號','與場景中的指定靶道一致'),
    (514,'高對比圓環','讓遠處目標與回顧落點清楚可辨'),
    (746,'同一張靶紙','練習畫面與回顧頁共用版型')]:
    d.line((540,y,628,y), fill='#9fb1a5', width=2)
    d.ellipse((535,y-5,545,y+5), fill='#809989')
    label(655,y-28,head,24,bold=True)
    label(655,y+9,body,21,'#59695e')
label(74,842,'註：同心圓為本遊戲的視覺設計選擇；不表示課本指定靶型或實際射擊評分標準。',17,'#77867b')
im.save('靶紙樣式示意.png')
