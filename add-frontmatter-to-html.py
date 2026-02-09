#!/usr/bin/env python3
import os
import re

pages_dir = "content/pages/biografi/pages"

def pad3(n):
    return str(n).zfill(3)

# Process each HTML file
for filename in sorted(os.listdir(pages_dir)):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(pages_dir, filename)
    
    # Extract page number from filename (e.g., "001.html" -> 1)
    match = re.match(r'(\d+)\.html', filename)
    if not match:
        continue
    
    page_num = int(match.group(1))
    anchor = f"p-{pad3(page_num)}"
    
    # Read existing HTML content
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Create frontmatter
    frontmatter = f"""---
page:
  number: {page_num}
anchor: {anchor}
permalink: false
tags: [biografiPage]
layout: false
---
"""
    
    # Write file with frontmatter
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter + html_content)
    
    print(f"Added frontmatter to {filename}")

print(f"\nProcessed all HTML files in {pages_dir}")
