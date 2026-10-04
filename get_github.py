import urllib.request, re
try:
    req = urllib.request.Request('https://21st.dev/?preview=/%40jahed/components/hero-1', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'https://github.com/[^"\']+', html)
    print(list(set(links)))
except Exception as e:
    print('Error:', e)
