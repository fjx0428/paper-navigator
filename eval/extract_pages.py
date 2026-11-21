#!/usr/bin/env python3
"""把已有笔记对应的 arXiv PDF 渲成翻页图片，并抽出较大的插图。"""

import json
import subprocess
from pathlib import Path

import fitz

ROOT = Path("/Users/leiyu/学科实践大作业")
NOTES = ROOT / "notes"
OUT = ROOT / "site" / "assets" / "papers"
TARGET_W = 1100


def ids():
    return sorted(p.stem for p in NOTES.glob("*.json") if len(p.stem) >= 9 and p.stem[4] == ".")


def download(arxiv_id: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 20_000 and dest.read_bytes()[:5] == b"%PDF-":
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://arxiv.org/pdf/{arxiv_id}"
    subprocess.run(
        ["curl", "-fL", "--retry", "5", "--retry-all-errors", "--retry-delay", "2",
         "-A", "paper-navigator/0.2", "-o", str(dest), url],
        check=True,
    )
    if dest.read_bytes()[:5] != b"%PDF-":
        dest.unlink(missing_ok=True)
        raise RuntimeError(f"{arxiv_id} 下载内容不是 PDF")


def render_pages(doc: fitz.Document, folder: Path) -> int:
    folder.mkdir(parents=True, exist_ok=True)
    for i, page in enumerate(doc):
        path = folder / f"p{i + 1:03d}.jpg"
        if path.exists() and path.stat().st_size > 8_000:
            continue
        zoom = TARGET_W / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        pix.save(str(path), jpg_quality=74)
    return doc.page_count


def extract_figures(doc: fitz.Document, folder: Path) -> list[dict]:
    seen: set[int] = set()
    found: list[dict] = []
    for pi, page in enumerate(doc):
        for img in page.get_images(full=True):
            xref = img[0]
            if xref in seen:
                continue
            seen.add(xref)
            try:
                info = doc.extract_image(xref)
            except Exception:
                continue
            w, h = int(info.get("width") or 0), int(info.get("height") or 0)
            if w < 320 or h < 180:
                continue
            ratio = w / max(h, 1)
            if ratio > 6 or ratio < 0.15:
                continue
            if w * h < 320 * 220:
                continue
            ext = info.get("ext") or "png"
            if ext not in ("png", "jpg", "jpeg"):
                ext = "png"
            found.append({
                "xref": xref,
                "page": pi + 1,
                "w": w,
                "h": h,
                "ext": "jpg" if ext == "jpeg" else ext,
                "bytes": info["image"],
            })
    found.sort(key=lambda item: item["w"] * item["h"], reverse=True)
    # 去掉几乎整页大的扫描图，留下真正的插图
    page_area = doc[0].rect.width * doc[0].rect.height
    kept = []
    for item in found:
        if item["w"] * item["h"] > page_area * 8:
            continue
        kept.append(item)
        if len(kept) >= 6:
            break
    figures = []
    for i, item in enumerate(kept, 1):
        name = f"f{i:02d}.{item['ext']}"
        (folder / name).write_bytes(item["bytes"])
        figures.append({"file": name, "page": item["page"], "w": item["w"], "h": item["h"]})
    return figures


def main() -> None:
    manifest = {}
    for arxiv_id in ids():
        folder = OUT / arxiv_id
        pdf = folder / "source.pdf"
        print(f"== {arxiv_id}", flush=True)
        download(arxiv_id, pdf)
        doc = fitz.open(pdf)
        pages = render_pages(doc, folder)
        figures = extract_figures(doc, folder)
        if not figures:
            ranked = sorted(
                ((len(page.get_drawings()), i) for i, page in enumerate(doc) if i > 0),
                reverse=True,
            )
            for _, i in ranked[:2]:
                if ranked and ranked[0][0] < 40:
                    break
                figures.append({"file": f"p{i + 1:03d}.jpg", "page": i + 1, "w": 0, "h": 0})
        doc.close()
        manifest[arxiv_id] = {"pages": pages, "figures": figures}
        print(f"   {pages} 页, {len(figures)} 张图", flush=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("manifest", len(manifest))


if __name__ == "__main__":
    main()
