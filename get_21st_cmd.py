import urllib.request
import re
try:
    url = 'https://21st.dev/?preview=/%40jahed/components/hero-1'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # print the title or some relevant tags
    print(re.findall(r'<title>(.*?)</title>', html))
    print(re.findall(r'npx[^"\'<]*', html))
except Exception as e:
    print('Error:', e)
