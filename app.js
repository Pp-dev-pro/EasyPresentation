const $=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9);
let token=localStorage.tk,user,slides=[],cur=0,sid=null,sc=1,tm,pi=0;
const api=async(p,o={})=>{const r=await fetch('/api/'+p,{method:o.body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:o.body&&JSON.stringify(o.body)});const j=await r.json();if(!r.ok)throw j;return j};
const T=(html,x,y,w,h,fs,color,bold,anim)=>({id:uid(),type:'text',html,x,y,w,h,fs,color,bold,anim});
const S=(x,y,w,h,color,anim,r)=>({id:uid(),type:'shape',x,y,w,h,color,anim,r});
const PH=c=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${c}"/><text x="200" y="160" fill="#fff" font-size="26" text-anchor="middle">Click · Change photo</text></svg>`);
const I=(x,y,w,h,c,anim)=>({id:uid(),type:'image',x,y,w,h,src:PH(c),anim});
const TPL={
Business:{free:1,f:()=>[{bg:'#0f172a',els:[T('Your Company',80,170,800,90,64,'#fff',1,'zoom'),T('Quarterly business review',80,275,800,50,28,'#38bdf8',0,'slideup'),S(80,345,160,6,'#38bdf8','slideleft')]},{bg:'#fff',els:[T('Agenda',60,40,600,70,48,'#0f172a',1,'fade'),T('• Goals<br>• Results<br>• Next steps',60,140,500,200,30,'#334155',0,'slideup'),I(600,120,300,300,'#6366f1','flip')]}]},
Minimal:{free:1,f:()=>[{bg:'#fafafa',els:[T('Simple. Clear.',100,200,760,100,70,'#111',1,'fade'),S(100,320,80,4,'#111')]}]},
Creative:{f:()=>[{bg:'linear-gradient(135deg,#f97316,#ec4899)',els:[T('Be Bold',80,150,800,120,96,'#fff',1,'bounce'),T('Creative portfolio 2026',80,300,800,50,30,'#fff',0,'slideup'),S(700,60,160,160,'#ffffff55','spin',80)]}]},
'Startup Pitch':{f:()=>[{bg:'#0b1020',els:[T('The Problem',60,50,700,70,50,'#818cf8',1,'slideleft'),T('Describe the pain your customers feel.',60,140,520,150,30,'#e5e7eb',0,'fade'),I(620,110,280,280,'#22d3ee','zoom')]},{bg:'#111827',els:[T('Traction',60,50,700,70,50,'#34d399',1,'zoom'),T('$1M ARR<br>10k users',60,150,600,200,48,'#fff',1,'pulse')]}]}};
const sel=()=>(slides[cur].els.find(e=>e.id==sid))||{};
const isPro=()=>user.plan=='pro';
function mk(e){const d=document.createElement('div');d.className='el '+e.type;d.dataset.id=e.id;
 Object.assign(d.style,{left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px'});
 if(e.type=='text'){d.innerHTML=e.html;Object.assign(d.style,{fontSize:e.fs+'px',color:e.color,fontWeight:e.bold?800:400,fontFamily:e.font||'Inter,sans-serif'})}
 if(e.type=='shape'){d.style.background=e.color;d.style.borderRadius=(e.r||0)+'px'}
 if(e.type=='image')d.innerHTML=`<img src="${e.src}">`;return d}
function fill(box,s,edit){box.innerHTML='';box.style.background=s.bg;s.els.forEach(e=>{const d=mk(e);if(edit){if(e.id==sid){d.classList.add('sel');const z=document.createElement('div');z.className='rz';d.appendChild(z)}}box.appendChild(d)})}
function draw(){fill($('#cv'),slides[cur],1);$('#thumbs').innerHTML='';
 slides.forEach((s,i)=>{const t=document.createElement('div');t.className='th'+(i==cur?' on':'');const c=document.createElement('div');c.className='cv';fill(c,s);t.appendChild(c);t.onclick=()=>{cur=i;sid=null;draw()};$('#thumbs').appendChild(t)});
 const e=sel();$('#fs').value=e.fs||32;$('#an').value=e.anim||'';$('#bg').value=/^#/.test(slides[cur].bg)?slides[cur].bg:'#ffffff';
 $('#plan').textContent=isPro()?'PRO':'Free plan';$('#upg').style.display=isPro()?'none':'';save()}
function fit(){const a=$('#stage');sc=Math.min((a.clientWidth-30)/960,(a.clientHeight-30)/540);$('#wrap').style.cssText=`width:${960*sc}px;height:${540*sc}px`;$('#cv').style.transform=`scale(${sc})`}
function save(){clearTimeout(tm);tm=setTimeout(()=>api('deck',{body:{slides}}).catch(()=>{}),700)}
function st(k,v){const e=sel();if(!e.id)return;e[k]=v;draw()}
function addText(){const e=T('Double-click to edit',100,100,400,60,32,'#111',0);slides[cur].els.push(e);sid=e.id;draw()}
function addShape(){const e=S(150,150,200,120,'#6366f1','',12);slides[cur].els.push(e);sid=e.id;draw()}
const rd=f=>new Promise(r=>{const x=new FileReader;x.onload=()=>r(x.result);x.readAsDataURL(f)});
async function addImg(f){if(!f)return;const e=I(120,100,320,220,'#000');e.src=await rd(f);slides[cur].els.push(e);sid=e.id;draw()}
async function repImg(f){if(!f||sel().type!='image')return alert('Select an image first');sel().src=await rd(f);draw()}
function addSlide(){if(!isPro()&&slides.length>=5)return alert('Free plan: 5 slides max. Upgrade to Pro!');slides.push({bg:'#fff',els:[]});cur=slides.length-1;sid=null;draw()}
function delSlide(){if(slides.length<2)return;slides.splice(cur,1);cur=Math.max(0,cur-1);draw()}
function del(){const s=slides[cur];s.els=s.els.filter(e=>e.id!=sid);sid=null;draw()}
function dup(){const e={...sel(),id:uid(),x:sel().x+20,y:sel().y+20};if(!e.type)return;slides[cur].els.push(e);sid=e.id;draw()}
function layer(d){const a=slides[cur].els,i=a.findIndex(e=>e.id==sid),j=i+d;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];draw()}
function useTpl(n){if(!n)return;$('#tpl').value='';if(!TPL[n].free&&!isPro())return alert('This template is Pro only.');slides=TPL[n].f();if(!isPro())slides=slides.slice(0,5);cur=0;sid=null;draw()}
function prev(){const d=document.querySelector('#cv .el.sel');if(!d)return;const a=sel().anim;if(!a)return;d.style.animation='none';d.offsetWidth;d.style.animation=a+' .8s both'}
function exportJ(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(slides)]));a.download='presentation.json';a.click()}
function logout(){localStorage.removeItem('tk');location.href='/'}
async function upgrade(){const j=await api('checkout',{body:{}});location.href=j.url}
/* drag, resize, edit */
$('#cv').addEventListener('pointerdown',ev=>{const el=ev.target.closest('.el');if(!el){sid=null;return draw()}
 if(el.isContentEditable)return;const e=slides[cur].els.find(x=>x.id==el.dataset.id);sid=e.id;
 const rz=ev.target.classList.contains('rz'),sx=ev.clientX,sy=ev.clientY,o={...e};
 const mv=m=>{const dx=(m.clientX-sx)/sc,dy=(m.clientY-sy)/sc;if(rz){e.w=Math.max(20,o.w+dx);e.h=Math.max(20,o.h+dy)}else{e.x=o.x+dx;e.y=o.y+dy}
  Object.assign(el.style,{left:e.x+'px',top:e.y+'px',width:e.w+'px',height:e.h+'px'})};
 const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);draw()};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);draw()});
