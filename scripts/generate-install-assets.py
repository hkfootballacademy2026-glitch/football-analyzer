"""Generate the published app QR and home-screen icons (Pillow + qrcode)."""
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.build-tools'))
import qrcode
from PIL import Image, ImageDraw
URL = 'https://football-analyzer-hk-20261105.football-analyzer.workers.dev/'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
qr.add_data(URL)
qr.make(fit=True)
qr.make_image(fill_color='black', back_color='white').save(ROOT / 'public/app-qr.png')
for filename, size, maskable in [('icon-192.png',192,False),('icon-512.png',512,False),('icon-maskable-512.png',512,True),('apple-touch-icon.png',180,False)]:
    scale=4
    image=Image.new('RGB',(size*scale,size*scale),'#101113')
    draw=ImageDraw.Draw(image)
    def xy(v): return round(v/192*size*scale)
    color='#c7ed8b'
    draw.rectangle((xy(44),xy(46),xy(148),xy(146)),outline=color,width=max(1,xy(7)))
    draw.line((xy(96),xy(46),xy(96),xy(146)),fill=color,width=max(1,xy(7)))
    draw.ellipse((xy(72),xy(72),xy(120),xy(120)),outline=color,width=max(1,xy(7)))
    image.resize((size,size),Image.Resampling.LANCZOS).save(ROOT/'public'/filename)
print('Generated QR and four app icons')
