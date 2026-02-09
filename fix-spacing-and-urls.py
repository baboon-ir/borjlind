#!/usr/bin/env python3
"""
Fix spacing issues after Swedish characters and update media URLs
"""
import re
from pathlib import Path
import sys

def fix_spacing(text):
    """Fix spacing issues with Swedish characters"""
    
    # First pass: Fix space BEFORE Swedish chars (like "insj ö" -> "insjö")
    text = re.sub(r'(\w) å(\w)', r'\1å\2', text)
    text = re.sub(r'(\w) ä(\w)', r'\1ä\2', text)
    text = re.sub(r'(\w) ö(\w)', r'\1ö\2', text)
    text = re.sub(r'(\w) Å(\w)', r'\1Å\2', text)
    text = re.sub(r'(\w) Ä(\w)', r'\1Ä\2', text)
    text = re.sub(r'(\w) Ö(\w)', r'\1Ö\2', text)
    
    # Fix space after Swedish char at start of word (like "Ö stersjön" -> "Östersjön")
    text = re.sub(r'å (\w)', r'å\1', text)
    text = re.sub(r'ä (\w)', r'ä\1', text)
    text = re.sub(r'ö (\w)', r'ö\1', text)
    text = re.sub(r'Å (\w)', r'Å\1', text)
    text = re.sub(r'Ä (\w)', r'Ä\1', text)
    text = re.sub(r'Ö (\w)', r'Ö\1', text)
    
    # Fix space before Swedish char at end of word (like "p å" -> "på")
    text = re.sub(r'(\w) å(\s|[,.\?!:]|$)', r'\1å\2', text)
    text = re.sub(r'(\w) ä(\s|[,.\?!:]|$)', r'\1ä\2', text)
    text = re.sub(r'(\w) ö(\s|[,.\?!:]|$)', r'\1ö\2', text)
    
    # Second pass: Add MISSING spaces between compound words
    # Common patterns where two words are joined incorrectly
    
    # "wordöverword" -> "word över word" (ö+ver at word boundary)
    text = re.sub(r'([a-zåäö]{3,})över\s', r'\1 över ', text)
    text = re.sub(r'([a-zåäö]{3,})över([a-zåäö]{3,})', r'\1 över \2', text)
    
    # "Härinneär" -> "Härinne är", "detär" -> "det är", etc.
    text = re.sub(r'([a-zåäö]{3,})är\s', r'\1 är ', text)
    text = re.sub(r'([a-zåäö]{3,})är([A-ZÅÄÖ])', r'\1 är \2', text)
    
    # "wordåword" patterns (but not "två", "få", "gå", etc)
    text = re.sub(r'([a-zåäö]{4,})på([a-zåäö]{3,})', r'\1 på \2', text)
    text = re.sub(r'([a-zåäö]{4,})för([a-zåäö]{3,})', r'\1 för \2', text)
    text = re.sub(r'([a-zåäö]{3,})från([a-zåäö]{3,})', r'\1 från \2', text)
    
    # Specific common errors
    text = re.sub(r'Härinneär', 'Härinne är', text)
    text = re.sub(r'Detär', 'Det är', text)
    text = re.sub(r'Jagär', 'Jag är', text)
    text = re.sub(r'Hanär', 'Han är', text)
    text = re.sub(r'Honär', 'Hon är', text)
    text = re.sub(r'Viär', 'Vi är', text)
    text = re.sub(r'Deär', 'De är', text)
    text = re.sub(r'Domär', 'Dom är', text)
    text = re.sub(r'Duär', 'Du är', text)
    text = re.sub(r'utspriddaöver', 'utspridda över', text)
    text = re.sub(r'påatt', 'på att', text)
    text = re.sub(r'jagöver', 'jag över', text)
    text = re.sub(r'fåen', 'få en', text)
    text = re.sub(r'fådet', 'få det', text)
    text = re.sub(r'minaättelägg', 'mina ättelägg', text)
    text = re.sub(r'migåt', 'mig åt', text)
    text = re.sub(r'måsåvara', 'må så vara', text)
    text = re.sub(r'Kanskeär', 'Kanske är', text)
    text = re.sub(r'ocksåett', 'också ett', text)
    
    return text

def update_media_urls(text):
    """Update Cloudflare R2 URLs to new domain"""
    old_base = 'https://f94fd764a5845820accbbd2640674c66.r2.cloudflarestorage.com/rolf-borjlind'
    new_base = 'https://pub-511c9170c3a84a38827fa0aaa81fbdc9.r2.dev'
    
    # Replace old base URL with new one
    text = text.replace(old_base, new_base)
    
    return text

def process_file(filepath):
    """Process a single MD file"""
    try:
        # Read file
        content = filepath.read_text(encoding='utf-8')
        
        # Apply fixes
        original = content
        content = fix_spacing(content)
        content = update_media_urls(content)
        
        # Only write if changed
        if content != original:
            filepath.write_text(content, encoding='utf-8')
            print(f"✓ Fixed {filepath.name}")
            return True
        else:
            return False
        
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
    
    changed_count = 0
    for filepath in md_files:
        if process_file(filepath):
            changed_count += 1
    
    print(f"\n✓ Updated {changed_count}/{len(md_files)} files")

if __name__ == "__main__":
    main()
