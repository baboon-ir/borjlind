#!/usr/bin/env python3
"""Second-pass fix: missing spaces and split words in biography pages.

Issues fixed:
1. Split words with space around é: "kabar é n" → "kabarén"
2. Split words with space before ö/ä: "beh över" → "behöver"
3. Word ending in å/ö/ä + Capital letter (missing space)
4. "på/så/då" + ö/ä/å word → insert space (always safe)
5. "på" + common determiners without space: "påen" → "på en"
6. "så/då/också" + common words → insert space
7. Dialogue dash without space: "-Är" → "– Är"
8. Missing space after comma
9. Common number/quantity word concatenations
10. Pronoun concatenations: "viär" → "vi är"
"""

import re
import os
import glob

stats = {
    'e_acute_fixes': 0,
    'split_word_fixes': 0,
    'ao_capital_fixes': 0,
    'prep_aao_fixes': 0,
    'pa_space_fixes': 0,
    'sa_space_fixes': 0,
    'da_space_fixes': 0,
    'ocksa_space_fixes': 0,
    'dialogue_nospace': 0,
    'comma_space': 0,
    'number_word': 0,
    'misc_fixes': 0,
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

    # === 1. Fix split words around é ===
    count = len(re.findall(r'(\w) é', body))
    stats['e_acute_fixes'] += count
    body = re.sub(r'(\w) é', r'\1é', body)
    body = re.sub(r'é ([a-zåäö])', r'é\1', body)

    # === 2. Fix specific split words (space inserted within word) ===
    split_words = [
        (r'\bbeh över', 'behöver'),
        (r'\bkonstn är', 'konstnär'),
        (r'\bkarakt är', 'karaktär'),
        (r'\bimagin är', 'imaginär'),
        (r'\bpopul är', 'populär'),
        (r'\bför fattare', 'författare'),
        (r'\bför fattarna', 'författarna'),
        (r'\bför fattarnas', 'författarnas'),
        (r'\bhuvud för fattare', 'huvudförfattare'),
        (r'\bhuvud för fattarna', 'huvudförfattarna'),
        (r'\blikst ä lldhet', 'likställdhet'),
        (r'\bvänskaps för hållande', 'vänskapsförhållande'),
        (r'\bför hållande', 'förhållande'),
    ]
    for pattern, replacement in split_words:
        count = len(re.findall(pattern, body, re.IGNORECASE))
        stats['split_word_fixes'] += count
        body = re.sub(pattern, replacement, body, flags=re.IGNORECASE)

    # === 3. Word ending in å/ö/ä + Capital letter → insert space ===
    for char in ['å', 'ö', 'ä']:
        count = len(re.findall(r'([a-zåäö])' + char + r'([A-ZÅÄÖ])', body))
        stats['ao_capital_fixes'] += count
        body = re.sub(r'([a-zåäö])' + char + r'([A-ZÅÄÖ])', r'\1' + char + r' \2', body)

    # === 4. "på/så/då" + word starting with ö/ä/å → always insert space ===
    # No Swedish compound starts with på+ö, på+ä, på+å, etc.
    for prep in ['på', 'så', 'då']:
        for char in ['ö', 'ä', 'å']:
            pattern = prep + char + r'([a-zåäö])'
            count = len(re.findall(pattern, body))
            stats['prep_aao_fixes'] += count
            body = re.sub(pattern, prep + ' ' + char + r'\1', body)
        # Also capital versions at start of sentence
        prep_cap = prep[0].upper() + prep[1:]
        for char in ['ö', 'ä', 'å', 'Ö', 'Ä', 'Å']:
            pattern = prep_cap + char + r'([a-zåäöA-ZÅÄÖ])'
            count = len(re.findall(pattern, body))
            stats['prep_aao_fixes'] += count
            body = re.sub(pattern, prep_cap + ' ' + char + r'\1', body)

    # === 5. "på" + common determiners/pronouns → insert space ===
    pa_words = (
        r'en\b|ett\b|den\b|det\b|dom\b|dem\b|'
        r'hans\b|hennes\b|sitt\b|ditt\b|mitt\b|'
        r'vårt\b|våra\b|sina\b|deras\b|'
        r'mig\b|dig\b|sig\b|oss\b|'
        r'nåt\b|något\b|nån\b|någon\b|några\b|'
        r'varje\b|alla\b|samma\b|'
        r'nya\b|nytt\b|allt\b|'
        r'andra\b|tredje\b|fjärde\b|'
        r'vilka\b|vilken\b|vilket\b'
    )
    # Match "på" + word anywhere (no lookbehind needed - word list is safe)
    count = len(re.findall(r'på(' + pa_words + ')', body))
    stats['pa_space_fixes'] += count
    body = re.sub(r'på(' + pa_words + ')', r'på \1', body)
    # Capital version
    count = len(re.findall(r'På(' + pa_words + ')', body))
    stats['pa_space_fixes'] += count
    body = re.sub(r'På(' + pa_words + ')', r'På \1', body)

    # === 6. "så" + common words → insert space ===
    sa_words = (
        r'mycket\b|dumt\b|gott\b|fort\b|sent\b|'
        r'djupt\b|snabbt\b|grymma\b|grym\b|'
        r'kallad\b|kallade\b|kallat\b|kallas\b|'
        r'länge\b|vida\b|enkelt\b|'
        r'dant\b|här\b|där\b|'
        r'mycke\b|'
        r'klart\b|kallt\b|illa\b|'
        r'hårt\b|litet\b'
    )
    count = len(re.findall(r'(?<![A-ZÅÄÖ])så(' + sa_words + ')', body))
    stats['sa_space_fixes'] += count
    body = re.sub(r'(?<![A-ZÅÄÖ])så(' + sa_words + ')', r'så \1', body)

    # "Så" at start of line or after ". " + common words
    sa_start_words = (
        r'vi\b|han\b|hon\b|dom\b|jag\b|du\b|ni\b|'
        r'enkelt\b|sätter\b|började\b|var\b|'
        r'mycket\b|fort\b|sent\b|gott\b|'
        r'länge\b|vida\b|'
        r'småningom\b|'
        r'kallad\b|kallade\b|kallat\b'
    )
    count = len(re.findall(r'(?:^|(?<=\. )|(?<= ))Så(' + sa_start_words + ')', body, re.MULTILINE))
    stats['sa_space_fixes'] += count
    body = re.sub(r'(?:^|(?<=\. )|(?<= ))Så(' + sa_start_words + ')',
                  lambda m: 'Så ' + m.group(1), body, flags=re.MULTILINE)

    # === 7. "då" + common words → insert space ===
    da_words = r'en\b|ett\b|den\b|det\b|vi\b|han\b|hon\b|jag\b|dom\b|var\b'
    count = len(re.findall(r'(?<=[a-zåäö, ])då(' + da_words + ')', body))
    stats['da_space_fixes'] += count
    body = re.sub(r'(?<=[a-zåäö, ])då(' + da_words + ')', r'då \1', body)

    # === 8. "också" + words → insert space ===
    ocksa_words = (
        r'en\b|ett\b|den\b|det\b|dom\b|'
        r'han\b|hon\b|jag\b|vi\b|du\b|'
        r'nåt\b|nån\b|med\b|för\b|till\b|vid\b|från\b|'
        r'att\b|som\b|har\b|hade\b|ska\b|kan\b|var\b|'
        r'mycket\b|lite\b|mer\b|'
        r'[A-ZÅÄÖ]'
    )
    count = len(re.findall(r'också(' + ocksa_words + ')', body))
    stats['ocksa_space_fixes'] += count
    body = re.sub(r'också(' + ocksa_words + ')', r'också \1', body)

    # "dessutom" + lowercase word
    body = re.sub(r'dessutom([a-zåäö])', r'dessutom \1', body)

    # === 9. Dialogue dash without space ===
    count = len(re.findall(r'^(\s*)-([A-ZÅÄÖ])', body, re.MULTILINE))
    stats['dialogue_nospace'] += count
    body = re.sub(r'^(\s*)-([A-ZÅÄÖ])', r'\1– \2', body, flags=re.MULTILINE)

    # === 10. Missing space after comma ===
    # Only when followed by a letter (not numbers, not inside quotes)
    count = len(re.findall(r',([a-zåäöA-ZÅÄÖ])', body))
    stats['comma_space'] += count
    body = re.sub(r',([a-zåäöA-ZÅÄÖ])', r', \1', body)

    # === 11. Common number/quantity word concatenations (case-insensitive) ===
    number_patterns = [
        (r'(?i)flera(år\b|gånger\b)', r'flera \1'),
        (r'(?i)två(stycken\b|timmar\b|mil\b|unga\b|veckor\b|dagar\b|månader\b|nätter\b)', r'två \1'),
        (r'(?i)tre(stycken\b|timmar\b|veckor\b|dagar\b)', r'tre \1'),
        (r'(?i)många(år\b|gånger\b)', r'många \1'),
    ]
    for pattern, replacement in number_patterns:
        count = len(re.findall(pattern, body))
        stats['number_word'] += count
        body = re.sub(pattern, replacement, body)

    # === 12. Pronoun/verb concatenations ===
    misc_patterns = [
        # Pronoun + "är" (very common OCR artifact)
        (r'\bviär\b', 'vi är'),
        (r'\bViår\b', 'Vi år'),  # careful - could also be "Vi åker"
        (r'\bnuär\b', 'nu är'),
        (r'\bdåär\b', 'då är'),
        (r'\bNiär\b', 'Ni är'),
        (r'\bdenär\b', 'den är'),
        (r'\bdetär\b', 'det är'),
        (r'\bhanär\b', 'han är'),
        (r'\bhonär\b', 'hon är'),
        # "och" + å-word
        (r'\bochåker\b', 'och åker'),
        (r'\bochåkte\b', 'och åkte'),
        (r'\bochåt\b', 'och åt'),
        (r'\bochår\b', 'och år'),
        # "Vi" + å-word
        (r'\bViåker\b', 'Vi åker'),
        (r'\bViåkte\b', 'Vi åkte'),
        (r'\bviåker\b', 'vi åker'),
        (r'\bviåkte\b', 'vi åkte'),
        # Common verb concatenations
        (r'\bgåigenom\b', 'gå igenom'),
        # "Men" + å-word
        (r'\bMenåret\b', 'Men året'),
        (r'\bmenår\b', 'men år'),
        # "under" + å-word
        (r'\bunderåret\b', 'under året'),
        (r'\bunderåren\b', 'under åren'),
        # Iställetå → Istället å
        (r'\bIställetå', 'Istället å'),
        (r'\biställetå', 'istället å'),
    ]
    for pattern, replacement in misc_patterns:
        count = len(re.findall(pattern, body))
        stats['misc_fixes'] += count
        body = re.sub(pattern, replacement, body)

    # === 13. Clean up excessive blank lines ===
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
print(f'é space fixes: {stats["e_acute_fixes"]}')
print(f'Split word fixes: {stats["split_word_fixes"]}')
print(f'å/ö/ä + Capital fixes: {stats["ao_capital_fixes"]}')
print(f'Prep + å/ö/ä word fixes: {stats["prep_aao_fixes"]}')
print(f'på + space fixes: {stats["pa_space_fixes"]}')
print(f'så + space fixes: {stats["sa_space_fixes"]}')
print(f'då + space fixes: {stats["da_space_fixes"]}')
print(f'också + space fixes: {stats["ocksa_space_fixes"]}')
print(f'Dialogue no-space fixes: {stats["dialogue_nospace"]}')
print(f'Comma space fixes: {stats["comma_space"]}')
print(f'Number word fixes: {stats["number_word"]}')
print(f'Misc fixes: {stats["misc_fixes"]}')
