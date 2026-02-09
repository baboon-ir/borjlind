#!/usr/bin/env python3
"""Third-pass fix: remaining på+word concatenations and other patterns."""

import re
import os
import glob

stats = {'total': 0}

def fix_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    match = re.match(r'^(---\n.*?\n---\n)(.*)', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        body = match.group(2)
    else:
        frontmatter = ''
        body = content

    # === 1. More "på" + words (missing from previous passes) ===
    # Add determiners that were missing
    pa_extra_words = (
        # Missing determiners/pronouns
        r'min\b|din\b|sin\b|vår\b|'
        r'honom\b|henne\b|'
        r'många\b|mycket\b|olika\b|'
        # Common nouns/adverbs after "på"
        r'väg\b|vägen\b|vägar\b|'
        r'golvet\b|golv\b|'
        r'grund\b|'
        r'scenen\b|scen\b|'
        r'plats\b|platsen\b|'
        r'riktigt\b|'
        r'kvällen\b|natten\b|morgonen\b|dagen\b|'
        r'tv\b|bio\b|'
        r'jobb\b|jobbet\b|'
        r'varann\b|varandra\b|'
        r'ryggen\b|magen\b|näsan\b|'
        r'bänken\b|bänkarna\b|'
        r'torget\b|gatan\b|'
        r'hotellet\b|hotell\b|'
        r'restaurangen\b|restaurang\b|'
        r'flygplatsen\b|stationen\b|'
        r'kontoret\b|'
        r'rutan\b|fönstret\b|'
        r'höger\b|vänster\b|'
        r'nytt\b|'
        r'förhand\b|'
        r'fredagen\b|lördagen\b|söndagen\b|'
        r'måndagen\b|tisdagen\b|onsdagen\b|torsdagen\b|'
        r'sommaren\b|hösten\b|vintern\b|våren\b|'
        r'hög\b|'
        r'avstånd\b|'
        r'semester\b|'
        r'besök\b|'
        r'tal\b|'
        r'svenska\b|engelska\b|danska\b|norska\b|'
        r'insidan\b|utsidan\b|'
        r'marken\b|'
        r'stan\b|'
        r'papper\b|pappret\b|'
        r'botten\b|'
        r'halsen\b|'
        r'isen\b|'
        r'fotboll\b|'
        r'kamelpiss\b|'
        r'vaggande\b|'
        r'kort\b'
    )
    for prep in ['på', 'På']:
        count = len(re.findall(prep + r'(' + pa_extra_words + r')', body))
        stats['total'] += count
        body = re.sub(prep + r'(' + pa_extra_words + r')', prep + r' \1', body)

    # === 2. Common word + öl/ör/öv concatenations ===
    specific_fixes = [
        # en + ö-words
        (r'\benöl\b', 'en öl'),
        (r'\benöl,', 'en öl,'),
        (r'\benöversättning\b', 'en översättning'),
        (r'\benörfil\b', 'en örfil'),
        # dricker + öl
        (r'\bdrickeröl\b', 'dricker öl'),
        (r'\bvarsinöl\b', 'varsin öl'),
        (r'\bsinaöl\b', 'sina öl'),
        (r'\bvåraöl\b', 'våra öl'),
        (r'\bpånyöl\b', 'på ny öl'),
        # Common word joins at ä boundary
        (r'\bBegravningenäger\b', 'Begravningen äger'),
        (r'\bCarstensänka\b', 'Carstens änka'),
        (r'\bdåfråga\b', 'då fråga'),
        (r'\bdenärevördiga\b', 'den ärevördiga'),
        (r'\benäldre\b', 'en äldre'),
        # Common word joins at å boundary
        (r'\bpånyöl\b', 'på ny öl'),
        (r'\bViåker\b', 'Vi åker'),  # may have been caught already
        (r'\bviåker\b', 'vi åker'),
        (r'\bdiskretåt\b', 'diskret åt'),
        (r'\bkommitöver\b', 'kommit över'),
        (r'\bgåigenom\b', 'gå igenom'),
        (r'\bkännsödsligt\b', 'känns ödsligt'),
        # "över spända" etc.
        (r'\böver spända\b', 'överspända'),
        (r'\bgräns över skridande\b', 'gränsöverskridande'),
        # poetenÅke etc. (missed by previous capital fixes?)
        (r'\btrummisÅke\b', 'trummis Åke'),
        (r'\bpoeten Åke\b', 'poeten Åke'),  # likely already correct
        # "Så" + words that weren't caught
        (r' Såsätter\b', ' Så sätter'),
        (r'"Såsätter\b', '"Så sätter'),
        # Ni + är
        (r'\bNiär\b', 'Ni är'),
        # Men + år
        (r'\bMenåret\b', 'Men året'),
        # Iställetå
        (r'\bIställetå', 'Istället å'),
        (r'\biställetå', 'istället å'),
    ]
    for pattern, replacement in specific_fixes:
        count = len(re.findall(pattern, body))
        stats['total'] += count
        body = re.sub(pattern, replacement, body)

    # === 3. "så" + more words ===
    sa_extra = r'här\b|där\b|kallad\b|kallade\b|kallat\b|kallas\b'
    count = len(re.findall(r'så(' + sa_extra + r')', body))
    stats['total'] += count
    body = re.sub(r'så(' + sa_extra + r')', r'så \1', body)

    # === 4. "också" + more patterns ===
    # också + att/har/hade etc.
    body = re.sub(r'också(att\b)', r'också \1', body)
    body = re.sub(r'också(har\b)', r'också \1', body)
    body = re.sub(r'också(hade\b)', r'också \1', body)

    # === 5. Fix case for number words (Tvåunga → Två unga, not två unga) ===
    # Capitalize first letter if at start of sentence (after ". " or at line start)
    body = re.sub(r'(?:^|(?<=\. ))två ', 'Två ', body, flags=re.MULTILINE)
    body = re.sub(r'(?:^|(?<=\. ))flera ', 'Flera ', body, flags=re.MULTILINE)
    body = re.sub(r'(?:^|(?<=\. ))många ', 'Många ', body, flags=re.MULTILINE)

    # === 6. Clean up blank lines ===
    body = re.sub(r'\n{3,}', '\n\n', body)

    content = frontmatter + body
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

pages_dir = '/Users/hakanfilip/Documents/borjlind/content/pages/biografi/pages/'
files = sorted(glob.glob(os.path.join(pages_dir, 'page-*.md')))

changed = 0
for f in files:
    if fix_page(f):
        changed += 1

print(f'Files changed: {changed} / {len(files)}')
print(f'Total fixes: {stats["total"]}')
