#!/usr/bin/env python3
"""
Import script for biography pages
Splits a single MD file with ## Page N/276 headers into individual page files
"""

import re
import os
from pathlib import Path

def parse_biography_file(input_file):
    """Parse the input file and split by page markers"""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by page markers: ## Page N/276
    pages = re.split(r'\n---\n+##\s*Page\s+(\d+)/276\s*\n', content)
    
    # First element is content before first page (ignore it)
    # Rest alternates: page_number, page_content, page_number, page_content...
    parsed_pages = []
    for i in range(1, len(pages), 2):
        if i + 1 < len(pages):
            page_num = int(pages[i])
            page_content = pages[i + 1].strip()
            parsed_pages.append((page_num, page_content))
    
    return parsed_pages

def create_page_file(page_num, content, output_dir):
    """Create a single page MD file with proper frontmatter"""
    # Pad page number to 3 digits
    page_str = str(page_num).zfill(3)
    anchor = f"p-{page_str}"
    
    # Create frontmatter
    frontmatter = f"""---
page:
  number: {page_num}
anchor: {anchor}
permalink: false
tags: [biografiPage]
---

"""
    
    # Write file
    output_file = output_dir / f"{page_str}.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(frontmatter + content)
    
    print(f"Created: {output_file.name}")

def main():
    # Configure paths
    script_dir = Path(__file__).parent
    input_file = script_dir / "assets/biografi_full_export.md"
    output_dir = script_dir / "content/pages/biografi/pages"
    
    # Verify input file exists
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Parse and create files
    print(f"Parsing {input_file}...")
    pages = parse_biography_file(input_file)
    
    print(f"\nFound {len(pages)} pages. Creating files...")
    for page_num, content in pages:
        create_page_file(page_num, content, output_dir)
    
    print(f"\n✓ Successfully created {len(pages)} biography page files!")
    print(f"Output directory: {output_dir}")

if __name__ == "__main__":
    main()