$('#cv').addEventListener('dblclick',ev=>{const el=ev.target.closest('.text');if(!el)return;el.contentEditable=true;el.style.cursor='text';el.focus();
 el.onblur=()=>{const e=slides[cur].els.find(x=>x.id==el.dataset.id);e.html=el.innerHTML;draw()}});
addEventListener('keydown',ev=>{if(ev.target.isContentEditable||/INPUT|SELECT/.test(ev.target.tagName))return;
 if($('#pres').style.display=='grid'){if(ev.key=='ArrowRight'||ev.key==' ')present(1);if(ev.key=='ArrowLeft')present(-1);if(ev.key=='Escape')$('#pres').style.display='none';return}
 if(ev.key=='Delete'||ev.key=='Backspace')del()});
/* present mode */
function present(d){const p=$('#pres');if(!d){pi=cur;p.style.display='grid'}else pi=pi+d;if(pi<0||pi>=slides.length){p.style.display='none';return}
 const c=$('#pcv'),s=Math.min(innerWidth/960,innerHeight/540);c.style.cssText=`transform:scale(${s});transform-origin:center`;
 fill(c,slides[pi]);c.style.animation='fade .5s';[...c.children].forEach((d,k)=>{const a=slides[pi].els[k].anim;if(a)d.style.animation=`${a} .8s ${k*.3}s both`})}
$('#pres').onclick=()=>present(1);
/* init */
(async()=>{try{if(!token)throw 0;user=await api('me');const q=new URLSearchParams(location.search);
 if(q.get('sid'))user=await api('verify?sid='+q.get('sid'));if(q.get('up')&&!isPro()){return upgrade()}
 history.replaceState({},'','/editor.html');
 Object.entries(TPL).forEach(([n,t])=>$('#tpl').add(new Option(n+(t.free?'':' 🔒'),n)));
 slides=(await api('deck')).slides;if(!slides||!slides.length)slides=TPL.Business.f();
 fit();addEventListener('resize',fit);draw()}catch(e){location.href='/'}})();
