#!/usr/bin/env python3
"""
Renumber biography pages: shift all pages down by 1
002.md becomes 001.md, 003.md becomes 002.md, etc.
Updates frontmatter accordingly.
"""

import re
from pathlib import Path

def renumber_pages():
    pages_dir = Path("content/pages/biografi/pages")
    
    # First, read all files that need to be renumbered (002-276)
    files_to_process = []
    for i in range(2, 277):
        old_file = pages_dir / f"{i:03d}.md"
        if old_file.exists():
            files_to_process.append((i, old_file))
    
    print(f"Found {len(files_to_process)} files to renumber")
    
    # Process in reverse order to avoid conflicts
    files_to_process.reverse()
    
    for old_num, old_file in files_to_process:
        new_num = old_num - 1
        new_file = pages_dir / f"{new_num:03d}.md"
        
        # Read content
        with open(old_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update frontmatter
        # Replace page number
        content = re.sub(
            r'number: \d+',
            f'number: {new_num}',
            content,
            count=1
        )
        
        # Replace anchor
        old_anchor = f"p-{old_num:03d}"
        new_anchor = f"p-{new_num:03d}"
        content = re.sub(
            rf'anchor: {old_anchor}',
            f'anchor: {new_anchor}',
            content,
            count=1
        )
        
        # Write to new location
        with open(new_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Renamed: {old_file.name} → {new_file.name}")
    
    # Delete the old 276.md (which is now empty/duplicate)
    old_276 = pages_dir / "276.md"
    if old_276.exists():
        old_276.unlink()
        print(f"Deleted: 276.md")
    
    print(f"\n✓ Successfully renumbered {len(files_to_process)} pages!")
    print("Total pages now: 275 (001-275)")

if __name__ == "__main__":
    renumber_pages()
