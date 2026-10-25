"""Rebuild both catalogue PDFs from the same data used by the website."""
import json
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape
from PIL import Image

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/formations-data.js').read_text(encoding='utf-8')
courses = json.loads(raw.split('window.ARI_TRAINING_COURSES = ', 1)[1].strip().rstrip(';'))
FONT = Path('/usr/share/fonts/truetype/dejavu')
for name, file in [('ARI', 'DejaVuSans.ttf'), ('ARI-Bold', 'DejaVuSans-Bold.ttf'), ('ARI-Serif', 'DejaVuSerif.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / file)))
pdfmetrics.registerFontFamily('ARI', normal='ARI', bold='ARI-Bold')
NAVY, GOLD, CREAM, MUTED = map(HexColor, ['#1d3063', '#aa7c18', '#f6f3ec', '#596477'])
W, H = 595.28, 841.89
LEFT, RIGHT = 48, W - 48
cover_jpeg = BytesIO()
Image.open(ROOT / 'assets/formation-leadership.webp').convert('RGB').save(cover_jpeg, 'JPEG', quality=80)
cover_jpeg.seek(0)
cover_image = ImageReader(cover_jpeg)


def safe(text):
    return escape(text.replace('—', '-').replace('–', '-').replace('\u2011', '-'))


def para(c, text, y, size=10, leading=16, bold=False, width=None, color=NAVY, x=LEFT):
    style = ParagraphStyle('p', fontName='ARI-Bold' if bold else 'ARI', fontSize=size,
                           leading=leading, textColor=color, spaceAfter=0)
    p = Paragraph(safe(text), style)
    _, height = p.wrap(width or RIGHT - x, H)
    p.drawOn(c, x, y - height)
    return y - height


def chrome(c, lang, page):
    c.setFillColor(white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(LEFT, H - 52, RIGHT, H - 52)
    c.setFont('ARI-Bold', 8)
    c.setFillColor(NAVY)
    c.drawString(LEFT, H - 36, 'AGILE RESOURCES INTERNATIONAL')
    c.setFont('ARI', 8)
    c.drawRightString(RIGHT, H - 36, 'TRAINING' if lang == 'en' else 'FORMATIONS')
    c.setStrokeColor(HexColor('#dedfdc'))
    c.line(LEFT, 45, RIGHT, 45)
    c.setFont('ARI', 7)
    c.setFillColor(MUTED)
    c.drawString(LEFT, 29, 'contact@agileresources-intl.com')
    c.drawRightString(RIGHT, 29, f'{page:02d} / 09')
    c.linkURL('mailto:contact@agileresources-intl.com', (LEFT, 23, LEFT + 190, 39), relative=0)


def section(c, title, y):
    y -= 18
    c.setFillColor(GOLD)
    c.setFont('ARI-Bold', 8)
    c.drawString(LEFT, y, title.upper())
    return y - 13


def build(lang):
    en = lang == 'en'
    out = ROOT / f'assets/catalogue-formations-ari-{lang}.pdf'
    c = canvas.Canvas(str(out), pagesize=(W, H), pageCompression=1)
    c.setTitle('ARI - Corporate training catalogue' if en else 'ARI - Catalogue de formations pour cadres et dirigeants')
    c.setAuthor('Agile Resources International')
    c.setSubject('Professional development, leadership and team performance')
    chrome(c, lang, 1)
    para(c, 'CORPORATE TRAINING' if en else 'FORMATION ENTREPRISES', 742, 10, 15, True, color=GOLD)
    y = para(c, 'Grow your people.\nMove your business forward.' if en else 'Faire grandir les talents. Faire avancer l’entreprise.', 704, 30, 38, True)
    para(c, 'Professionals, Managers & Leaders' if en else 'Cadres, Managers & Dirigeants', y - 20, 13, 20, color=MUTED)
    c.drawImage(cover_image, LEFT, 205, width=RIGHT-LEFT, height=320, preserveAspectRatio=True, anchor='c')
    para(c, '07 programmes  /  02 learning pathways' if en else '07 formations  /  02 univers de formation', 170, 14, 21, True)
    para(c, 'A starting point for a programme shaped around your organisation.' if en else 'Une base solide pour construire un parcours adapté à votre organisation.', 132, 11, 18, color=MUTED)
    c.showPage()
    chrome(c, lang, 2)
    y = para(c, 'Find your next step.' if en else 'À chaque enjeu, son prochain pas.', 748, 27, 35, True)
    for group, label in [('cadres', 'Professionals' if en else 'Cadres'), ('leaders', 'Managers & Leaders')]:
        y = section(c, label, y - 12)
        for course in [item for item in courses if item['audience'] == group]:
            top = y
            y = para(c, course['ref'], y, 9, 16, True, width=52, color=GOLD)
            end = para(c, course[lang]['title'], top, 11, 17, width=RIGHT-LEFT-75, x=LEFT+75)
            c.linkRect('', course['id'], (LEFT, end-4, RIGHT, top+3), relative=0, thickness=0)
            y = min(y, end) - 18
    y = section(c, 'Tailored delivery' if en else 'Un parcours construit avec vous', y)
    y = para(c, 'Content, duration, delivery format, prerequisites, assessment and pricing are agreed with ARI when your needs are scoped.' if en else 'Le contenu, la durée, les modalités, les prérequis, l’évaluation et le tarif sont précisés avec ARI lors du cadrage de votre besoin.', y, 10, 17, color=MUTED)
    y = para(c, 'The programme outlines, exercises and takeaways in this catalogue are proposals that can be adapted to your context.' if en else 'Les trames de programme, exercices et livrables de ce catalogue sont proposés comme base d’adaptation à votre contexte.', y - 15, 10, 17, color=MUTED)
    if y < 65:
        raise ValueError('Contents overflow')
    c.showPage()
    for page, course in enumerate(courses, 3):
        t = course[lang]
        chrome(c, lang, page)
        c.bookmarkPage(course['id'])
        c.addOutlineEntry(t['title'], course['id'])
        y = para(c, course['ref'] + '  /  ' + ('Professionals' if en else 'Cadres') if course['audience'] == 'cadres' else course['ref'] + '  /  Managers & Leaders', 750, 9, 14, True, color=GOLD)
        y = para(c, t['title'], y-14, 23, 29, True)
        y = para(c, t['description'], y-15, 10, 16)
        y = section(c, 'Learning objective' if en else 'Objectif pédagogique', y)
        y = para(c, t['objective'], y, 10, 16)
        y = section(c, 'Audience' if en else 'Public concerné', y)
        y = para(c, t['public'], y, 9, 15, color=MUTED)
        y = section(c, 'Proposed programme outline' if en else 'Trame de programme proposée', y)
        for i, (title, text) in enumerate(t['modules'], 1):
            y = para(c, f'{i:02d}  {title}', y, 10, 15, True)
            y = para(c, text, y-3, 9, 14, color=MUTED) - 11
        y = section(c, 'Practical exercise & takeaway' if en else 'Mise en pratique & livrable proposé', y)
        y = para(c, t['practice'], y, 9, 14)
        y = para(c, t['takeaway'], y-6, 9, 14, color=MUTED)
        y = para(c, 'Duration, delivery format, prerequisites and assessment: agreed with ARI. Pricing: tailored quote.' if en else 'Durée, modalités, prérequis et évaluation : à définir avec ARI. Tarif : sur devis.', y-18, 8, 13, color=MUTED)
        if y < 67:
            raise ValueError(f'Page overflow ({lang}, {course["id"]}): {y}')
        url = 'https://agileresources-intl.com/' + ('en/' if en else '') + 'catalogue/' + course['id']
        c.linkURL(url, (LEFT, 52, RIGHT, 66), relative=0)
        c.setFillColor(GOLD)
        c.setFont('ARI-Bold', 8)
        c.drawString(LEFT, 56, 'EXPLORE ONLINE / REQUEST A PROPOSAL' if en else 'DÉCOUVRIR EN LIGNE / DEMANDER UNE PROPOSITION')
        c.showPage()
    c.save()
    print(out)


if __name__ == '__main__':
    build('fr')
    build('en')
