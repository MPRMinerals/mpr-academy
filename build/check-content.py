#!/usr/bin/env python3
"""Content constraints for the MPR site. Run from the repository root."""
import io, re, sys

body = io.open('build/body.html', encoding='utf-8').read()
dic  = io.open('build/i18n.js',  encoding='utf-8').read()
head = io.open('build/head.html', encoding='utf-8').read()
full = io.open('index.html',      encoding='utf-8').read()
content = body + dic + head
low = re.sub(r'<[^>]+>', ' ', content).lower()

res = []
def ok(name, cond):
    print(('  ok   ' if cond else '  FAIL ') + name); res.append(cond)

ok('no warehouse operator name',
   not any(b in low for b in ['bollor', 'dp world', 'ctrade', 'grindrod']))
t = sorted(set(re.sub(r'[^\d]', '', x) for x in re.findall(r'\b[\d.,\s]{1,8}\s*(?:MT|TM)\b', content)))
ok('tonnage figures are Kambove build targets only ' + str(t), t == ['5000', '60000'])
ok('no currency figure',
   not re.findall(r'\b(?:usd|eur|gbp)\b\s*[\d.,]+|[$\u20ac\u00a3]\s?[\d.,]+', low))
p = sorted(set(x for x in re.findall(r'(\d+(?:[.,]\d+)?)\s*(?:percent|per cent|%|pour cent|por ciento)', low)
               if not x.startswith('99')))
ok('only the 2 percent performance bond is published ' + str(p), p == ['2'])
ok('advance payment percentage withheld',
   'agreed percentage' in low and not re.search(r'advance payment[^.]{0,60}\d+\s*(percent|%)', low))
ok('no SWIFT, IBAN or account number', not re.search(r'\b(swift|iban|bic)\b', low))
ok('no licence or registry number', not re.search(r'(licence|license|registry)\s*(no\b|number|#)', low))
ok('no em or en dash in the delivered file', '\u2014' not in full and '\u2013' not in full)
ok('three working languages only', len(re.findall(r'data-lang="', full)) == 6)
ok('copyright reads 2022', 'Copyright 2022 MPR Minerals Group' in full)
ok('external requests are Google Fonts only',
   all('fonts.g' in u for u in set(re.findall(r'(?:src|href)="(https?://[^"]+)"', full))))
ok('each brand asset embedded once',
   full.count('--logo:url(data:image/webp') == 1 and full.count('data:image/webp;base64,') == 2)
ok('purity is a range in all three languages',
   '99.97 to 99.99' in full and '99,97 \u00e0 99,99' in full and '99,97 a 99,99' in full)
ok('all three legal entities named',
   all(x in full for x in ['MPR Mine-Rals for Non-Ferrous Metal Trading Co. LLC',
                           'MPR Minerals Limited', 'MPR Minerals LLC']))
ok('Dallas given its own presence', full.count('Dallas') >= 5)
ok('leadership referenced by function only',
   'chief executive' in low and 'chief operating officer' in low and 'chief legal' in low)

print('\n%d of %d' % (sum(res), len(res)))
sys.exit(0 if all(res) else 1)
