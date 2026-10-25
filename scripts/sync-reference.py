"""Download reference content/media locally; retain source URLs in the asset manifest."""
from pathlib import Path
import json, hashlib, subprocess, concurrent.futures, re
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'public/media';DEST.mkdir(exist_ok=True)
CACHE=Path('/tmp/otherlife-pages');CACHE.mkdir(exist_ok=True)
for page in ['home','company','careers','work-artist-accelerator','work-onramper','work-christies','work-cake-wallet','work-narcos','work-hypernative']:
 file=CACHE/(page+'.json')
 if not file.exists():
  route='' if page=='home' else page.replace('work-','work/',1) if page.startswith('work-') else page
  html=subprocess.check_output(['curl','-fLs','--max-time','60','https://www.otherlife.xyz/'+route],text=True)
  match=re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',html)
  if not match: raise RuntimeError('Reference page data missing: '+page)
  file.write_text(match.group(1))
assets={}
def media(value):
 if not value:return None
 url=value['url'];key=hashlib.sha256(url.encode()).hexdigest()[:20]
 ext=Path(url.split('?')[0]).suffix.lower()
 kind='video' if ext in ['.mp4','.webm','.mov'] else 'file' if ext=='.pdf' else 'image'
 suffix='.mp4' if kind=='video' else ext if ext in ['.svg','.pdf','.gif'] else '.webp'
 name=key+suffix
 assets[url]={'file':name,'kind':kind}
 return {'src':'/media/'+name,'kind':kind,'alt':value.get('alternativeText') or '', 'width':value.get('width') or 1920,'height':value.get('height') or 1080}
def rich(v):return v or []
def quote(q):
 return {k:q.get(k,'') for k in ['quote','author','role','company']}|{'image':media(q.get('image'))}
def load(n):return json.loads((CACHE/(n+'.json')).read_text())['props']['pageProps']
h=load('home')['page'];c=load('company')['page'];r=load('careers')['page']
company={k:c[k] for k in ['heroTitle','heroLabel','heroDescription','servicesLabel','servicesAdditionalText','services','awardsLabel']}
company['team']=[{k:t[k] for k in ['name','position']}|{'image':media(t['image'])} for t in c['heroTeam']]
company['topImage']=media(c['servicesTopImage']);company['bottomImage']=media(c['servicesBottomImage'])
company['testimonials']=[quote(q) for q in c['testimonials']]
company['awards']=[{k:a[k] for k in ['title','amount','type']} for a in c['awards']]
company['work']=[p['slug'] for p in c['caseStudies']]
careers={k:r[k] for k in ['hiringLabel','hiringTitle','hiringDescription','perksLabel','perksDescription','jobOpeningsLabel','contactMessage']}
careers['image']=media(r['hiringImage']);careers['gallery']=[media(m) for m in r['gallery']]
careers['jobs']=[{'slug':re.sub('[^a-z0-9]+','-',j['title'].lower()).strip('-'),'title':j['title'],'description':j['description']} for j in r['jobOpenings']]
home={'projects':[{'slug':p['slug'],'title':p['title'],'description':p['projectText'],'services':p['servicesText'],'image':media(p['homepageBannerImage']),'mobileImage':media(p['homepageBannerImageMobile']),'video':media(p['homepageBannerVideo']),'logo':media(p['logo'])} for p in h['featuredCaseStudies']], 'clients':[{'name':x['name'],'href':x['url'] if (x.get('url') or '').startswith('/work/') else None,'image':media(x['logo']),'hover':media(x.get('logoHover')),'background':media(x.get('logoHoverBackground'))} for x in h['featuredClients']]}
home['showreel']=media({'url':'https://www.otherlife.xyz/assets/webgl/showreel/showreel.webm'})
cases=[]
for p in sorted(CACHE.glob('work-*.json')):
 d=json.loads(p.read_text())['props']['pageProps']['caseStudy']
 case={k:d.get(k,'') for k in ['title','subtitle','slug','projectText','servicesText','year']}
 case['image']=media(d['bannerImage']);case['mobileImage']=media(d['bannerImageMobile']);case['video']=media(d.get('bannerVideo')) if d['useBannerVideo'] else None
 case['pdf']=media(d.get('pdf'))
 blocks=[]
 for b in d['pageBuilder']:
  t=b['__typename']
  if t=='ComponentCaseStudyMedia':blocks.append({'type':'media','title':b.get('title'),'image':media(b.get('image')),'poster':media(b.get('videoPoster')),'video':media(b.get('video')) if b.get('useVideo') else None})
  elif t=='ComponentSharedImages':blocks.append({'type':'images','images':[media(m) for m in b['images']]})
  elif t=='ComponentCaseStudyMediaGrid':blocks.append({'type':'mediaGrid','rows':[[media(m) for m in row['files']] for row in b['mediaRow']]})
  elif t=='ComponentCaseStudyStats':blocks.append({'type':'stats','title':b.get('title'),'stats':[{'value':s['value'],'label':s['label']} for s in b['stat']]})
  elif t=='ComponentCaseStudyQuote':blocks.append({'type':'quote','quote':quote(b['testimonial'])})
  elif t=='ComponentCaseStudyStepList':blocks.append({'type':'steps','steps':[{k:s[k] for k in ['title','subtitle','description']} for s in b['steps']]})
  elif t=='ComponentCaseStudyPressArticles':blocks.append({'type':'press','articles':[{'title':a['title'],'date':a['date'],'image':media(a.get('logo'))} for a in b['press']]})
  else:raise ValueError(t)
 case['blocks']=blocks;cases.append(case)
content={'home':home,'company':company,'careers':careers,'cases':cases}
(ROOT/'src/data/content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2))
for orientation in ['landscape','portrait']:
 for ext in ['mp4','jpg']:
  name='hero-'+orientation+'.'+ext
  assets['https://www.otherlife.xyz/assets/videos/'+name]={'file':name,'kind':'video' if ext=='mp4' else 'image','maxWidth':1920 if orientation=='landscape' else 720,'crf':'23' if orientation=='landscape' else '24'}
print('Assets:',len(assets),'videos:',sum(a['kind']=='video' for a in assets.values()),flush=True)
def download(item):
 url,info=item;dest=DEST/info['file']
 if dest.exists():return
 temp=Path('/tmp/otherlife-download-'+info['file'])
 subprocess.run(['curl','-fLs','--retry','2','--max-time','180',url,'-o',str(temp)],check=True)
 if info['kind']=='video':
  subprocess.run(['ffmpeg','-v','error','-y','-threads','1','-i',str(temp),'-vf',"scale='min("+str(info.get('maxWidth',1280))+",iw)':-2",'-r','30','-c:v','libx264','-threads','1','-preset','fast','-crf',info.get('crf','28'),'-c:a','aac','-b:a','96k','-movflags','+faststart',str(dest)],check=True)
 elif dest.suffix=='.webp':
  with Image.open(temp) as im:
   im.thumbnail((1920,1920));im.save(dest,'WEBP',quality=90,method=4)
 else:dest.write_bytes(temp.read_bytes())
 temp.unlink()
 print('Saved',info['file'],dest.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 list(pool.map(download,assets.items()))
(ROOT/'src/data/media-sources.json').write_text(json.dumps(assets,indent=2))
print('All assets ready:',sum(p.stat().st_size for p in DEST.iterdir()),flush=True)
