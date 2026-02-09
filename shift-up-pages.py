#!/usr/bin/env python3
"""
Shift biography pages UP by 1
001.md becomes 002.md, 002.md becomes 003.md, etc.
Updates frontmatter accordingly.
"""

import re
from pathlib import Path

def shift_up_pages():
    pages_dir = Path("content/pages/biografi/pages")
    
    # First, read all files that need to be shifted (001-275)
    files_to_process = []
    for i in range(1, 276):
        old_file = pages_dir / f"{i:03d}.md"
        if old_file.exists():
            files_to_process.append((i, old_file))
    
    print(f"Found {len(files_to_process)} files to shift up")
    
    # Process in FORWARD order (start from highest number)
    files_to_process.reverse()
    
    for old_num, old_file in files_to_process:
        new_num = old_num + 1
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
        
        print(f"Shifted: {old_file.name} → {new_file.name}")
    
    # Delete the old 001.md (which is now in 002.md)
    old_001 = pages_dir / "001.md"
    if old_001.exists():
        old_001.unlink()
        print(f"Deleted: 001.md")
    
    print(f"\n✓ Successfully shifted {len(files_to_process)} pages up!")
    print("Total pages now: 275 (002-276)")
    print("You can now create 001.md with your new content")

if __name__ == "__main__":
    shift_up_pages()
