#!/usr/bin/env python3
"""Apply conservative whitespace/typography fixes to biography chapter sources."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CHAPTERS_DIR = ROOT / "content/pages/biografi/chapters"


def split_frontmatter(content: str) -> tuple[str, str]:
    match = re.match(r"^(---\n.*?\n---\n)(.*)$", content, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return "", content


def apply_patterns(body: str) -> str:
    replacements = [
        (r"\butöver en\b", "ut över en"),
        (r"\butöver salen\b", "ut över salen"),
        (r"\butöver duken\b", "ut över duken"),
        (r"\butöver Lost Lake\b", "ut över Lost Lake"),
        (r"\butöver platsen\b", "ut över platsen"),
        (r"\bpånätet\b", "på nätet"),
        (r"\bpånätterna\b", "på nätterna"),
        (r"\bpånattåget\b", "på nattåget"),
        (r"\bpåmellanstadiet\b", "på mellanstadiet"),
        (r"\bpåtonfall\b", "på tonfall"),
        (r"\bpåtavelduken\b", "på tavelduken"),
        (r"\bpåväggarna\b", "på väggarna"),
        (r"\bgenomåren\b", "genom åren"),
        (r"\bMalmömed\b", "Malmö med"),
        (r"\bdom häråren\b", "dom här åren"),
        (r"\bliteåt\b", "lite åt"),
        (r"\bgåtätt\b", "gå tätt"),
        (r"\bpåskådespelaren\b", "på skådespelaren"),
        (r"\bpåkonstnären\b", "på konstnären"),
        (r"\bpåjust\b", "på just"),
        (r"\bpågatan\b", "på gatan"),
        (r"\bpågolvet\b", "på golvet"),
        (r"\bpåplatsen\b", "på platsen"),
        (r"\bpåbio\b", "på bio"),
        (r"\bpåjobb(et)?\b", r"på jobb\1"),
        (r"\bpåtv\b", "på tv"),
        (r"\bdåoch då\b", "då och då"),
        (r"\b38år\b", "38 år"),
        (r"\b24år\b", "24 år"),
        (r"\btrettioår\b", "trettio år"),
    ]
    for pattern, replacement in replacements:
        body = re.sub(pattern, replacement, body)

    # General conservative spacing repairs.
    body = re.sub(r"(?<![A-Za-zÅÄÖåäö])På([a-zåäö]{3,})\b", r"På \1", body)
    body = re.sub(r"(?<![A-Za-zÅÄÖåäö])på([a-zåäö]{3,})\b", r"på \1", body)
    body = re.sub(r"(?<![A-Za-zÅÄÖåäö])genom([a-zåäö]{3,})\b", r"genom \1", body)
    body = re.sub(r"(?<![A-Za-zÅÄÖåäö])lite([a-zåäö]{2,})\b", r"lite \1", body)

    # OCR-like missing spaces after punctuation or between words.
    body = re.sub(r"([a-zåäö])([A-ZÅÄÖ])", r"\1 \2", body)
    body = re.sub(r",([A-Za-zÅÄÖåäö])", r", \1", body)

    # Restore common words seen in production.
    body = body.replace("utöver en liten insjö", "ut över en liten insjö")
    body = body.replace("På nattåget", "På nattåget")
    body = body.replace("på nätet", "på nätet")
    body = body.replace("genom åren", "genom åren")
    body = body.replace("på tonfall", "på tonfall")
    body = body.replace("gå tätt", "gå tätt")

    return body


def fix_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(original)
    updated = frontmatter + apply_patterns(body)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    files = sorted(CHAPTERS_DIR.glob("chapter-*.md"))
    changed = 0
    for path in files:
        if fix_file(path):
            changed += 1
    print(f"files_changed={changed}")


if __name__ == "__main__":
    main()
