# RespiraCare preview media

The [animated preview](respiracare-preview.gif) and [static cover](respiracare-preview.png) show nine parts of the implemented RespiraCare web interface in a 1280 × 720 presentation. The animation is 27.8 seconds and loops. The static cover is also the reduced-motion alternative in the repository README.

## Capture provenance

The public captures were made in Chromium from the [deployed website](https://krishna-respira-care.onrender.com/) on 15 November 2026. The protected patient and administrator captures were made in Chromium from this repository's local frontend on the `docs/respiracare-animated-preview` branch. For those captures, `capture_screens.cjs` uses a local-only session and deterministic, fictional API fixtures. It does not sign in to the production service or call the live patient API. The fixture accounts use `demo.invalid` addresses. The examples show the real React pages rendering fixture data; they are **not production assessments, actual patient histories, or measurements of model accuracy**.

| File in `screens/` | Route | Source and purpose |
| --- | --- | --- |
| `01-home-desktop.png` | `/` | Deployed website; opening hero and call to action |
| `02-patient-dashboard.png` | `/dashboard` | Local frontend; fictional patient account |
| `03-symptom-input.png` | `/symptoms` | Local frontend; fictional symptom phrase, bilingual examples, and analyse action |
| `04-symptom-confirmation.png` | `/symptoms/confirm` | Local frontend; synthetic recognition, original description, and selected symptoms |
| `04b-confirmation-action.png` | `/symptoms/confirm` | Same local page scrolled to its correction and confirmation controls |
| `05-assessment-result.png` | `/prediction` | Local frontend; illustrative V3 research-pattern response, not a model prediction |
| `05b-assessment-guidance.png` | `/prediction` | Same illustrative result showing the next-step guidance |
| `06-urgent-review.png` | `/prediction` | Local frontend; synthetic red-flag response demonstrating urgent guidance |
| `07-assessment-history.png` | `/history` | Local frontend; fictional saved sessions and filters |
| `07b-assessment-detail.png` | `/history/preview-normal-001` | Local frontend; fictional assessment detail |
| `08-admin-dashboard.png` | `/admin` | Local frontend; fictional administrator account and monitoring records |
| `08b-admin-monitoring.png` | `/admin` | Same local administrator page scrolled to monitoring charts |
| `09-about.png` | `/about` | Deployed website; supplemental public capture, not used in animation |
| `10-responsive-desktop.png` | `/` | Deployed website at 1440 × 900 |
| `11-responsive-tablet.png` | `/` | Deployed website at 768 × 1024 |
| `12-responsive-mobile.png` | `/` | Deployed website at 390 × 844 |

The result fixture intentionally contains no numeric confidence or patient disease probability. The urgent fixture shows no routine condition prediction. Captions and source labels are outside the browser screenshots; screenshot contents are only proportionally cropped or scaled. The logo image `respiracare-mark.png` is rendered from the repository's `public/favicon.svg`.

## Rebuild

`capture_screens.cjs` is the capture recipe. It requires Chromium, `playwright-core`, and a local copy of this frontend running at `http://127.0.0.1:5183`. Set `PLAYWRIGHT_CORE_PATH` to the installed `playwright-core` directory. It captures public pages from the deployed URL and intercepts API requests only in local browser contexts. No application source files or production data are changed.

With Pillow installed, regenerate the presentation from the retained screenshots:

```powershell
python docs/media/build_preview.py
```

The builder writes `respiracare-preview.gif` and `respiracare-preview.png`. It uses 14 visual states across nine scenes, including short crossfades and two views of longer pages. The browser panels are presentation framing; no interface text, scores, or results are drawn into the screenshots.
