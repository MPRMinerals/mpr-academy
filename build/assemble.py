#!/usr/bin/env python3
"""Assemble the self contained index.html from the parts in build/ and brand/."""
import io, os, base64, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB  = '/tmp/claude-0/-home-user-mpr-academy/043b3efc-47fd-546d-8758-e2e3de106b4d/scratchpad/libs/package/dist/'
read = lambda p: io.open(p, encoding='utf-8').read()
b64  = lambda p: base64.b64encode(open(p, 'rb').read()).decode()

os.chdir(ROOT)
css, body = read('build/style.css'), read('build/body.html')
i18n, site = read('build/i18n.js'), read('build/site.js')
libs = [read(LIB + f) for f in ('gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js', 'lenis.min.js')]

assets = (":root{\n"
          "  --logo:url(data:image/webp;base64," + b64('brand/logo.webp') + ");\n"
          "  --kuba:url(data:image/webp;base64," + b64('brand/kuba-strip.webp') + ");\n"
          "}\n")

head = read('build/head.html').replace('__FAV__', b64('brand/favicon.png'))
scripts = "".join("<script>\n" + s + "\n</script>\n" for s in libs + [i18n, site])

html = (head.replace('__STYLE__', assets + css)
        + '<body class="no-video no-video-band">\n' + body + '\n' + scripts + '</body>\n</html>\n')

io.open('index.html', 'w', encoding='utf-8').write(html)
bad = html.count('—') + html.count('–')
print('index.html %d KB, dashes %d' % (os.path.getsize('index.html') // 1024, bad))
if bad: sys.exit('FAIL: em or en dash present')
