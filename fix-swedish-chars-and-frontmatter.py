#!/usr/bin/env python3
"""
Fix Swedish characters and update frontmatter in biography MD files
"""
import re
from pathlib import Path
import sys

def fix_swedish_characters(text):
    """Fix split Swedish characters (å, ä, ö)"""
    # Fix lowercase with space-separated entities
    text = text.replace(' å ', 'å')
    text = text.replace(' ä ', 'ä')
    text = text.replace(' ö ', 'ö')
    
    # Fix uppercase with space-separated entities  
    text = text.replace(' Å ', 'Å')
    text = text.replace(' Ä ', 'Ä')
    text = text.replace(' Ö ', 'Ö')
    
    # Also fix without spaces (just in case)
    text = text.replace('å', 'å')
    text = text.replace('ä', 'ä')
    text = text.replace('ö', 'ö')
    text = text.replace('Å', 'Å')
    text = text.replace('Ä', 'Ä')
    text = text.replace('Ö', 'Ö')
    
    return text

def update_frontmatter(content, page_num):
    """Update frontmatter to match expected format"""
    # Remove old frontmatter
    content = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL)
    
    # Create new frontmatter
    anchor = f"p-{page_num:03d}"
    new_frontmatter = f"""---
page:
  number: {page_num}
anchor: {anchor}
permalink: false
tags: [biografiPage]
layout: biography
---
"""
    
    return new_frontmatter + content.strip() + '\n'

def process_file(filepath):
    """Process a single MD file"""
    # Extract page number from filename (page-1.md -> 1)
    match = re.search(r'page-(\d+)\.md$', filepath.name)
    if not match:
        print(f"Skipping {filepath.name} - couldn't extract page number")
        return False
    
    page_num = int(match.group(1))
    
    try:
        # Read file
        content = filepath.read_text(encoding='utf-8')
        
        # Fix Swedish characters
        content = fix_swedish_characters(content)
        
        # Update frontmatter
        content = update_frontmatter(content, page_num)
        
        # Write back
        filepath.write_text(content, encoding='utf-8')
        
        print(f"✓ Fixed {filepath.name} (page {page_num})")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {filepath.name}: {e}")
        return False

def main():
    script_dir = Path(__file__).parent
    pages_dir = script_dir / "content/pages/biografi/pages"
    
    if not pages_dir.exists():
        print(f"Error: Directory not found: {pages_dir}")
        sys.exit(1)
    
    # Find all page-*.md files
    md_files = sorted(pages_dir.glob("page-*.md"), key=lambda p: int(re.search(r'(\d+)', p.stem).group(1)))
    
    if not md_files:
        print(f"No page-*.md files found in {pages_dir}")
        sys.exit(1)
    
    print(f"Found {len(md_files)} MD files to process\n")
    
    success_count = 0
    for filepath in md_files:
        if process_file(filepath):
            success_count += 1
    
    print(f"\n✓ Successfully processed {success_count}/{len(md_files)} files")

if __name__ == "__main__":
    main()
