"""Build the 1280×720 README preview from captured browser screenshots.

Requires Pillow. Run from the frontend repository:
    python docs/media/build_preview.py

The source images are never edited; all scene labels sit outside screenshots.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
SCREENS = ROOT / "screens"
SIZE = (1280, 720)
PURPLE = (105, 75, 145)
INK = (41, 34, 54)
MUTED = (103, 92, 118)
FONT_DIR = Path("C:/Windows/Fonts")


def font(size, bold=False):
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    if (FONT_DIR / name).exists():
        return ImageFont.truetype(str(FONT_DIR / name), size)
    return ImageFont.load_default()


def background():
    image = Image.new("RGB", SIZE)
    draw = ImageDraw.Draw(image)
    for y in range(SIZE[1]):
        t = y / (SIZE[1] - 1)
        draw.line((0, y, SIZE[0], y), fill=(
            int(250 - 10 * t), int(248 - 10 * t), int(253 - 5 * t)
        ))
    draw.rounded_rectangle((25, 20, 1255, 700), radius=28, fill=(255, 255, 255))
    draw.rounded_rectangle((25, 20, 1255, 700), radius=28, outline=(223, 212, 232), width=2)
    return image


def frame(image, number, heading, detail, source):
    draw = ImageDraw.Draw(image)
    mark = Image.open(ROOT / "respiracare-mark.png").convert("RGBA")
    mark.thumbnail((48, 48), Image.Resampling.LANCZOS)
    image.paste(mark, (55, 39), mark)
    draw.text((110, 35), "RespiraCare", font=font(23, True), fill=INK)
    draw.text((110, 65), "RESPIRATORY HEALTH AWARENESS", font=font(11, True), fill=PURPLE)
    draw.text((1220, 50), f"{number:02d} / 09", font=font(16, True), fill=PURPLE, anchor="ra")
    draw.text((55, 104), heading, font=font(30, True), fill=INK)
    draw.text((55, 144), detail, font=font(15), fill=MUTED)
    draw.rounded_rectangle((45, 184, 1235, 655), radius=17, fill=(223, 216, 231))
    draw.text((57, 681), source, font=font(12), fill=MUTED)
    draw.text((1221, 681), "krishna-respira-care.onrender.com", font=font(12, True), fill=PURPLE, anchor="ra")


def browser_panel(image, name, route, y_offset=0):
    draw = ImageDraw.Draw(image)
    left, top, right, bottom = 49, 188, 1231, 651
    draw.rounded_rectangle((left, top, right, bottom), radius=15, fill=(255, 255, 255), outline=(219, 207, 230), width=2)
    draw.rounded_rectangle((left + 2, top + 2, right - 2, top + 36), radius=11, fill=(248, 245, 251))
    draw.rectangle((left + 2, top + 23, right - 2, top + 37), fill=(248, 245, 251))
    for i, color in enumerate(((214, 194, 226), (195, 169, 214), (155, 122, 185))):
        x = left + 22 + i * 19
        draw.ellipse((x - 5, top + 17, x + 5, top + 27), fill=color)
    draw.text((left + 102, top + 14), route, font=font(12), fill=MUTED)
    source = Image.open(SCREENS / name).convert("RGB")
    inner_w, inner_h = right - left - 4, bottom - top - 41
    crop_h = round(inner_h * source.width / inner_w)
    crop_y = min(max(0, y_offset), max(0, source.height - crop_h))
    crop = source.crop((0, crop_y, source.width, min(source.height, crop_y + crop_h)))
    crop = crop.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    image.paste(crop, (left + 2, top + 39))


def responsive_panel(image):
    draw = ImageDraw.Draw(image)
    devices = [
        ("10-responsive-desktop.png", "DESKTOP  1440 × 900", (70, 223, 634, 569)),
        ("11-responsive-tablet.png", "TABLET  768 × 1024", (663, 223, 981, 590)),
        ("12-responsive-mobile.png", "MOBILE  390 × 844", (1000, 223, 1196, 611)),
    ]
    draw.rounded_rectangle((49, 188, 1231, 651), radius=16, fill=(249, 246, 252), outline=(219, 207, 230), width=2)
    for filename, label, (x1, y1, x2, y2) in devices:
        source = Image.open(SCREENS / filename).convert("RGB")
        available_w, available_h = x2 - x1, y2 - y1
        scale = min(available_w / source.width, available_h / source.height)
        w, h = round(source.width * scale), round(source.height * scale)
        x = x1 + (available_w - w) // 2
        y = y1 + (available_h - h) // 2
        draw.rounded_rectangle((x - 6, y - 27, x + w + 6, y + h + 6), radius=12, fill=(255, 255, 255), outline=(208, 196, 219), width=2)
        draw.ellipse((x + 8, y - 17, x + 14, y - 11), fill=(165, 139, 194))
        draw.text((x + 25, y - 20), "RespiraCare", font=font(10, True), fill=PURPLE)
        image.paste(source.resize((w, h), Image.Resampling.LANCZOS), (x, y))
        draw.text(((x1 + x2) // 2, 627), label, font=font(12, True), fill=PURPLE, anchor="mm")


SCENES = [
    (1, "RespiraCare | Respiratory Health Awareness", "A clearer path from symptoms to health-awareness guidance", "01-home-desktop.png", "/", 0, "LIVE WEBSITE CAPTURE"),
    (1, "RespiraCare | Respiratory Health Awareness", "A clearer path from symptoms to health-awareness guidance", "01-home-desktop.png", "/", 125, "LIVE WEBSITE CAPTURE"),
    (2, "Your Personal Health Awareness Dashboard", "Start a symptom check or return to previous assessments", "02-patient-dashboard.png", "/dashboard", 170, "LOCAL DEMO · SYNTHETIC ACCOUNT"),
    (3, "Describe Symptoms in English or Kiswahili", "Free-text entry with bilingual guidance and examples", "03-symptom-input.png", "/symptoms", 0, "LOCAL DEMO · FICTIONAL SYMPTOMS"),
    (4, "Review and Confirm Recognised Symptoms", "Check what the application recognised before continuing", "04-symptom-confirmation.png", "/symptoms/confirm", 390, "LOCAL DEMO · SYNTHETIC RECOGNITION"),
    (4, "Review and Confirm Recognised Symptoms", "Check what the application recognised before continuing", "04b-confirmation-action.png", "/symptoms/confirm", 0, "LOCAL DEMO · SYNTHETIC RECOGNITION"),
    (5, "Understand Your Respiratory Assessment", "A possible research pattern with clear health-awareness guidance", "05-assessment-result.png", "/prediction", 380, "LOCAL DEMO · ILLUSTRATIVE RESULT"),
    (5, "Understand Your Respiratory Assessment", "A possible research pattern with clear health-awareness guidance", "05b-assessment-guidance.png", "/prediction", 480, "LOCAL DEMO · ILLUSTRATIVE RESULT"),
    (6, "Safety-First Symptom Assessment", "Urgent warning signs take priority over routine pattern results", "06-urgent-review.png", "/prediction", 350, "LOCAL DEMO · SYNTHETIC SAFETY EXAMPLE"),
    (7, "Review Previous Assessments and Feedback", "Saved sessions, status, and individual assessment details", "07-assessment-history.png", "/history", 260, "LOCAL DEMO · SYNTHETIC RECORDS"),
    (7, "Review Previous Assessments and Feedback", "Saved sessions, status, and individual assessment details", "07b-assessment-detail.png", "/history/preview-normal-001", 200, "LOCAL DEMO · SYNTHETIC RECORD"),
    (8, "Administrator Monitoring and Management", "System activity, urgent reviews, and feedback insights", "08-admin-dashboard.png", "/admin", 240, "LOCAL DEMO · SYNTHETIC ADMIN DATA"),
    (8, "Administrator Monitoring and Management", "System activity, urgent reviews, and feedback insights", "08b-admin-monitoring.png", "/admin", 300, "LOCAL DEMO · SYNTHETIC ADMIN DATA"),
    (9, "Responsive Across Desktop, Tablet and Mobile", "One web application across three genuine browser viewports", None, "/", 0, "LIVE WEBSITE CAPTURES · DESKTOP / TABLET / MOBILE"),
]


def make_slide(scene):
    number, title, detail, filename, route, offset, provenance = scene
    image = background()
    frame(image, number, title, detail, provenance)
    if filename:
        browser_panel(image, filename, route, offset)
    else:
        responsive_panel(image)
    return image


def main():
    slides = [make_slide(scene) for scene in SCENES]
    slides[1].save(ROOT / "respiracare-preview.png", optimize=True)
    # Fourteen visual states represent nine scenes; long pages reveal their
    # content in two genuine browser captures rather than shrinking the text.
    holds = [1000, 1800, 2800, 2800, 1400, 1400, 1400, 1400, 2800, 1400, 1400, 1400, 1400, 2800]
    frames, durations = [], []
    for index, slide in enumerate(slides):
        frames.append(slide.quantize(colors=128, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE))
        durations.append(holds[index])
        if index < len(slides) - 1:
            for alpha in (0.35, 0.7):
                fade = Image.blend(slide, slides[index + 1], alpha)
                frames.append(fade.quantize(colors=128, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE))
                durations.append(100)
    frames[0].save(
        ROOT / "respiracare-preview.gif", save_all=True, append_images=frames[1:],
        duration=durations, loop=0, optimize=True, disposal=2,
    )
    print(f"Slides: {len(slides)} | Frames: {len(frames)} | Duration: {sum(durations) / 1000:.1f}s")
    print(f"GIF bytes: {(ROOT / 'respiracare-preview.gif').stat().st_size:,}")


if __name__ == "__main__":
    main()
