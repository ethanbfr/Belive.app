import { useState, useEffect, useRef } from 'react';

// ── SUPABASE ──────────────────────────────────────────────
const SUPA_URL = "https://fiftdixtzeiidvwblvtr.supabase.co";
const SUPA_KEY = "sb_publishable_J0CVKi8b-ZpMEUwjb3gMrw_-zwsKkPH";
const SUPA_PUBLISHABLE = "sb_publishable_hHHgNw_jHBktQ-OOxgu-Eg_wW8QhgGL";

async function supabase(method, table, body, match) {
  const url = `${SUPA_URL}/rest/v1/${table}${match ? `?${match}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

const db = {
  getUsers:       ()              => supabase("GET",    "users",     null),
  getUser:        (email)         => supabase("GET",    "users",     null, `email=eq.${encodeURIComponent(email)}`),
  createUser:     (data)          => supabase("POST",   "users",     data),
  updateUser:     (email, data)   => supabase("PATCH",  "users",     data, `email=eq.${encodeURIComponent(email)}`),
  deleteUser:     (email)         => supabase("DELETE", "users",     null, `email=eq.${encodeURIComponent(email)}`),
  getStreams:     (email)         => supabase("GET",    "streams",   null, `user_email=eq.${encodeURIComponent(email)}`),
  addStream:      (data)          => supabase("POST",   "streams",   data),
  getCodes:       ()              => supabase("GET",    "codes",     null),
  addCode:        (data)          => supabase("POST",   "codes",     data),
  useCode:        (code, name)    => supabase("PATCH",  "codes",     {used_by: name, used_at: new Date().toISOString()}, `code=eq.${code}`),
  getContrats:    ()              => supabase("GET",    "contrats",  null),
  addContrat:     (data)          => supabase("POST",   "contrats",  data),
  getReferrals:   ()              => supabase("GET",    "referrals", null),
  getReferralsByParrain: (email)  => supabase("GET",    "referrals", null, `parrain_email=eq.${encodeURIComponent(email)}`),
  addReferral:    (data)          => supabase("POST",   "referrals", data),
  updateReferral: (id, data)      => supabase("PATCH",  "referrals", data, `id=eq.${id}`),
  // Partenariats
  getPartners:    ()              => supabase("GET",    "partners", null),
  addPartner:     (data)          => supabase("POST",   "partners", data),
  updatePartner:  (id, data)      => supabase("PATCH",  "partners", data, `id=eq.${id}`),
  deletePartner:  (id)            => supabase("DELETE", "partners", null, `id=eq.${id}`),
};

const R="#D4103F",D="#080808",C="#111",C2="#161616",B="rgba(255,255,255,0.07)",M="rgba(255,255,255,0.38)";
const G="#22c55e",BL="#60a5fa",PU="#a78bfa",YE="#fbbf24";
const DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const TIPS=["Streame aux mêmes horaires — la régularité fidélise.","Ton titre : 1 mot-clé + une accroche émotionnelle.","Les 5 premières minutes décident si un viewer reste.","Un raid ciblé vaut 10 raids aléatoires.","La qualité audio compte plus que la qualité vidéo.","Remercie chaque nouveau follower par son pseudo.","Brawl Stars et Fortnite = meilleure visibilité Twitch FR."];
const LB=[];
const PARTNERS=[];
const IPOSTS=[
  {id:1,user:"AlexStream",av:"A",time:"il y a 2h",content:"Quelqu'un dispo pour un raid ce soir vers 22h sur Warzone ? On peut s'échanger nos viewers 🔥",likes:8,liked:false,replies:[{user:"GamingPro",av:"G",text:"Moi je suis là ! Je t'envoie un MP 👊",time:"1h"}],showReplies:false,replyInput:"",category:"raid"},
  {id:2,user:"GamingPro",av:"G",time:"il y a 5h",content:"Tip du jour : activez les marqueurs de clip automatiques sur OBS. J'ai retrouvé 3 moments incroyables 🎬",likes:15,liked:false,replies:[],showReplies:false,replyInput:"",category:"conseil"},
  {id:3,user:"StreamKing",av:"S",time:"il y a 1j",content:"Viens de passer 150 followers ! Merci à tous les raids de la communauté Belive 🙏",likes:24,liked:false,replies:[{user:"AlexStream",av:"A",text:"Félicitations ! 🎉",time:"23h"}],showReplies:false,replyInput:"",category:"milestone"},
];
const ADMIN={"ethanbfr06@gmail.com":{name:"Ethan",role:"admin",password:"Belive2025!",av:"E",phone:"0780999251",twitch:"ethan_bfr",youtube:"",tiktok:"",instagram:""}};

// ── NOTIFICATIONS ─────────────────────────────────────────
function askNotifPermission(){
  if(!("Notification" in window))return;
  Notification.requestPermission();
}

function sendNotif(title, body, tag){
  if(!("Notification" in window)||Notification.permission!=="granted")return;
  new Notification(title,{body,icon:"https://beliveacademy.com/favicon.ico",tag:tag||"belive"});
}

// Stocke les notifs admin dans localStorage pour qu'il les voit quand il se connecte
function storeAdminNotif(msg){
  const notifs=JSON.parse(localStorage.getItem("ba6_notifs")||"[]");
  notifs.unshift({msg,time:new Date().toLocaleString("fr-FR"),read:false});
  localStorage.setItem("ba6_notifs",JSON.stringify(notifs.slice(0,50)));
}
const AI_R=(q,avg)=>{
  const l=q.toLowerCase();

  if(l.includes("bonjour")||l.includes("salut")||l.includes("coucou"))
    return`Bonjour ! 👋 Je suis ton coach streaming dédié.\n\nPose-moi des questions sur :\n• 📈 Ta croissance et tes viewers\n• 🎮 Le choix de tes jeux\n• 💰 La monétisation\n• 🤝 Les partenariats\n• 🎯 L'affiliation Twitch\n\nQu'est-ce que tu veux améliorer en premier ?`;

  if(l.includes("titre")||l.includes("title"))
    return`Un bon titre de stream c'est **3 éléments** :\n\n1. Le jeu ou la catégorie\n2. Ce que tu fais exactement\n3. Une émotion ou un défi\n\nExemple ❌ : "Warzone ce soir"\nExemple ✅ : "Warzone ranked — Je monte jusqu'au Diamond ou j'arrête"\n\nLes titres avec un défi ou une promesse génèrent 40% de clics en plus.\n\n⚠️ Nos agents t'aident à créer des titres optimisés selon ton style.`;

  if(l.includes("viewer")||l.includes("audience")||l.includes("regarder"))
    return`Avec ${avg||3} viewers en moyenne, voilà les leviers concrets :\n\n**Court terme :**\n• Parle constamment même si personne ne regarde — les gens restent si tu es actif\n• Fais des polls et poses des questions à ton chat\n• Remercie chaque nouveau viewer par son pseudo\n\n**Moyen terme :**\n• Raids ciblés vers des streamers de ta taille\n• Clips TikTok de tes meilleurs moments\n• Horaires fixes = viewers fidèles\n\n⚠️ Pour une stratégie personnalisée basée sur tes stats réelles, nos agents Belive Academy analysent ton profil en profondeur.`;

  if(l.includes("partenariat")||l.includes("sponsor")||l.includes("deal"))
    return`Les partenariats se débloquent par paliers :\n\n**0–200 followers** → Codes promo affiliation (GFuel, Kinguin...)\n**200–500 followers** → Deals produits offerts\n**500–1000 followers** → Premiers vrais deals rémunérés\n**1000+ followers** → Sponsoring régulier\n\nLa clé : avoir une **audience engagée** compte plus que le nombre de followers. 100 viewers actifs valent mieux que 1000 followers inactifs.\n\n⚠️ La prospection de marques et la négociation des contrats, c'est exactement le travail de Belive Academy — rejoins-nous pour accélérer.`;

  if(l.includes("argent")||l.includes("monetis")||l.includes("gagner"))
    return`Les sources de revenus d'un créateur :\n\n💜 **Twitch** : Subs (2,50€), Bits, Ads\n▶️ **YouTube** : Monétisation (1000 subs + 4000h)\n🎵 **TikTok** : Creator Fund\n🤝 **Partenariats** : La vraie source d'argent\n💰 **Dons directs** : Streamlabs, PayPal\n\nLa plupart des streamers gagnent leur premier vrai argent via les **partenariats**, pas les subs.\n\n⚠️ Belive Academy cherche et négocie des partenariats pour toi — c'est là qu'est le vrai revenu.`;

  if(l.includes("jeu")||l.includes("game")||l.includes("jouer")||l.includes("catégorie"))
    return`Le choix du jeu est stratégique :\n\n**Règle d'or** : vise des catégories avec **200–800 viewers totaux** sur Twitch → tu apparais en haut de liste\n\n**Bons choix actuellement :**\n• Brawl Stars — petite communauté FR, forte fidélité\n• Valorant ranked — clips viraux faciles\n• Minecraft créatif — niche mais très fidèle\n\n**À éviter :** Fortnite, GTA RP, Warzone → trop de concurrence sauf si tu as déjà une audience.\n\n⚠️ L'analyse de ta niche optimale selon ton style, c'est un travail d'agent Belive.`;

  if(l.includes("follower")||l.includes("croissance")||l.includes("grow")||l.includes("grandir"))
    return`Pour grandir rapidement, les 3 leviers qui marchent vraiment :\n\n**1. Le contenu court** 🎬\nClipe tes meilleurs moments et poste sur TikTok/YouTube Shorts. Un clip viral peut t'amener 50–200 followers en une nuit.\n\n**2. Le réseau** 🤝\nFais des raids ciblés vers des streamers de ta taille. Propose des co-streams. Rejoins des communities Discord.\n\n**3. La régularité** 📅\nStreame aux mêmes horaires. Les algorithmes Twitch récompensent la régularité.\n\n⚠️ Une stratégie de croissance complète et personnalisée avec un agent Belive accélère tout ça de 3x.`;

  if(l.includes("affili")||l.includes("affiliate"))
    return`L'affiliation Twitch nécessite sur 30 jours consécutifs :\n\n✅ **50 followers**\n✅ **500 minutes** streamées\n✅ **7 jours** de stream différents\n✅ **3 viewers moyens**\n\nLe plus dur : les **3 viewers moyens**. Voilà comment y arriver :\n• Invite des amis à regarder tes premiers streams\n• Streame en heures de pointe (20h–23h)\n• Annonce tes streams sur tes réseaux 1h avant\n\n⚠️ Nos agents ont des méthodes spécifiques pour booster ta moyenne de viewers rapidement.`;

  if(l.includes("setup")||l.includes("micro")||l.includes("caméra")||l.includes("materiel")||l.includes("matériel"))
    return`Les priorités setup dans l'ordre :\n\n**1. Audio** 🎙️ — Le plus important\nUn mauvais micro = les viewers partent. Budget min : 50€ (HyperX SoloCast)\n\n**2. Internet** 📡\n6 Mbps upload minimum pour streamer en 1080p60\n\n**3. Éclairage** 💡\nUne simple ring light à 20€ change tout\n\n**4. Caméra** 📷\nEn dernier — pas obligatoire pour débuter\n\nLa règle : investis dans l'ordre, pas tout d'un coup.\n\n⚠️ Pour un audit complet de ton setup selon ton budget, nos agents Belive sont là.`;

  if(l.includes("horaire")||l.includes("heure")||l.includes("quand"))
    return`Les meilleurs créneaux streaming FR :\n\n📅 **Semaine :**\n• 19h–20h : Bonne audience, peu de concurrence\n• 20h–23h ✅ : Peak time — meilleur créneau\n\n📅 **Weekend :**\n• 14h–17h : Audience ado\n• 20h–minuit ✅ : Meilleur créneau\n\n⚠️ **Important** : La régularité > Le timing. Streame toujours aux mêmes heures plutôt que de chasser le "meilleur moment".\n\n⚠️ Nos agents analysent les données de ta catégorie pour trouver ton créneau optimal.`;

  if(l.includes("réseau")||l.includes("tiktok")||l.includes("instagram")||l.includes("youtube"))
    return`La stratégie multi-plateforme qui marche :\n\n🎮 **Twitch** → Ton stream principal, ta communauté\n🎵 **TikTok** → Tes clips viraux, ta découverte\n▶️ **YouTube** → Tes highlights, ton référencement long terme\n📸 **Instagram** → Ta vie, ton personal branding\n\n**La règle des 80/20** : 80% de ton contenu sur Twitch, 20% recyclé sur les autres plateformes.\n\n⚠️ Une stratégie cross-plateforme coordonnée, c'est exactement ce que nos agents construisent pour toi.`;

  return`Bonne question ! Pour te donner une réponse précise, j'aurais besoin de plus de détails sur ta situation.\n\nJe peux t'aider sur :\n• 📈 Viewers et croissance\n• 🎮 Choix des jeux\n• ⏰ Horaires optimaux\n• 💰 Monétisation\n• 🤝 Partenariats\n• 🎯 Affiliation Twitch\n• 🎙️ Setup technique\n\n⚠️ Pour un accompagnement complet et personnalisé, nos agents **Belive Academy** sont disponibles. 🎯`;
};
const CTR=(c,ct)=>{
  const revenus=[];
  if(ct.inclDons) revenus.push("Dons");
  if(ct.inclPubs) revenus.push("Publicités");
  if(ct.inclPartenariats) revenus.push("Partenariats");
  if(ct.inclSubs) revenus.push("Abonnements/Subs");
  if(ct.inclBits) revenus.push("Bits/Super Chats");
  if(ct.inclMerchandise) revenus.push("Merchandise");
  const revenusStr=revenus.length>0?revenus.join(", "):"Tous les revenus";
  const today=new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
  const prestations=[];
  if(ct.prestCoaching) prestations.push("Coaching personnalise");
  if(ct.prestStats) prestations.push("Suivi statistiques");
  if(ct.prestPartenariats) prestations.push("Recherche partenariats");
  if(ct.prestStrategie) prestations.push("Strategie de croissance");
  if(ct.prestApp) prestations.push("Acces app Belive Academy");
  if(ct.prestGroupe) prestations.push("Acces groupe prive");
  if(ct.prestContenu) prestations.push("Aide creation de contenu");
  if(ct.prestReseaux) prestations.push("Gestion reseaux sociaux");

  return `BELIVE ACADEMY - CONTRAT D ACCOMPAGNEMENT CREATEUR
Agence Createurs et Influence | "Ecris ta propre histoire"
____________________________________________________________
Date : ${today}
____________________________________________________________

AGENCE
Belive Academy - Ethan
Email : ethan@beliveacademy.com
Tel : 07 80 99 92 51
Site : beliveacademy.com

CREATEUR
Nom       : ${c?.name||"___"}
Email     : ${c?.email||"___"}
Telephone : ${c?.phone||"___"}
Twitch    : ${c?.twitch?"@"+c.twitch:"Non renseigne"}
YouTube   : ${c?.youtube||"Non renseigne"}
____________________________________________________________

FORMULE : ${ct.formule==="commission"?"COMMISSION":"COACHING PREMIUM"}

${ct.formule==="commission"?`Frais d entree unique : ${ct.montant}€`:`Mensualite : ${ct.montant}€/mois`}
Commission : ${ct.commission}%
Revenus concernes : ${revenusStr}
Duree : ${ct.duree}
Preavis de resiliation : ${ct.preavis||"15 jours"}
${ct.clauseExclu?`Exclusivite : ${ct.clauseExclu}`:""}
${ct.noteLibre?`Note particuliere : ${ct.noteLibre}`:""}
____________________________________________________________

PRESTATIONS INCLUSES
${prestations.map(p=>"- "+p).join("\n")}
____________________________________________________________

SIGNATURES - Fait le ${today}

Pour BELIVE ACADEMY :                   Pour le CREATEUR :
Ethan - Belive Academy                  ${c?.name||"___"}

______________________________          ______________________________
Signature                               Signature + Lu et approuve

____________________________________________________________
Belive Academy | beliveacademy.com
ethan@beliveacademy.com | 07 80 99 92 51`;
};

const css=`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{background:${D};color:white;font-family:'Manrope',sans-serif;}
input,select,textarea,button{font-family:'Manrope',sans-serif;}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.18);}
select option{background:#1a1a1a;color:white;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:rgba(212,16,63,0.3);border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
.fade{animation:fadeUp 0.3s ease both;}
.slide{animation:slideIn 0.25s ease both;}
.blink::after{content:'▋';animation:pulse 0.8s infinite;margin-left:2px;}
.desktop-sidebar{display:flex;}
.mobile-bar{display:none;}
@media(max-width:900px){
  .desktop-sidebar{display:none !important;}
  .mobile-bar{display:flex !important;}
  .main-content{margin-left:0 !important;padding-top:64px !important;}
}
`;

// ATOMS
const Pill=({children,color="red",xs})=>{const m={red:{bg:"rgba(212,16,63,0.12)",t:R,b:"rgba(212,16,63,0.25)"},green:{bg:"rgba(34,197,94,0.12)",t:G,b:"rgba(34,197,94,0.25)"},blue:{bg:"rgba(96,165,250,0.12)",t:BL,b:"rgba(96,165,250,0.25)"},purple:{bg:"rgba(167,139,250,0.12)",t:PU,b:"rgba(167,139,250,0.25)"},yellow:{bg:"rgba(251,191,36,0.12)",t:YE,b:"rgba(251,191,36,0.25)"},gray:{bg:"rgba(255,255,255,0.06)",t:M,b:B}};const c=m[color]||m.gray;return <span style={{background:c.bg,color:c.t,border:`1px solid ${c.b}`,borderRadius:100,padding:xs?"2px 8px":"4px 12px",fontSize:xs?10:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;};

const Btn=({children,onClick,v="primary",sz="md",full,icon,disabled})=>{const V={primary:{bg:R,c:"white",b:"none"},ghost:{bg:"rgba(255,255,255,0.05)",c:"white",b:`1px solid ${B}`},danger:{bg:"rgba(212,16,63,0.1)",c:R,b:`1px solid rgba(212,16,63,0.2)`},success:{bg:"rgba(34,197,94,0.1)",c:G,b:`1px solid rgba(34,197,94,0.2)`}};const S={sm:{p:"7px 14px",fs:12},md:{p:"11px 22px",fs:13},lg:{p:"15px 30px",fs:14}};const s=V[v];const z=S[sz];return <button onClick={disabled?undefined:onClick} style={{background:s.bg,color:s.c,border:s.b,borderRadius:10,padding:z.p,fontSize:z.fs,fontWeight:700,cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",opacity:disabled?0.45:1,display:"flex",alignItems:"center",gap:6,justifyContent:"center",transition:"opacity 0.15s"}}>{icon&&<span>{icon}</span>}{children}</button>;};

const Field=({label,hint,...p})=><div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>{label}</div>}{p.as==="select"?<select {...p} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 14px",color:"white",fontSize:13,outline:"none"}}>{p.children}</select>:p.as==="textarea"?<textarea {...p} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 14px",color:"white",fontSize:13,outline:"none",resize:"vertical",minHeight:80}}/>:<input {...p} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 14px",color:"white",fontSize:13,outline:"none"}}/>}{hint&&<div style={{fontSize:11,color:M,marginTop:4}}>{hint}</div>}</div>;

const Card=({children,style,onClick})=><div onClick={onClick} style={{background:C,border:`1px solid ${B}`,borderRadius:16,padding:20,cursor:onClick?"pointer":"default",...style}}>{children}</div>;

const Modal=({open,onClose,title,children,wide})=>{if(!open)return null;return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16,backdropFilter:"blur(6px)"}}><div onClick={e=>e.stopPropagation()} className="fade" style={{background:C2,border:`1px solid ${B}`,borderRadius:20,padding:24,width:"100%",maxWidth:wide?700:480,maxHeight:"92vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{fontWeight:800,fontSize:16}}>{title}</div><button onClick={onClose} style={{background:"none",border:"none",color:M,fontSize:22,cursor:"pointer"}}>✕</button></div>{children}</div></div>;};

const SC=({label,value,sub,icon,color="red",delta})=>{const cl={red:R,green:G,blue:BL,purple:PU}[color]||R;return <Card><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,textTransform:"uppercase"}}>{label}</div>{icon&&<span style={{fontSize:18}}>{icon}</span>}</div><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:34,color:cl,lineHeight:1,marginBottom:4}}>{value}</div>{sub&&<div style={{fontSize:12,color:M}}>{sub}</div>}{delta!==undefined&&<div style={{marginTop:6,fontSize:11,fontWeight:700,color:delta>=0?G:"#ef4444"}}>{delta>=0?"↑":"↓"} {Math.abs(delta)}% vs mois dernier</div>}</Card>;};

const Av=({name,size=36})=><div style={{width:size,height:size,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:size*0.38,flexShrink:0}}>{(name||"?").charAt(0).toUpperCase()}</div>;

// TEMPLATE SVG COMPONENTS
const BannerTemplate=({variant,pseudo})=>{
  const variants={
    dark:{bg:"#0a0a0a",accent:R,text:"white",sub:"rgba(255,255,255,0.4)"},
    red:{bg:R,accent:"white",text:"white",sub:"rgba(255,255,255,0.7)"},
    neon:{bg:"#050510",accent:"#7c3aed",text:"white",sub:"rgba(167,139,250,0.6)"},
  };
  const v=variants[variant]||variants.dark;
  return(
    <div style={{width:"100%",aspectRatio:"3/1",background:v.bg,borderRadius:12,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",border:`1px solid ${B}`}}>
      {/* Grid bg */}
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${v.accent}10 1px,transparent 1px),linear-gradient(90deg,${v.accent}10 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
      {/* Glow */}
      <div style={{position:"absolute",width:"50%",height:"200%",background:`radial-gradient(ellipse,${v.accent}22 0%,transparent 65%)`,top:"-50%",right:"-10%"}}/>
      {/* Lines */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:v.accent}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:v.accent}}/>
      {/* Logo */}
      <div style={{position:"relative",zIndex:2}}>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(20px,4vw,36px)",color:v.text,letterSpacing:2,lineHeight:1}}>BELIVE <span style={{color:v.accent==="white"?"rgba(255,255,255,0.7)":v.accent}}>ACADEMY</span></div>
        <div style={{background:v.accent,borderRadius:100,padding:"2px 10px",display:"inline-block",marginTop:4}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(8px,1.5vw,12px)",color:v.bg,letterSpacing:3}}>CRÉATEUR OFFICIEL</div>
        </div>
      </div>
      {/* Pseudo */}
      <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(16px,3.5vw,32px)",color:v.text,letterSpacing:2}}>{pseudo||"TON PSEUDO"}</div>
        <div style={{fontSize:"clamp(8px,1.2vw,11px)",color:v.sub,letterSpacing:2,textTransform:"uppercase"}}>Agence Créateurs & Influence</div>
      </div>
      {/* Right */}
      <div style={{position:"relative",zIndex:2,textAlign:"right"}}>
        <div style={{fontSize:"clamp(7px,1vw,10px)",color:v.sub,letterSpacing:1}}>beliveacademy.com</div>
        <div style={{fontSize:"clamp(6px,0.9vw,9px)",color:v.sub,marginTop:4,letterSpacing:0.5}}>🔥 Rejoins la communauté</div>
      </div>
    </div>
  );
};

const ProfileFrameTemplate=({variant,pseudo})=>{
  const variants={
    dark:{bg:"#0a0a0a",ring:R,badge:"#0a0a0a",badgeText:R},
    red:{bg:R,ring:"white",badge:"white",badgeText:R},
    gold:{bg:"#1a1200",ring:"#ffd700",badge:"#ffd700",badgeText:"#1a1200"},
  };
  const v=variants[variant]||variants.dark;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <div style={{position:"relative",width:140,height:140}}>
        {/* Outer ring */}
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`linear-gradient(135deg,${v.ring},${v.ring}88)`,padding:4}}>
          <div style={{width:"100%",height:"100%",borderRadius:"50%",background:v.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            {/* Placeholder photo area */}
            <div style={{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:`2px dashed rgba(255,255,255,0.15)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <div style={{fontSize:28,opacity:0.3}}>📷</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",textAlign:"center",lineHeight:1.3}}>Ta photo ici</div>
            </div>
          </div>
        </div>
        {/* Badge bottom */}
        <div style={{position:"absolute",bottom:-2,left:"50%",transform:"translateX(-50%)",background:v.badge,border:`2px solid ${v.bg}`,borderRadius:100,padding:"3px 10px",whiteSpace:"nowrap"}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:9,color:v.badgeText,letterSpacing:2}}>BELIVE</div>
        </div>
        {/* Top verified */}
        <div style={{position:"absolute",top:2,right:2,width:24,height:24,background:v.ring,borderRadius:"50%",border:`2px solid ${v.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✓</div>
      </div>
      {pseudo&&<div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:14,color:"white",letterSpacing:1,textAlign:"center"}}>@{pseudo}</div>}
    </div>
  );
};

// MAIN
export default function App(){
  // Détecter si on accède aux pages publiques CGU/Politique
  useEffect(()=>{
    const path=window.location.pathname;
    const search=window.location.search;
    
    // Vérifier les paramètres URL
    if(search.includes("page=cgu")||search.includes("cgu=true")) setPublicPage("cgu");
    else if(search.includes("page=politique")||search.includes("politique=true")) setPublicPage("politique");
    // Vérifier les chemins directs
    else if(path==="/cgu"||path==="/cgu.html") setPublicPage("cgu");
    else if(path==="/politique"||path==="/politique.html"||path==="/politique-de-confidentialite") setPublicPage("politique");
  }, []);

  const [user,setUser]=useState(()=>{
    try{
      const saved=localStorage.getItem("ba6_session");
      return saved?JSON.parse(saved):null;
    }catch(e){return null;}
  });
  const [authEmail,setAuthEmail]=useState("");
  const [authPass,setAuthPass]=useState("");
  const [authErr,setAuthErr]=useState("");
  const [isReg,setIsReg]=useState(false);
  const [reg,setReg]=useState({name:"",email:"",pass:"",phone:"",twitch:"",youtube:"",tiktok:"",instagram:"",code:"",referralCode:""});
  const [regAge,setRegAge]=useState(false);
  const [regCGU,setRegCGU]=useState(false);
  const [showPass,setShowPass]=useState(false);
  const [isForgot,setIsForgot]=useState(false);
  const [forgotEmail,setForgotEmail]=useState("");
  const [forgotSent,setForgotSent]=useState(false);
  const [showRegPass,setShowRegPass]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [publicPage,setPublicPage]=useState(null); // 'cgu' ou 'politique'
  const [sideOpen,setSideOpen]=useState(true);
  const [menuOpen,setMenuOpen]=useState(false);
  const [modal,setModal]=useState(null);
  const [showWelcome,setShowWelcome]=useState(false);
  const [showLegalModal,setShowLegalModal]=useState(null);
  const [adminNotifs,setAdminNotifs]=useState(()=>JSON.parse(localStorage.getItem("ba6_notifs")||"[]"));
  const [notifPrefs,setNotifPrefs]=useState(()=>JSON.parse(localStorage.getItem("ba6_nprefs")||'{"planning":true,"messages":true,"partenariats":true,"classement":true}'));

  const [createurs,setCreateurs]=useState(()=>JSON.parse(localStorage.getItem("ba6_cr")||"[]"));
  const [streams,setStreams]=useState(()=>JSON.parse(localStorage.getItem("ba6_st")||"[]"));
  const [contrats,setContrats]=useState(()=>JSON.parse(localStorage.getItem("ba6_co")||"[]"));
  const [codes,setCodes]=useState(()=>JSON.parse(localStorage.getItem("ba6_cd")||"[]"));
  const [ms,setMs]=useState(()=>JSON.parse(localStorage.getItem("ba6_ms")||'{"twitch":0,"youtube":0,"tiktok":0}'));
  const [schedule,setSchedule]=useState(()=>JSON.parse(localStorage.getItem("ba6_sc")||"[]"));
  const [partners,setPartners]=useState(()=>JSON.parse(localStorage.getItem("ba6_pa")||JSON.stringify(PARTNERS)));
  const [posts,setPosts]=useState(IPOSTS);
  const [parrainages,setParrainages]=useState([]);
  const [adminRefs,setAdminRefs]=useState([]);
  const [postFilter,setPostFilter]=useState("all");
  const [postSearch,setPostSearch]=useState("");

  const [newCr,setNewCr]=useState({name:"",email:"",phone:"",twitch:"",youtube:"",tiktok:"",instagram:"",formule:"commission"});
  const [newSt,setNewSt]=useState({date:"",dur:"",viewers:"",platform:"twitch"});
  const [newSc,setNewSc]=useState({day:"Lundi",time:"20:00",dur:"2",platform:"twitch"});
  const [planningMode,setPlanningMode]=useState("single");
  const [weekSc,setWeekSc]=useState({days:{Lundi:true,Mardi:true,Mercredi:true,Jeudi:true,Vendredi:true,Samedi:false,Dimanche:false},time:"20:00",dur:"2",platform:"twitch"});
  const [newPartner,setNewPartner]=useState({brand:"",type:"",budget:"",desc:"",icon:"🤝",hot:false});
  const [codeType,setCodeType]=useState("createur");
  const [freeType,setFreeType]=useState("limited");
  const [freeDays,setFreeDays]=useState(14);
  const [codeCreatorName,setCodeCreatorName]=useState("");

  const [mSt,setMSt]=useState({twitch:"",youtube:"",tiktok:""});
  const [newPost,setNewPost]=useState("");
  const [ct,setCt]=useState({createur:null,formule:"commission",commission:"25",montant:"19",duree:"Sans engagement"});
  const [commFilter,setCommFilter]=useState("all");
  const [commSearch,setCommSearch]=useState("");
  const [commCat,setCommCat]=useState("conseil");
  const [tmplPseudo,setTmplPseudo]=useState("");
  const [referrals,setReferrals]=useState(()=>JSON.parse(localStorage.getItem("ba6_ref")||"[]"));
  const [tmplPhoto,setTmplPhoto]=useState(null);
  const [profilePhoto,setProfilePhoto]=useState(null);
  const [selectedTmpl,setSelectedTmpl]=useState("banner-dark");
  const [parrainCopied,setParrainCopied]=useState(false);
  const [profil,setProfil]=useState(()=>JSON.parse(localStorage.getItem("ba6_profil")||"{}"));
  const [profilEdit,setProfilEdit]=useState(false);
  const [showSubscriptionSection,setShowSubscriptionSection]=useState(false);
  const monCodeParrain=user?.referral_code || generateReferralCode();

  // Générer un code de parrainage unique
  function generateReferralCode() {
    if (!user?.name || !user?.email) return '';
    
    const namePart = user.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const emailPart = user.email.slice(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `BELIVE-${namePart}${randomPart}-${emailPart}`;
  }

  // Sauvegarder le code de parrainage
  useEffect(() => {
    if (user?.email && !user.referral_code) {
      const code = generateReferralCode();
      // Mettre à jour Supabase et localStorage
      db.updateUser(user.email, { referral_code: code });
      const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
      if (sv[user.email]) {
        sv[user.email].referral_code = code;
      }
      localStorage.setItem("ba6_users", JSON.stringify(sv));
      setUser({ ...user, referral_code: code });
    }
  }, [user?.email]);

  const [aiMsgs,setAiMsgs]=useState([{role:"ai",text:"Bonjour ! Je suis ton coach streaming IA 🎮\nPose-moi tes questions sur la croissance, la monétisation ou ta stratégie."}]);
  const [aiInput,setAiInput]=useState("");
  const [aiTyping,setAiTyping]=useState(false);
  const aiEnd=useRef(null);

  // ── STRIPE SÉCURISÉ (PLUS AUCUNE CLÉ SECRÈTE EXPOSÉE) ───────────────────────────────────
const STRIPE_URLS = {
  premium: "https://buy.stripe.com/cNicN430LdLj88zgru1wY05",  // 14.99€
  agency: "https://buy.stripe.com/00waEW7h15eNdsT1wA1wY04",   // 9.99€
  discounted: "https://buy.stripe.com/dRmeVc30LbDbdsTcbe1wY06" // 7.49€ (-50% automatique récurrent)
};
  const [stripe, setStripe] = useState(null);

  // Plus besoin d'initialiser Stripe - on utilise les URLs directes

  // Gérer les webhooks Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('payment') === 'success') {
      updateUserToPremium();
      alert('✅ Paiement réussi ! Bienvenue chez Belive Academy Premium 🎉');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('payment') === 'cancelled') {
      alert('❌ Paiement annulé');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Créer un abonnement via URLs sécurisées
  async function createSubscription(plan = "premium", userEmail, userData) {
    if (!userEmail) {
      alert('Erreur: email manquant');
      return;
    }

    try {
      // Vérifier si l'utilisateur a une réduction de parrainage valide
      let finalUrl = STRIPE_URLS.premium;
      let discountApplied = false;
      
      if (userData && userData.next_month_discount && 
          userData.discount_percentage === 50 && 
          userData.discount_valid_until && 
          new Date(userData.discount_valid_until) > new Date()) {
        // Appliquer le prix avec réduction 50% correct
        finalUrl = STRIPE_URLS.discounted; // Prix 7.49€ (-50% réel)
        discountApplied = true;
        
        // Afficher la confirmation
        alert(`🎉 Réduction de parrainage appliquée !\n\nTu bénéficies de -50% sur ton abonnement ce mois-ci.\nPrix: 7.49€ au lieu de 14.99€\nÉconomie: 7.50€`);
      }

      // Rediriger vers Stripe Checkout
      window.location.href = finalUrl;

      // Si réduction appliquée, la désactiver après utilisation
      if (discountApplied) {
        try {
          await db.updateUser(userEmail, {
            next_month_discount: false,
            discount_percentage: null,
            discount_valid_until: null,
            discount_month: null
          });
          
          // Mettre à jour localStorage
          const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
          if (sv[userEmail]) {
            sv[userEmail].next_month_discount = false;
            sv[userEmail].discount_percentage = null;
            sv[userEmail].discount_valid_until = null;
            sv[userEmail].discount_month = null;
          }
          localStorage.setItem("ba6_users", JSON.stringify(sv));
        } catch (e) {
          console.log("Erreur désactivation réduction:", e);
        }
      }

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'abonnement');
    }
  }

  // Fonction pour créer un abonnement agence (9.99€)
  async function createAgencySubscription() {
    await createSubscription("agency", user.email, user);
  }

  // Fonction pour créer un abonnement selon le code
  async function createSubscriptionWithCode(code) {
    // Vérifier si c'est un code d'agence pour utiliser le prix 9.99€
    const agencyCodes = ['AGENCE2025', 'BELIVEAG', 'CREATOR2025']; // Mettez vos vrais codes ici
    
    if (agencyCodes.includes(code.toUpperCase())) {
      await createAgencySubscription();
    } else {
      await createSubscription("premium", user.email, user); // Prix par défaut 14.99€
    }
  }

  // Mettre à jour l'utilisateur comme Premium
  async function updateUserToPremium() {
    if (user?.email) {
      try {
        // Mettre à jour via Supabase
        await db.updateUser(user.email, {
          plan: "pro",
          paid: true,
          planActivatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.log("Erreur Supabase:", e);
      }
      
      // Mettre à jour localStorage
      const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
      if (sv[user.email]) {
        sv[user.email].plan = "pro";
        sv[user.email].paid = true;
        sv[user.email].planActivatedAt = new Date().toISOString();
      }
      localStorage.setItem("ba6_users", JSON.stringify(sv));
      
      // Mettre à jour la session
      const updatedUser = {
        ...user,
        plan: "pro",
        paid: true,
        planActivatedAt: new Date().toISOString()
      };
      localStorage.setItem("ba6_session", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Vérifier si c'est un filleul et appliquer la réduction au parrain
      applyReferralDiscount();
    }
  }

  // Appliquer automatiquement la réduction au parrain
  async function applyReferralDiscount() {
    if (!user?.referred_by) return;
    
    try {
      const parrainages = JSON.parse(localStorage.getItem("ba6_parrainages") || "[]");
      const referral = parrainages.find(p => 
        p.filleul_email === user.email && 
        p.parrain_email === user.referred_by &&
        !p.reward_applied
      );
      
      if (!referral) return;
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usersData = JSON.parse(localStorage.getItem("ba6_users") || "{}");
      const parrain = usersData[user.referred_by];
      
      if (!parrain) return;
      
      // Vérifier si le parrain n'a pas déjà 1 réduction ce mois-ci
      const monthlyRewards = parrainages.filter(p => 
        p.parrain_email === user.referred_by && 
        p.reward_month === currentMonth
      );
      
      if (monthlyRewards.length >= 1) return; // 1 seule réduction par mois
      
      // Appliquer la réduction de 50% pour le prochain mois
      parrain.next_month_discount = true;
      parrain.discount_percentage = 50;
      parrain.discount_valid_until = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(); // 45 jours pour couvrir le prochain mois
      
      // Mettre à jour localStorage
      usersData[user.referred_by] = parrain;
      localStorage.setItem("ba6_users", JSON.stringify(usersData));
      
      // Mettre à jour Supabase
      try {
        await db.updateUser(user.referred_by, {
          next_month_discount: true,
          discount_percentage: 50,
          discount_valid_until: parrain.discount_valid_until
        });
      } catch (e) {
        console.log("Erreur mise à jour Supabase:", e);
      }
      
      // Marquer la récompense comme appliquée
      referral.reward_applied = true;
      referral.reward_month = currentMonth;
      referral.reward_type = "next_month_50_percent";
      referral.applied_at = new Date().toISOString();
      
      localStorage.setItem("ba6_parrainages", JSON.stringify(parrainages));
      
      // Notifier le parrain
      if (parrain.email === user.email) {
        alert(`🎉 Félicitations ! Tu as gagné une réduction de 50% sur ton prochain mois grâce à ton parrainage !\n\nPrix: 7.49€ au lieu de 14.99€`);
      }
      
    } catch (e) {
      console.error("Erreur application réduction parrainage:", e);
    }
  }

  useEffect(()=>{localStorage.setItem("ba6_cr",JSON.stringify(createurs));},[createurs]);
  useEffect(()=>{localStorage.setItem("ba6_st",JSON.stringify(streams));},[streams]);
  // DÉSACTIVÉ - Les requêtes Supabase déconnectent l'admin
  // useEffect(() => {
  //   if (user && user.email === "ethanbfr06@gmail.com") {
  //     db.getPartners().then(data => {
  //       if (data) {
  //         setPartners(data);
  //         localStorage.setItem("ba6_pa", JSON.stringify(data));
  //       }
  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    // Charger les données depuis Supabase
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Pour l'admin, synchroniser automatiquement les utilisateurs au chargement
        if (user.email === "ethanbfr06@gmail.com") {
          console.log("Admin détecté, synchronisation automatique...");
          
          // Essayer de synchroniser les utilisateurs
          try {
            const users = await db.getUsers();
            if (users && users.length > 0) {
              const usersObj = {};
              users.forEach(u => {
                usersObj[u.email] = u;
              });
              localStorage.setItem("ba6_users", JSON.stringify(usersObj));
              console.log("Synchronisation auto réussie:", users.length, "utilisateurs");
            }
          } catch(syncError) {
            console.log("Synchronisation échouée, utilisation des données locales:", syncError.message);
          }
        }
        
        // Charger les autres données SANS déconnecter en cas d'erreur
        try {
          const streams = await db.getStreams(user.email);
          if (streams) {
            setStreams(streams);
            localStorage.setItem("ba6_st", JSON.stringify(streams));
          }
        } catch(e) {
          console.log("Erreur streams, utilisation localStorage");
        }
        
        try {
          const codes = await db.getCodes();
          if (codes) {
            setCodes(codes);
            localStorage.setItem("ba6_cd", JSON.stringify(codes));
          }
        } catch(e) {
          console.log("Erreur codes, utilisation localStorage");
        }
        
        try {
          const contrats = await db.getContrats();
          if (contrats) {
            setContrats(contrats);
            localStorage.setItem("ba6_co", JSON.stringify(contrats));
          }
        } catch(e) {
          console.log("Erreur contrats, utilisation localStorage");
        }
        
        try {
          const referrals = await db.getReferrals();
          if (referrals) {
            setReferrals(referrals);
            localStorage.setItem("ba6_ref", JSON.stringify(referrals));
            setAdminRefs(referrals);
          }
        } catch(e) {
          console.log("Erreur referrals, utilisation localStorage");
        }
        
      } catch(e) {
        console.log("Erreur générale chargement données:", e);
        // NE PAS déconnecter l'utilisateur - continuer avec les données locales
      }
    };
    
    loadData();
  }, [user]);

  // Génère un code de parrainage unique pour chaque créateur
  function getMyReferralCode(){
    const base=(user.twitch||user.name).toUpperCase().replace(/\s/g,"").slice(0,6);
    return`REF-${base}-${user.email.slice(0,3).toUpperCase()}`;
  }

  function useReferralCode(code){
    const found=referrals.find(r=>r.code===code.toUpperCase());
    if(found){
      if(found.usedBy===user.email){alert("Tu ne peux pas utiliser ton propre code !");return false;}
      if(found.usedBy){alert("Ce code a déjà été utilisé.");return false;}
      setReferrals(p=>p.map(r=>r.code===code.toUpperCase()?{...r,usedBy:user.email,usedAt:new Date().toLocaleDateString("fr-FR")}:r));
      // Donne -50% au parrain le mois prochain
      alert("✅ Code de parrainage appliqué ! Le créateur qui t'a parrainé recevra -50% le mois prochain. Merci !");
      return true;
    }
    alert("Code de parrainage invalide.");return false;
  }

  function createMyReferralCode(){
    const code=getMyReferralCode();
    const exists=referrals.find(r=>r.code===code);
    if(!exists) setReferrals(p=>[...p,{code,owner:user.email,ownerName:user.name,createdAt:new Date().toLocaleDateString("fr-FR"),usedBy:null,usedAt:null}]);
    return code;
  }
  useEffect(()=>{aiEnd.current?.scrollIntoView({behavior:"smooth"});},[aiMsgs]);

  const role=user?.role;
  const isPro=user?.plan==="pro"||user?.plan==="unlimited"||role==="admin";
  const isBeliveCreator=user?.plan==="belive_creator";
  const trialStart=user?.trialStart?new Date(user.trialStart):null;
  const trialDays=14;
  const trialDaysLeft=trialStart?Math.max(0,trialDays-Math.floor((Date.now()-trialStart.getTime())/(1000*60*60*24))):0;
  const isInTrial=trialDaysLeft>0;
  const hasAccess=isPro||isInTrial||isBeliveCreator;

  // Charger les codes et utilisateurs depuis Supabase quand admin connecté
  useEffect(()=>{
    if(role==="admin"){
      // Charger les codes
      db.getCodes().then(data=>{
        if(data&&data.length>0){
          setCodes(data.map(c=>({
            code:c.code,
            type:c.type,
            freeType:c.free_type||"limited",
            freeDays:c.free_days||14,
            createdAt:c.created_at,
            usedBy:c.used_by,
            usedAt:c.used_at,
            owner:c.owner,
            creatorName:c.creator_name||"",
          })));
        }
      }).catch(()=>{});
      // Charger les utilisateurs depuis Supabase
      db.getUsers().then(data=>{
        if(data&&data.length>0){
          const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
          data.forEach(u=>{
            // Toujours mettre à jour plan, offert et paid depuis Supabase
            if(sv[u.email]){
              sv[u.email].plan=u.plan||sv[u.email].plan||"free";
              sv[u.email].offert=u.offert||false;
              sv[u.email].paid=u.paid||false;
            } else {
              sv[u.email]={
                name:u.name,
                role:u.role||"createur",
                password:u.password,
                plan:u.plan||"free",
                offert:u.offert||false,
                paid:u.paid||false,
                phone:u.phone,
                twitch:u.twitch,
                youtube:u.youtube,
                tiktok:u.tiktok,
                instagram:u.instagram,
                av:u.av||(u.name?u.name.charAt(0):"?"),
                trialStart:u.trial_start,
              };
            }
          });
          localStorage.setItem("ba6_users",JSON.stringify(sv));
        }
      }).catch(()=>{});
      // Charger les parrainages admin
      db.getReferrals().then(data=>{if(data&&data.length>0)setAdminRefs(data);}).catch(()=>{});
      // Charger les partenariats depuis Supabase
      db.getPartners().then(data=>{
        if(data&&data.length>0){
          setPartners(data);
        }
      }).catch(()=>{});
    }
  },[role]);
  const totalH=streams.reduce((s,r)=>s+r.duration,0);
  const avgV=streams.length?Math.round(streams.reduce((s,r)=>s+r.viewers,0)/streams.length):0;
  const maxV=streams.length?Math.max(...streams.map(s=>s.viewers)):0;
  const affPct=Math.min(100,Math.round((ms.twitch/50)*100));
  const tip=TIPS[new Date().getDate()%TIPS.length];
  const totalCand=partners.reduce((s,p)=>s+p.applicants.length,0);

  async function doLogin(){
    setAuthErr("");
    const u=ADMIN[authEmail];
    if(u&&u.password===authPass){
      setUser({email:authEmail,...u});
      askNotifPermission();
      return;
    }
    const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    if(sv[authEmail]&&sv[authEmail].password===authPass){
      const loggedUser={email:authEmail,...sv[authEmail]};
      setUser(loggedUser);
      try{
        const supaStreams=await db.getStreams(authEmail);
        if(supaStreams&&supaStreams.length>0){
          setStreams(supaStreams.map(s=>({id:s.id,date:s.date,duration:s.duration,viewers:s.viewers,platform:s.platform,user_email:s.user_email})));
        }
        // Charger les parrainages
        const supaRefs=await db.getReferralsByParrain(authEmail);
        if(supaRefs&&supaRefs.length>0) setParrainages(supaRefs);
      }catch(e){console.log("Data load failed");}
      return;
    }
    // Essayer Supabase si pas dans localStorage
    try{
      const supaUser=await db.getUser(authEmail);
      if(supaUser&&supaUser[0]&&supaUser[0].password===authPass){
        const u2=supaUser[0];
        const sv2=JSON.parse(localStorage.getItem("ba6_users")||"{}");
        sv2[authEmail]=u2;
        localStorage.setItem("ba6_users",JSON.stringify(sv2));
        setUser({email:authEmail,...u2});
        return;
      }
    }catch(e){}
    setAuthErr("Email ou mot de passe incorrect.");
  }

  async function doForgotPassword(){
    if(!forgotEmail){alert("Entre ton email.");return;}
    const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    const u=sv[forgotEmail];
    if(!u){
      // Essayer dans Supabase
      try{
        const supaUser=await db.getUser(forgotEmail);
        if(!supaUser||!supaUser[0]){alert("❌ Aucun compte avec cet email.");return;}
      }catch(e){alert("❌ Aucun compte avec cet email.");return;}
    }
    // Génère un code de réinitialisation
    const resetCode=Math.random().toString(36).slice(2,8).toUpperCase();
    const resets=JSON.parse(localStorage.getItem("ba6_resets")||"{}");
    resets[forgotEmail]={code:resetCode,expiry:Date.now()+3600000};
    localStorage.setItem("ba6_resets",JSON.stringify(resets));
    // Envoyer l'email via EmailJS
    try{
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          service_id:"service_on459ks",
          template_id:"template_ey0hwpz",
          user_id:"MTTbA9t4YLXMDdk1I",
          template_params:{
            to_email:forgotEmail,
            reset_code:resetCode,
            from_name:"Belive Academy",
          }
        })
      });
    }catch(e){}
    setForgotSent(true);
    alert(`✅ Code de réinitialisation envoyé à ${forgotEmail} !\n\nCode : ${resetCode}\n(Valable 1 heure)`);
  }

  function doResetPassword(newPass){
    const resets=JSON.parse(localStorage.getItem("ba6_resets")||"{}");
    const r=resets[forgotEmail];
    if(!r||Date.now()>r.expiry){alert("❌ Code expiré.");return;}
    const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    if(sv[forgotEmail]){
      sv[forgotEmail].password=newPass;
      localStorage.setItem("ba6_users",JSON.stringify(sv));
    }
    delete resets[forgotEmail];
    localStorage.setItem("ba6_resets",JSON.stringify(resets));
    setIsForgot(false);
    setForgotSent(false);
    setForgotEmail("");
    alert("✅ Mot de passe réinitialisé ! Tu peux te connecter.");
  }

  async function doReg(){
    const{name,email,pass,phone,twitch,youtube,tiktok,instagram,code}=reg;
    if(!name||!email||!pass||!phone){alert("Nom, email, mot de passe et téléphone obligatoires.");return;}
    if(!regAge){alert("⚠️ Tu dois confirmer avoir 18 ans ou plus.");return;}
    if(!regCGU){alert("⚠️ Tu dois accepter les CGU et la politique de confidentialité.");return;}
    
    let r2="createur";
    let plan="free";
    let trialDaysFromCode=14;
    let referredBy = null;
    let discountApplied = false;
    
    // Vérifier les codes de parrainage
    if(code){
      // Vérifier d'abord si c'est un code de parrainage
      const usersData=JSON.parse(localStorage.getItem("ba6_users")||"{}");
      const referrer = Object.values(usersData).find(u => u.referral_code === code.toUpperCase());
      
      if(referrer){
        // C'est un code de parrainage valide
        referredBy = referrer.email;
        discountApplied = true;
        trialDaysFromCode = 30; // 30 jours au lieu de 14
        
        // Enregistrer le parrainage
        const parrainages = JSON.parse(localStorage.getItem("ba6_parrainages")||"[]");
        parrainages.push({
          parrain_email: referrer.email,
          filleul_email: email,
          filleul_name: name,
          code_used: code.toUpperCase(),
          discount_given: true,
          created_at: new Date().toISOString(),
          reward_applied: false
        });
        localStorage.setItem("ba6_parrainages", JSON.stringify(parrainages));
        
        alert(`🎉 Code de parrainage valide !\n\nBienvenue ${name} !\nTu bénéficies de 30 jours d'essai au lieu de 14 grâce à ${referrer.name} !`);
      } else {
        // Vérifier les codes spéciaux (agence, etc.)
        let f=null;
        try{
          const supaResult=await db.getCodes();
          if(supaResult){
            f=supaResult.find(c=>c.code===code.toUpperCase()&&!c.used_by);
            if(f){
              await db.useCode(f.code, name);
              f={...f, freeType:f.free_type, freeDays:f.free_days, usedBy:null};
            }
          }
        }catch(e){
          f=codes.find(c=>c.code===code.toUpperCase()&&!c.usedBy);
          if(f) setCodes(p=>p.map(c=>c.code===f.code?{...c,usedBy:name,usedAt:new Date().toISOString()}:c));
        }
        if(!f){alert("❌ Code invalide ou déjà utilisé.");return;}
        r2=f.type||"createur";
        if(f.freeType==="belive_creator"||f.free_type==="belive_creator") plan="belive_creator";
        if(f.freeType==="unlimited"||f.free_type==="unlimited"){plan="pro";}
        if((f.freeType==="limited"||f.free_type==="limited")&&(f.freeDays||f.free_days)) trialDaysFromCode=f.freeDays||f.free_days;
      }
    }
    const isOffert=plan==="pro"&&true;
    const trialEnd=new Date(Date.now()+trialDaysFromCode*24*60*60*1000).toISOString();
    // Génère un code parrain unique
    const refCode=generateReferralCode();
    const nu={name,role:r2,password:pass,av:name.charAt(0).toUpperCase(),plan,offert:plan==="pro"?true:false,phone,twitch,youtube,tiktok,instagram,trialStart:new Date().toISOString(),trialEnd,ageVerified:true,cguAccepted:new Date().toISOString(),referral_code:refCode,referred_by: referredBy, discount_applied: discountApplied};
    const usersStorage=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    usersStorage[email]=nu;
    localStorage.setItem("ba6_users",JSON.stringify(usersStorage));
    // Sauvegarde dans Supabase
    try{
      await db.createUser({email,name,role:r2,password:pass,plan,phone,twitch,youtube,tiktok,instagram,av:name.charAt(0).toUpperCase(),trial_start:new Date().toISOString(),referral_code:refCode,referred_by: referredBy});
    }catch(e){console.log("User save to Supabase failed");}
    
    // Si inscrit avec un code parrain — créer le lien parrainage
    if(referredBy){
      try{
        // Donner une récompense au parrain (réduction sur son prochain mois)
        const parrainages = JSON.parse(localStorage.getItem("ba6_parrainages")||"[]");
        const currentMonth = new Date().toISOString().slice(0,7);
        
        // Vérifier si le parrain a déjà une récompense ce mois-ci
        const monthlyRewards = parrainages.filter(p => 
          p.parrain_email === referredBy && 
          p.reward_month === currentMonth
        );
        
        if(monthlyRewards.length < 1) { // Max 1 récompense par mois
          // Ajouter une réduction pour le parrain
          const usersData = JSON.parse(localStorage.getItem("ba6_users")||"{}");
          if(usersData[referredBy]){
            usersData[referredBy].referral_discounts = (usersData[referredBy].referral_discounts || 0) + 1;
            usersData[referredBy].next_month_discount = true;
            localStorage.setItem("ba6_users", JSON.stringify(usersData));
          }
          
          // Marquer la récompense comme appliquée
          const referralIndex = parrainages.findIndex(p => 
            p.filleul_email === email && p.parrain_email === referredBy
          );
          if(referralIndex !== -1){
            parrainages[referralIndex].reward_applied = true;
            parrainages[referralIndex].reward_month = currentMonth;
            parrainages[referralIndex].reward_type = "next_month_discount";
            localStorage.setItem("ba6_parrainages", JSON.stringify(parrainages));
          }
        }
      }catch(e){console.log("Referral reward failed:", e);}
    }
    
    // Connecter l'utilisateur
    setUser({email,role:r2,name,phone,twitch,youtube,tiktok,instagram,plan,offert:isOffert,trialStart:new Date().toISOString(),trialEnd,av:name.charAt(0).toUpperCase(),referral_code:refCode});
    localStorage.setItem("ba6_session",JSON.stringify({email,role:r2,name,phone,twitch,youtube,tiktok,instagram,plan,offert:isOffert,trialStart:new Date().toISOString(),trialEnd,av:name.charAt(0).toUpperCase(),referral_code:refCode}));
    
    // Réinitialiser le formulaire
    setReg({name:"",email:"",pass:"",phone:"",twitch:"",youtube:"",tiktok:"",instagram:"",code:"",referralCode:""});
    setRegAge(false);
    setRegCGU(false);
    setIsReg(false);
    
    alert(`✅ Bienvenue ${name} sur Belive Academy !\n\n${discountApplied ? "Tu as bénéficié de l'offre de parrainage !" : "Ton compte est créé avec succès !"}`);
  }

  const TWITCH_CLIENT_ID="splan7frqhf243aohn4l08n3z3a82c";
  const TWITCH_SECRET="o8zr3ahhc0lyqzntmwsrwti6bnc73r";

  async function getTwitchToken(){
    const res=await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`,{method:"POST"});
    const data=await res.json();
    return data.access_token;
  }

  async function refreshTwitchStats(){
    if(!user?.twitch)return;
    try{
      const token=await getTwitchToken();
      // Followers
      const userRes=await fetch(`https://api.twitch.tv/helix/users?login=${user.twitch}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const userData=await userRes.json();
      if(!userData.data||userData.data.length===0)return;
      const twitchUser=userData.data[0];
      const followRes=await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${twitchUser.id}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const followData=await followRes.json();
      const followers=followData.total||0;
      // Stream en direct
      const streamRes=await fetch(`https://api.twitch.tv/helix/streams?user_login=${user.twitch}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const streamData=await streamRes.json();
      const liveStream=streamData.data&&streamData.data[0];
      const liveViewers=liveStream?liveStream.viewer_count:0;
      const isLiveNow=!!liveStream;
      setMs(p=>({...p,twitch:followers,liveViewers,isLive:isLiveNow}));
      if(isLiveNow) setUser(p=>({...p,isLive:true,liveViewers}));
    }catch(e){console.log("Twitch refresh failed");}
  }

  // Rafraîchir les stats Twitch toutes les 2 minutes si connecté
  useEffect(()=>{
    if(user?.twitch&&role==="createur"){
      refreshTwitchStats();
      const interval=setInterval(refreshTwitchStats, 120000);
      return ()=>clearInterval(interval);
    }
  },[user?.twitch, role]);

  async function connectTwitch(){
    const pseudo=prompt("Entre ton pseudo Twitch :");
    if(!pseudo)return;
    try{
      const token=await getTwitchToken();
      const userRes=await fetch(`https://api.twitch.tv/helix/users?login=${pseudo}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const userData=await userRes.json();
      if(!userData.data||userData.data.length===0){alert("❌ Pseudo Twitch introuvable.");return;}
      const twitchUser=userData.data[0];
      const followRes=await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${twitchUser.id}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const followData=await followRes.json();
      const followers=followData.total||0;
      // Vérifier si en live
      const streamRes=await fetch(`https://api.twitch.tv/helix/streams?user_login=${pseudo}`,{headers:{"Client-ID":TWITCH_CLIENT_ID,"Authorization":`Bearer ${token}`}});
      const streamData=await streamRes.json();
      const liveStream=streamData.data&&streamData.data[0];
      const liveViewers=liveStream?liveStream.viewer_count:0;
      setUser(p=>({...p,twitch:pseudo,twitchId:twitchUser.id,twitchAvatar:twitchUser.profile_image_url,isLive:!!liveStream,liveViewers}));
      setMs(p=>({...p,twitch:followers,liveViewers,isLive:!!liveStream}));
      alert(`✅ Twitch @${pseudo} connecté !\n👥 ${followers.toLocaleString()} followers\n${liveStream?`🔴 EN LIVE — ${liveViewers} viewers`:"⚫ Pas en live"}`);
    }catch(e){
      const followers=parseInt(prompt("Combien de followers Twitch as-tu ?")||"0");
      setUser(p=>({...p,twitch:pseudo}));
      setMs(p=>({...p,twitch:followers}));
      alert(`✅ Twitch @${pseudo} connecté !`);
    }
  }
  const YOUTUBE_KEY="AIzaSyDiXDzDOnnI-nbLVSU4SZKFM-14v7czCi0";

  async function refreshYoutubeStats(){
    if(!user?.youtubeId)return;
    try{
      const res=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${user.youtubeId}&key=${YOUTUBE_KEY}`);
      const data=await res.json();
      if(data.items&&data.items[0]){
        const subs=parseInt(data.items[0].statistics.subscriberCount||0);
        const views=parseInt(data.items[0].statistics.viewCount||0);
        setMs(p=>({...p,youtube:subs,youtubeViews:views}));
      }
    }catch(e){console.log("YouTube refresh failed");}
  }

  // Rafraîchir les stats YouTube toutes les 5 minutes
  useEffect(()=>{
    if(user?.youtubeId&&role==="createur"){
      refreshYoutubeStats();
      const interval=setInterval(refreshYoutubeStats, 300000);
      return ()=>clearInterval(interval);
    }
  },[user?.youtubeId, role]);

  async function connectYoutube(){
    const ch=prompt("Entre le nom ou l'URL de ta chaîne YouTube :");
    if(!ch)return;
    try{
      const query=ch.replace("https://www.youtube.com/@","").replace("@","");
      const res=await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${query}&key=${YOUTUBE_KEY}`);
      const data=await res.json();
      if(!data.items||data.items.length===0){alert("❌ Chaîne YouTube introuvable.");return;}
      const channelId=data.items[0].snippet.channelId;
      const statsRes=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_KEY}`);
      const statsData=await statsRes.json();
      const channel=statsData.items[0];
      const subs=parseInt(channel.statistics.subscriberCount||0);
      setUser(p=>({...p,youtube:channel.snippet.title,youtubeId:channelId}));
      setMs(p=>({...p,youtube:subs}));
      alert(`✅ YouTube "${channel.snippet.title}" connecté ! ${subs.toLocaleString()} abonnés récupérés.`);
    }catch(e){
      const subs=parseInt(prompt("Combien d'abonnés YouTube as-tu ?")||"0");
      setUser(p=>({...p,youtube:ch}));
      setMs(p=>({...p,youtube:subs}));
      alert(`✅ YouTube "${ch}" connecté !`);
    }
  }

  async function sendAI(){if(!aiInput.trim())return;const q=aiInput;setAiInput("");setAiMsgs(p=>[...p,{role:"user",text:q}]);setAiTyping(true);await new Promise(r=>setTimeout(r,900+Math.random()*700));setAiTyping(false);setAiMsgs(p=>[...p,{role:"ai",text:AI_R(q,avgV)}]);}

  async function addStream(){
    const{date,dur,viewers,platform}=newSt;
    if(!date||!dur){alert("Date et durée obligatoires.");return;}
    const newStream={id:Date.now(),date,duration:parseFloat(dur),viewers:parseInt(viewers)||0,platform,user_email:user.email};
    setStreams(p=>[...p,newStream]);
    // Sauvegarde dans Supabase
    try{
      await db.addStream({
        user_email:user.email,
        date,
        duration:parseFloat(dur),
        viewers:parseInt(viewers)||0,
        platform,
      });
    }catch(e){console.log("Stream save to Supabase failed");}
    setNewSt({date:"",dur:"",viewers:"",platform:"twitch"});
    setModal(null);
  }
  function addScheduleItem(){
    const item={id:Date.now(),...newSc,duration:parseInt(newSc.dur)};
    setSchedule(p=>[...p,item]);
    // Demande permission notif automatiquement
    if("Notification" in window && Notification.permission==="default"){
      Notification.requestPermission().then(p=>{
        if(p==="granted") sendNotif("🔔 Rappels activés !","Tu recevras des notifications 1h avant chaque stream","planning-ok");
      });
    }
    setModal(null);
  }
  function addWeekScheduleItems(){
    const selectedDays=DAYS.filter(d=>weekSc.days[d]);
    if(selectedDays.length===0){alert("Sélectionne au moins un jour.");return;}
    if(!weekSc.time||!weekSc.dur){alert("Heure et durée obligatoires.");return;}
    const duration=parseFloat(weekSc.dur);
    const baseId=Date.now();
    const newItems=selectedDays.map((day,idx)=>({
      id:baseId+idx,
      day,
      time:weekSc.time,
      dur:weekSc.dur,
      duration,
      platform:weekSc.platform,
    }));
    setSchedule(p=>[...p,...newItems]);
    if("Notification" in window && Notification.permission==="default"){
      Notification.requestPermission().then(p=>{
        if(p==="granted") sendNotif("🔔 Rappels activés !","Tu recevras des notifications 1h avant chaque stream","planning-ok");
      });
    }
    setModal(null);
    alert(`✅ ${newItems.length} stream(s) planifié(s) pour la semaine.`);
  }
  function saveStats(){setMs({twitch:parseInt(mSt.twitch)||ms.twitch,youtube:parseInt(mSt.youtube)||ms.youtube,tiktok:parseInt(mSt.tiktok)||ms.tiktok});alert("✅ Stats sauvegardées !");}
  function requestNotif(s){
    const platformIcons={twitch:"🟣",youtube:"▶️",tiktok:"🎵"};
    if(!notifPrefs.planning){alert("Tu as désactivé les notifications de planning dans ton profil.");return;}
    if(!("Notification" in window)){alert("Notifications non supportées sur cet appareil.");return;}
    Notification.requestPermission().then(p=>{
      if(p==="granted"){
        const[h,m]=s.time.split(":").map(Number);
        const streamMs=new Date();streamMs.setHours(h,m-60,0,0);
        const delay=streamMs-Date.now();
        if(delay>0){setTimeout(()=>new Notification("🔴 Belive Academy",{body:`Ton stream ${platformIcons[s.platform]} commence dans 1 heure !`,icon:"https://beliveacademy.com/favicon.ico"}),delay);}
        alert(`✅ Rappel activé ! Tu recevras une notification 1h avant ton stream du ${s.day} à ${s.time}`);
      }else{alert("Active les notifications dans les paramètres de ton navigateur.");}
    });
  }

  function deleteUser(email){
    if(!confirm(`Supprimer définitivement ce créateur ?`))return;
    const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    delete sv[email];
    localStorage.setItem("ba6_users",JSON.stringify(sv));
    setCreateurs(p=>p.filter(c=>c.email!==email));
    alert("✅ Créateur supprimé.");
  }

  async function togglePro(email){
    const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    if(sv[email]){
      if(sv[email].plan==="pro"){
        sv[email].plan="free";
        sv[email].offert=false;
        await db.updateUser(email,{plan:"free",offert:false});
      } else {
        const isPaid=window.confirm("Ce créateur a-t-il payé ?\n\nOK = Payant (compté dans les revenus)\nAnnuler = Offert (gratuit, non compté)");
        sv[email].plan="pro";
        sv[email].offert=!isPaid;
        await db.updateUser(email,{plan:"pro",offert:!isPaid,paid:isPaid});
      }
      localStorage.setItem("ba6_users",JSON.stringify(sv));
    }
    setCreateurs(p=>p.map(c=>c.email===email?{...c,plan:sv[email]?.plan,offert:sv[email]?.offert}:c));
  }

  async function genCode(type, freeType="limited", freeDays=14, creatorName=""){
    const ch="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const seg1=Array.from({length:6},()=>ch[Math.floor(Math.random()*ch.length)]).join("");
    const seg2=Array.from({length:6},()=>ch[Math.floor(Math.random()*ch.length)]).join("");
    const seg3=Array.from({length:4},()=>ch[Math.floor(Math.random()*ch.length)]).join("");
    const prefix=type==="createur"?"BELIVE":type==="parrain"?"PARRAIN":"AGENT";
    const newCode={
      code:`${prefix}-${seg1}-${seg2}-${seg3}`,
      type,
      freeType,
      freeDays: freeType==="limited"?freeDays:null,
      createdAt:new Date().toISOString(),
      expiresAt:null,
      usedBy:null,
      usedAt:null,
      owner:user.name,
      creatorName: creatorName||"",
    };
    // Sauvegarde dans Supabase
    try{
      const result = await db.addCode({
        code:newCode.code,
        type:newCode.type,
        free_type:newCode.freeType,
        free_days:newCode.freeDays,
        used_by:null,
        used_at:null,
        owner:newCode.owner,
        creator_name:newCode.creatorName,
        created_at:newCode.createdAt,
      });
      if(result){
        alert(`✅ Code ${newCode.code} créé et sauvegardé !`);
      } else {
        alert(`⚠️ Code créé mais non sauvegardé dans Supabase. Erreur de connexion.`);
      }
    }catch(e){
      alert(`❌ Erreur Supabase : ${e.message}`);
    }
    setCodes(p=>[...p,newCode]);
  }

  function genReferral(){const ch="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const rand=Array.from({length:6},()=>ch[Math.floor(Math.random()*ch.length)]).join("");const code=`PARRAIN-${rand}`;const saved=JSON.parse(localStorage.getItem("ba6_referrals")||"{}");if(!saved[user.email]){saved[user.email]={code,uses:0,discount:false};localStorage.setItem("ba6_referrals",JSON.stringify(saved));}return saved[user.email];}

  function getReferral(){const saved=JSON.parse(localStorage.getItem("ba6_referrals")||"{}");return saved[user?.email]||null;}

  function addCreateur(){const{name,email,phone,twitch,youtube,tiktok,instagram,formule}=newCr;if(!name||!email){alert("Nom et email obligatoires.");return;}setCreateurs(p=>[...p,{id:Date.now(),name,email,phone,twitch,youtube,tiktok,instagram,formule,status:"actif",date:new Date().toLocaleDateString("fr-FR")}]);setNewCr({name:"",email:"",phone:"",twitch:"",youtube:"",tiktok:"",instagram:"",formule:"commission"});setModal(null);}

  function applyPartner(pid){
  const partner = partners.find(p=>p.id===pid);
  if(!partner) return;
  
  // Vérifier si le créateur a accès à ce partenariat
  if(partner.accessEnabled === false) {
    alert("❌ Ce partenariat n'est pas accessible aux créateurs pour le moment.");
    return;
  }
  
  const already=partner.applicants.find(a=>a.email===user.email);
  if(already){
    alert("Tu as déjà postulé !");
    return;
  }
  
  // Mettre à jour localement
  setPartners(prev=>prev.map(p=>p.id!==pid?p:{...p,applicants:[...p.applicants,{name:user.name,email:user.email,phone:user.phone||"—",twitch:user.twitch||"—",youtube:user.youtube||"—",tiktok:user.tiktok||"—",instagram:user.instagram||"—",date:new Date().toLocaleDateString("fr-FR")}]}));
  
  // Sauvegarder dans Supabase
  try {
    const updatedPartner = {...partner, applicants: [...partner.applicants, {name:user.name,email:user.email,phone:user.phone||"—",twitch:user.twitch||"—",youtube:user.youtube||"—",tiktok:user.tiktok||"—",instagram:user.instagram||"—",date:new Date().toLocaleDateString("fr-FR")}]};
    db.updatePartner(pid, {applicants: updatedPartner.applicants});
    alert("✅ Candidature envoyée ! Belive Academy te contactera.");
  } catch(e) {
    alert("⚠️ Candidature envoyée localement. Erreur de sauvegarde.");
  }
}

  // Fonctions admin pour gérer les partenariats
  async function addNewPartner(partnerData) {
    try {
      const result = await db.addPartner(partnerData);
      if(result) {
        setPartners(p=>[...p, {...partnerData, id: result[0]?.id || Date.now()}]);
        alert("✅ Partenariat créé et sauvegardé !");
        return true;
      } else {
        alert("⚠️ Partenariat créé mais non sauvegardé dans Supabase.");
        return false;
      }
    } catch(e) {
      alert(`❌ Erreur Supabase : ${e.message}`);
      return false;
    }
  }

  async function updatePartnerAccess(id, accessEnabled) {
    try {
      await db.updatePartner(id, { accessEnabled });
      setPartners(p=>p.map(partner => 
        partner.id === id ? {...partner, accessEnabled} : partner
      ));
      alert(`✅ Accès du partenariat ${accessEnabled ? 'activé' : 'désactivé'} !`);
      return true;
    } catch(e) {
      alert(`❌ Erreur mise à jour : ${e.message}`);
      return false;
    }
  }

  async function deletePartnerFromDB(id) {
    if(!confirm("Supprimer définitivement ce partenariat ?")) return false;
    
    try {
      await db.deletePartner(id);
      setPartners(p=>p.filter(p=>p.id!==id));
      alert("✅ Partenariat supprimé !");
      return true;
    } catch(e) {
      alert(`❌ Erreur suppression : ${e.message}`);
      return false;
    }
  }

  async function saveContract(){
    if(!ct.createur)return;
    setContrats(p=>[...p,{id:Date.now(),...ct.createur,formule:ct.formule,commission:ct.commission,montant:ct.montant,duree:ct.duree,date:new Date().toLocaleDateString("fr-FR")}]);

    const today=new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
    const revenus=[ct.inclPartenariats&&"Partenariats",ct.inclPubs&&"Publicités",ct.inclSubs&&"Subs",ct.inclBits&&"Bits",ct.inclMerchandise&&"Merchandise",ct.inclDons&&"Dons"].filter(Boolean).join(", ")||"Tous";
    const prestations=[ct.prestCoaching&&"Coaching personnalisé",ct.prestStats&&"Suivi statistiques",ct.prestPartenariats&&"Recherche partenariats",ct.prestStrategie&&"Stratégie de croissance",ct.prestApp&&"Accès app Belive Academy",ct.prestGroupe&&"Accès groupe privé",ct.prestContenu&&"Aide création contenu",ct.prestReseaux&&"Gestion réseaux sociaux"].filter(Boolean);

    try{
      // Génération PDF avec jsPDF
      const script=document.createElement("script");
      script.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.head.appendChild(script);
      await new Promise(r=>script.onload=r);

      const {jsPDF}=window.jspdf;
      const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const W=210, M=18;

      // Header noir
      doc.setFillColor(17,17,17);
      doc.rect(0,0,W,32,"F");

      // Logo BELIVE
      doc.setFont("helvetica","bold");
      doc.setFontSize(22);
      doc.setTextColor(255,255,255);
      doc.text("BELIVE",M,20);
      doc.setTextColor(212,16,63);
      doc.text("ACADEMY",M+38,20);

      // Badge
      doc.setFillColor(212,16,63);
      doc.roundedRect(130,12,62,10,3,3,"F");
      doc.setFontSize(7);
      doc.setTextColor(255,255,255);
      doc.text("CONTRAT D'ACCOMPAGNEMENT",133,18.5);

      // Ligne rouge
      doc.setFillColor(212,16,63);
      doc.rect(0,32,W,2,"F");

      let y=44;

      // Titre
      doc.setFont("helvetica","bold");
      doc.setFontSize(14);
      doc.setTextColor(17,17,17);
      doc.text("CONTRAT D'ACCOMPAGNEMENT CRÉATEUR",M,y);
      y+=7;
      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.setTextColor(130,130,130);
      doc.text(`Fait le ${today}`,M,y);
      y+=12;

      // Deux colonnes agence/créateur
      const colW=82;
      // Agence
      doc.setFillColor(248,248,248);
      doc.roundedRect(M,y,colW,40,3,3,"F");
      doc.setFillColor(212,16,63);
      doc.rect(M,y,3,40,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(212,16,63);
      doc.text("AGENCE",M+6,y+7);
      doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(50,50,50);
      doc.text("Belive Academy — Ethan",M+6,y+14);
      doc.text("ethan@beliveacademy.com",M+6,y+20);
      doc.text("07 80 99 92 51",M+6,y+26);
      doc.text("beliveacademy.com",M+6,y+32);

      // Créateur
      const cx=M+colW+8;
      doc.setFillColor(248,248,248);
      doc.roundedRect(cx,y,colW,40,3,3,"F");
      doc.setFillColor(212,16,63);
      doc.rect(cx,y,3,40,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(212,16,63);
      doc.text("CRÉATEUR",cx+6,y+7);
      doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(50,50,50);
      doc.text(ct.createur?.name||"—",cx+6,y+14);
      doc.text(ct.createur?.email||"—",cx+6,y+20);
      doc.text(ct.createur?.twitch?"@"+ct.createur.twitch:"—",cx+6,y+26);
      doc.text(ct.createur?.youtube||"—",cx+6,y+32);
      y+=48;

      // Formule
      doc.setFillColor(17,17,17);
      doc.roundedRect(M,y,W-M*2,38,3,3,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(212,16,63);
      doc.text(`FORMULE : ${ct.formule==="commission"?"COMMISSION":"COACHING PREMIUM"}`,M+6,y+8);
      const items=[
        [ct.formule==="commission"?"Frais d'entrée":"Mensualité",`${ct.montant}€`],
        ["Commission",`${ct.commission}%`],
        ["Durée",ct.duree],
        ["Préavis",ct.preavis||"15j"],
      ];
      items.forEach(([l,v],i)=>{
        const ix=M+6+(i%2)*87, iy=y+16+(Math.floor(i/2)*9);
        doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(150,150,150);
        doc.text(l,ix,iy);
        doc.setFont("helvetica","bold");doc.setTextColor(255,255,255);
        doc.text(v,ix+28,iy);
      });
      doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(150,150,150);
      doc.text("Revenus : "+revenus,M+6,y+34);
      y+=46;

      // Prestations
      doc.setFillColor(248,248,248);
      doc.roundedRect(M,y,W-M*2,prestations.length>4?30:22,3,3,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(212,16,63);
      doc.text("PRESTATIONS INCLUSES",M+6,y+7);
      prestations.forEach((p,i)=>{
        const px=M+6+(i%2)*87, py=y+14+(Math.floor(i/2)*7);
        doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(50,50,50);
        doc.text("✓ "+p,px,py);
      });
      y+=(prestations.length>4?38:30);

      // Signatures
      y+=6;
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(17,17,17);
      doc.text("SIGNATURES — Fait le "+today,M,y);
      y+=8;
      [[`Ethan — Belive Academy`,"Signature de l'agence",true],[ct.createur?.name||"___","Signature + Lu et approuvé",false]].forEach(([name,label,signed],i)=>{
        const sx=M+(i*92);
        doc.setDrawColor(230,230,230);doc.setLineWidth(0.5);
        doc.rect(sx,y,82,28);
        doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(17,17,17);
        doc.text(name,sx+6,y+8);
        // Signature Belive Academy pré-signée
        if(signed){
          doc.setFont("helvetica","bolditalic");doc.setFontSize(14);doc.setTextColor(212,16,63);
          doc.text("Belive Academy",sx+6,y+19);
        } else {
          doc.setDrawColor(212,16,63);doc.setLineWidth(1);
          doc.line(sx+8,y+20,sx+74,y+20);
        }
        doc.setFont("helvetica","normal");doc.setFontSize(7);doc.setTextColor(150,150,150);
        doc.text(label,sx+6,y+26);
      });

      // Footer
      doc.setFillColor(17,17,17);
      doc.rect(0,272,W,25,"F");
      doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(255,255,255);
      doc.text("BELIVE ",M,283);
      doc.setTextColor(212,16,63);
      doc.text("ACADEMY",M+20,283);
      doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120,120,120);
      doc.text("beliveacademy.com • ethan@beliveacademy.com • 07 80 99 92 51",M,289);

      const pdfBase64=doc.output("datauristring").split(",")[1];

      // Envoi via EmailJS
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({service_id:"service_on459ks",template_id:"template_7kpdxpg",user_id:"MTTbA9t4YLXMDdk1I",
          template_params:{to_email:"ethan@beliveacademy.com",to_name:"Ethan — Belive Academy",from_name:ct.createur.name+" via Belive Academy",contrat:`Contrat pour ${ct.createur.name} — ${ct.formule} — ${ct.montant}€ — ${ct.commission}% — ${ct.duree}`,createur_email:ct.createur.email,createur_name:ct.createur.name}
        })
      });
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({service_id:"service_on459ks",template_id:"template_7kpdxpg",user_id:"MTTbA9t4YLXMDdk1I",
          template_params:{to_email:ct.createur.email,to_name:ct.createur.name,from_name:"Ethan — Belive Academy",contrat:`Voici ton contrat Belive Academy — ${ct.formule} — ${ct.montant}€ — ${ct.commission}% — ${ct.duree}`,createur_email:ct.createur.email,createur_name:ct.createur.name}
        })
      });

      // Téléchargement automatique du PDF
      doc.save(`Contrat-Belive-Academy-${ct.createur.name.replace(/ /g,"-")}.pdf`);
      alert(`✅ Contrat PDF généré et emails envoyés !\n📧 ethan@beliveacademy.com\n📧 ${ct.createur.email}`);
    }catch(e){
      console.log(e);
      alert(`✅ Contrat sauvegardé !\n📧 Email envoyé à : ${ct.createur.email}`);
    }
    setModal(null);
  }
  function openContract(c){setCt({
    createur:c,
    formule:c.formule||"commission",
    commission:"25",
    montant:c.formule==="premium"?"14.99":"19",
    duree:"Sans engagement",
    preavis:"15 jours",
    // Revenus
    inclDons:false,
    inclPubs:true,
    inclPartenariats:true,
    inclSubs:true,
    inclBits:true,
    inclMerchandise:true,
    // Prestations
    prestCoaching:true,
    prestStats:true,
    prestPartenariats:true,
    prestStrategie:true,
    prestApp:true,
    prestGroupe:true,
    prestContenu:false,
    prestReseaux:false,
    // Options
    clauseExclu:"",
    noteLibre:"",
  });setModal("contract");}

  async function cancelSubscription(){
    if(!confirm("⚠️ Tu es sûr de vouloir annuler ton abonnement ?\n\nTu perdras l'accès à toutes les fonctionnalités premium à la fin de la période en cours.")) return;
    
    try{
      // Utiliser Supabase pour gérer l'annulation Stripe
      const { data, error } = await supabase
        .rpc('cancel_stripe_subscription', {
          user_email: user.email
        });
      
      if(error){
        console.error('Erreur Supabase:', error);
        alert("❌ Erreur lors de l'annulation. Contacte le support : ethan@beliveacademy.com");
        return;
      }
      
      // Mettre à jour l'état local
      const sv=JSON.parse(localStorage.getItem("ba6_users")||"{}");
      if(sv[user.email]){
        sv[user.email].plan="free";
        sv[user.email].paid=false;
        sv[user.email].cancelledAt=new Date().toISOString();
      }
      localStorage.setItem("ba6_users",JSON.stringify(sv));
      
      setUser({...user,plan:"free",paid:false,cancelledAt:new Date().toISOString()});
      
      alert("✅ Ton abonnement a été annulé. Tu continueras à bénéficier des avantages jusqu'à la fin de ta période en cours.");
      
    }catch(e){
      console.error('Erreur:', e);
      alert("❌ Erreur de connexion. Contacte le support : ethan@beliveacademy.com");
    }
  }

  const navItems=[
    {id:"dashboard",    icon:"⬡", label:"Dashboard",    roles:["admin","createur"]},
    {id:"coach",        icon:"✦", label:"Coach IA",      roles:["createur"],         badge:"IA"},
    {id:"stats",        icon:"↗", label:"Statistiques",  roles:["admin","createur"]},
    {id:"planning",     icon:"◷", label:"Planning",      roles:["admin","createur"]},
    {id:"partenariats", icon:"◉", label:"Partenariats",  roles:["admin","createur"], badge:"NEW"},
    {id:"communaute",   icon:"◎", label:"Communauté",    roles:["admin","createur"]},
    {id:"classement",   icon:"◆", label:"Classement",    roles:["admin","createur"]},
    {id:"templates",    icon:"🎨",label:"Templates",     roles:["createur"]},
    {id:"parrainage",   icon:"🎁",label:"Parrainage",    roles:["createur"]},
    {id:"createurs",    icon:"▣", label:"Créateurs",     roles:["admin"],            section:"GESTION"},
    {id:"contrats",     icon:"▤", label:"Contrats",      roles:["admin"]},
    {id:"codes",        icon:"▧", label:"Codes",         roles:["admin"]},
    {id:"parrainages",  icon:"🎁", label:"Parrainages",   roles:["admin"]},
  ].filter(n=>n.roles.includes(role));

  // Pages publiques CGU et Politique
  if(publicPage){
    return(
      <div style={{minHeight:"100vh",background:D,color:"white",padding:20}}>
        <style>{css}</style>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:36,letterSpacing:2,marginBottom:8}}>
              BELIVE <span style={{color:R}}>ACADEMY</span>
            </div>
            <div style={{fontSize:14,color:M}}>
              {publicPage==="cgu"?"Conditions Générales d'Utilisation":"Politique de Confidentialité"}
            </div>
          </div>
          
          <div style={{background:C,border:`1px solid ${B}`,borderRadius:16,padding:32,lineHeight:1.6}}>
            {publicPage==="cgu"?(
              <div>
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>1. Objet</h3>
                <p style={{marginBottom:20,fontSize:14}}>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Belive Academy.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>2. Accès au service</h3>
                <p style={{marginBottom:20,fontSize:14}}>Belive Academy est réservée aux personnes majeures (18 ans et plus). L'inscription est soumise à acceptation des présentes CGU.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>3. Services proposés</h3>
                <ul style={{marginBottom:20,marginLeft:24,fontSize:14}}>
                  <li style={{marginBottom:8}}>Accompagnement de créateurs de contenu</li>
                  <li style={{marginBottom:8}}>Formation et coaching streaming</li>
                  <li style={{marginBottom:8}}>Mise en relation avec des partenaires</li>
                  <li style={{marginBottom:8}}>Accès à une communauté de créateurs</li>
                </ul>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>4. Obligations des membres</h3>
                <p style={{marginBottom:16,fontSize:14}}>Les membres s'engagent à :</p>
                <ul style={{marginBottom:20,marginLeft:24,fontSize:14}}>
                  <li style={{marginBottom:8}}>Fournir des informations exactes</li>
                  <li style={{marginBottom:8}}>Respecter les autres membres</li>
                  <li style={{marginBottom:8}}>Ne pas partager de contenu illégal</li>
                  <li style={{marginBottom:8}}>Payer les frais d'abonnement souscrits</li>
                </ul>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>5. Tarification</h3>
                <p style={{marginBottom:20,fontSize:14}}>Les tarifs sont consultables sur la plateforme. Belive Academy se réserve le droit de modifier les tarifs sous préavis de 30 jours.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>6. Propriété intellectuelle</h3>
                <p style={{marginBottom:20,fontSize:14}}>Le contenu de la plateforme est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>7. Résiliation</h3>
                <p style={{marginBottom:20,fontSize:14}}>L'utilisateur peut résilier son compte à tout moment. Belive Academy se réserve le droit de résilier un compte en cas de manquement aux CGU.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>8. Contact</h3>
                <p style={{fontSize:14,marginBottom:20}}>
                  <strong>Email :</strong> ethan@beliveacademy.com<br/>
                  <strong>Téléphone :</strong> 07 80 99 92 51<br/>
                  <strong>Site :</strong> beliveacademy.com
                </p>
              </div>
            ):(
              <div>
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>1. Collecte des données</h3>
                <p style={{marginBottom:16,fontSize:14}}>Belive Academy collecte les données suivantes :</p>
                <ul style={{marginBottom:20,marginLeft:24,fontSize:14}}>
                  <li style={{marginBottom:8}}>Nom, prénom, email, téléphone</li>
                  <li style={{marginBottom:8}}>Informations sur les réseaux sociaux</li>
                  <li style={{marginBottom:8}}>Données de connexion et d'utilisation</li>
                  <li style={{marginBottom:8}}>Données de paiement</li>
                </ul>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>2. Finalités</h3>
                <p style={{marginBottom:16,fontSize:14}}>Vos données sont utilisées pour :</p>
                <ul style={{marginBottom:20,marginLeft:24,fontSize:14}}>
                  <li style={{marginBottom:8}}>Gérer votre compte et abonnement</li>
                  <li style={{marginBottom:8}}>Fournir les services demandés</li>
                  <li style={{marginBottom:8}}>Améliorer la plateforme</li>
                  <li style={{marginBottom:8}}>Communiquer avec vous</li>
                </ul>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>3. Conservation</h3>
                <p style={{marginBottom:20,fontSize:14}}>Les données sont conservées le temps nécessaire à l'exécution des services et conformément à la législation.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>4. Partage des données</h3>
                <p style={{marginBottom:16,fontSize:14}}>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
                <ul style={{marginBottom:20,marginLeft:24,fontSize:14}}>
                  <li style={{marginBottom:8}}>Les partenaires pour les offres commerciales</li>
                  <li style={{marginBottom:8}}>Les prestataires techniques</li>
                  <li style={{marginBottom:8}}>Les autorités légales sur demande</li>
                </ul>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>5. Sécurité</h3>
                <p style={{marginBottom:20,fontSize:14}}>Belive Academy met en œuvre des mesures techniques et organisationnelles pour protéger vos données.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>6. Vos droits</h3>
                <p style={{marginBottom:20,fontSize:14}}>Vous disposez d'un droit d'accès, de modification, de suppression et de portabilité sur vos données.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>7. Cookies</h3>
                <p style={{marginBottom:20,fontSize:14}}>Le site utilise des cookies techniques indispensables à son fonctionnement.</p>
                
                <h3 style={{color:R,marginBottom:16,fontSize:18}}>8. Contact</h3>
                <p style={{fontSize:14}}>
                  <strong>Email :</strong> ethan@beliveacademy.com<br/>
                  <strong>Téléphone :</strong> 07 80 99 92 51<br/>
                  <strong>Site :</strong> beliveacademy.com
                </p>
              </div>
            )}
          </div>
          
          <div style={{textAlign:"center",marginTop:40}}>
            <div style={{fontSize:12,color:M,marginBottom:16}}>
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}
            </div>
            <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
              <button 
                onClick={()=>window.location.href="/"} 
                style={{background:R,color:"white",border:"none",padding:"12px 24px",borderRadius:8,fontWeight:700,cursor:"pointer"}}
              >
                Rejoindre Belive Academy
              </button>
              <button 
                onClick={()=>window.location.href=publicPage==="cgu"?"/politique":"/cgu"} 
                style={{background:"transparent",color:R,border:`1px solid ${R}`,padding:"12px 24px",borderRadius:8,fontWeight:700,cursor:"pointer"}}
              >
                Voir {publicPage==="cgu"?"la politique de confidentialité":"les CGU"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTH
  if(!user)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:D,padding:16,position:"relative",overflow:"hidden"}}>
      <style>{css}</style>
      <div style={{position:"absolute",width:600,height:600,background:"radial-gradient(circle,rgba(212,16,63,0.1) 0%,transparent 70%)",top:-200,right:-150,borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:440}} className="fade">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:44,letterSpacing:3}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
          <div style={{fontSize:13,color:M,marginTop:4}}>La plateforme des créateurs de contenu</div>
        </div>
        <div style={{background:"#0d0d0d",border:`1px solid ${B}`,borderRadius:20,padding:28}}>
          <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>{isReg?"Créer un compte":"Connexion"}</div>
          <div style={{fontSize:13,color:M,marginBottom:20}}>{isReg?"Rejoins la communauté Belive":"Content de te revoir 👋"}</div>
          {isReg?(<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Field label="Prénom *" value={reg.name.split(" ")[0]||""} onChange={e=>setReg({...reg,name:e.target.value+" "+(reg.name.split(" ")[1]||"")})} placeholder="Prénom"/>
              <Field label="Nom *" value={reg.name.split(" ")[1]||""} onChange={e=>setReg({...reg,name:(reg.name.split(" ")[0]||"")+" "+e.target.value})} placeholder="Nom"/>
            </div>
            <Field label="Email *" type="email" value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="ton@email.com"/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Mot de passe *</div>
              <div style={{position:"relative"}}>
                <input type={showRegPass?"text":"password"} value={reg.pass} onChange={e=>setReg({...reg,pass:e.target.value})} placeholder="••••••••" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 44px 11px 14px",color:"white",fontSize:13,outline:"none"}}/>
                <button onClick={()=>setShowRegPass(!showRegPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:M,cursor:"pointer",fontSize:16,lineHeight:1}}>
                  {showRegPass?"🙈":"👁️"}
                </button>
              </div>
            </div>
            <Field label="Téléphone *" type="tel" value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} placeholder="06 12 34 56 78"/>
            <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${B}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:M,letterSpacing:0.5,marginBottom:10,textTransform:"uppercase"}}>Tes réseaux sociaux</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="🟣 Twitch" value={reg.twitch} onChange={e=>setReg({...reg,twitch:e.target.value})} placeholder="pseudo"/>
                <Field label="▶️ YouTube" value={reg.youtube} onChange={e=>setReg({...reg,youtube:e.target.value})} placeholder="chaîne"/>
                <Field label="🎵 TikTok" value={reg.tiktok} onChange={e=>setReg({...reg,tiktok:e.target.value})} placeholder="@pseudo"/>
                <Field label="📸 Instagram" value={reg.instagram} onChange={e=>setReg({...reg,instagram:e.target.value})} placeholder="@pseudo"/>
              </div>
            </div>
            <Field label="Code Belive Academy" value={reg.code} onChange={e=>setReg({...reg,code:e.target.value.toUpperCase()})} placeholder="BELIVE-XXXXXX" hint="Si tu es dans l'agence — sinon essai gratuit 14 jours"/>
            <Field label="Code de parrainage (optionnel)" value={reg.referralCode} onChange={e=>setReg({...reg,referralCode:e.target.value.toUpperCase()})} placeholder="REF-XXXXXX-XXX" hint="Si un créateur t'a recommandé Belive Academy"/>

            {/* Vérification âge */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:10,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${regAge?"rgba(34,197,94,0.3)":B}`,borderRadius:10}}>
              <input type="checkbox" checked={regAge} onChange={e=>setRegAge(e.target.checked)} style={{marginTop:2,width:16,height:16,accentColor:R,flexShrink:0}}/>
              <div style={{fontSize:12,color:M,lineHeight:1.6}}>
                <strong style={{color:"white"}}>Je confirme avoir 18 ans ou plus</strong><br/>
                L'accès à Belive Academy est réservé aux personnes majeures. En cochant cette case, je certifie sur l'honneur avoir au moins 18 ans.
              </div>
            </label>

            {/* CGU + confidentialité */}
            <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:16,padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${regCGU?"rgba(34,197,94,0.3)":B}`,borderRadius:10}}>
              <input type="checkbox" checked={regCGU} onChange={e=>setRegCGU(e.target.checked)} style={{marginTop:2,width:16,height:16,accentColor:R,flexShrink:0}}/>
              <div style={{fontSize:12,color:M,lineHeight:1.6}}>
                <strong style={{color:"white"}}>J'accepte les CGU et la politique de confidentialité</strong><br/>
                En m'inscrivant, j'accepte les{" "}
                <span style={{color:R,textDecoration:"underline",cursor:"pointer"}} onClick={e=>{e.preventDefault();setShowLegalModal("cgu");}}>CGU</span>
                {" "}et la{" "}
                <span style={{color:R,textDecoration:"underline",cursor:"pointer"}} onClick={e=>{e.preventDefault();setShowLegalModal("politique");}}>politique de confidentialité</span>
                {" "}de Belive Academy.
              </div>
            </label>

            <Btn full onClick={doReg} sz="lg" disabled={!regAge||!regCGU}>Créer mon compte</Btn>
            {(!regAge||!regCGU)&&<div style={{textAlign:"center",fontSize:11,color:M,marginTop:8}}>⚠️ Tu dois confirmer ton âge et accepter les CGU + la confidentialité pour continuer</div>}
          </>):(<>
            <Field label="Email" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="ton@email.com"/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Mot de passe</div>
              <div style={{position:"relative"}}>
                <input type={showPass?"text":"password"} value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••••••" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 44px 11px 14px",color:"white",fontSize:13,outline:"none"}}/>
                <button onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:M,cursor:"pointer",fontSize:16,lineHeight:1}}>
                  {showPass?"🙈":"👁️"}
                </button>
              </div>
            </div>
            {authErr&&<div style={{color:R,fontSize:12,marginBottom:12,textAlign:"center"}}>{authErr}</div>}
            <Btn full onClick={doLogin} sz="lg">Se connecter</Btn>
            <div style={{textAlign:"center",marginTop:10}}>
              <span onClick={()=>setIsForgot(true)} style={{color:M,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Mot de passe oublié ?</span>
            </div>
          </>)}
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:M}}>
            {isReg?"Déjà un compte ?":"Pas encore de compte ?"}{" "}
            <span onClick={()=>setIsReg(!isReg)} style={{color:R,fontWeight:700,cursor:"pointer"}}>{isReg?"Se connecter":"S'inscrire — 14 jours gratuits"}</span>
          </div>
        </div>
      </div>

      {/* MODALE LÉGALE CGU/POLITIQUE */}
      <Modal open={!!showLegalModal} onClose={()=>setShowLegalModal(null)} title={showLegalModal==="cgu"?"Conditions Générales d'Utilisation":"Politique de Confidentialité"} wide>
        <div style={{maxHeight:"70vh",overflowY:"auto",lineHeight:1.6}}>
          {showLegalModal==="cgu"?(
            <div>
              <h3 style={{color:R,marginBottom:12}}>1. Objet</h3>
              <p style={{marginBottom:16}}>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Belive Academy.</p>
              
              <h3 style={{color:R,marginBottom:12}}>2. Accès au service</h3>
              <p style={{marginBottom:16}}>Belive Academy est réservée aux personnes majeures (18 ans et plus). L'inscription est soumise à acceptation des présentes CGU.</p>
              
              <h3 style={{color:R,marginBottom:12}}>3. Services proposés</h3>
              <ul style={{marginBottom:16,marginLeft:20}}>
                <li>Accompagnement de créateurs de contenu</li>
                <li>Formation et coaching streaming</li>
                <li>Mise en relation avec des partenaires</li>
                <li>Accès à une communauté de créateurs</li>
              </ul>
              
              <h3 style={{color:R,marginBottom:12}}>4. Obligations des membres</h3>
              <p style={{marginBottom:16}}>Les membres s'engagent à :</p>
              <ul style={{marginBottom:16,marginLeft:20}}>
                <li>Fournir des informations exactes</li>
                <li>Respecter les autres membres</li>
                <li>Ne pas partager de contenu illégal</li>
                <li>Payer les frais d'abonnement souscrits</li>
              </ul>
              
              <h3 style={{color:R,marginBottom:12}}>5. Tarification</h3>
              <p style={{marginBottom:16}}>Les tarifs sont consultables sur la plateforme. Belive Academy se réserve le droit de modifier les tarifs sous préavis de 30 jours.</p>
              
              <h3 style={{color:R,marginBottom:12}}>6. Propriété intellectuelle</h3>
              <p style={{marginBottom:16}}>Le contenu de la plateforme est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite.</p>
              
              <h3 style={{color:R,marginBottom:12}}>7. Résiliation</h3>
              <p style={{marginBottom:16}}>L'utilisateur peut résilier son compte à tout moment. Belive Academy se réserve le droit de résilier un compte en cas de manquement aux CGU.</p>
              
              <h3 style={{color:R,marginBottom:12}}>8. Contact</h3>
              <p>Pour toute question : ethan@beliveacademy.com - 07 80 99 92 51</p>
            </div>
          ):(
            <div>
              <h3 style={{color:R,marginBottom:12}}>1. Collecte des données</h3>
              <p style={{marginBottom:16}}>Belive Academy collecte les données suivantes :</p>
              <ul style={{marginBottom:16,marginLeft:20}}>
                <li>Nom, prénom, email, téléphone</li>
                <li>Informations sur les réseaux sociaux</li>
                <li>Données de connexion et d'utilisation</li>
                <li>Données de paiement</li>
              </ul>
              
              <h3 style={{color:R,marginBottom:12}}>2. Finalités</h3>
              <p style={{marginBottom:16}}>Vos données sont utilisées pour :</p>
              <ul style={{marginBottom:16,marginLeft:20}}>
                <li>Gérer votre compte et abonnement</li>
                <li>Fournir les services demandés</li>
                <li>Améliorer la plateforme</li>
                <li>Communiquer avec vous</li>
              </ul>
              
              <h3 style={{color:R,marginBottom:12}}>3. Conservation</h3>
              <p style={{marginBottom:16}}>Les données sont conservées le temps nécessaire à l'exécution des services et conformément à la législation.</p>
              
              <h3 style={{color:R,marginBottom:12}}>4. Partage des données</h3>
              <p style={{marginBottom:16}}>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
              <ul style={{marginBottom:16,marginLeft:20}}>
                <li>Les partenaires pour les offres commerciales</li>
                <li>Les prestataires techniques</li>
                <li>Les autorités légales sur demande</li>
              </ul>
              
              <h3 style={{color:R,marginBottom:12}}>5. Sécurité</h3>
              <p style={{marginBottom:16}}>Belive Academy met en œuvre des mesures techniques et organisationnelles pour protéger vos données.</p>
              
              <h3 style={{color:R,marginBottom:12}}>6. Vos droits</h3>
              <p style={{marginBottom:16}}>Vous disposez d'un droit d'accès, de modification, de suppression et de portabilité sur vos données.</p>
              
              <h3 style={{color:R,marginBottom:12}}>7. Cookies</h3>
              <p style={{marginBottom:16}}>Le site utilise des cookies techniques indispensables à son fonctionnement.</p>
              
              <h3 style={{color:R,marginBottom:12}}>8. Contact</h3>
              <p>Pour exercer vos droits : ethan@beliveacademy.com - 07 80 99 92 51</p>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={()=>setShowLegalModal(null)}>Fermer</Btn>
        </div>
      </Modal>
    </div>
  );

  // SIDEBAR
  const SBContent=({hideHeader})=>(
    <>
      {!hideHeader&&<div style={{padding:"0 8px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:19,letterSpacing:2}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
          <div style={{fontSize:10,color:M,letterSpacing:1.5,textTransform:"uppercase",marginTop:2}}>{role==="admin"?"👑 Super Admin":"🎮 Créateur"}</div>
        </div>
        <button onClick={()=>setSideOpen(false)} style={{background:"none",border:"none",color:M,fontSize:18,cursor:"pointer",lineHeight:1,flexShrink:0}}>←</button>
      </div>}
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
        {navItems.map((n,i)=>(
          <div key={n.id}>
            {/* Section header */}
            {n.section&&(
              <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.2)",letterSpacing:2,textTransform:"uppercase",padding:"12px 12px 4px",marginTop:4}}>
                {n.section}
              </div>
            )}
            <div onClick={()=>{setPage(n.id);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",background:page===n.id?"rgba(212,16,63,0.09)":"transparent",color:page===n.id?R:M,borderLeft:page===n.id?`2px solid ${R}`:"2px solid transparent",transition:"all 0.15s"}}>
              <span style={{fontSize:14}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.badge==="IA"&&<Pill color="red" xs>IA</Pill>}
              {n.badge==="NEW"&&<Pill color="green" xs>NEW</Pill>}
              {n.id==="partenariats"&&role==="admin"&&totalCand>0&&(
                <span style={{background:R,color:"white",borderRadius:100,fontSize:10,fontWeight:800,padding:"1px 7px"}}>{totalCand}</span>
              )}
              {n.id==="dashboard"&&role==="admin"&&adminNotifs.filter(n=>!n.read).length>0&&(
                <span style={{background:R,color:"white",borderRadius:100,fontSize:10,fontWeight:800,padding:"1px 7px"}}>{adminNotifs.filter(n=>!n.read).length}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {role==="createur"&&!isPro&&(
        <div style={{background:isInTrial?"rgba(251,191,36,0.07)":"rgba(212,16,63,0.07)",border:`1px solid ${isInTrial?"rgba(251,191,36,0.2)":"rgba(212,16,63,0.14)"}`,borderRadius:12,padding:14,margin:"12px 0"}}>
          {isInTrial?(
            <>
              <div style={{fontSize:12,fontWeight:800,marginBottom:2,color:YE}}>⏳ Essai gratuit</div>
              <div style={{fontSize:11,color:M,marginBottom:8}}>{trialDaysLeft} jour{trialDaysLeft>1?"s":""} restant{trialDaysLeft>1?"s":""}</div>
            </>
          ):(
            <>
              <div style={{fontSize:12,fontWeight:800,marginBottom:4}}>✨ Passe à Pro</div>
              <div style={{fontSize:11,color:M,marginBottom:10,lineHeight:1.5}}>IA illimitée, partenariats & plus</div>
            </>
          )}
          <Btn full sz="sm" onClick={()=>setModal("payment")}>14,99€/mois</Btn>
        </div>
      )}
      <div style={{paddingTop:12,borderTop:`1px solid ${B}`}}>
        <div onClick={()=>{setPage("profil");setMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer",padding:"6px 8px",borderRadius:10,transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{position:"relative"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:R,border:`2px solid ${page==="profil"?R:"transparent"}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>
              {profil.photo?<img src={profil.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user.name.charAt(0)}
            </div>
            <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,background:"#22c55e",borderRadius:"50%",border:`2px solid #0a0a0a`}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
            <div style={{fontSize:10,color:M,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.twitch?`🟣 @${user.twitch}`:user.email}</div>
          </div>
          <span style={{fontSize:12,color:M}}>›</span>
        </div>
        <button onClick={()=>{setUser(null);setPage("dashboard");}} style={{width:"100%",background:"transparent",border:`1px solid ${B}`,borderRadius:8,padding:"7px",color:M,fontSize:11,fontWeight:600,cursor:"pointer"}}>Déconnexion</button>
      </div>
    </>
  );

  const isMobile=typeof window!=="undefined"&&window.innerWidth<768;
  const SW=(!isMobile&&sideOpen)?220:0;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:D}}>
      <style>{css}</style>

      {/* Sidebar desktop — cachée sur tablette/mobile via CSS */}
      {sideOpen&&(
        <div className="desktop-sidebar" style={{width:220,background:"#0a0a0a",borderRight:`1px solid ${B}`,flexDirection:"column",padding:"20px 12px",position:"fixed",top:0,left:0,bottom:0,zIndex:100}}>
          <SBContent/>
        </div>
      )}

      {/* Barre mobile — visible sur tablette/mobile via CSS */}
      <div className="mobile-bar" style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"#0a0a0a",borderBottom:`1px solid ${B}`,padding:"11px 16px",alignItems:"center",gap:12}}>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",color:"white",fontSize:22,cursor:"pointer",lineHeight:1,flexShrink:0}}>
          {menuOpen?"✕":"☰"}
        </button>
        <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,letterSpacing:2,flex:1}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
        <div onClick={()=>{setPage("profil");setMenuOpen(false);}} style={{width:32,height:32,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0,cursor:"pointer",overflow:"hidden"}}>
          {profil.photo?<img src={profil.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:user.name.charAt(0)}
        </div>
      </div>

      {/* Menu mobile overlay — part sous la barre du haut */}
      {menuOpen&&(
        <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",top:54,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",zIndex:299,backdropFilter:"blur(4px)"}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",left:0,top:0,bottom:0,width:260,background:"#0a0a0a",borderRight:`1px solid ${B}`,padding:"16px 12px",display:"flex",flexDirection:"column",overflowY:"auto"}} className="slide">
            {/* Bouton fermer manuel */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${B}`}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:16,letterSpacing:2}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
              <button onClick={()=>setMenuOpen(false)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${B}`,borderRadius:8,padding:"5px 10px",color:"white",fontSize:13,cursor:"pointer",fontWeight:700}}>← Fermer</button>
            </div>
            <SBContent hideHeader/>
          </div>
        </div>
      )}

      {/* Top bar desktop quand sidebar fermée */}
      {!sideOpen&&(
        <div className="desktop-sidebar" style={{position:"fixed",top:0,left:0,right:0,zIndex:150,background:"#0a0a0a",borderBottom:`1px solid ${B}`,padding:"12px 20px",alignItems:"center",gap:14}}>
          <button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer"}}>☰</button>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18,letterSpacing:2}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
        </div>
      )}

      {/* Main content */}
      <div className="main-content" style={{marginLeft:SW,flex:1,padding:24,paddingTop:24,minHeight:"100vh",transition:"margin-left 0.25s ease"}} id="main-content">

        {/* PAYWALL — Accès bloqué si essai terminé */}
        {role==="createur"&&!hasAccess&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20,backdropFilter:"blur(10px)"}}>
            <div className="fade" style={{background:"#0d0d0d",border:`1px solid rgba(212,16,63,0.3)`,borderRadius:24,padding:32,width:"100%",maxWidth:440,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${R},transparent)`}}/>
              <div style={{fontSize:48,marginBottom:16}}>🔒</div>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2,marginBottom:8}}>
                ESSAI TERMINÉ
              </div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:24}}>
                Ton essai gratuit de 14 jours est terminé.<br/>
                Pour continuer à accéder à Belive Academy,<br/>
                choisis ton offre ci-dessous.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
                <button onClick={()=>window.open("https://buy.stripe.com/00waEW7h15eNdsT1wA1wY04","_blank")} style={{background:R,color:"white",border:"none",borderRadius:12,padding:"16px 24px",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                  🎯 Créateur Belive — 9,99€/mois
                </button>
                <button onClick={()=>window.open("https://buy.stripe.com/cNicN430LdLj88zgru1wY05","_blank")} style={{background:"rgba(255,255,255,0.08)",color:"white",border:`1px solid ${B}`,borderRadius:12,padding:"16px 24px",fontSize:15,fontWeight:800,cursor:"pointer"}}>
                  ⚡ Accès indépendant — 14,99€/mois
                </button>
              </div>
              <div style={{fontSize:12,color:M}}>🔒 Paiement sécurisé via Stripe • Résiliable à tout moment</div>
              <button onClick={()=>{setUser(null);}} style={{marginTop:16,background:"none",border:"none",color:"rgba(255,255,255,0.2)",fontSize:11,cursor:"pointer"}}>Se déconnecter</button>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {page==="dashboard"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>BONJOUR, {user.name.split(" ")[0].toUpperCase()} 👋</div>
                <div style={{fontSize:13,color:M,marginTop:2}}>Voici tes performances</div>
              </div>
              {!sideOpen&&<button onClick={()=>setSideOpen(true)} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"6px 12px",color:M,fontSize:12,cursor:"pointer"}}>Menu</button>}
            </div>
            <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.13)`,borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",gap:12}}>
              <span style={{fontSize:20}}>💡</span>
              <div><div style={{fontSize:10,fontWeight:700,color:R,letterSpacing:1.5,textTransform:"uppercase",marginBottom:3}}>Conseil du jour</div><div style={{fontSize:13,color:"rgba(255,255,255,0.72)"}}>{tip}</div></div>
            </div>
            {role==="admin"&&(() => {
              // Récupère tous les utilisateurs inscrits depuis localStorage
              const localStorageUsers = Object.entries(JSON.parse(localStorage.getItem("ba6_users")||"{}")).map(([email,u])=>({email,...u})).filter(u => u.role !== "admin" && u.email !== "ethanbfr06@gmail.com");
              
              // Fusionne avec les données Supabase de manière synchrone (utilise les données déjà chargées si disponibles)
              const allUsersMap = new Map();
              localStorageUsers.forEach(u => allUsersMap.set(u.email, u));
              
              const allUsers = Array.from(allUsersMap.values()).filter(u => u.role !== "admin" && u.email !== "ethanbfr06@gmail.com");
              
              // Informations de débogage
              console.log("=== ADMIN DASHBOARD DEBUG ===");
              console.log("localStorageUsers count:", localStorageUsers.length);
              console.log("allUsers count:", allUsers.length);
              console.log("allUsers:", allUsers);
              const payantsBelive=allUsers.filter(u=>u.plan==="belive_creator"&&u.offert!==true&&u.offert!=="true");
              const payantsPro=allUsers.filter(u=>u.plan==="pro"&&u.offert!==true&&u.offert!=="true");
              const gratuitVie=allUsers.filter(u=>u.offert===true);
              const revenuBelive=payantsBelive.length*9.99;
              const revenuPro=payantsPro.length*14.99;
              const essai=allUsers.filter(u=>!["pro","belive_creator","unlimited"].includes(u.plan)&&u.trialStart&&Math.floor((Date.now()-new Date(u.trialStart).getTime())/(1000*60*60*24))<14);
              const expires=allUsers.filter(u=>!["pro","belive_creator","unlimited"].includes(u.plan)&&(!u.trialStart||Math.floor((Date.now()-new Date(u.trialStart).getTime())/(1000*60*60*24))>=14));
              const revenuMensuel=revenuBelive+revenuPro;
              const potentielMax=revenuMensuel+(essai.length*14.99)+(expires.length*14.99);

              return(<>
                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:20}}>
                  <SC label="Total inscrits" value={allUsers.length} sub="créateurs" icon="👥"/>
                  <SC label="Revenu réel" value={`${revenuMensuel.toFixed(2)}€`} sub="ce mois" icon="💰" color="green"/>
                  <SC label="En essai" value={essai.length} sub={`${essai.length} gratuits`} icon="⏳" color="yellow"/>
                  <SC label="Expirés" value={expires.length} sub="à relancer" icon="🔒" color="red"/>
                  <SC label="Gratuit à vie" value={gratuitVie.length} sub="offerts" icon="🎁" color="purple"/>
                  <SC label="Contrats" value={contrats.length} sub="générés" icon="📋" color="blue"/>
                </div>

                {/* Revenu estimé */}
                <Card style={{marginBottom:20,background:"rgba(34,197,94,0.05)",border:`1px solid rgba(34,197,94,0.2)`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>💰 Revenu mensuel réel</div>
                      <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:42,color:G,lineHeight:1}}>{revenuMensuel.toFixed(2)}€</div>
                      <div style={{fontSize:12,color:M,marginTop:4}}>
                        {payantsBelive.length>0&&`${payantsBelive.length} × 9,99€`}
                        {payantsBelive.length>0&&payantsPro.length>0&&" + "}
                        {payantsPro.length>0&&`${payantsPro.length} × 14,99€`}
                        {payantsBelive.length===0&&payantsPro.length===0&&"Aucun abonné payant"}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,color:M,marginBottom:4}}>Potentiel si essais convertis</div>
                      <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,color:YE}}>{potentielMax.toFixed(2)}€</div>
                      <div style={{fontSize:11,color:M}}>{essai.length} essais + {expires.length} expirés à convertir</div>
                    </div>
                  </div>
                  {/* Détail par plan */}
                  <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid rgba(255,255,255,0.06)`,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                    <div style={{textAlign:"center",background:"rgba(212,16,63,0.06)",borderRadius:10,padding:"10px 8px"}}>
                      <div style={{fontWeight:800,fontSize:16,color:R}}>{payantsBelive.length}</div>
                      <div style={{fontSize:11,color:M,marginTop:2}}>Créateurs Belive</div>
                      <div style={{fontSize:11,color:R,fontWeight:700}}>9,99€/mois</div>
                    </div>
                    <div style={{textAlign:"center",background:"rgba(34,197,94,0.06)",borderRadius:10,padding:"10px 8px"}}>
                      <div style={{fontWeight:800,fontSize:16,color:G}}>{payantsPro.length}</div>
                      <div style={{fontSize:11,color:M,marginTop:2}}>Pro indépendants</div>
                      <div style={{fontSize:11,color:G,fontWeight:700}}>14,99€/mois</div>
                    </div>
                    <div style={{textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 8px"}}>
                      <div style={{fontWeight:800,fontSize:16,color:M}}>{gratuitVie.length}</div>
                      <div style={{fontSize:11,color:M,marginTop:2}}>Gratuit à vie</div>
                      <div style={{fontSize:11,color:M,fontWeight:700}}>0€</div>
                    </div>
                  </div>
                </Card>

                {/* Liste complète des inscrits */}
                <Card style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontWeight:800,fontSize:15}}>👥 Tous les inscrits ({allUsers.length})</div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn sz="sm" onClick={()=>{
                      // Synchronisation simplifiée pour mobile
                      const syncData = async () => {
                        try {
                          console.log("Début synchronisation...");
                          const users = await db.getUsers();
                          console.log("Utilisateurs récupérés:", users);
                          
                          if (users && users.length > 0) {
                            const usersObj = {};
                            users.forEach(u => {
                              usersObj[u.email] = u;
                            });
                            localStorage.setItem("ba6_users", JSON.stringify(usersObj));
                            console.log("LocalStorage mis à jour:", usersObj);
                            alert("✅ " + users.length + " utilisateurs synchronisés !");
                            window.location.reload();
                          } else {
                            alert("❌ Aucun utilisateur trouvé dans Supabase");
                          }
                        } catch(e) {
                          console.error("Erreur synchronisation:", e);
                          alert("❌ Erreur: " + e.message);
                        }
                      };
                      
                      syncData();
                    }} icon="🔄">Synchroniser</Btn>
                    <Btn sz="sm" onClick={async()=>{
                      try {
                        const supabaseUsers = await db.getUsers();
                        if (supabaseUsers && supabaseUsers.length > 0) {
                          // Filtrer pour ne PAS montrer l'admin dans la liste
                          const onlyCreators = supabaseUsers.filter(u => u.role !== "admin" && u.email !== "ethanbfr06@gmail.com");
                          const adminCount = supabaseUsers.filter(u => u.role === "admin" || u.email === "ethanbfr06@gmail.com").length;
                          const creatorCount = onlyCreators.length;
                          const totalCount = supabaseUsers.length;
                          
                          console.log("=== COMPTES SUPABASE DÉTAILLÉS ===");
                          console.log("Tous les comptes bruts:", supabaseUsers);
                          console.log("Admin filtrés:", supabaseUsers.filter(u => u.role === "admin" || u.email === "ethanbfr06@gmail.com"));
                          console.log("Créateurs filtrés:", onlyCreators);
                          
                          let details = "📊 COMPTES DANS SUPABASE:\n\n";
                          details += `Total: ${totalCount} comptes\n`;
                          details += `Admin: ${adminCount} compte(s)\n`;
                          details += `Créateurs: ${creatorCount} compte(s)\n\n`;
                          details += "🔍 LISTE DES CRÉATEURS UNIQUEMENT:\n";
                          details += "─".repeat(40) + "\n";
                          
                          if (onlyCreators.length === 0) {
                            details += "Aucun créateur trouvé (seulement l'admin)\n";
                          } else {
                            onlyCreators.forEach((u, i) => {
                              details += `\n${i+1}. ${u.name || 'Nom non renseigné'}\n`;
                              details += `   📧 Email: ${u.email}\n`;
                              details += `   🎯 Rôle: ${u.role || 'Non défini'}\n`;
                              details += `   💳 Plan: ${u.plan || 'Non défini'}\n`;
                              details += `   📅 Inscrit: ${u.trialStart ? new Date(u.trialStart).toLocaleDateString('fr-FR') : 'Date inconnue'}\n`;
                            });
                          }
                          
                          details += "\n" + "─".repeat(40) + "\n";
                          details += "⚠️  L'admin n'apparaît pas dans cette liste";
                          
                          alert(details);
                        } else {
                          alert("❌ Aucun utilisateur trouvé dans Supabase\n\nVérifiez que:\n• Les tables existent\n• RLS est désactivé\n• La clé API est correcte");
                        }
                      } catch(e) {
                        console.error("Erreur complète:", e);
                        alert("❌ Erreur interrogation Supabase: " + e.message + "\n\nDétails: " + JSON.stringify(e));
                      }
                    }} icon="🗄️">Vérifier Supabase</Btn>
                    <Btn sz="sm" onClick={()=>{
                      // Diagnostic mobile - affiche les infos directement
                      const localStorageData = JSON.parse(localStorage.getItem("ba6_users")||"{}");
                      const userCount = Object.keys(localStorageData).length;
                      
                      let diagnostic = "📊 DIAGNOSTIC MOBILE:\n\n";
                      diagnostic += `LocalStorage: ${userCount} utilisateur(s)\n\n`;
                      diagnostic += "Liste des utilisateurs:\n";
                      
                      Object.entries(localStorageData).forEach(([email, u], i) => {
                        diagnostic += `${i+1}. ${u.name || '???'} (${email})\n`;
                      });
                      
                      alert(diagnostic);
                    }} icon="📱">Diagnostic Mobile</Btn>
                    <Btn sz="sm" onClick={async()=>{
                      try {
                        // Nettoyer l'admin du localStorage
                        const localStorageData = JSON.parse(localStorage.getItem("ba6_users")||"{}");
                        delete localStorageData["ethanbfr06@gmail.com"];
                        localStorage.setItem("ba6_users", JSON.stringify(localStorageData));
                        
                        alert("✅ Admin supprimé du localStorage !\n\nRafraîchissez la page pour voir les changements.");
                        window.location.reload();
                      } catch(e) {
                        alert("❌ Erreur nettoyage: " + e.message);
                      }
                    }} icon="🧹">Nettoyer Admin</Btn>
                  </div>
                </div>
                  {allUsers.length===0?(
                    <div style={{textAlign:"center",padding:"24px 0",color:M}}>Aucun inscrit pour l'instant</div>
                  ):allUsers.map((u,i)=>{
                    const daysLeft=u.trialStart?Math.max(0,14-Math.floor((Date.now()-new Date(u.trialStart).getTime())/(1000*60*60*24))):0;
                    const status=u.plan==="pro"?"pro":daysLeft>0?"trial":"expired";
                    return(
                      <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${B}`}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <div style={{width:40,height:40,background:"rgba(212,16,63,0.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{(u.name||"?").charAt(0)}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                              <div style={{fontWeight:800,fontSize:14}}>{u.name}</div>
                              {status==="pro"&&<Pill color="green">✅ Pro</Pill>}
                              {status==="trial"&&<Pill color="yellow">⏳ Essai {daysLeft}j</Pill>}
                              {status==="expired"&&<Pill color="red">🔒 Expiré</Pill>}
                              {u.formule&&<Pill color="blue">{u.formule==="commission"?"Commission":"Premium"}</Pill>}
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,fontSize:12,color:M}}>
                              <span>📧 {u.email}</span>
                              <span>📱 {u.phone||"—"}</span>
                              {u.twitch&&<span>🟣 @{u.twitch}</span>}
                              {u.youtube&&<span>▶️ {u.youtube}</span>}
                              {u.tiktok&&<span>🎵 {u.tiktok}</span>}
                              {u.instagram&&<span>📸 {u.instagram}</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <Btn sz="sm" v="ghost" onClick={()=>openContract({...u,id:i})}>📋</Btn>
                            <Btn sz="sm" v="ghost" onClick={async()=>{
                              if(!confirm(`⚠️ Supprimer définitivement ${u.name} (${u.email}) ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n• Le compte utilisateur\n• Toutes ses données associées\n• Ses accès à l'application`)) return;
                              
                              try {
                                // Supprimer de Supabase
                                await db.deleteUser(u.email);
                                
                                // Supprimer du localStorage
                                const localStorageData = JSON.parse(localStorage.getItem("ba6_users")||"{}");
                                delete localStorageData[u.email];
                                localStorage.setItem("ba6_users", JSON.stringify(localStorageData));
                                
                                alert(`✅ ${u.name} a été supprimé définitivement`);
                                window.location.reload();
                              } catch(e) {
                                alert("❌ Erreur lors de la suppression: " + e.message);
                              }
                            }} style={{background:"none",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:8,padding:"5px 10px",color:R,fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑️</Btn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                {/* Payants */}
                {(payantsBelive.length>0||payantsPro.length>0)&&(
                  <Card style={{marginBottom:16,background:"rgba(34,197,94,0.03)",border:`1px solid rgba(34,197,94,0.15)`}}>
                    <div style={{fontWeight:800,fontSize:14,color:G,marginBottom:12}}>💳 Abonnés payants ({payantsBelive.length+payantsPro.length})</div>
                    {[...payantsBelive,...payantsPro].map((u,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid rgba(34,197,94,0.08)`}}>
                        <div style={{width:34,height:34,background:"rgba(34,197,94,0.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{u.name.charAt(0)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13}}>{u.name}</div>
                          <div style={{fontSize:11,color:M}}>📧 {u.email} • 📱 {u.phone||"—"}</div>
                        </div>
                        <div style={{fontWeight:800,color:G,fontSize:13}}>14,99€/mois</div>
                      </div>
                    ))}
                  </Card>
                )}

                {/* À relancer */}
                {expires.length>0&&(
                  <Card style={{background:"rgba(212,16,63,0.03)",border:`1px solid rgba(212,16,63,0.12)`}}>
                    <div style={{fontWeight:800,fontSize:14,color:R,marginBottom:12}}>🔔 À relancer ({expires.length})</div>
                    <div style={{fontSize:12,color:M,marginBottom:12}}>Ces créateurs ont terminé leur essai — contacte-les pour les convertir en Pro</div>
                    {expires.map((u,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid rgba(212,16,63,0.08)`}}>
                        <div style={{width:34,height:34,background:"rgba(212,16,63,0.12)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{u.name.charAt(0)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13}}>{u.name}</div>
                          <div style={{fontSize:11,color:M}}>📧 {u.email} • 📱 {u.phone||"—"}</div>
                        </div>
                        <button onClick={()=>{navigator.clipboard?.writeText(u.phone||u.email);alert(`📋 ${u.phone||u.email} copié !`);}} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"5px 10px",color:M,fontSize:11,cursor:"pointer"}}>📋 Copier</button>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Parrainages admin */}
                {adminRefs.length>0&&(
                  <Card style={{marginTop:16,background:"rgba(251,191,36,0.03)",border:`1px solid rgba(251,191,36,0.15)`}}>
                    <div style={{fontWeight:800,fontSize:14,color:YE,marginBottom:12}}>🎁 Parrainages ({adminRefs.length})</div>
                    {adminRefs.map((r,i)=>{
                      const currentMonth=new Date().toISOString().slice(0,7);
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid rgba(251,191,36,0.08)`}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13}}>{r.parrain_email}</div>
                            <div style={{fontSize:11,color:M}}>a parrainé → {r.filleul_name||r.filleul_email}</div>
                            <div style={{fontSize:11,color:M}}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                          </div>
                          <Pill color={r.paid?"green":"yellow"} xs>{r.paid?"✅ Payant":"⏳ Essai"}</Pill>
                          {r.reward_applied&&<Pill color="green" xs>🎁 -50% appliqué</Pill>}
                          {r.paid&&!r.reward_applied&&(
                            <Btn sz="sm" onClick={async()=>{
                              const alreadyRewarded=adminRefs.find(x=>x.parrain_email===r.parrain_email&&x.reward_applied&&x.reward_month===currentMonth);
                              if(alreadyRewarded){alert("Ce parrain a déjà reçu une réduction ce mois.");return;}
                              await db.updateReferral(r.id,{reward_applied:true,reward_month:currentMonth});
                              alert(`✅ Réduction -50% appliquée pour ${r.parrain_email} !`);
                              db.getReferrals().then(data=>{if(data)setAdminRefs(data);});
                            }}>Appliquer -50%</Btn>
                          )}
                        </div>
                      );
                    })}
                  </Card>
                )}
              </>);
            })()}
            {role==="createur"&&(<>
              {/* Bannière trial / Pro */}
              {/* Bannière trial — uniquement si en cours */}
              {isInTrial&&!isPro&&(
                <div style={{position:"relative",overflow:"hidden",borderRadius:14,marginBottom:14,padding:"14px 18px",background:"linear-gradient(135deg,rgba(251,191,36,0.08),rgba(212,16,63,0.06))",border:`1px solid rgba(251,191,36,0.25)`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:13,marginBottom:3}}>⏳ Essai gratuit — {trialDaysLeft} jour{trialDaysLeft>1?"s":""} restant{trialDaysLeft>1?"s":""}</div>
                      <div style={{fontSize:12,color:M}}>Passe à Pro avant la fin pour ne rien perdre</div>
                    </div>
                    <Btn sz="sm" onClick={()=>setModal("payment")}>Passer à Pro</Btn>
                  </div>
                  <div style={{marginTop:10,height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(trialDaysLeft/trialDays)*100}%`,background:`linear-gradient(90deg,${YE},${R})`,borderRadius:2}}/>
                  </div>
                </div>
              )}

              {/* Bannière expirée — uniquement si vraiment terminée */}
              {!hasAccess&&!isPro&&trialStart&&(
                <div style={{position:"relative",overflow:"hidden",borderRadius:14,marginBottom:14,padding:"16px 18px",background:"rgba(212,16,63,0.06)",border:`1px solid rgba(212,16,63,0.2)`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:13,marginBottom:3}}>🔒 Essai terminé</div>
                      <div style={{fontSize:12,color:M}}>Continue avec Pro pour garder l'accès complet</div>
                    </div>
                    <Btn sz="sm" onClick={()=>setModal("payment")}>14,99€/mois</Btn>
                  </div>
                </div>
              )}

              {/* Bannière communauté — visible période gratuite + Pro */}
              {hasAccess&&(
                <div style={{position:"relative",overflow:"hidden",borderRadius:16,marginBottom:18,padding:"20px 24px",background:"linear-gradient(135deg,#0d0d0d 0%,#1a0508 100%)",border:`1px solid rgba(212,16,63,0.25)`}}>
                  <div style={{position:"absolute",width:250,height:250,background:"radial-gradient(circle,rgba(212,16,63,0.18) 0%,transparent 70%)",top:-80,right:-60,pointerEvents:"none"}}/>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${R},transparent)`}}/>
                  <div style={{position:"relative",zIndex:2}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{width:8,height:8,background:G,borderRadius:"50%"}}/>
                      <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,textTransform:"uppercase"}}>Communauté active</div>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:20,letterSpacing:2,marginBottom:6}}>
                      TU FAIS PARTIE DE <span style={{color:R}}>BELIVE ACADEMY</span>
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6,marginBottom:14}}>
                      Affiche ton badge sur tes réseaux — fais-toi reconnaître par les autres créateurs Belive et trouve des coéquipiers plus facilement.
                    </div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <Btn sz="sm" onClick={()=>setPage("communaute")} icon="🔥">Rejoindre</Btn>
                      <Btn sz="sm" v="ghost" onClick={()=>setPage("templates")} icon="🎨">Mes bannières</Btn>
                    </div>
                  </div>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:18}}>
                <SC label="🟣 Twitch" value={ms.twitch||"—"} color="purple"/>
                <SC label="▶️ YouTube" value={ms.youtube||"—"} color="red"/>
                <SC label="Viewers moy." value={avgV} color="blue"/>
                <SC label="Heures ce mois" value={totalH.toFixed(1)+"h"} color="green"/>
              </div>
              {/* Platforms connect */}
              <Card style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontWeight:800}}>🔗 Connecte tes plateformes</div>
                  <button onClick={()=>{refreshTwitchStats();refreshYoutubeStats();}} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:8,padding:"4px 10px",color:M,fontSize:11,cursor:"pointer"}}>🔄 Actualiser</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{background:"rgba(145,70,255,0.08)",border:`1px solid ${ms.isLive?"rgba(255,50,50,0.4)":"rgba(145,70,255,0.2)"}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>🟣</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{fontWeight:700,fontSize:13}}>Twitch</div>
                        {ms.isLive&&<span style={{background:"#ef4444",color:"white",borderRadius:100,fontSize:9,fontWeight:800,padding:"2px 6px"}}>🔴 LIVE</span>}
                      </div>
                      <div style={{fontSize:11,color:M}}>
                        {user.twitch?`@${user.twitch} • ${ms.twitch||0} followers`:"Non connecté"}
                        {ms.isLive&&ms.liveViewers&&<span style={{color:"#fbbf24"}}> • {ms.liveViewers} viewers</span>}
                      </div>
                    </div>
                    <Btn sz="sm" v={user.twitch?"success":"ghost"} onClick={connectTwitch}>{user.twitch?"✓":"Connecter"}</Btn>
                  </div>
                  <div style={{background:"rgba(255,0,0,0.08)",border:`1px solid rgba(255,0,0,0.2)`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>▶️</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>YouTube</div>
                      <div style={{fontSize:11,color:M}}>{user.youtube?`${user.youtube} • ${ms.youtube||0} abonnés`:"Non connecté"}</div>
                    </div>
                    <Btn sz="sm" v={user.youtube?"success":"ghost"} onClick={connectYoutube}>{user.youtube?"✓":"Connecter"}</Btn>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:11,color:M}}>💡 Stats actualisées automatiquement toutes les 2 minutes.</div>
              </Card>
              {/* Checklist recommandations créateur */}
              <Card style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:14}}>✅ Objectifs de la semaine</div>
                    <div style={{fontSize:12,color:M,marginTop:2}}>Coche ce que tu as accompli — barre de progression automatique</div>
                  </div>
                </div>

                {/* Barre de progression globale */}
                {(()=>{
                  const total=8;
                  const twitchOk=!!user.twitch;
                  const youtubeOk=!!user.youtube;
                  const done=[
                    twitchOk,
                    youtubeOk,
                    profil.check_stream3x||false,
                    profil.check_clip||false,
                    profil.check_community||false,
                    profil.check_profil||false,
                    profil.check_planning||false,
                    profil.check_raid||false,
                  ].filter(Boolean).length;
                  const pct=Math.round((done/total)*100);
                  return(
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:12,color:M}}>{done}/{total} objectifs accomplis</div>
                        <Pill color={pct===100?"green":pct>=50?"yellow":"red"}>{pct}%</Pill>
                      </div>
                      <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",marginBottom:14}}>
                        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${R},#ff4d4d)`,borderRadius:4,transition:"width 0.5s ease"}}/>
                      </div>
                    </>
                  );
                })()}

                {/* Liste des objectifs */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {auto:!!user.twitch,   k:null,              icon:"🟣", label:"Connecter ton compte Twitch",      desc:user.twitch?`@${user.twitch} connecté ✓`:"Connecte ton Twitch depuis le dashboard"},
                    {auto:!!user.youtube,  k:null,              icon:"▶️", label:"Connecter ton compte YouTube",     desc:user.youtube?`${user.youtube} connecté ✓`:"Connecte ta chaîne YouTube depuis le dashboard"},
                    {auto:false,           k:"check_stream3x",  icon:"🎮", label:"Streamer au moins 3 fois cette semaine", desc:"La régularité est la clé numéro 1 de la croissance"},
                    {auto:false,           k:"check_clip",      icon:"🎬", label:"Poster un clip sur TikTok ou YouTube Shorts", desc:"Un clip viral peut t'amener 50-200 nouveaux followers"},
                    {auto:false,           k:"check_community", icon:"👥", label:"Poster dans la communauté Belive", desc:"Crée du lien avec les autres créateurs de l'agence"},
                    {auto:false,           k:"check_profil",    icon:"👤", label:"Compléter ton profil (photo + bio + jeux)", desc:"Un profil complet inspire confiance aux partenaires"},
                    {auto:false,           k:"check_planning",  icon:"📅", label:"Planifier ses streams de la semaine", desc:"Annonce tes horaires sur tes réseaux 24h avant"},
                    {auto:false,           k:"check_raid",      icon:"⚔️", label:"Faire ou recevoir un raid",        desc:"Les raids boostent ta visibilité et créent du lien"},
                  ].map(item=>{
                    const isChecked=item.auto||(item.k&&profil[item.k])||false;
                    return(
                      <div key={item.k||item.label} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:isChecked?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${isChecked?"rgba(34,197,94,0.25)":B}`,borderRadius:10}}>
                        <div style={{width:32,height:32,background:isChecked?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13,color:isChecked?"white":M,textDecoration:isChecked?"line-through":"none"}}>{item.label}</div>
                          <div style={{fontSize:11,color:M,marginTop:2}}>{item.desc}</div>
                        </div>
                        {item.auto?(
                          <div style={{width:24,height:24,background:G,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"white",fontWeight:800}}>✓</div>
                        ):item.k?(
                          <label style={{cursor:"pointer",flexShrink:0}}>
                            <input type="checkbox" checked={profil[item.k]||false} onChange={e=>setProfil(p=>({...p,[item.k]:e.target.checked}))} style={{width:20,height:20,accentColor:G,cursor:"pointer"}}/>
                          </label>
                        ):null}
                      </div>
                    );
                  })}
                </div>

                {/* Message quand tout est fait */}
                {(()=>{
                  const allDone=!!user.twitch&&!!user.youtube&&profil.check_stream3x&&profil.check_clip&&profil.check_community&&profil.check_profil&&profil.check_planning&&profil.check_raid;
                  return allDone?(
                    <div style={{marginTop:12,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                      <div style={{fontWeight:800,color:G,fontSize:14}}>🔥 Semaine parfaite ! Tu es sur la bonne voie !</div>
                      <div style={{fontSize:12,color:M,marginTop:4}}>Continue comme ça — la régularité fait tout.</div>
                    </div>
                  ):null;
                })()}
              </Card>
              {/* Quick stream */}
              <Card>
                <div style={{fontWeight:800,marginBottom:12}}>➕ Enregistrer un stream</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <Field label="Date" type="date" value={newSt.date} onChange={e=>setNewSt({...newSt,date:e.target.value})}/>
                  <Field label="Durée (h)" type="number" value={newSt.dur} onChange={e=>setNewSt({...newSt,dur:e.target.value})} placeholder="2" step="0.5"/>
                  <Field label="Viewers" type="number" value={newSt.viewers} onChange={e=>setNewSt({...newSt,viewers:e.target.value})} placeholder="5"/>
                  <Field label="Plateforme" as="select" value={newSt.platform} onChange={e=>setNewSt({...newSt,platform:e.target.value})}><option value="twitch">🟣 Twitch</option><option value="youtube">▶️ YouTube</option></Field>
                </div>
                <Btn sz="sm" onClick={addStream}>Ajouter</Btn>
                {streams.length>0&&<div style={{marginTop:12}}>{streams.slice(-3).reverse().map(s=>(
                  <div key={s.id} style={{display:"flex",gap:12,padding:"7px 0",borderBottom:`1px solid ${B}`,fontSize:12,color:M}}>
                    <span>{s.date}</span><span style={{color:"white",fontWeight:700}}>{s.duration}h</span><span>{s.viewers} viewers</span><Pill xs color="purple">{s.platform}</Pill>
                  </div>
                ))}</div>}
              </Card>
            </>)}
          </div>
        )}

        {/* STATS */}
        {page==="stats"&&(
          <div>
            <div style={{marginBottom:20}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>STATISTIQUES</div><div style={{fontSize:13,color:M}}>Analyse de tes performances</div></div>
            <Card style={{marginBottom:16}}>
              <div style={{fontWeight:800,marginBottom:12}}>🔗 Mettre à jour mes stats</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Field label="🟣 Followers Twitch" type="number" value={mSt.twitch} onChange={e=>setMSt({...mSt,twitch:e.target.value})} placeholder={ms.twitch||"0"}/>
                <Field label="▶️ Abonnés YouTube" type="number" value={mSt.youtube} onChange={e=>setMSt({...mSt,youtube:e.target.value})} placeholder={ms.youtube||"0"}/>
              </div>
              <Btn sz="sm" onClick={saveStats}>💾 Sauvegarder</Btn>
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:16}}>
              <SC label="Total heures" value={totalH.toFixed(1)+"h"} icon="⏱️" delta={8}/>
              <SC label="Viewers moyen" value={avgV} icon="👁️" color="blue" delta={-2}/>
              <SC label="Record viewers" value={maxV} icon="📈" color="green"/>
              <SC label="Streams" value={streams.length} icon="🎮" color="purple"/>
            </div>
            <Card style={{marginBottom:16}}>
              <div style={{fontWeight:800,marginBottom:16}}>📊 Historique — 7 dernières sessions</div>
              {streams.length===0?<div style={{textAlign:"center",padding:"32px 0",color:M}}>Aucune donnée</div>:(
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120}}>
                  {streams.slice(-7).map(s=>{const max=Math.max(...streams.slice(-7).map(x=>x.duration),1);return(
                    <div key={s.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:9,color:M}}>{s.duration}h</div>
                      <div style={{width:"100%",background:`linear-gradient(180deg,${R},rgba(212,16,63,0.2))`,borderRadius:"4px 4px 0 0",height:`${(s.duration/max)*100}px`}}/>
                      <div style={{fontSize:9,color:M}}>{s.date.slice(0,5)}</div>
                    </div>
                  );})}
                </div>
              )}
            </Card>
            <Card>
              <div style={{fontWeight:800,marginBottom:12}}>📈 Analyse vs mois précédent</div>
              {streams.length<3?<div style={{color:M,fontSize:13}}>Enregistre au moins 3 streams.</div>:(
                [["Temps de stream",`+${(totalH*0.15).toFixed(1)}h`,true,"Tu streames plus qu'avant"],["Viewers moyens",avgV>=3?"✓ Objectif atteint":"Sous l'objectif",avgV>=3,"Objectif : 3 viewers"],["Régularité",streams.length>=7?"✓ Régulier":"Pas assez régulier",streams.length>=7,"7 streams/mois minimum"]].map(([l,v,g,d])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${B}`}}>
                    <div><div style={{fontWeight:700,fontSize:13}}>{l}</div><div style={{fontSize:11,color:M}}>{d}</div></div>
                    <Pill color={g?"green":"yellow"}>{v}</Pill>
                  </div>
                ))
              )}
            </Card>
          </div>
        )}

        {/* PLANNING */}
        {page==="planning"&&(()=>{
          const now=new Date();
          const currentDay=DAYS[now.getDay()===0?6:now.getDay()-1];
          const currentTime=now.getHours()*60+now.getMinutes();

          // Find next stream
          const todayStreams=schedule.filter(s=>s.day===currentDay);
          const nextToday=todayStreams.find(s=>{const[h,m]=s.time.split(":").map(Number);return h*60+m>currentTime;});
          const nextStream=nextToday||schedule.find(s=>{const di=DAYS.indexOf(s.day);const ci=DAYS.indexOf(currentDay);return di>ci;})||schedule[0];

          // Minutes until next stream
          let minutesUntil=null;
          if(nextToday){const[h,m]=nextToday.time.split(":").map(Number);minutesUntil=h*60+m-currentTime;}

          const platformColors={twitch:"#9146FF",youtube:"#ff0000",tiktok:"#69C9D0"};
          const platformIcons={twitch:"🟣",youtube:"▶️",tiktok:"🎵"};

          // Stats
          const totalSessions=schedule.length;
          const weeklyHours=schedule.reduce((s,r)=>s+(r.duration||2),0);
          const mostStreamed=schedule.length?schedule.reduce((acc,s)=>{acc[s.platform]=(acc[s.platform]||0)+1;return acc;},{}):null;
          const topPlatform=mostStreamed?Object.entries(mostStreamed).sort((a,b)=>b[1]-a[1])[0]?.[0]:"—";

          // Notifications actives
          function requestNotif(s){
            if(!notifPrefs.planning){alert("Tu as désactivé les notifications de planning dans ton profil.");return;}
            if(!("Notification" in window)){alert("Notifications non supportées sur cet appareil.");return;}
            Notification.requestPermission().then(p=>{
              if(p==="granted"){
                const[h,m]=s.time.split(":").map(Number);
                const streamMs=new Date();streamMs.setHours(h,m-60,0,0);
                const delay=streamMs-Date.now();
                if(delay>0){setTimeout(()=>new Notification("🔴 Belive Academy",{body:`Ton stream ${platformIcons[s.platform]} commence dans 1 heure !`,icon:"https://beliveacademy.com/favicon.ico"}),delay);}
                alert(`✅ Rappel activé ! Tu recevras une notification 1h avant ton stream du ${s.day} à ${s.time}`);
              }else{alert("Active les notifications dans les paramètres de ton navigateur.");}
            });
          }

          function getSharePlanningText(){
            if(!schedule.length){
              return `📅 Planning de stream ${user.name}\nAucun stream planifié pour le moment.`;
            }
            const ordered=[...schedule].sort((a,b)=>{
              const d=DAYS.indexOf(a.day)-DAYS.indexOf(b.day);
              if(d!==0)return d;
              return (a.time||"00:00").localeCompare(b.time||"00:00");
            });
            const lines=ordered.map(s=>`- ${s.day} ${s.time} • ${s.duration}h • ${platformIcons[s.platform]||"🎮"} ${s.platform}`);
            return `📅 Planning de stream de ${user.name}\n\n${lines.join("\n")}\n\nSuivez-moi en live !`;
          }

          function sharePlanning(){
            const text=getSharePlanningText();
            if(navigator.share){
              navigator.share({title:`Planning de ${user.name}`,text}).catch(()=>{});
              return;
            }
            navigator.clipboard?.writeText(text).then(()=>{
              alert("✅ Planning copié ! Tu peux le coller où tu veux (Discord, Instagram, etc.).");
            }).catch(()=>{
              alert("⚠️ Impossible de copier automatiquement. Copie manuelle requise.");
            });
          }

          function downloadPlanningICS(){
            if(!schedule.length){alert("Ajoute au moins un stream pour télécharger le calendrier.");return;}
            const mapDay={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5,Samedi:6,Dimanche:0};
            const toUTC=(d)=>`${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,"0")}${String(d.getUTCDate()).padStart(2,"0")}T${String(d.getUTCHours()).padStart(2,"0")}${String(d.getUTCMinutes()).padStart(2,"0")}00Z`;
            const escapeICS=(s)=>String(s||"").replace(/\\/g,"\\\\").replace(/,/g,"\\,").replace(/;/g,"\\;").replace(/\n/g,"\\n");
            const nowDate=new Date();
            const events=[...schedule].map((s,i)=>{
              const targetDay=mapDay[s.day]??1;
              const base=new Date(nowDate);
              const diff=(targetDay-base.getDay()+7)%7;
              base.setDate(base.getDate()+diff);
              const [h,m]=(s.time||"20:00").split(":").map(Number);
              base.setHours(h||20,m||0,0,0);
              const start=new Date(base);
              const end=new Date(base);
              end.setMinutes(end.getMinutes()+Math.max(30,(Number(s.duration)||2)*60));
              return [
                "BEGIN:VEVENT",
                `UID:${Date.now()}-${i}@beliveacademy.com`,
                `DTSTAMP:${toUTC(new Date())}`,
                `DTSTART:${toUTC(start)}`,
                `DTEND:${toUTC(end)}`,
                `SUMMARY:${escapeICS(`${platformIcons[s.platform]||"🎮"} Stream ${user.name}`)}`,
                `DESCRIPTION:${escapeICS(`Live ${s.platform} • ${s.day} ${s.time}`)}`,
                "END:VEVENT"
              ].join("\r\n");
            });
            const icsContent=[
              "BEGIN:VCALENDAR",
              "VERSION:2.0",
              "PRODID:-//Belive Academy//Planning//FR",
              "CALSCALE:GREGORIAN",
              "METHOD:PUBLISH",
              ...events,
              "END:VCALENDAR"
            ].join("\r\n");
            const blob=new Blob([icsContent],{type:"text/calendar;charset=utf-8"});
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.href=url;
            a.download=`planning-${(user.name||"createur").replace(/\s+/g,"-").toLowerCase()}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }

          return(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>PLANNING</div><div style={{fontSize:13,color:M}}>Ton calendrier de streams</div></div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                  <Btn sz="sm" v="ghost" onClick={sharePlanning} icon="🔗">Partager</Btn>
                  <Btn sz="sm" v="ghost" onClick={downloadPlanningICS} icon="📥">Télécharger</Btn>
                  <Btn sz="sm" onClick={()=>setModal("addSc")} icon="+">Planifier un stream</Btn>
                </div>
              </div>

              {/* Prochain stream ALERT */}
              {nextStream&&(
                <div style={{background:minutesUntil!==null&&minutesUntil<120?"rgba(212,16,63,0.12)":"rgba(34,197,94,0.06)",border:`1px solid ${minutesUntil!==null&&minutesUntil<120?"rgba(212,16,63,0.4)":"rgba(34,197,94,0.2)"}`,borderRadius:16,padding:"18px 22px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
                  <div style={{fontSize:36}}>{minutesUntil!==null&&minutesUntil<120?"🔴":"📅"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>
                      {minutesUntil!==null&&minutesUntil<=0?"🔴 C'est l'heure de streamer !":minutesUntil!==null&&minutesUntil<60?`⚡ Stream dans ${minutesUntil} minutes !`:minutesUntil!==null&&minutesUntil<120?`⏰ Stream dans ${Math.round(minutesUntil/60)}h — Prépare-toi !`:`Prochain stream`}
                    </div>
                    <div style={{fontSize:13,color:M}}>{nextStream.day} à {nextStream.time} • {nextStream.duration}h • {platformIcons[nextStream.platform]} {nextStream.platform}</div>
                  </div>
                  <Btn sz="sm" v={minutesUntil!==null&&minutesUntil<120?"primary":"ghost"} onClick={()=>requestNotif(nextStream)} icon="🔔">
                    {minutesUntil!==null&&minutesUntil<120?"Notifier mes viewers":"Activer le rappel"}
                  </Btn>
                </div>
              )}

              {/* Stats planning */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
                <Card style={{textAlign:"center",padding:"16px 12px"}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:R,lineHeight:1}}>{totalSessions}</div>
                  <div style={{fontSize:11,color:M,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>Sessions/semaine</div>
                </Card>
                <Card style={{textAlign:"center",padding:"16px 12px"}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:G,lineHeight:1}}>{weeklyHours}h</div>
                  <div style={{fontSize:11,color:M,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>Heures prévues</div>
                </Card>
                <Card style={{textAlign:"center",padding:"16px 12px"}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:BL,lineHeight:1}}>{currentDay.slice(0,3)}</div>
                  <div style={{fontSize:11,color:M,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>Aujourd'hui</div>
                </Card>
                <Card style={{textAlign:"center",padding:"16px 12px"}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:PU,lineHeight:1}}>{platformIcons[topPlatform]||"—"}</div>
                  <div style={{fontSize:11,color:M,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>Plateforme principale</div>
                </Card>
              </div>

              {/* Timeline du jour */}
              {todayStreams.length>0&&(
                <Card style={{marginBottom:20,background:"rgba(212,16,63,0.04)",border:`1px solid rgba(212,16,63,0.15)`}}>
                  <div style={{fontWeight:800,marginBottom:14,fontSize:14}}>🔴 Aujourd'hui — {currentDay}</div>
                  {todayStreams.map(s=>{
                    const[h,m]=s.time.split(":").map(Number);
                    const mins=h*60+m;
                    const isLive=mins<=currentTime&&currentTime<=mins+s.duration*60;
                    const isPast=mins+s.duration*60<currentTime;
                    return(
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${B}`}}>
                        <div style={{width:48,height:48,background:isLive?"rgba(212,16,63,0.2)":isPast?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.06)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:isLive?`2px solid ${R}`:"none"}}>
                          {isLive?"🔴":isPast?"✅":platformIcons[s.platform]}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
                            {s.time} — {s.duration}h de stream
                            {isLive&&<Pill color="red" xs>EN LIVE</Pill>}
                            {isPast&&<Pill color="gray" xs>Terminé</Pill>}
                          </div>
                          <div style={{fontSize:12,color:M,marginTop:2}}>{platformIcons[s.platform]} {s.platform} • Durée prévue : {s.duration}h</div>
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          {!isPast&&!isLive&&<Btn sz="sm" v="ghost" onClick={()=>requestNotif(s)} icon="🔔">Rappel</Btn>}
                          <button onClick={()=>setSchedule(p=>p.filter(x=>x.id!==s.id))} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"5px 10px",color:M,fontSize:11,cursor:"pointer"}}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              )}

              {/* Calendrier semaine */}
              <div style={{fontWeight:800,marginBottom:12,fontSize:14}}>📆 Calendrier de la semaine</div>
              {schedule.length===0?(
                <Card style={{textAlign:"center",padding:"48px 20px"}}>
                  <div style={{fontSize:44,marginBottom:12}}>📅</div>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>Pas encore de planning</div>
                  <div style={{color:M,marginBottom:16}}>Planifie tes streams pour rester régulier et recevoir des rappels</div>
                  <Btn onClick={()=>setModal("addSc")} icon="+">Planifier mon premier stream</Btn>
                </Card>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
                  {DAYS.map(day=>{
                    const ds=schedule.filter(s=>s.day===day);
                    const isToday=day===currentDay;
                    return(
                      <Card key={day} style={{minHeight:150,padding:12,background:isToday?"rgba(212,16,63,0.06)":"var(--card,#111)",border:isToday?`1px solid rgba(212,16,63,0.25)`:undefined}}>
                        <div style={{fontSize:10,fontWeight:700,color:isToday?R:M,letterSpacing:1,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          {day.slice(0,3).toUpperCase()}
                          {isToday&&<span style={{background:R,color:"white",borderRadius:100,fontSize:8,padding:"1px 5px",fontWeight:800}}>TODAY</span>}
                        </div>
                        {ds.length===0?(
                          <div style={{color:"rgba(255,255,255,0.07)",fontSize:11,textAlign:"center",paddingTop:14}}>—</div>
                        ):ds.map(s=>{
                          const[h,m]=s.time.split(":").map(Number);
                          const mins=h*60+m;
                          const isLive=isToday&&mins<=currentTime&&currentTime<=mins+s.duration*60;
                          const isPast=isToday&&mins+s.duration*60<currentTime;
                          return(
                            <div key={s.id} style={{background:isLive?"rgba(212,16,63,0.15)":isPast?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.05)",border:`1px solid ${isLive?R:"rgba(255,255,255,0.08)"}`,borderRadius:8,padding:"7px 8px",marginBottom:6}}>
                              <div style={{fontWeight:700,fontSize:11,color:isLive?R:isPast?M:"white"}}>{s.time} {isLive?"🔴":""}</div>
                              <div style={{fontSize:10,color:M}}>{s.duration}h</div>
                              <div style={{fontSize:10,color:platformColors[s.platform]||M}}>{platformIcons[s.platform]} {s.platform}</div>
                              <div style={{display:"flex",gap:4,marginTop:4}}>
                                {!isPast&&<button onClick={()=>requestNotif(s)} style={{background:"none",border:"none",color:M,fontSize:9,cursor:"pointer",padding:0}}>🔔</button>}
                                <button onClick={()=>setSchedule(p=>p.filter(x=>x.id!==s.id))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",fontSize:9,cursor:"pointer",marginLeft:"auto"}}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                        <button onClick={()=>{setNewSc({...newSc,day});setModal("addSc");}} style={{width:"100%",background:"none",border:"1px dashed rgba(255,255,255,0.08)",borderRadius:8,padding:"5px",color:"rgba(255,255,255,0.15)",fontSize:10,cursor:"pointer",marginTop:4}}>+ Ajouter</button>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Conseils planning */}
              <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${B}`,borderRadius:12,padding:"16px 18px"}}>
                  <div style={{fontWeight:700,marginBottom:8,fontSize:13}}>💡 Conseils pour ton planning</div>
                  <div style={{fontSize:12,color:M,lineHeight:1.8}}>
                    • Streame <strong style={{color:"white"}}>3–5 fois/semaine</strong> minimum<br/>
                    • Toujours aux <strong style={{color:"white"}}>mêmes horaires</strong><br/>
                    • Meilleurs créneaux FR : <strong style={{color:"white"}}>20h–23h</strong><br/>
                    • Weekend : commence à <strong style={{color:"white"}}>16h</strong>
                  </div>
                </div>
                <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.13)`,borderRadius:12,padding:"16px 18px"}}>
                  <div style={{fontWeight:700,marginBottom:8,fontSize:13}}>🔔 Rappels automatiques</div>
                  <div style={{fontSize:12,color:M,lineHeight:1.8}}>
                    Clique sur <strong style={{color:"white"}}>🔔 Rappel</strong> sur chaque stream pour recevoir une notification <strong style={{color:"white"}}>1h avant</strong> de commencer.<br/><br/>
                    <span style={{color:R}}>⚠️ Active les notifications de ton navigateur</span>
                  </div>
                </div>
              </div>

              {/* Meilleurs horaires FR */}
              <div style={{marginTop:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>📊 Meilleurs horaires pour streamer en France</div>
                <Card>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:10}}>
                    {[{d:"Lun",slots:[{h:"20h",s:9},{h:"18h",s:5}]},{d:"Mar",slots:[{h:"20h",s:9},{h:"18h",s:5}]},{d:"Mer",slots:[{h:"20h",s:8},{h:"16h",s:7}]},{d:"Jeu",slots:[{h:"20h",s:9},{h:"18h",s:6}]},{d:"Ven",slots:[{h:"20h",s:10},{h:"18h",s:7}]},{d:"Sam",slots:[{h:"15h",s:10},{h:"12h",s:8}]},{d:"Dim",slots:[{h:"15h",s:9},{h:"12h",s:7}]}].map(day=>(
                      <div key={day.d} style={{textAlign:"center"}}>
                        <div style={{fontSize:10,fontWeight:700,color:M,marginBottom:5}}>{day.d}</div>
                        {day.slots.map((sl,i)=>(
                          <div key={i} style={{background:`rgba(212,16,63,${sl.s/12})`,borderRadius:5,padding:"4px 2px",marginBottom:3}}>
                            <div style={{fontSize:9,fontWeight:700,color:"white"}}>{sl.h}</div>
                            <div style={{fontSize:8,color:"rgba(255,255,255,0.6)"}}>{sl.s}/10</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:M,textAlign:"center"}}>🔴 Plus foncé = meilleure audience Twitch FR</div>
                </Card>
              </div>

              {/* Calendrier régularité */}
              <div style={{marginTop:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>🟩 Régularité — 30 derniers jours</div>
                <Card>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                    {Array.from({length:30},(_,i)=>{
                      const d=new Date();d.setDate(d.getDate()-29+i);
                      const ds=d.toISOString().slice(0,10);
                      const has=streams.some(s=>s.date===ds);
                      const isT=ds===new Date().toISOString().slice(0,10);
                      return <div key={i} title={ds} style={{width:22,height:22,borderRadius:4,background:has?"#22c55e":isT?"rgba(212,16,63,0.3)":"rgba(255,255,255,0.05)",border:isT?`1px solid ${R}`:"none"}}/>;
                    })}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:14,fontSize:11,color:M}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:12,borderRadius:2,background:"rgba(255,255,255,0.05)"}}/> Aucun stream</div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:12,borderRadius:2,background:"#22c55e"}}/> Streamé</div>
                    <div style={{marginLeft:"auto",fontWeight:700,color:"white"}}>{streams.length} streams / 30j</div>
                  </div>
                </Card>
              </div>

              {/* Objectif hebdo */}
              <div style={{marginTop:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>🎯 Objectif de la semaine</div>
                <Card>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{streams.length}/{Math.max(totalSessions,3)} streams effectués</div>
                      <div style={{fontSize:12,color:M,marginTop:2}}>Objectif : streamer tous tes créneaux planifiés</div>
                    </div>
                    <Pill color={streams.length>=Math.max(totalSessions,3)?"green":"yellow"}>{Math.min(100,Math.round((streams.length/Math.max(totalSessions,3))*100))}%</Pill>
                  </div>
                  <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(100,Math.round((streams.length/Math.max(totalSessions,3))*100))}%`,background:`linear-gradient(90deg,${R},#ff4d4d)`,borderRadius:4}}/>
                  </div>
                </Card>
              </div>

              {/* Conseils intelligents */}
              <div style={{marginTop:20}}>
                <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>💡 Conseils personnalisés</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {show:streams.length===0,icon:"🚀",txt:"Aucun stream enregistré. Commence par planifier 3 créneaux cette semaine et note-les après !",c:"blue"},
                    {show:streams.length>0&&avgV<3,icon:"👁️",txt:`Ton average est ${avgV} viewer(s). Pour l'affiliation tu as besoin de 3 en moyenne. Streame à 20h–23h et demande des raids !`,c:"yellow"},
                    {show:streams.length>0&&avgV>=3,icon:"🎉",txt:`Bravo ! ${avgV} viewers en moyenne — tu es au niveau de l'affiliation. Continue ta régularité !`,c:"green"},
                    {show:totalSessions>=5,icon:"⭐",txt:"Planning chargé cette semaine — excellent ! La régularité est la clé numéro 1 de la croissance.",c:"green"},
                    {show:totalSessions>0&&totalSessions<3,icon:"📅",txt:"Moins de 3 créneaux planifiés. Les créateurs qui streament 4x/semaine grandissent 3x plus vite !",c:"red"},
                    {show:streams.length>3&&streams.length<10,icon:"⏰",txt:"Tu es sur la bonne voie ! Essaie d'atteindre 15 streams/mois pour booster l'algorithme Twitch.",c:"yellow"},
                    {show:ms.twitch>0&&ms.twitch<50,icon:"🎯",txt:`${ms.twitch}/50 followers Twitch. Tu as besoin de ${50-ms.twitch} followers de plus pour l'affiliation — continues les raids !`,c:"blue"},
                  ].filter(x=>x.show).slice(0,3).map((x,i)=>(
                    <div key={i} style={{background:`rgba(${x.c==="green"?"34,197,94":x.c==="yellow"?"245,158,11":x.c==="blue"?"96,165,250":"212,16,63"},0.07)`,border:`1px solid rgba(${x.c==="green"?"34,197,94":x.c==="yellow"?"245,158,11":x.c==="blue"?"96,165,250":"212,16,63"},0.2)`,borderRadius:12,padding:"13px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:20,flexShrink:0}}>{x.icon}</span>
                      <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.6}}>{x.txt}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}

        {/* CLASSEMENT */}
        {page==="classement"&&(()=>{
          // Calcul dynamique des points pour chaque utilisateur inscrit
          const allUsers=Object.entries(JSON.parse(localStorage.getItem("ba6_users")||"{}")).map(([email,u])=>({email,...u}));
          const allStreams=JSON.parse(localStorage.getItem("ba6_st")||"[]");

          const scored=allUsers.map(u=>{
            const userStreams=allStreams.filter(s=>s.user_email===u.email||s.user===u.email);
            const hours=userStreams.reduce((t,s)=>t+s.duration,0);
            const followers=parseInt(u.twitch_followers||0);
            const avgViewers=userStreams.length?Math.round(userStreams.reduce((t,s)=>t+s.viewers,0)/userStreams.length):0;
            // Formule : heures×20 + followers×0.5 + viewers moyens×10
            const score=Math.round(hours*20 + followers*0.5 + avgViewers*10);
            return{name:u.name,ps:u.twitch||"—",score,hours:parseFloat(hours.toFixed(1)),followers,avgViewers,email:u.email};
          }).filter(u=>u.score>0||u.hours>0).sort((a,b)=>b.score-a.score);

          const medals=["🥇","🥈","🥉"];
          const gc=["#ffd700","#c0c0c0","#cd7f32"];

          return(
            <div>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>CLASSEMENT</div>
                <div style={{fontSize:13,color:M,marginTop:2}}>Points = Heures live × 20 + Followers × 0.5 + Viewers moyens × 10</div>
              </div>

              {scored.length===0?(
                <Card style={{textAlign:"center",padding:"60px 20px"}}>
                  <div style={{fontSize:52,marginBottom:16}}>🏆</div>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:2,marginBottom:10}}>LE CLASSEMENT SE REMPLIT</div>
                  <div style={{fontSize:14,color:M,lineHeight:1.7,maxWidth:400,margin:"0 auto"}}>
                    Le classement se met à jour automatiquement au fur et à mesure que les créateurs s'inscrivent et streament.<br/><br/>
                    <strong style={{color:"white"}}>Sois le premier à apparaître ici ! 🔥</strong>
                  </div>
                  {role==="createur"&&(
                    <div style={{marginTop:20}}>
                      <Btn onClick={()=>setPage("planning")} icon="📅">Planifier mon premier stream</Btn>
                    </div>
                  )}
                </Card>
              ):(
                <>
                  {/* Podium top 3 */}
                  {scored.length>=3&&(
                    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:14,marginBottom:24}}>
                      {[1,0,2].map(i=>{
                        const p=scored[i];
                        if(!p)return null;
                        const hs=[150,195,120];
                        const hi=[1,0,2].indexOf(i);
                        return(
                          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                            <div style={{width:44,height:44,background:`linear-gradient(135deg,${gc[i]},${gc[i]}99)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18}}>{medals[i]}</div>
                            <div style={{textAlign:"center"}}>
                              <div style={{fontWeight:800,fontSize:12}}>{p.name}</div>
                              <div style={{fontSize:13,fontWeight:800,color:R,marginTop:2}}>{p.score} pts</div>
                            </div>
                            <div style={{width:64,height:hs[hi],background:`${gc[i]}14`,border:`1px solid ${gc[i]}44`,borderRadius:"6px 6px 0 0",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:8,fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,color:gc[i]}}>{i+1}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tableau complet */}
                  <Card>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${B}`}}>
                          {["#","Créateur","Heures","Viewers","Score"].map(h=>(
                            <th key={h} style={{textAlign:"left",padding:"10px 14px",fontSize:11,fontWeight:700,color:M,textTransform:"uppercase"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {scored.map((p,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`,background:p.email===user.email?"rgba(212,16,63,0.04)":"transparent"}}>
                            <td style={{padding:"12px 14px",fontWeight:800,color:i<3?gc[i]:M}}>{medals[i]||`#${i+1}`}</td>
                            <td style={{padding:"12px 14px"}}>
                              <div style={{fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                                {p.name}
                                {p.email===user.email&&<Pill color="red" xs>Toi</Pill>}
                              </div>
                              <div style={{fontSize:11,color:M}}>🟣 @{p.ps}</div>
                            </td>
                            <td style={{padding:"12px 14px",color:M}}>{p.hours}h</td>
                            <td style={{padding:"12px 14px",color:M}}>{p.avgViewers} moy.</td>
                            <td style={{padding:"12px 14px"}}><strong style={{color:R,fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:18}}>{p.score}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  {/* Formule de calcul */}
                  <div style={{marginTop:14,background:"rgba(255,255,255,0.03)",border:`1px solid ${B}`,borderRadius:10,padding:"12px 16px",fontSize:12,color:M,lineHeight:1.7}}>
                    🏆 <strong style={{color:"white"}}>Formule des points :</strong> Heures de live × 20 + Followers Twitch × 0.5 + Viewers moyens × 10<br/>
                    📅 Le classement se réinitialise le <strong style={{color:"white"}}>1er de chaque mois</strong>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* PARTENARIATS */}
        {page==="partenariats"&&(
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>PARTENARIATS</div>
              <div style={{fontSize:13,color:M,marginTop:2}}>{role==="admin"?"Gérez vos partenariats":"Opportunités de collaboration"}</div>
            </div>

            {/* Si des partenariats actifs existent — on les affiche aux créateurs */}
            {role==="createur"&&partners.filter(p=>p.status==="active").length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:12}}>🔥 Deals disponibles</div>
                {partners.filter(p=>p.status==="active").map(p=>{
                  const applied=p.applicants?.find(a=>a.email===user.email);
                  return(
                    <Card key={p.id} style={{display:"flex",alignItems:"center",gap:16,marginBottom:10}}>
                      <div style={{width:50,height:50,background:"rgba(255,255,255,0.05)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{p.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                          <div style={{fontWeight:800,fontSize:14}}>{p.brand}</div>
                          {p.hot&&<Pill color="red" xs>🔥 Populaire</Pill>}
                          {applied&&<Pill color="green" xs>✓ Postulé</Pill>}
                        </div>
                        {p.type&&<div style={{fontSize:12,color:M,marginBottom:4}}>{p.type}</div>}
                        <div style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{p.desc}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        {p.budget&&<div style={{fontWeight:800,color:R,marginBottom:8,fontSize:13}}>{isPro?p.budget:"••• €"}</div>}
                        {applied
                          ?<Pill color="green">✓ Envoyée</Pill>
                          :p.accessEnabled === false
                          ?<Pill color="gray" xs>🔒 Non accessible</Pill>
                          :<Btn sz="sm" v={isPro?"primary":"ghost"} onClick={()=>isPro?applyPartner(p.id):setModal("payment")}>{isPro?"Postuler":"🔒 Pro"}</Btn>
                        }
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Page vide — message professionnel — visible si pas de partenariat actif */}
            {(partners.filter(p=>p.status==="active").length===0||role==="admin")&&role==="createur"&&(
              <div style={{position:"relative",overflow:"hidden",borderRadius:20,padding:"48px 32px",background:"linear-gradient(135deg,#0d0d0d,#12040a)",border:`1px solid rgba(212,16,63,0.2)`,textAlign:"center",marginBottom:20}}>
              <div style={{position:"absolute",width:400,height:400,background:"radial-gradient(circle,rgba(212,16,63,0.1) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${R},transparent)`}}/>
              <div style={{position:"relative",zIndex:2}}>
                <div style={{fontSize:52,marginBottom:16}}>🤝</div>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:26,letterSpacing:2,marginBottom:12}}>PARTENARIATS EN COURS</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.8,maxWidth:480,margin:"0 auto",marginBottom:24}}>
                  L'équipe Belive Academy travaille activement à la mise en place de partenariats avec des marques sélectionnées pour la communauté créateurs.<br/><br/>
                  <strong style={{color:"white"}}>Les premières opportunités seront disponibles très prochainement.</strong>
                </div>
                <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                  {["⚡ Boissons énergisantes","🎮 Jeux vidéo","🖱️ Périphériques gaming","🔒 Services digitaux"].map(c=>(
                    <div key={c} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${B}`,borderRadius:12,padding:"12px 20px",fontSize:13,color:M}}>{c}</div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Info pour les créateurs */}
            {role==="createur"&&(
              <Card style={{background:"rgba(212,16,63,0.04)",border:`1px solid rgba(212,16,63,0.12)`}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <span style={{fontSize:28,flexShrink:0}}>📩</span>
                  <div>
                    <div style={{fontWeight:800,marginBottom:6}}>Tu es notifié en premier</div>
                    <div style={{fontSize:13,color:M,lineHeight:1.7}}>
                      Dès qu'un partenariat est disponible, tu recevras une notification directement sur ton compte. Assure-toi d'avoir activé les notifications dans ton profil.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {role==="admin"&&(
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:15}}>📋 Gérer les partenariats</div>
                    <div style={{fontSize:12,color:M,marginTop:2}}>Ajoute un deal — il sera proposé à tous les créateurs avec notification</div>
                  </div>
                  <Btn sz="sm" onClick={()=>setModal("addPartner")} icon="+">Nouveau deal</Btn>
                </div>
                {partners.length===0?(
                  <div style={{textAlign:"center",padding:"20px 0",color:M,fontSize:13}}>Aucun partenariat actif — clique sur "Nouveau deal" pour en ajouter un</div>
                ):partners.map((p,i)=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${B}`}}>
                    <div style={{width:40,height:40,background:"rgba(255,255,255,0.05)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{p.brand}</div>
                      <div style={{fontSize:11,color:M}}>{p.type} • {p.budget} • {p.applicants?.length||0} candidature(s)</div>
                    </div>
                    <button onClick={()=>setPartners(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"none",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:8,padding:"5px 10px",color:R,fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑️</button>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* COMMUNAUTÉ */}
        {page==="communaute"&&(()=>{
          const CATS=[{id:"all",icon:"🌐",l:"Tous"},{id:"raid",icon:"⚔️",l:"Raids"},{id:"conseil",icon:"💡",l:"Conseils"},{id:"milestone",icon:"🏆",l:"Succès"},{id:"question",icon:"❓",l:"Questions"},{id:"collab",icon:"🤝",l:"Collabs"}];
          const filtered=posts.filter(p=>{
            const mc=commFilter==="all"||p.category===commFilter;
            const ms=!commSearch||p.content?.toLowerCase().includes(commSearch.toLowerCase())||p.user?.toLowerCase().includes(commSearch.toLowerCase());
            return mc&&ms;
          });
          return(
            <div>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>COMMUNAUTÉ</div>
                <div style={{fontSize:13,color:M,marginTop:2}}>Échange avec les créateurs Belive</div>
              </div>

              {/* Composer */}
              <Card style={{marginBottom:18}}>
                <div style={{display:"flex",gap:12,marginBottom:12}}>
                  <Av name={user.name} size={36}/>
                  <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Partage un conseil, demande un raid, célèbre une victoire..." style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${B}`,borderRadius:12,padding:"11px 14px",color:"white",fontSize:13,outline:"none",resize:"none",minHeight:80,lineHeight:1.6,fontFamily:"'Manrope',sans-serif"}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {CATS.filter(c=>c.id!=="all").map(c=>(
                      <button key={c.id} onClick={()=>setCommCat(c.id)} style={{background:commCat===c.id?"rgba(212,16,63,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${commCat===c.id?"rgba(212,16,63,0.4)":B}`,borderRadius:100,padding:"5px 12px",color:commCat===c.id?R:M,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        {c.icon} {c.l}
                      </button>
                    ))}
                  </div>
                  <Btn sz="sm" onClick={()=>{
                    if(!newPost.trim())return;
                    const banned=["agence","recrutement","rejoins nous","contact","whatsapp","telegram","discord","instagram","dm","mp","@","http","www",".com",".fr","euro","€","gratuit","offre","deal","proposition"];
                    const low=newPost.toLowerCase();
                    const found=banned.find(w=>low.includes(w));
                    if(found){alert(`⚠️ Message non autorisé — ce contenu n'est pas permis dans la communauté Belive Academy.`);return;}
                    setPosts(p=>[{id:Date.now(),user:user.name,av:(user.av||user.name.charAt(0)),time:"À l'instant",content:newPost,likes:0,liked:false,replies:[],showReplies:false,replyInput:"",category:commCat},...p]);
                    setNewPost("");
                  }}>Publier</Btn>
                </div>
              </Card>

              {/* Filtres */}
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                <input value={commSearch} onChange={e=>setCommSearch(e.target.value)} placeholder="🔍 Rechercher..." style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"8px 14px",color:"white",fontSize:12,outline:"none",width:160,fontFamily:"'Manrope',sans-serif"}}/>
                {CATS.map(c=>(
                  <button key={c.id} onClick={()=>setCommFilter(c.id)} style={{background:commFilter===c.id?"rgba(212,16,63,0.12)":"transparent",border:`1px solid ${commFilter===c.id?"rgba(212,16,63,0.3)":B}`,borderRadius:100,padding:"5px 12px",color:commFilter===c.id?R:M,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    {c.icon} {c.l}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {filtered.length===0?(
                <Card style={{textAlign:"center",padding:"40px 20px"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔍</div>
                  <div style={{fontWeight:800,marginBottom:6}}>Aucun post trouvé</div>
                  <div style={{color:M,fontSize:13}}>Sois le premier à poster ici !</div>
                </Card>
              ):filtered.map((p,i)=>{
                const catIcon={all:"🌐",raid:"⚔️",conseil:"💡",milestone:"🏆",question:"❓",collab:"🤝"}[p.category]||"💬";
                const catLabel={raid:"Raid",conseil:"Conseil",milestone:"Succès",question:"Question",collab:"Collab"}[p.category]||"";
                return(
                  <Card key={p.id||i} style={{marginBottom:12}}>
                    <div style={{display:"flex",gap:12,marginBottom:12}}>
                      <Av name={p.user} size={36}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <div style={{fontWeight:700,fontSize:14}}>{p.user}</div>
                          {catLabel&&<span style={{background:"rgba(255,255,255,0.06)",borderRadius:100,padding:"2px 8px",fontSize:10,color:M}}>{catIcon} {catLabel}</span>}
                        </div>
                        <div style={{fontSize:11,color:M}}>{p.time}</div>
                      </div>
                    </div>
                    <div style={{fontSize:14,color:"rgba(255,255,255,0.82)",lineHeight:1.65,marginBottom:14}}>{p.content}</div>
                    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                      <button onClick={()=>setPosts(prev=>prev.map((x,j)=>j!==i?x:{...x,likes:(x.liked?x.likes-1:x.likes+1),liked:!x.liked}))} style={{background:p.liked?"rgba(212,16,63,0.1)":"none",border:`1px solid ${p.liked?"rgba(212,16,63,0.3)":B}`,borderRadius:8,padding:"6px 14px",color:p.liked?R:M,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                        {p.liked?"❤️":"🤍"} {p.likes}
                      </button>
                      <button onClick={()=>setPosts(prev=>prev.map((x,j)=>j!==i?x:{...x,showReplies:!x.showReplies}))} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"6px 14px",color:M,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                        💬 {(p.replies||[]).length}
                      </button>
                      {p.category==="raid"&&(
                        <button style={{background:"rgba(212,16,63,0.08)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:8,padding:"6px 14px",color:R,fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:"auto"}}>⚔️ Je participe</button>
                      )}
                    </div>
                    {p.showReplies&&(
                      <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${B}`}}>
                        {(p.replies||[]).map((r,ri)=>(
                          <div key={ri} style={{display:"flex",gap:10,marginBottom:10}}>
                            <div style={{width:28,height:28,background:"rgba(212,16,63,0.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{(r.av||r.user.charAt(0)).toUpperCase()}</div>
                            <div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 12px"}}>
                              <div style={{display:"flex",gap:8,marginBottom:4}}>
                                <span style={{fontWeight:700,fontSize:12}}>{r.user}</span>
                                <span style={{fontSize:11,color:M}}>{r.time}</span>
                              </div>
                              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{r.text}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{display:"flex",gap:10,marginTop:10}}>
                          <div style={{width:28,height:28,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{(user.av||user.name.charAt(0)).toUpperCase()}</div>
                          <input value={p.replyInput||""} onChange={e=>setPosts(prev=>prev.map((x,j)=>j!==i?x:{...x,replyInput:e.target.value}))}
                            onKeyDown={e=>{if(e.key==="Enter"&&p.replyInput?.trim()){
                              setPosts(prev=>prev.map((x,j)=>j!==i?x:{...x,replies:[...(x.replies||[]),{user:user.name,av:(user.av||user.name.charAt(0)),text:x.replyInput,time:"À l'instant"}],replyInput:"",showReplies:true}));
                              if(notifPrefs.messages){sendNotif("💬 Nouveau message",`${user.name} a répondu dans la communauté`,"msg");}
                            }}}
                            placeholder="Ta réponse... (Entrée pour envoyer)" style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:8,padding:"7px 12px",color:"white",fontSize:13,outline:"none",fontFamily:"'Manrope',sans-serif"}}/>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          );
        })()}

        {/* TEMPLATES */}
        {page==="templates"&&(()=>{
          const pseudo=tmplPseudo||user.twitch||user.name;
          const BannerDark=()=>(
            <div style={{width:"100%",aspectRatio:"1200/480",background:"#080808",borderRadius:12,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",border:"1px solid rgba(212,16,63,0.3)"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(212,16,63,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(212,16,63,0.05) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
              <div style={{position:"absolute",width:"50%",height:"200%",background:"radial-gradient(ellipse,rgba(212,16,63,0.18) 0%,transparent 65%)",top:"-50%",right:"-10%"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:R}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:R}}/>
              <div style={{position:"relative",zIndex:2}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(18px,3.5vw,40px)",color:"white",letterSpacing:2,lineHeight:1}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
                <div style={{background:R,borderRadius:100,padding:"3px 12px",display:"inline-block",marginTop:6}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(7px,1.2vw,13px)",color:"white",letterSpacing:3}}>CRÉATEUR OFFICIEL</div>
                </div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(16px,3vw,36px)",color:"white",letterSpacing:3}}>{pseudo.toUpperCase()}</div>
                <div style={{fontSize:"clamp(7px,1vw,11px)",color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginTop:4}}>Agence Créateurs & Influence</div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"right"}}>
                <div style={{fontSize:"clamp(7px,0.9vw,10px)",color:"rgba(255,255,255,0.25)",letterSpacing:1}}>beliveacademy.com</div>
                <div style={{fontSize:"clamp(6px,0.8vw,9px)",color:"rgba(255,255,255,0.2)",marginTop:4}}>🔥 Rejoins la communauté</div>
              </div>
            </div>
          );
          const BannerRed=()=>(
            <div style={{width:"100%",aspectRatio:"1200/480",background:R,borderRadius:12,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"white"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"white"}}/>
              <div style={{position:"relative",zIndex:2}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(18px,3.5vw,40px)",color:"white",letterSpacing:2,lineHeight:1}}>BELIVE ACADEMY</div>
                <div style={{background:"white",borderRadius:100,padding:"3px 12px",display:"inline-block",marginTop:6}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(7px,1.2vw,13px)",color:R,letterSpacing:3}}>CRÉATEUR OFFICIEL</div>
                </div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(16px,3vw,36px)",color:"white",letterSpacing:3}}>{pseudo.toUpperCase()}</div>
                <div style={{fontSize:"clamp(7px,1vw,11px)",color:"rgba(255,255,255,0.7)",letterSpacing:2,textTransform:"uppercase",marginTop:4}}>Agence Créateurs & Influence</div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"right"}}>
                <div style={{fontSize:"clamp(7px,0.9vw,10px)",color:"rgba(255,255,255,0.5)",letterSpacing:1}}>beliveacademy.com</div>
              </div>
            </div>
          );
          const BannerNeon=()=>(
            <div style={{width:"100%",aspectRatio:"1200/480",background:"#050510",borderRadius:12,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",border:"1px solid rgba(124,58,237,0.3)"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
              <div style={{position:"absolute",width:"60%",height:"200%",background:"radial-gradient(ellipse,rgba(212,16,63,0.15) 0%,rgba(124,58,237,0.1) 40%,transparent 70%)",top:"-50%",right:"-10%"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#7c3aed,#D4103F)"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#D4103F,#7c3aed)"}}/>
              <div style={{position:"relative",zIndex:2}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(18px,3.5vw,40px)",color:"white",letterSpacing:2,lineHeight:1}}>BELIVE <span style={{color:"#a78bfa"}}>ACADEMY</span></div>
                <div style={{background:"linear-gradient(90deg,#7c3aed,#D4103F)",borderRadius:100,padding:"3px 12px",display:"inline-block",marginTop:6}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(7px,1.2vw,13px)",color:"white",letterSpacing:3}}>CRÉATEUR OFFICIEL</div>
                </div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(16px,3vw,36px)",color:"white",letterSpacing:3}}>{pseudo.toUpperCase()}</div>
                <div style={{fontSize:"clamp(7px,1vw,11px)",color:"rgba(167,139,250,0.7)",letterSpacing:2,textTransform:"uppercase",marginTop:4}}>Agence Créateurs & Influence</div>
              </div>
              <div style={{position:"relative",zIndex:2,textAlign:"right"}}>
                <div style={{fontSize:"clamp(7px,0.9vw,10px)",color:"rgba(255,255,255,0.25)"}}>beliveacademy.com</div>
              </div>
            </div>
          );
          const Frame=({ring,badge,badgeTxt,bg})=>(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{position:"relative",width:130,height:130}}>
                <div style={{position:"absolute",inset:0,borderRadius:"50%",background:`linear-gradient(135deg,${ring},${ring}88)`,padding:4}}>
                  <div style={{width:"100%",height:"100%",borderRadius:"50%",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    {tmplPhoto ? (
                      <img src={tmplPhoto} alt="profil" style={{position:"absolute",inset:6,width:"calc(100% - 12px)",height:"calc(100% - 12px)",borderRadius:"50%",objectFit:"cover"}}/>
                    ) : (
                      <div style={{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"2px dashed rgba(255,255,255,0.12)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                        <div style={{fontSize:26,opacity:0.25}}>📷</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.18)",textAlign:"center"}}>Ta photo</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{position:"absolute",bottom:-2,left:"50%",transform:"translateX(-50%)",background:badge,border:`2px solid ${bg}`,borderRadius:100,padding:"3px 10px",whiteSpace:"nowrap"}}>
                  <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:9,color:badgeTxt,letterSpacing:2}}>BELIVE</div>
                </div>
                <div style={{position:"absolute",top:2,right:2,width:22,height:22,background:ring,borderRadius:"50%",border:`2px solid ${bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:800}}>✓</div>
              </div>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:12,color:"white",letterSpacing:1}}>@{pseudo}</div>
            </div>
          );
          return(
            <div>
              <div style={{marginBottom:20}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>TEMPLATES</div><div style={{fontSize:13,color:M}}>Bannières et photos de profil Belive Academy</div></div>
              <Card style={{marginBottom:24}}>
                <div style={{fontWeight:800,marginBottom:12}}>✏️ Personnalise tes templates</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,alignItems:"flex-end"}}>
                  <Field label="Ton pseudo Twitch/Stream" value={tmplPseudo} onChange={e=>setTmplPseudo(e.target.value)} placeholder={user.twitch||user.name}/>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>📷 Ta photo de profil</div>
                    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"11px 14px"}}>
                      {tmplPhoto ? (
                        <img src={tmplPhoto} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}}/>
                      ) : (
                        <span style={{fontSize:20}}>📷</span>
                      )}
                      <span style={{fontSize:13,color:tmplPhoto?"white":M}}>{tmplPhoto?"Photo chargée ✓ — Clique pour changer":"Uploader ta photo..."}</span>
                      <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setTmplPhoto(ev.target.result);r.readAsDataURL(f);}}/>
                    </label>
                    {tmplPhoto&&<button onClick={()=>setTmplPhoto(null)} style={{marginTop:6,background:"none",border:"none",color:M,fontSize:11,cursor:"pointer"}}>✕ Supprimer la photo</button>}
                  </div>
                </div>
                <div style={{fontSize:12,color:M}}>💡 Ta photo apparaîtra dans les cadres de profil ci-dessous</div>
              </Card>

              {/* BANNIÈRES TWITCH */}
              <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🟣 Bannières Twitch <span style={{fontSize:12,color:M,fontWeight:400}}>(1200×480px)</span></div>
              <div style={{fontSize:12,color:M,marginBottom:16}}>Fais une capture d'écran et upload dans Paramètres Twitch → Image de profil en-tête</div>
              <div style={{display:"flex",flexDirection:"column",gap:20,marginBottom:32}}>
                <div><div style={{fontSize:12,fontWeight:700,color:M,marginBottom:8}}>Style Noir — Classique</div><BannerDark/></div>
                <div><div style={{fontSize:12,fontWeight:700,color:M,marginBottom:8}}>Style Rouge — Impact</div><BannerRed/></div>
                <div><div style={{fontSize:12,fontWeight:700,color:M,marginBottom:8}}>Style Neon — Gaming</div><BannerNeon/></div>
              </div>

              {/* BANNIÈRES YOUTUBE */}
              <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>▶️ Bannières YouTube <span style={{fontSize:12,color:M,fontWeight:400}}>(2560×1440px — capture l'élément)</span></div>
              <div style={{fontSize:12,color:M,marginBottom:16}}>Upload dans Personnaliser la chaîne → Image de bannière</div>
              <div style={{display:"flex",flexDirection:"column",gap:20,marginBottom:32}}>
                <div><div style={{fontSize:12,fontWeight:700,color:M,marginBottom:8}}>Style Noir YouTube</div>
                  <div style={{width:"100%",aspectRatio:"16/5",background:"#080808",borderRadius:12,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6%",border:`1px solid ${B}`}}>
                    <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,0,0,0.04) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"#ff0000"}}/>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:"#ff0000"}}/>
                    <div style={{position:"relative",zIndex:2}}>
                      <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(16px,3vw,38px)",color:"white",letterSpacing:2}}>BELIVE <span style={{color:"#ff4444"}}>ACADEMY</span></div>
                      <div style={{background:"#ff0000",borderRadius:100,padding:"2px 10px",display:"inline-block",marginTop:4}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(7px,1vw,12px)",color:"white",letterSpacing:3}}>CRÉATEUR OFFICIEL</div></div>
                    </div>
                    <div style={{position:"relative",zIndex:2,textAlign:"center"}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:"clamp(14px,2.8vw,34px)",color:"white",letterSpacing:3}}>{pseudo.toUpperCase()}</div><div style={{fontSize:"clamp(7px,1vw,10px)",color:"rgba(255,255,255,0.4)",letterSpacing:2,marginTop:4}}>YOUTUBE • TWITCH • TIKTOK</div></div>
                    <div style={{position:"relative",zIndex:2,textAlign:"right"}}><div style={{fontSize:"clamp(7px,0.9vw,10px)",color:"rgba(255,255,255,0.2)"}}>beliveacademy.com</div></div>
                  </div>
                </div>
              </div>

              {/* PHOTOS DE PROFIL */}
              <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>👤 Cadres Photo de Profil</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:20,marginBottom:24}}>
                <Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:M,marginBottom:14,fontWeight:600}}>Style Noir/Rouge</div><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Frame ring={R} badge={R} badgeTxt="white" bg="#080808"/></div><div style={{fontSize:11,color:M}}>Classique Belive</div></Card>
                <Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:M,marginBottom:14,fontWeight:600}}>Style Rouge/Blanc</div><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Frame ring="white" badge="white" badgeTxt={R} bg={R}/></div><div style={{fontSize:11,color:M}}>Style dynamique</div></Card>
                <Card style={{textAlign:"center",padding:24}}><div style={{fontSize:12,color:M,marginBottom:14,fontWeight:600}}>Style Or — VIP</div><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Frame ring="#ffd700" badge="#ffd700" badgeTxt="#1a1200" bg="#1a1200"/></div><div style={{fontSize:11,color:M}}>Créateur premium</div></Card>
              </div>

              <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.13)`,borderRadius:12,padding:"16px 18px"}}>
                <div style={{fontWeight:700,marginBottom:8}}>📲 Comment utiliser ces templates ?</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.8}}>
                  <strong style={{color:"white"}}>Bannières Twitch :</strong> Capture d'écran → Paramètres Twitch → Image de profil en-tête<br/>
                  <strong style={{color:"white"}}>Bannières YouTube :</strong> Capture d'écran → Personnaliser la chaîne → Image de bannière<br/>
                  <strong style={{color:"white"}}>Photos de profil :</strong> Utilise <strong>Canva</strong> (gratuit) pour insérer ta photo dans le cadre<br/>
                  <strong style={{color:"white"}}>Reconnaissance :</strong> Les créateurs Belive se reconnaîtront entre eux 🔥
                </div>
              </div>
            </div>
          );
        })()}

        {/* COACH IA */}
        {/* PROFIL */}
        {page==="profil"&&role==="createur"&&(
          <div className="fade">
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>MON PROFIL</div>
              <div style={{fontSize:13,color:M,marginTop:2}}>Ton identité sur Belive Academy</div>
            </div>

            {/* Photo + infos principales */}
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(212,16,63,0.15)",border:`3px solid ${R}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {profil.photo
                      ?<img src={profil.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,color:R}}>{user.name.charAt(0)}</div>
                    }
                  </div>
                  <label style={{position:"absolute",bottom:-2,right:-2,width:24,height:24,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12}}>
                    📷
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setProfil(p=>({...p,photo:ev.target.result}));r.readAsDataURL(f);}}/>
                  </label>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>{user.name}</div>
                  <div style={{fontSize:13,color:M,marginBottom:8}}>{profil.bio||"Aucune bio pour l'instant"}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {user.twitch&&<span style={{background:"rgba(145,70,255,0.12)",color:"#a78bfa",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700}}>🟣 @{user.twitch}</span>}
                    {user.youtube&&<span style={{background:"rgba(255,0,0,0.1)",color:"#ff6b6b",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700}}>▶️ {user.youtube}</span>}
                    {user.tiktok&&<span style={{background:"rgba(0,0,0,0.3)",color:"white",borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700}}>🎵 {user.tiktok}</span>}
                  </div>
                </div>
                <Btn sz="sm" v="ghost" onClick={()=>setProfilEdit(!profilEdit)}>{profilEdit?"✕ Fermer":"✏️ Modifier"}</Btn>
              </div>

              {profilEdit&&(
                <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${B}`}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <Field label="Bio" as="textarea" value={profil.bio||""} onChange={e=>setProfil(p=>({...p,bio:e.target.value}))} placeholder="Parle de toi, ton style de stream..."/>
                    <div style={{gridColumn:"1/-1"}}>
                      <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>🎮 Jeux streamés (6 max)</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                        {[0,1,2,3,4,5].map(i=>(
                          <input key={i} value={(profil.games||[])[i]||""} onChange={e=>{const g=[...(profil.games||["","","","","",""])];g[i]=e.target.value;setProfil(p=>({...p,games:g}));}} placeholder={`Jeu ${i+1}${i===0?" *":""}`} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"10px 12px",color:"white",fontSize:12,outline:"none",fontFamily:"'Manrope',sans-serif"}}/>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:M,marginTop:6}}>💡 Au moins un jeu recommandé — les autres créateurs pourront te trouver</div>
                    </div>
                    <Field label="Ville / Région" value={profil.city||""} onChange={e=>setProfil(p=>({...p,city:e.target.value}))} placeholder="Ex: Paris, Lyon..."/>
                    <Field label="Disponibilités" value={profil.dispo||""} onChange={e=>setProfil(p=>({...p,dispo:e.target.value}))} placeholder="Ex: Soirs semaine, weekends"/>
                  </div>
                  <Btn sz="sm" onClick={()=>setProfilEdit(false)} icon="💾">Sauvegarder</Btn>
                </div>
              )}
            </Card>

            {/* Stats publiques */}
            <div style={{fontWeight:800,marginBottom:12,fontSize:14}}>📊 Mes statistiques publiques</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:20}}>
              <SC label="🟣 Twitch" value={ms.twitch||"—"} color="purple"/>
              <SC label="▶️ YouTube" value={ms.youtube||"—"} color="red"/>
              <SC label="Heures streamées" value={totalH.toFixed(1)+"h"} color="green"/>
              <SC label="Streams ce mois" value={streams.length} color="purple"/>
              <SC label="Viewers moyen" value={avgV} color="blue"/>
            </div>

            {/* Infos supplémentaires */}
            <Card style={{marginBottom:20}}>
              <div style={{fontWeight:800,marginBottom:14}}>🎮 À propos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  ["🎮 Jeux streamés", (profil.games||[]).filter(Boolean).join(", ")||"Non renseigné"],
                  ["📍 Localisation", profil.city||"Non renseigné"],
                  ["⏰ Disponibilités", profil.dispo||"Non renseigné"],
                  ["📅 Membre depuis", user.createdAt||new Date().toLocaleDateString("fr-FR")],
                ].map(([l,v])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:M,marginBottom:4}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:v==="Non renseigné"?M:"white"}}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Badge Belive */}
            <Card style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.15)`,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:52,height:52,background:R,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🏆</div>
                <div>
                  <div style={{fontWeight:800,marginBottom:4}}>Créateur Belive Academy</div>
                  <div style={{fontSize:13,color:M}}>Tu fais partie de la communauté officielle Belive Academy. Utilise les templates pour afficher ton badge sur tes réseaux !</div>
                </div>
              </div>
            </Card>

            {/* Centre de notifications */}
            <Card>
              <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>🔔 Mes notifications</div>
              <div style={{fontSize:12,color:M,marginBottom:16}}>Active ou désactive chaque type de notification</div>
              {[
                {key:"planning",   icon:"📅", label:"Rappels de stream",      desc:"1h avant chaque stream planifié"},
                {key:"messages",   icon:"💬", label:"Nouveaux messages",       desc:"Quand quelqu'un répond dans la communauté"},
                {key:"partenariats",icon:"🤝",label:"Partenariats",            desc:"Nouvelles offres de partenariat disponibles"},
                {key:"classement", icon:"◆", label:"Classement",              desc:"Quand tu montes dans le classement"},
              ].map(n=>(
                <div key={n.key} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${B}`}}>
                  <div style={{width:40,height:40,background:"rgba(255,255,255,0.04)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{n.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{n.label}</div>
                    <div style={{fontSize:11,color:M,marginTop:2}}>{n.desc}</div>
                  </div>
                  {/* Toggle switch */}
                  <div onClick={()=>{
                    const newPrefs={...notifPrefs,[n.key]:!notifPrefs[n.key]};
                    setNotifPrefs(newPrefs);
                    if(newPrefs[n.key]&&Notification.permission==="default"){
                      Notification.requestPermission();
                    }
                  }} style={{
                    width:46,height:26,borderRadius:13,
                    background:notifPrefs[n.key]?R:"rgba(255,255,255,0.1)",
                    position:"relative",cursor:"pointer",
                    transition:"background 0.2s",flexShrink:0
                  }}>
                    <div style={{
                      position:"absolute",top:3,
                      left:notifPrefs[n.key]?22:3,
                      width:20,height:20,background:"white",
                      borderRadius:"50%",transition:"left 0.2s",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.3)"
                    }}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14,fontSize:12,color:M,display:"flex",alignItems:"center",gap:8}}>
                <span>{Notification.permission==="granted"?"✅ Notifications activées":"⚠️ Notifications désactivées dans ton navigateur"}</span>
                {Notification.permission!=="granted"&&(
                  <button onClick={()=>Notification.requestPermission()} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"4px 10px",color:R,fontSize:11,fontWeight:700,cursor:"pointer"}}>Activer</button>
                )}
              </div>
            </Card>

            {/* Section Abonnement simplifiée */}
            <Card>
              <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>💳 Mon Abonnement</div>
              
              {/* Statut actuel */}
              <div style={{background:user.plan==="pro"?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.03)",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <div style={{width:40,height:40,background:user.plan==="pro"?G:"rgba(255,255,255,0.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                    {user.plan==="pro"?"⭐":"🎁"}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:user.plan==="pro"?G:"white"}}>
                      {user.plan==="pro"?"Premium Actif" : user.plan==="belive_creator"?"Créateur Belive" : "Essai Gratuit"}
                    </div>
                    <div style={{fontSize:11,color:M}}>
                      {user.plan==="pro"?"14,99€/mois" : 
                       user.plan==="belive_creator"?"Offert par l'agence" :
                       isInTrial?`${trialDaysLeft} jours restants` :
                       "Fonctionnalités limitées"}
                    </div>
                  </div>
                </div>
                {user.plan==="pro" && (
                  <div style={{fontSize:12,color:M,marginTop:8}}>
                    Prochain paiement : {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString("fr-FR")}
                  </div>
                )}
              </div>

              {/* Bouton d'annulation */}
              {user.plan==="pro" && (
                <Btn 
                  v="danger"
                  onClick={cancelSubscription}
                  icon="✕"
                  style={{width:"100%"}}
                >
                  Annuler mon abonnement
                </Btn>
              )}

              {user.plan==="pro" && (
                <div style={{marginTop:12,fontSize:11,color:M,textAlign:"center"}}>
                  ⚠️ L'annulation prendra effet à la fin de ta période de facturation.<br/>
                  Tu conserveras l'accès Premium jusqu'à cette date.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* PARRAINAGE */}
        {page==="parrainage"&&role==="createur"&&(()=>{
          const myCode=user?.referral_code||("REF-"+(user?.name||"").toUpperCase().replace(/\s/g,"").slice(0,6)+"-"+(user?.email||"").slice(0,3).toUpperCase());
          const currentMonth=new Date().toISOString().slice(0,7); // YYYY-MM
          const myReferrals=parrainages.filter(r=>r.parrain_email===user?.email);
          const paidReferrals=myReferrals.filter(r=>r.paid);
          const rewardThisMonth=myReferrals.find(r=>r.reward_applied&&r.reward_month===currentMonth);
          const pendingReward=paidReferrals.find(r=>!r.reward_applied);

          return(
          <div className="fade">
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>PARRAINAGE</div>
              <div style={{fontSize:13,color:M,marginTop:2}}>Invite des créateurs et gagne des réductions</div>
            </div>

            {/* Comment ça marche */}
            <Card style={{marginBottom:20,background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.15)`}}>
              <div style={{fontWeight:800,marginBottom:14,fontSize:15}}>🎁 Comment ça marche ?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[
                  {icon:"🔗",t:"Partage ton code unique",d:"Chaque créateur a un code différent"},
                  {icon:"🎁",t:"30 jours d'essai offerts",d:"Le filleul bénéficie de 30j au lieu de 14"},
                  {icon:"💰",t:"Réduction pour toi",d:"-50% sur ton prochain mois (max 1/mois)"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 14px",textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontWeight:800,fontSize:13,marginBottom:6}}>{s.t}</div>
                    <div style={{fontSize:12,color:M,lineHeight:1.5}}>{s.d}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,background:"rgba(255,165,0,0.08)",border:"1px solid rgba(255,165,0,0.2)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"rgba(255,165,0,0.9)"}}>
                ⚠️ Limite : 1 réduction de -50% par mois. Chaque filleul doit s'abonner pour valider la réduction.
              </div>
            </Card>

            {/* Mon code */}
            <Card style={{marginBottom:20}}>
              <div style={{fontWeight:800,marginBottom:12}}>🔑 Mon code de parrainage</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:10,padding:"14px 20px",fontFamily:"monospace",fontSize:18,letterSpacing:4,color:R,fontWeight:800,textAlign:"center"}}>
                  {myCode}
                </div>
                <Btn onClick={()=>{navigator.clipboard?.writeText(myCode).catch(()=>{});setParrainCopied(true);setTimeout(()=>setParrainCopied(false),2000);}} icon={parrainCopied?"✓":"📋"} v={parrainCopied?"success":"primary"}>
                  {parrainCopied?"Copié !":"Copier"}
                </Btn>
              </div>
              <div style={{fontSize:12,color:M}}>💡 Partage ce code en stream, sur tes réseaux ou en MP</div>
            </Card>

            {/* Réduction en cours */}
            {rewardThisMonth&&(
              <Card style={{marginBottom:20,background:"rgba(34,197,94,0.06)",border:`1px solid rgba(34,197,94,0.2)`}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:36}}>🎉</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:G,marginBottom:4}}>-50% activé ce mois !</div>
                    <div style={{fontSize:13,color:M}}>Ta réduction est appliquée sur ton prochain paiement.</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Réduction en attente */}
            {pendingReward&&!rewardThisMonth&&(
              <Card style={{marginBottom:20,background:"rgba(251,191,36,0.06)",border:`1px solid rgba(251,191,36,0.2)`}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:36}}>⏳</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:YE,marginBottom:4}}>-50% en attente pour le mois prochain !</div>
                    <div style={{fontSize:13,color:M}}>Un de tes filleuls a payé. Ta réduction sera appliquée automatiquement.</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Mes filleuls */}
            <Card>
              <div style={{fontWeight:800,marginBottom:14}}>👥 Mes filleuls ({myReferrals.length})</div>
              {myReferrals.length===0?(
                <div style={{textAlign:"center",padding:"24px 0",color:M}}>
                  <div style={{fontSize:36,marginBottom:10}}>🔗</div>
                  <div style={{fontWeight:700,marginBottom:6}}>Aucun filleul pour l'instant</div>
                  <div style={{fontSize:13}}>Partage ton code pour commencer !</div>
                </div>
              ):myReferrals.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${B}`}}>
                  <div style={{width:36,height:36,background:"rgba(212,16,63,0.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0}}>{(r.filleul_name||"?").charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{r.filleul_name||r.filleul_email}</div>
                    <div style={{fontSize:11,color:M}}>Inscrit le {new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <Pill color={r.paid?"green":"yellow"} xs>{r.paid?"✅ Payant":"⏳ Essai"}</Pill>
                  {r.reward_applied&&<Pill color="green" xs>🎁 -50% appliqué</Pill>}
                </div>
              ))}
              <div style={{marginTop:14,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,fontSize:12,color:M,lineHeight:1.7}}>
                <strong style={{color:"white"}}>Règles :</strong> 1 filleul payant = -50% le mois suivant. Maximum 1 réduction par mois.
              </div>
            </Card>
          </div>
          );
        })()}

        {/* COACH IA */}
        {page==="coach"&&role==="createur"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>COACH IA</div><Pill color="red">Streaming uniquement</Pill></div>
              <div style={{fontSize:13,color:M}}>Conseils personnalisés sur ta stratégie streaming</div>
            </div>
            {!isPro&&<div style={{background:"rgba(245,158,11,0.07)",border:`1px solid rgba(245,158,11,0.18)`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:"rgba(255,255,255,0.55)"}}>⚠️ Plan gratuit : 5 questions/jour. Pro = illimité.</div>}
            <Card style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,marginBottom:12}}>
                {aiMsgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8}}>
                    {m.role==="ai"&&<div style={{width:28,height:28,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,alignSelf:"flex-start"}}>🤖</div>}
                    <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",fontSize:13,lineHeight:1.65,background:m.role==="user"?R:"rgba(255,255,255,0.05)"}}>
                      {m.text.split("**").map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:<span key={j}>{p}</span>)}
                    </div>
                  </div>
                ))}
                {aiTyping&&<div style={{display:"flex",gap:8}}><div style={{width:28,height:28,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div><div style={{background:"rgba(255,255,255,0.05)",borderRadius:"14px 14px 14px 4px",padding:"10px 14px",fontSize:13,color:M}} className="blink">En cours</div></div>}
                <div ref={aiEnd}/>
              </div>
              <div style={{display:"flex",gap:10,borderTop:`1px solid ${B}`,paddingTop:12}}>
                <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()} placeholder="Ex: Comment augmenter mes viewers ?" style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"10px 14px",color:"white",fontSize:13,outline:"none"}}/>
                <Btn onClick={sendAI} disabled={!aiInput.trim()||aiTyping}>Envoyer</Btn>
              </div>
            </Card>
          </div>
        )}

        {/* CRÉATEURS ADMIN */}
        {page==="createurs"&&role==="admin"&&(()=>{
          const allUsers=Object.entries(JSON.parse(localStorage.getItem("ba6_users")||"{}")).map(([email,u])=>({email,...u}));
          const allCreateurs=[...allUsers,...createurs.filter(c=>!allUsers.find(u=>u.email===c.email))];
          return(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>CRÉATEURS</div><div style={{fontSize:13,color:M}}>{allCreateurs.length} inscrits</div></div>
                <div style={{display:"flex",gap:8}}>
                  <Btn sz="sm" v="ghost" onClick={()=>setPage("codes")} icon="🔑">Codes</Btn>
                  <Btn sz="sm" onClick={()=>setModal("addCr")} icon="+">Ajouter</Btn>
                </div>
              </div>

              {/* Génération rapide de code */}
              <Card style={{marginBottom:16,background:"rgba(212,16,63,0.04)",border:`1px solid rgba(212,16,63,0.15)`}}>
                <div style={{fontWeight:800,marginBottom:10}}>🔑 Générer un code d'invitation rapide</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[{t:"createur",l:"🎮 Créateur"},{t:"agent",l:"🎯 Agent"}].map(x=>(
                    <div key={x.t} style={{flex:1,minWidth:180}}>
                      <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:10,padding:"12px 16px",fontFamily:"monospace",fontSize:15,letterSpacing:3,color:R,fontWeight:800,textAlign:"center",marginBottom:8}}>
                        {codes.filter(c=>c.type===x.t).slice(-1)[0]?.code||`${x.t==="createur"?"BELIVE":"AGENT"}-??????`}
                      </div>
                      <Btn full sz="sm" onClick={async()=>await genCode(x.t)}>{x.l} — Générer</Btn>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Liste complète */}
              {allCreateurs.length===0?(
                <Card style={{textAlign:"center",padding:"48px 20px"}}>
                  <div style={{fontSize:44,marginBottom:12}}>🎮</div>
                  <div style={{fontWeight:800,marginBottom:8}}>Aucun créateur inscrit</div>
                  <Btn onClick={()=>setModal("addCr")} icon="+">Ajouter manuellement</Btn>
                </Card>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {allCreateurs.map((c,i)=>{
                    const daysLeft=c.trialStart?Math.max(0,14-Math.floor((Date.now()-new Date(c.trialStart).getTime())/(1000*60*60*24))):0;
                    const status=c.plan==="pro"?"pro":daysLeft>0?"trial":"expired";
                    return(
                      <Card key={c.email||c.id||i}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <div style={{width:42,height:42,background:"rgba(212,16,63,0.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,flexShrink:0}}>{(c.name||"?").charAt(0)}</div>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                              <div style={{fontWeight:800,fontSize:14}}>{c.name}</div>
                              {status==="pro"&&<Pill color="green">✅ Pro</Pill>}
                              {status==="trial"&&<Pill color="yellow">⏳ {daysLeft}j</Pill>}
                              {status==="expired"&&<Pill color="red">🔒 Expiré</Pill>}
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,fontSize:11,color:M}}>
                              <span>📧 {c.email}</span>
                              <span>📱 {c.phone||"—"}</span>
                              {c.twitch&&<span>🟣 @{c.twitch}</span>}
                              {c.youtube&&<span>▶️ {c.youtube}</span>}
                              {c.tiktok&&<span>🎵 {c.tiktok}</span>}
                              {c.instagram&&<span>📸 {c.instagram}</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,alignItems:"flex-end"}}>
                            <Btn sz="sm" onClick={()=>openContract(c)}>📋 Contrat</Btn>
                            <button onClick={()=>togglePro(c.email)} style={{background:status==="pro"?"rgba(34,197,94,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${status==="pro"?"rgba(34,197,94,0.3)":B}`,borderRadius:8,padding:"5px 12px",color:status==="pro"?G:M,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                              {status==="pro"?"↓ Retirer Pro":"↑ Passer Pro"}
                            </button>
                            <button onClick={()=>deleteUser(c.email)} style={{background:"rgba(212,16,63,0.08)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:8,padding:"5px 12px",color:R,fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑️ Supprimer</button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* CONTRATS ADMIN */}
        {page==="contrats"&&role==="admin"&&(
          <div>
            <div style={{marginBottom:16}}><div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>CONTRATS</div><div style={{fontSize:13,color:M}}>Partenariats et contrats d'influence</div></div>
            {contrats.length===0?<Card style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:44,marginBottom:12}}>📋</div><div style={{fontWeight:800,marginBottom:8}}>Aucun contrat</div><div style={{color:M}}>Va dans Créateurs pour générer un contrat</div></Card>:(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {contrats.map(c=>(
                  <Card key={c.id} style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,background:"rgba(34,197,94,0.1)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📋</div>
                    <div style={{flex:1}}><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:12,color:M}}>{c.formule} • {c.commission}% • {c.montant}€ • {c.duree} • {c.date}</div><div style={{fontSize:12,color:M}}>📧 {c.email}</div></div>
                    <Pill color="yellow">Envoyé</Pill>
                    <button onClick={()=>setContrats(p=>p.filter(x=>x.id!==c.id))} style={{background:"none",border:`1px solid ${B}`,borderRadius:8,padding:"5px 12px",color:M,fontSize:11,cursor:"pointer"}}>Suppr.</button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CODES ADMIN */}
        {page==="codes"&&role==="admin"&&(()=>{const lastCode=codes.filter(c=>c.type===codeType).slice(-1)[0];return(
            <div>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>CODES D'ACCÈS</div>
                <div style={{fontSize:13,color:M}}>Génère des codes d'invitation illimités pour tes créateurs</div>
              </div>

              {/* Générateur */}
              <Card style={{marginBottom:20}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>🔑 Générateur de code</div>

                {/* Type de compte */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Type de compte</div>
                  <div style={{display:"flex",gap:10}}>
                    {[{v:"createur",l:"🎮 Créateur"},{v:"agent",l:"🎯 Agent"}].map(t=>(
                      <button key={t.v} onClick={()=>setCodeType(t.v)} style={{flex:1,padding:"10px",background:codeType===t.v?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${codeType===t.v?"rgba(212,16,63,0.4)":B}`,borderRadius:10,color:codeType===t.v?R:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type d'accès */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Type d'accès</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {[
                      {v:"belive_creator",l:"🎯 Créateur Belive",d:"Accès à 9,99€/mois"},
                      {v:"limited",l:"⏳ Durée limitée",d:"X jours gratuits"},
                      {v:"unlimited",l:"♾️ Pro permanent",d:"Gratuit à vie"},
                    ].map(t=>(
                      <button key={t.v} onClick={()=>setFreeType(t.v)} style={{flex:1,minWidth:100,padding:"10px 8px",background:freeType===t.v?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${freeType===t.v?"rgba(212,16,63,0.4)":B}`,borderRadius:10,color:freeType===t.v?R:"white",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
                        <div>{t.l}</div>
                        <div style={{fontSize:10,color:freeType===t.v?"rgba(212,16,63,0.7)":M,marginTop:3,fontWeight:400}}>{t.d}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info selon le type */}
                {freeType==="belive_creator"&&(
                  <div style={{background:"rgba(212,16,63,0.06)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:12,color:M,lineHeight:1.7}}>
                    🎯 <strong style={{color:"white"}}>Créateur Belive</strong> — Quand il s'inscrit avec ce code, l'app lui propose automatiquement le lien à <strong style={{color:R}}>9,99€/mois</strong> au lieu de 14,99€.
                  </div>
                )}

                {/* Durée si limité */}
                {freeType==="limited"&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Durée gratuite</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {[7,14,30,60,90].map(d=>(
                        <button key={d} onClick={()=>setFreeDays(d)} style={{padding:"8px 16px",background:freeDays===d?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${freeDays===d?"rgba(212,16,63,0.4)":B}`,borderRadius:8,color:freeDays===d?R:M,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          {d} jours
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aperçu du code */}
                <div style={{background:"rgba(212,16,63,0.06)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:12,padding:"16px",fontFamily:"monospace",fontSize:15,letterSpacing:3,color:R,textAlign:"center",fontWeight:800,marginBottom:16}}>
                  {lastCode?.code||`${codeType==="createur"?"BELIVE":"AGENT"}-XXXXXX-XXXXXX-XXXX`}
                </div>

                {/* Nom du créateur */}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>👤 Pour qui est ce code ? (optionnel)</div>
                  <input value={codeCreatorName} onChange={e=>setCodeCreatorName(e.target.value)} placeholder="Ex: Lucas Stream, Marie Live..." style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:10,padding:"10px 14px",color:"white",fontSize:13,outline:"none"}}/>
                  <div style={{fontSize:11,color:M,marginTop:4}}>Ce nom s'affichera dans l'historique pour que tu te rappelles à qui tu as donné ce code</div>
                </div>

                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                  <Btn full onClick={async()=>{await genCode(codeType,freeType,freeDays,codeCreatorName);setCodeCreatorName("");}} icon="🔄">
                    Générer un nouveau code
                  </Btn>
                  {lastCode&&(
                    <Btn v="ghost" onClick={()=>{navigator.clipboard?.writeText(lastCode.code).catch(()=>{});alert(`✅ Code copié !`);}}>
                      📋 Copier
                    </Btn>
                  )}
                </div>

                <div style={{fontSize:12,color:M,lineHeight:1.7}}>
                  {freeType==="belive_creator"
                    ?<>🎯 <strong style={{color:"white"}}>Créateur Belive</strong> — L'app proposera automatiquement le tarif <strong style={{color:R}}>9,99€/mois</strong></>
                    :freeType==="unlimited"
                    ?<>♾️ <strong style={{color:"white"}}>Accès Pro permanent</strong> — Gratuit à vie</>
                    :<>⏳ <strong style={{color:"white"}}>{freeDays} jours gratuits</strong> — Ensuite 14,99€/mois</>
                  }
                  <br/>🔒 Code unique à 16 caractères — impossible à deviner
                </div>
              </Card>

              {/* Historique */}
              {codes.length>0&&(
                <Card>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{fontWeight:800}}>Historique ({codes.length} codes)</div>
                    <button onClick={()=>setCodes([])} style={{background:"none",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:8,padding:"5px 12px",color:R,fontSize:11,cursor:"pointer"}}>Tout effacer</button>
                  </div>
                  {[...codes].reverse().map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:180}}>
                        <div style={{fontFamily:"monospace",color:R,letterSpacing:1,fontWeight:800,fontSize:11,marginBottom:c.creatorName?4:0}}>{c.code}</div>
                        {c.creatorName&&<div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>👤 Pour : <strong style={{color:"white"}}>{c.creatorName}</strong></div>}
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        <Pill color={c.type==="createur"?"purple":"blue"} xs>{c.type}</Pill>
                        {c.freeType==="belive_creator"||c.free_type==="belive_creator"
                          ?<Pill color="red" xs>🎯 9,99€</Pill>
                          :c.freeType==="unlimited"||c.free_type==="unlimited"
                          ?<Pill color="green" xs>♾️ Pro</Pill>
                          :<Pill color="yellow" xs>⏳ {c.freeDays||c.free_days||14}j</Pill>
                        }
                        {c.usedBy||c.used_by
                          ?<Pill color="red" xs>✓ {c.usedBy||c.used_by}</Pill>
                          :<Pill color="green" xs>Dispo</Pill>
                        }
                      </div>
                      <button onClick={()=>{navigator.clipboard?.writeText(c.code).catch(()=>{});alert("✅ Copié !");}} style={{background:"none",border:`1px solid ${B}`,borderRadius:6,padding:"3px 8px",color:M,fontSize:10,cursor:"pointer"}}>📋</button>
                      <button onClick={()=>setCodes(p=>p.filter((_,j)=>j!==codes.length-1-i))} style={{background:"none",border:"none",color:"rgba(255,255,255,0.15)",fontSize:12,cursor:"pointer"}}>✕</button>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          );
        })()}

        {/* PARRAINAGES ADMIN */}
        {page==="parrainages"&&role==="admin"&&(
          <div className="fade">
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,letterSpacing:2}}>PARRAINAGES</div>
              <div style={{fontSize:13,color:M}}>Suivi des parrainages et réductions -50%</div>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              <SC label="Total parrainages" value={adminRefs.length} icon="🔗" color="yellow"/>
              <SC label="Filleuls payants" value={adminRefs.filter(r=>r.paid).length} icon="💳" color="green"/>
              <SC label="Réductions appliquées" value={adminRefs.filter(r=>r.reward_applied).length} icon="🎁" color="red"/>
            </div>

            {/* Liste */}
            <Card>
              <div style={{fontWeight:800,marginBottom:14}}>👥 Tous les parrainages</div>
              {adminRefs.length===0?(
                <div style={{textAlign:"center",padding:"40px 0",color:M}}>
                  <div style={{fontSize:36,marginBottom:10}}>🎁</div>
                  <div style={{fontWeight:700,marginBottom:6}}>Aucun parrainage pour l'instant</div>
                  <div style={{fontSize:13}}>Les parrainages apparaîtront ici dès qu'un créateur utilisera le code d'un autre</div>
                </div>
              ):adminRefs.map((r,i)=>{
                const currentMonth=new Date().toISOString().slice(0,7);
                const alreadyRewarded=adminRefs.find(x=>x.parrain_email===r.parrain_email&&x.reward_applied&&x.reward_month===currentMonth&&x.id!==r.id);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${B}`}}>
                    <div style={{width:40,height:40,background:"rgba(251,191,36,0.15)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎁</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{r.parrain_email}</div>
                      <div style={{fontSize:11,color:M,marginTop:2}}>a parrainé → <strong style={{color:"white"}}>{r.filleul_name||r.filleul_email}</strong></div>
                      <div style={{fontSize:11,color:M}}>{new Date(r.created_at).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <Pill color={r.paid?"green":"yellow"} xs>{r.paid?"✅ Payant":"⏳ Essai"}</Pill>
                      {r.reward_applied&&<Pill color="green" xs>🎁 -50% {r.reward_month}</Pill>}
                      {alreadyRewarded&&!r.reward_applied&&<Pill color="gray" xs>Limite mois atteinte</Pill>}
                      {r.paid&&!r.reward_applied&&!alreadyRewarded&&(
                        <Btn sz="sm" onClick={async()=>{
                          await db.updateReferral(r.id,{reward_applied:true,reward_month:currentMonth});
                          alert(`✅ Réduction -50% appliquée pour ${r.parrain_email} !`);
                          db.getReferrals().then(data=>{if(data)setAdminRefs(data);});
                        }}>Appliquer -50%</Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

      </div>

      {/* MODALS */}

      {/* WELCOME MODAL */}
      {/* FORGOT PASSWORD MODAL */}
      <Modal open={isForgot} onClose={()=>{setIsForgot(false);setForgotSent(false);setForgotEmail("");}} title="🔑 Mot de passe oublié">
        {!forgotSent?(
          <>
            <div style={{fontSize:13,color:M,marginBottom:16,lineHeight:1.6}}>Entre ton email — on t'envoie un code de réinitialisation.</div>
            <Field label="Email" type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="ton@email.com"/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn v="ghost" onClick={()=>setIsForgot(false)}>Annuler</Btn>
              <Btn onClick={doForgotPassword}>Envoyer le code</Btn>
            </div>
          </>
        ):(
          <>
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:M}}>
              ✅ Code envoyé à <strong style={{color:"white"}}>{forgotEmail}</strong>
            </div>
            {(()=>{
              const [code,setCode]=useState("");
              const [newPass,setNewPass]=useState("");
              const [confirmPass,setConfirmPass]=useState("");
              return(
                <>
                  <Field label="Code reçu par email" value={code} onChange={e=>setCode(e.target.value)} placeholder="XXXXXX"/>
                  <Field label="Nouveau mot de passe" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="••••••••"/>
                  <Field label="Confirmer le mot de passe" type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="••••••••"/>
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <Btn v="ghost" onClick={()=>setIsForgot(false)}>Annuler</Btn>
                    <Btn onClick={()=>{
                      const resets=JSON.parse(localStorage.getItem("ba6_resets")||"{}");
                      const r=resets[forgotEmail];
                      if(!r||r.code!==code.toUpperCase()){alert("❌ Code incorrect.");return;}
                      if(newPass!==confirmPass){alert("❌ Les mots de passe ne correspondent pas.");return;}
                      if(newPass.length<6){alert("❌ Mot de passe trop court (6 caractères minimum).");return;}
                      doResetPassword(newPass);
                    }}>Réinitialiser</Btn>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </Modal>

      {showWelcome&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:20,backdropFilter:"blur(8px)"}}>
          <div className="fade" style={{background:"#0d0d0d",border:`1px solid rgba(212,16,63,0.3)`,borderRadius:24,padding:32,width:"100%",maxWidth:460,textAlign:"center",position:"relative",overflow:"hidden"}}>
            {/* Background glow */}
            <div style={{position:"absolute",width:300,height:300,background:"radial-gradient(circle,rgba(212,16,63,0.15) 0%,transparent 70%)",top:-100,left:"50%",transform:"translateX(-50%)",pointerEvents:"none"}}/>
            {/* Top line */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${R},transparent)`}}/>

            <div style={{fontSize:52,marginBottom:16}}>🎉</div>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:32,letterSpacing:3,marginBottom:8}}>
              BIENVENUE DANS<br/><span style={{color:R}}>BELIVE ACADEMY</span>
            </div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:24}}>
              Tu fais maintenant partie de la communauté officielle.<br/>
              Des créateurs comme toi t'attendent déjà — ensemble vous allez aller plus loin. 🔥
            </div>

            {/* Steps */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,textAlign:"left"}}>
              {[
                {icon:"👤",t:"Complete ton profil",d:"Ajoute ta photo, tes jeux et ta bio"},
                {icon:"🎮",t:"Connecte tes plateformes",d:"Twitch, YouTube, TikTok — lie tes comptes"},
                {icon:"🤝",t:"Rejoins la communauté",d:"Poste, fais des raids, trouve des coéquipiers"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"12px 14px"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>{s.t}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <Btn full sz="lg" onClick={()=>{setShowWelcome(false);setPage("profil");}}>
              🚀 Commencer mon aventure
            </Btn>
            <div onClick={()=>setShowWelcome(false)} style={{marginTop:14,fontSize:12,color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>
              Passer pour l'instant
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      <Modal open={modal==="payment"} onClose={()=>setModal(null)} title="Passer à Pro">
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:13,color:M}}>Choisis ton offre</div>
        </div>

        {/* Créateur Belive → uniquement 9,99€ */}
        {isBeliveCreator?(
          <div style={{background:"rgba(212,16,63,0.06)",border:`1px solid rgba(212,16,63,0.3)`,borderRadius:14,padding:20,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontWeight:800,fontSize:15}}>🎯 Offre Créateur Belive</div>
                <div style={{fontSize:12,color:M,marginTop:2}}>Ton tarif exclusif agence</div>
              </div>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,color:R}}>9,99€<span style={{fontSize:13,color:M}}>/mois</span></div>
            </div>
            <div style={{fontSize:12,color:M,marginBottom:14,lineHeight:1.6}}>✅ Accès complet • Coach IA • Partenariats • Templates • Communauté</div>
            <Btn full onClick={()=>window.open("https://buy.stripe.com/00waEW7h15eNdsT1wA1wY04","_blank")}>
              Souscrire à 9,99€/mois
            </Btn>
          </div>
        ):(
          <>
            <div style={{background:"rgba(212,16,63,0.06)",border:`1px solid rgba(212,16,63,0.25)`,borderRadius:14,padding:20,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:15}}>🎯 Créateur Belive</div><div style={{fontSize:12,color:M,marginTop:2}}>Pour les créateurs de l'agence</div></div>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,color:R}}>9,99€<span style={{fontSize:13,color:M}}>/mois</span></div>
              </div>
              <div style={{fontSize:12,color:M,marginBottom:14,lineHeight:1.6}}>✅ Accès complet • Coach IA • Partenariats • Templates • Communauté</div>
              <Btn full onClick={()=>window.open("https://buy.stripe.com/00waEW7h15eNdsT1wA1wY04","_blank")}>Souscrire à 9,99€/mois</Btn>
              <div style={{textAlign:"center",marginTop:8,fontSize:11,color:M}}>Réservé aux créateurs Belive Academy</div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${B}`,borderRadius:14,padding:20,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontWeight:800,fontSize:15}}>⚡ Application Belive</div><div style={{fontSize:12,color:M,marginTop:2}}>Accès indépendant</div></div>
                <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:28,color:"white"}}>14,99€<span style={{fontSize:13,color:M}}>/mois</span></div>
              </div>
              <div style={{fontSize:12,color:M,marginBottom:14,lineHeight:1.6}}>✅ Accès complet • Coach IA • Partenariats • Templates • Communauté</div>
              <Btn full v="ghost" onClick={()=>window.open("https://buy.stripe.com/cNicN430LdLj88zgru1wY05","_blank")}>Souscrire à 14,99€/mois</Btn>
            </div>
          </>
        )}
        <div style={{textAlign:"center",fontSize:11,color:M}}>🔒 Paiement sécurisé via Stripe • Résiliable à tout moment</div>
      </Modal>

      {/* Modal nouveau partenariat */}
      <Modal open={modal==="addPartner"} onClose={()=>setModal(null)} title="➕ Nouveau partenariat">
        <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.12)`,borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:12,color:M,lineHeight:1.7}}>
          💡 Une fois ajouté, tous les créateurs recevront une notification et pourront postuler depuis leur espace.
        </div>

        {/* Icône */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Icône de la marque</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {["🤝","⚡","🎮","🔒","🖱️","👕","🎧","📱","💊","🍕","🎯","💰","🏆","🔥"].map(ic=>(
              <button key={ic} onClick={()=>setNewPartner({...newPartner,icon:ic})} style={{width:40,height:40,background:newPartner.icon===ic?"rgba(212,16,63,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${newPartner.icon===ic?"rgba(212,16,63,0.5)":B}`,borderRadius:8,fontSize:20,cursor:"pointer"}}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Nom de la marque *" value={newPartner.brand} onChange={e=>setNewPartner({...newPartner,brand:e.target.value})} placeholder="Ex: GFuel France"/>
          <Field label="Catégorie" value={newPartner.type} onChange={e=>setNewPartner({...newPartner,type:e.target.value})} placeholder="Ex: Boisson, Gaming..."/>
          <Field label="Budget / Récompense" value={newPartner.budget} onChange={e=>setNewPartner({...newPartner,budget:e.target.value})} placeholder="Ex: 50–200€ ou Produit offert"/>
        </div>
        <Field label="Description pour les créateurs" as="textarea" value={newPartner.desc} onChange={e=>setNewPartner({...newPartner,desc:e.target.value})} placeholder="Ex: Code promo à placer en stream. Commission sur chaque vente générée..."/>

        <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:16,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${B}`,borderRadius:10}}>
          <input type="checkbox" checked={newPartner.hot} onChange={e=>setNewPartner({...newPartner,hot:e.target.checked})} style={{width:16,height:16,accentColor:R}}/>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>🔥 Marquer comme populaire</div>
            <div style={{fontSize:11,color:M}}>Affiche un badge "Populaire" pour attirer l'attention</div>
          </div>
        </label>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
          <Btn onClick={()=>{
            if(!newPartner.brand){alert("Le nom de la marque est obligatoire.");return;}
            const p={...newPartner,id:Date.now(),applicants:[],status:"active"};
            setPartners(prev=>[...prev,p]);
            // Notif pour tous les créateurs
            sendNotif("🤝 Nouveau partenariat !",`${newPartner.brand} — Nouveau deal disponible sur Belive Academy !`,"new-partner");
            storeAdminNotif(`🤝 Partenariat ajouté : ${newPartner.brand}`);
            setNewPartner({brand:"",type:"",budget:"",desc:"",icon:"🤝",hot:false});
            setModal(null);
            alert(`✅ Partenariat ${newPartner.brand} ajouté ! Les créateurs ont été notifiés.`);
          }} icon="✅">Publier le partenariat</Btn>
        </div>
      </Modal>

      <Modal open={modal==="addCr"} onClose={()=>setModal(null)} title="Ajouter un créateur">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nom complet *" value={newCr.name} onChange={e=>setNewCr({...newCr,name:e.target.value})} placeholder="Prénom Nom"/>
          <Field label="Email *" type="email" value={newCr.email} onChange={e=>setNewCr({...newCr,email:e.target.value})} placeholder="email@exemple.com"/>
          <Field label="Téléphone" type="tel" value={newCr.phone} onChange={e=>setNewCr({...newCr,phone:e.target.value})} placeholder="06 12 34 56 78"/>
          <Field label="Formule" as="select" value={newCr.formule} onChange={e=>setNewCr({...newCr,formule:e.target.value})}><option value="commission">Commission (19€ + 25%)</option><option value="premium">Premium (14,99€/mois)</option></Field>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="🟣 Twitch" value={newCr.twitch} onChange={e=>setNewCr({...newCr,twitch:e.target.value})} placeholder="pseudo"/>
          <Field label="▶️ YouTube" value={newCr.youtube} onChange={e=>setNewCr({...newCr,youtube:e.target.value})} placeholder="chaîne"/>
          <Field label="🎵 TikTok" value={newCr.tiktok} onChange={e=>setNewCr({...newCr,tiktok:e.target.value})} placeholder="@pseudo"/>
          <Field label="📸 Instagram" value={newCr.instagram} onChange={e=>setNewCr({...newCr,instagram:e.target.value})} placeholder="@pseudo"/>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
          <Btn onClick={addCreateur}>Ajouter</Btn>
        </div>
      </Modal>

      <Modal open={modal==="addSc"} onClose={()=>setModal(null)} title="Planifier un stream">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <button onClick={()=>setPlanningMode("single")} style={{padding:"9px 10px",background:planningMode==="single"?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${planningMode==="single"?"rgba(212,16,63,0.4)":B}`,borderRadius:10,color:planningMode==="single"?R:"white",fontWeight:700,cursor:"pointer"}}>Un seul jour</button>
          <button onClick={()=>setPlanningMode("week")} style={{padding:"9px 10px",background:planningMode==="week"?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${planningMode==="week"?"rgba(212,16,63,0.4)":B}`,borderRadius:10,color:planningMode==="week"?R:"white",fontWeight:700,cursor:"pointer"}}>Toute la semaine</button>
        </div>

        {planningMode==="single"?(
          <>
            <Field label="Jour" as="select" value={newSc.day} onChange={e=>setNewSc({...newSc,day:e.target.value})}>{DAYS.map(d=><option key={d}>{d}</option>)}</Field>
            <Field label="Heure" type="time" value={newSc.time} onChange={e=>setNewSc({...newSc,time:e.target.value})}/>
            <Field label="Durée (heures)" type="number" value={newSc.dur} onChange={e=>setNewSc({...newSc,dur:e.target.value})} placeholder="2"/>
            <Field label="Plateforme" as="select" value={newSc.platform} onChange={e=>setNewSc({...newSc,platform:e.target.value})}><option value="twitch">🟣 Twitch</option><option value="youtube">▶️ YouTube</option></Field>
          </>
        ):(
          <>
            <div style={{fontSize:11,fontWeight:600,color:M,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Jours à planifier</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
              {DAYS.map(d=>(
                <button key={d} onClick={()=>setWeekSc(p=>({...p,days:{...p.days,[d]:!p.days[d]}}))} style={{padding:"8px 6px",background:weekSc.days[d]?"rgba(212,16,63,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${weekSc.days[d]?"rgba(212,16,63,0.35)":B}`,borderRadius:8,color:weekSc.days[d]?R:M,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {d.slice(0,3)}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <Btn sz="sm" v="ghost" onClick={()=>setWeekSc(p=>({...p,days:{Lundi:true,Mardi:true,Mercredi:true,Jeudi:true,Vendredi:true,Samedi:false,Dimanche:false}}))}>Lun-Ven</Btn>
              <Btn sz="sm" v="ghost" onClick={()=>setWeekSc(p=>({...p,days:{Lundi:false,Mardi:false,Mercredi:false,Jeudi:false,Vendredi:false,Samedi:true,Dimanche:true}}))}>Weekend</Btn>
              <Btn sz="sm" v="ghost" onClick={()=>setWeekSc(p=>({...p,days:{Lundi:true,Mardi:true,Mercredi:true,Jeudi:true,Vendredi:true,Samedi:true,Dimanche:true}}))}>Tous</Btn>
            </div>
            <Field label="Heure commune" type="time" value={weekSc.time} onChange={e=>setWeekSc({...weekSc,time:e.target.value})}/>
            <Field label="Durée commune (heures)" type="number" value={weekSc.dur} onChange={e=>setWeekSc({...weekSc,dur:e.target.value})} placeholder="2"/>
            <Field label="Plateforme commune" as="select" value={weekSc.platform} onChange={e=>setWeekSc({...weekSc,platform:e.target.value})}><option value="twitch">🟣 Twitch</option><option value="youtube">▶️ YouTube</option></Field>
          </>
        )}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
          <Btn onClick={planningMode==="single"?addScheduleItem:addWeekScheduleItems}>{planningMode==="single"?"Planifier":"Planifier la semaine"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="contract"} onClose={()=>setModal(null)} title={`Contrat — ${ct.createur?.name||""}`} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <Field label="Formule" as="select" value={ct.formule} onChange={e=>setCt({...ct,formule:e.target.value,montant:e.target.value==="premium"?"14.99":"19"})}>
            <option value="commission">Commission (frais unique)</option>
            <option value="premium">Coaching Premium (mensuel)</option>
          </Field>
          <Field label={ct.formule==="commission"?"Frais d'entrée (€)":"Mensualité (€)"} type="number" value={ct.montant} onChange={e=>setCt({...ct,montant:e.target.value})}/>
          <Field label="Commission (%)" type="number" value={ct.commission} onChange={e=>setCt({...ct,commission:e.target.value})} placeholder="25"/>
          <Field label="Durée" as="select" value={ct.duree} onChange={e=>setCt({...ct,duree:e.target.value})}>
            <option>Sans engagement</option>
            <option>3 mois</option>
            <option>6 mois</option>
            <option>9 mois</option>
            <option>12 mois</option>
          </Field>
          <Field label="Préavis résiliation" as="select" value={ct.preavis} onChange={e=>setCt({...ct,preavis:e.target.value})}>
            <option>7 jours</option>
            <option>15 jours</option>
            <option>30 jours</option>
          </Field>
        </div>

        {/* Revenus concernés */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:M,letterSpacing:0.5,marginBottom:10,textTransform:"uppercase"}}>💰 Commission prélevée sur :</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {k:"inclPartenariats",l:"🤝 Partenariats"},
              {k:"inclPubs",l:"📺 Publicités"},
              {k:"inclSubs",l:"💜 Subs/Abonnements"},
              {k:"inclBits",l:"💎 Bits/Super Chats"},
              {k:"inclMerchandise",l:"👕 Merchandise"},
              {k:"inclDons",l:"🎁 Dons"},
            ].map(r=>(
              <label key={r.k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 12px",background:ct[r.k]?"rgba(212,16,63,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${ct[r.k]?"rgba(212,16,63,0.3)":B}`,borderRadius:8}}>
                <input type="checkbox" checked={ct[r.k]||false} onChange={e=>setCt({...ct,[r.k]:e.target.checked})} style={{accentColor:R}}/>
                <span style={{fontSize:12,color:ct[r.k]?"white":M}}>{r.l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Prestations incluses */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:M,letterSpacing:0.5,marginBottom:10,textTransform:"uppercase"}}>✅ Prestations incluses :</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {k:"prestCoaching",l:"🎯 Coaching personnalisé"},
              {k:"prestStats",l:"📊 Suivi statistiques"},
              {k:"prestPartenariats",l:"🤝 Recherche partenariats"},
              {k:"prestStrategie",l:"📈 Stratégie de croissance"},
              {k:"prestApp",l:"📱 Accès app Belive Academy"},
              {k:"prestGroupe",l:"👥 Accès groupe privé"},
              {k:"prestContenu",l:"🎬 Aide création contenu"},
              {k:"prestReseaux",l:"📲 Gestion réseaux sociaux"},
            ].map(p=>(
              <label key={p.k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 12px",background:ct[p.k]?"rgba(34,197,94,0.08)":"rgba(255,255,255,0.03)",border:`1px solid ${ct[p.k]?"rgba(34,197,94,0.25)":B}`,borderRadius:8}}>
                <input type="checkbox" checked={ct[p.k]||false} onChange={e=>setCt({...ct,[p.k]:e.target.checked})} style={{accentColor:G}}/>
                <span style={{fontSize:12,color:ct[p.k]?"white":M}}>{p.l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <Field label="Clause d'exclusivité (optionnel)" value={ct.clauseExclu||""} onChange={e=>setCt({...ct,clauseExclu:e.target.value})} placeholder="Ex: Exclusivité agence 6 mois"/>
          <Field label="Notes particulières (optionnel)" value={ct.noteLibre||""} onChange={e=>setCt({...ct,noteLibre:e.target.value})} placeholder="Conditions spécifiques..."/>
        </div>

        {/* Aperçu contrat PDF */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:M,letterSpacing:0.5,marginBottom:10,textTransform:"uppercase"}}>👁️ Aperçu du contrat</div>
          <div style={{background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>
            {/* Header */}
            <div style={{background:"#111",padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:20,letterSpacing:3,color:"white"}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
              <div style={{background:R,color:"white",borderRadius:100,padding:"4px 14px",fontSize:10,fontWeight:800,letterSpacing:2}}>CONTRAT D'ACCOMPAGNEMENT</div>
            </div>
            <div style={{height:3,background:`linear-gradient(90deg,${R},#ff4d4d)`}}/>
            {/* Body */}
            <div style={{padding:"24px 28px"}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:16,letterSpacing:2,color:"#111",marginBottom:4}}>CONTRAT D'ACCOMPAGNEMENT CRÉATEUR</div>
              <div style={{fontSize:11,color:"#888",marginBottom:20}}>📅 Fait le {new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})}</div>
              {/* Two cols */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
                <div style={{background:"#f8f8f8",borderRadius:10,padding:"14px 16px",borderLeft:"4px solid #D4103F"}}>
                  <div style={{fontSize:9,fontWeight:800,color:R,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>AGENCE</div>
                  {[["Nom","Belive Academy — Ethan"],["Email","ethan@beliveacademy.com"],["Tél.","07 80 99 92 51"]].map(([l,v])=>(
                    <div key={l} style={{fontSize:11,color:"#333",marginBottom:4,display:"flex",gap:8}}><strong style={{minWidth:50,color:"#111"}}>{l}</strong>{v}</div>
                  ))}
                </div>
                <div style={{background:"#f8f8f8",borderRadius:10,padding:"14px 16px",borderLeft:"4px solid #D4103F"}}>
                  <div style={{fontSize:9,fontWeight:800,color:R,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>CRÉATEUR</div>
                  {[["Nom",ct.createur?.name||"—"],["Email",ct.createur?.email||"—"],["Twitch",ct.createur?.twitch?"@"+ct.createur.twitch:"—"],["YouTube",ct.createur?.youtube||"—"]].map(([l,v])=>(
                    <div key={l} style={{fontSize:11,color:"#333",marginBottom:4,display:"flex",gap:8}}><strong style={{minWidth:50,color:"#111"}}>{l}</strong>{v}</div>
                  ))}
                </div>
              </div>
              {/* Formule */}
              <div style={{background:"#111",borderRadius:10,padding:"16px 18px",marginBottom:14}}>
                <div style={{fontSize:9,fontWeight:800,color:R,letterSpacing:2,marginBottom:12}}>FORMULE : {ct.formule==="commission"?"COMMISSION":"COACHING PREMIUM"}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    [ct.formule==="commission"?"Frais d'entrée":"Mensualité",`${ct.montant}€`],
                    ["Commission",`${ct.commission}%`],
                    ["Durée",ct.duree],
                    ["Préavis",ct.preavis||"15 jours"],
                    ["Revenus",[ct.inclPartenariats&&"Partenariats",ct.inclPubs&&"Pubs",ct.inclSubs&&"Subs",ct.inclBits&&"Bits",ct.inclMerchandise&&"Merch",ct.inclDons&&"Dons"].filter(Boolean).join(", ")||"Tous"],
                  ].map(([l,v])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:800,color:"white"}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Prestations */}
              <div style={{background:"#f8f8f8",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
                <div style={{fontSize:9,fontWeight:800,color:R,letterSpacing:2,marginBottom:10}}>PRESTATIONS INCLUSES</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[
                    {k:"prestCoaching",l:"Coaching personnalisé"},
                    {k:"prestStats",l:"Suivi statistiques"},
                    {k:"prestPartenariats",l:"Recherche partenariats"},
                    {k:"prestStrategie",l:"Stratégie de croissance"},
                    {k:"prestApp",l:"Accès app Belive Academy"},
                    {k:"prestGroupe",l:"Accès groupe privé"},
                    {k:"prestContenu",l:"Aide création contenu"},
                    {k:"prestReseaux",l:"Gestion réseaux sociaux"},
                  ].filter(p=>ct[p.k]).map(p=>(
                    <div key={p.k} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#333"}}>
                      <div style={{width:16,height:16,background:R,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:9,flexShrink:0}}>✓</div>
                      {p.l}
                    </div>
                  ))}
                </div>
              </div>
              {/* Signatures */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Ethan — Belive Academy","ethan@beliveacademy.com","Signature de l'agence"],[ct.createur?.name||"___",ct.createur?.email||"___","Signature + Lu et approuvé"]].map(([name,email,label])=>(
                  <div key={name} style={{border:"2px solid #eee",borderRadius:10,padding:"16px",textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:12,color:"#111",marginBottom:2}}>{name}</div>
                    <div style={{fontSize:10,color:"#888",marginBottom:16}}>{email}</div>
                    <div style={{borderTop:`2px solid ${R}`,margin:"0 20px"}}/>
                    <div style={{fontSize:9,color:"#aaa",marginTop:6}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div style={{background:"#111",padding:"14px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:14,letterSpacing:2,color:"white"}}>BELIVE <span style={{color:R}}>ACADEMY</span></div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"right"}}>beliveacademy.com • ethan@beliveacademy.com • 07 80 99 92 51</div>
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn v="ghost" onClick={()=>setModal(null)}>Fermer</Btn>
          <Btn v="ghost" onClick={()=>{
            const w=window.open("","_blank");
            w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:white;}@media print{body{margin:0;}}</style></head><body>${document.querySelector('[data-contract-preview]')?.innerHTML||""}</body></html>`);
            w.document.close();
            setTimeout(()=>w.print(),500);
          }} icon="📄">Imprimer PDF</Btn>
          <Btn v="success" onClick={saveContract} icon="💾">Envoyer par email</Btn>
        </div>
      </Modal>

    </div>
  );
}
