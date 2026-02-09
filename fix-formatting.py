#!/usr/bin/env python3
"""Fix formatting issues in biography page files.

Issues fixed:
1. Broken bold-italic chars: *** *** → merged
2. Broken bold chars: ** ** → merged
3. Broken italic chars: * * → merged
4. ::: indent / true / ::: artifact blocks → removed
5. --- horizontal rules inside text → removed
6. Dialogue "- " at line start → "– " (en-dash) to avoid bullet lists
7. Excessive blank lines → cleaned up
"""

import re
import os
import glob

stats = {
    'bold_italic_merge': 0,
    'bold_merge': 0,
    'italic_merge': 0,
    'true_blocks': 0,
    'hr_removed': 0,
    'dialogue_fixed': 0,
}


def fix_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Split frontmatter from body
    match = re.match(r'^(---\n.*?\n---\n)(.*)', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        body = match.group(2)
    else:
        frontmatter = ''
        body = content

    # 1. Merge broken bold-italic (*** ***)
    count = len(re.findall(r'\*\*\* \*\*\*', body))
    stats['bold_italic_merge'] += count
    body = re.sub(r'\*\*\* \*\*\*', '', body)

    # 2. Merge broken bold (** **)
    # Negative lookbehind/lookahead ensures exactly 2 stars (not 3)
    count = len(re.findall(r'(?<!\*)\*\*(?!\*) (?<!\*)\*\*(?!\*)', body))
    stats['bold_merge'] += count
    body = re.sub(r'(?<!\*)\*\*(?!\*) (?<!\*)\*\*(?!\*)', '', body)

    # 3. Merge broken italic (* *)
    # Negative lookbehind/lookahead ensures exactly 1 star (not 2+)
    count = len(re.findall(r'(?<!\*)\*(?!\*) (?<!\*)\*(?!\*)', body))
    stats['italic_merge'] += count
    body = re.sub(r'(?<!\*)\*(?!\*) (?<!\*)\*(?!\*)', '', body)

    # 4. Remove ::: indent / true / ::: blocks (artifact from import)
    count = len(re.findall(r'::: indent\s*\n\s*true\s*\n:::', body))
    stats['true_blocks'] += count
    body = re.sub(r'::: indent\s*\n\s*true\s*\n:::', '', body)

    # 5. Remove --- horizontal rules (standalone lines, not frontmatter)
    count = len(re.findall(r'\n---\s*\n', body))
    stats['hr_removed'] += count
    body = re.sub(r'\n+---\s*\n+', '\n\n', body)
    # Also handle --- at end of file
    body = re.sub(r'\n+---\s*$', '\n', body)

    # 6. Fix dialogue: "- " at start of line → "– " (en-dash)
    count = len(re.findall(r'^\s*- ', body, re.MULTILINE))
    stats['dialogue_fixed'] += count
    body = re.sub(r'^(\s*)- ', r'\1– ', body, flags=re.MULTILINE)

    # 7. Clean up excessive blank lines (max 1 blank line between paragraphs)
    body = re.sub(r'\n{3,}', '\n\n', body)

    content = frontmatter + body

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


# Process all page files
pages_dir = '/Users/hakanfilip/Documents/borjlind/content/pages/biografi/pages/'
files = sorted(glob.glob(os.path.join(pages_dir, 'page-*.md')))

changed = 0
for f in files:
    if fix_page(f):
        changed += 1

print(f'Files changed: {changed} / {len(files)}')
print(f'Bold-italic merges: {stats["bold_italic_merge"]}')
print(f'Bold merges: {stats["bold_merge"]}')
print(f'Italic merges: {stats["italic_merge"]}')
print(f'True blocks removed: {stats["true_blocks"]}')
print(f'Horizontal rules removed: {stats["hr_removed"]}')
print(f'Dialogue lines fixed: {stats["dialogue_fixed"]}')
