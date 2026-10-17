require('dotenv').config();
const express=require('express'),crypto=require('crypto'),fs=require('fs');
const app=express();app.use(express.json({limit:'30mb'}));app.use(express.static('public'));
const DB='data.json';const db=fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB)):{users:{},sessions:{}};
const save=()=>fs.writeFileSync(DB,JSON.stringify(db));
const hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex');
const stripe=process.env.STRIPE_SECRET_KEY?require('stripe')(process.env.STRIPE_SECRET_KEY):null;
const BASE=process.env.BASE_URL||'http://localhost:3000';
const pub=u=>({email:u.email,name:u.name,plan:u.plan});
const login=u=>{const t=crypto.randomBytes(24).toString('hex');db.sessions[t]=u.email;save();return{token:t,user:pub(u)}};
const auth=(q,r,n)=>{const e=db.sessions[(q.headers.authorization||'').replace('Bearer ','')];if(!e)return r.status(401).json({error:'Please log in'});q.user=db.users[e];n()};
app.post('/api/signup',(q,r)=>{const{name,email,password}=q.body;
 if(!email||!password||password.length<6)return r.status(400).json({error:'Valid email and 6+ char password required'});
 const k=email.toLowerCase();if(db.users[k])return r.status(409).json({error:'Account already exists'});
 const salt=crypto.randomBytes(16).toString('hex');
 db.users[k]={email:k,name:name||k.split('@')[0],salt,pw:hash(password,salt),plan:'free',deck:null};r.json(login(db.users[k]))});
app.post('/api/login',(q,r)=>{const u=db.users[(q.body.email||'').toLowerCase()];
 if(!u||hash(q.body.password||'',u.salt)!==u.pw)return r.status(401).json({error:'Wrong email or password'});r.json(login(u))});
app.get('/api/me',auth,(q,r)=>r.json(pub(q.user)));
app.get('/api/deck',auth,(q,r)=>r.json({slides:q.user.deck}));
app.post('/api/deck',auth,(q,r)=>{q.user.deck=q.body.slides;save();r.json({ok:true})});
app.post('/api/checkout',auth,async(q,r)=>{
 if(!stripe){q.user.plan='pro';save();return r.json({demo:true,url:'/editor.html?paid=1'})}
 const s=await stripe.checkout.sessions.create({mode:'subscription',customer_email:q.user.email,line_items:[{price:process.env.STRIPE_PRICE_ID,quantity:1}],
  success_url:`${BASE}/editor.html?paid=1&sid={CHECKOUT_SESSION_ID}`,cancel_url:`${BASE}/index.html#pricing`});r.json({url:s.url})});
app.get('/api/verify',auth,async(q,r)=>{try{const s=await stripe.checkout.sessions.retrieve(q.query.sid);
 if(s.payment_status==='paid'&&s.customer_email===q.user.email){q.user.plan='pro';save()}}catch(e){}r.json(pub(q.user))});
app.listen(process.env.PORT||3000,()=>console.log('SlideForge running on '+BASE));
