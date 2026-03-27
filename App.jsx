import { useState, useEffect, useRef } from 'react';

// ── SUPABASE ──────────────────────────────────────────────
const SUPA_URL = "https://fiftdixtzeiidvwblvtr.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZnRkaXh0emVpaWR2d2JsdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDk3MzcsImV4cCI6MjA4OTc4NTczN30.BFvldCWsJQPXa6dHqR8wRJikVpG7qXTAEw_T6mtCGKM";

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
};

// ── STRIPE SÉCURISÉ (PLUS AUCUNE CLÉ SECRÈTE EXPOSÉE) ───────────────────────────────────
const STRIPE_URLS = {
  premium: "https://buy.stripe.com/cNicN430LdLj88zgru1wY05",  // 14.99€
  agency: "https://buy.stripe.com/00waEW7h15eNdsT1wA1wY04",   // 9.99€
  discounted: "https://buy.stripe.com/dRmeVc30LbDbdsTcbe1wY06" // 7.49€ (-50% automatique récurrent)
};

// ── VARIABLES GLOBALES ──────────────────────────────────────────────
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

// ── RÉPONSES IA ─────────────────────────────────────────────
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

// ── GÉNÉRATION DE CONTRAT ─────────────────────────────────────
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

// ── CSS ───────────────────────────────────────────────────────
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

// ── FONCTIONS STRIPE SÉCURISÉES AVEC PARRAINAGE ───────────────────────────────────
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

// Gérer le succès du paiement
async function handlePaymentSuccess(userEmail) {
  if (!userEmail) return;
  
  try {
    // Mettre à jour l'utilisateur en base de données
    await db.updateUser(userEmail, {
      plan: "premium",
      subscription_active: true,
      subscription_start: new Date().toISOString()
    });
    
    // Mettre à jour localStorage
    const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
    if (sv[userEmail]) {
      sv[userEmail].plan = "premium";
      sv[userEmail].subscription_active = true;
      sv[userEmail].subscription_start = new Date().toISOString();
    }
    localStorage.setItem("ba6_users", JSON.stringify(sv));
    
    // Notifier l'admin
    storeAdminNotif(`🎉 Nouvel abonnement Premium : ${userEmail}`);
    
  } catch (error) {
    console.error('Erreur mise à jour après paiement:', error);
  }
}

// Annuler l'abonnement
async function cancelSubscription(userEmail) {
  if (!userEmail) return;
  
  if (!confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?\n\nVous garderez l'accès jusqu'à la fin de la période payée.")) {
    return;
  }
  
  try {
    // Marquer l'abonnement comme annulé
    await db.updateUser(userEmail, {
      subscription_cancelled: true,
      subscription_cancelled_at: new Date().toISOString()
    });
    
    // Mettre à jour localStorage
    const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
    if (sv[userEmail]) {
      sv[userEmail].subscription_cancelled = true;
      sv[userEmail].subscription_cancelled_at = new Date().toISOString();
    }
    localStorage.setItem("ba6_users", JSON.stringify(sv));
    
    alert("✅ Votre abonnement sera annulé à la fin de la période en cours.");
    
    // Notifier l'admin
    storeAdminNotif(`❌ Annulation d'abonnement : ${userEmail}`);
    
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    alert("Une erreur est survenue lors de l'annulation.");
  }
}

// Appliquer un code de parrainage
async function applyReferralCode(code, userEmail, userName) {
  if (!code || !userEmail || !userName) return false;
  
  try {
    // Chercher le parrain avec ce code
    const usersData = JSON.parse(localStorage.getItem("ba6_users") || "{}");
    const referrer = Object.values(usersData).find(u => u.referral_code === code.toUpperCase());
    
    if (!referrer) {
      alert("❌ Code de parrainage invalide");
      return false;
    }
    
    if (referrer.email === userEmail) {
      alert("❌ Tu ne peux pas utiliser ton propre code de parrainage");
      return false;
    }
    
    // Vérifier si le parrain n'a pas déjà une réduction ce mois-ci
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
    const parrainages = JSON.parse(localStorage.getItem("ba6_parrainages") || "[]");
    const monthlyRewards = parrainages.filter(p => 
      p.parrain_email === referrer.email && 
      p.reward_month === currentMonth
    );
    
    if (monthlyRewards.length >= 1) {
      alert("❌ Ce parrain a déjà utilisé sa réduction ce mois-ci. Maximum 1 par mois.");
      return false;
    }
    
    // Enregistrer le parrainage
    await db.addReferral({
      parrain_email: referrer.email,
      filleul_email: userEmail,
      filleul_name: userName,
      code: code.toUpperCase(),
      created_at: new Date().toISOString(),
      status: "pending"
    });
    
    // Donner la réduction au parrain pour le mois suivant
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const discountValidUntil = nextMonthDate.toISOString();
    
    await db.updateUser(referrer.email, {
      next_month_discount: true,
      discount_percentage: 50,
      discount_valid_until: discountValidUntil,
      discount_month: currentMonth // Enregistrer le mois de la récompense
    });
    
    // Mettre à jour localStorage pour le parrain
    if (usersData[referrer.email]) {
      usersData[referrer.email].next_month_discount = true;
      usersData[referrer.email].discount_percentage = 50;
      usersData[referrer.email].discount_valid_until = discountValidUntil;
      usersData[referrer.email].discount_month = currentMonth;
    }
    localStorage.setItem("ba6_users", JSON.stringify(usersData));
    
    // Marquer la récompense comme appliquée
    const newParrainage = {
      parrain_email: referrer.email,
      filleul_email: userEmail,
      filleul_name: userName,
      code: code.toUpperCase(),
      created_at: new Date().toISOString(),
      status: "completed",
      reward_month: currentMonth,
      reward_applied: true,
      reward_type: "next_month_50_percent"
    };
    parrainages.push(newParrainage);
    localStorage.setItem("ba6_parrainages", JSON.stringify(parrainages));
    
    // Notifier l'admin
    storeAdminNotif(`🎁 Nouveau parrainage : ${userName} (${userEmail}) parrainé par ${referrer.name} (${referrer.email})`);
    
    return true;
    
  } catch (error) {
    console.error('Erreur application code parrainage:', error);
    alert("Une erreur est survenue lors de l'application du code de parrainage.");
    return false;
  }
}

// ── COMPOSANTS ─────────────────────────────────────────────
const Pill = ({children, color="red", xs}) => {
  const m = {
    red: {bg: "rgba(212,16,63,0.12)", t: R, b: "rgba(212,16,63,0.25)"},
    green: {bg: "rgba(34,197,94,0.12)", t: G, b: "rgba(34,197,94,0.25)"},
    blue: {bg: "rgba(96,165,250,0.12)", t: BL, b: "rgba(96,165,250,0.25)"},
    purple: {bg: "rgba(167,139,250,0.12)", t: PU, b: "rgba(167,139,250,0.25)"},
    yellow: {bg: "rgba(251,191,36,0.12)", t: YE, b: "rgba(251,191,36,0.25)"},
    gray: {bg: "rgba(255,255,255,0.06)", t: M, b: B}
  };
  const c = m[color] || m.gray;
  return (
    <span style={{
      background: c.bg,
      color: c.t,
      border: `1px solid ${c.b}`,
      borderRadius: 100,
      padding: xs ? "2px 8px" : "4px 12px",
      fontSize: xs ? 10 : 11,
      fontWeight: 700,
      whiteSpace: "nowrap"
    }}>{children}</span>
  );
};

const Btn = ({children, onClick, v="primary", sz="md", full, icon, disabled}) => {
  const V = {
    primary: {bg: R, c: "white", b: "none"},
    ghost: {bg: "rgba(255,255,255,0.05)", c: "white", b: `1px solid ${B}`},
    danger: {bg: "rgba(212,16,63,0.1)", c: R, b: "1px solid rgba(212,16,63,0.2)"},
    success: {bg: "rgba(34,197,94,0.1)", c: G, b: "1px solid rgba(34,197,94,0.2)"}
  };
  const S = {
    sm: {p: "7px 14px", fs: 12},
    md: {p: "11px 22px", fs: 13},
    lg: {p: "15px 30px", fs: 14}
  };
  const s = V[v];
  const z = S[sz];
  return (
    <button 
      onClick={disabled ? undefined : onClick} 
      style={{
        background: s.bg,
        color: s.c,
        border: s.b,
        borderRadius: 10,
        padding: z.p,
        fontSize: z.fs,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.45 : 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        justifyContent: "center",
        transition: "opacity 0.15s"
      }}
    >
      {icon && <span>{icon}</span>}{children}
    </button>
  );
};

const Field = ({label, hint, ...p}) => (
  <div style={{marginBottom: 14}}>
    {label && <div style={{fontSize: 11, fontWeight: 600, color: M, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase"}}>{label}</div>}
    {p.as === "select" ? 
      <select {...p} style={{width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${B}`, borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none"}}>{p.children}</select> : 
      p.as === "textarea" ? 
        <textarea {...p} style={{width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${B}`, borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none", resize: "vertical", minHeight: 80}}/> : 
        <input {...p} style={{width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${B}`, borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 13, outline: "none"}}/>
    }
    {hint && <div style={{fontSize: 11, color: M, marginTop: 4}}>{hint}</div>}
  </div>
);

const Card = ({children, style, onClick}) => (
  <div onClick={onClick} style={{background: C, border: `1px solid ${B}`, borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default", ...style}}>
    {children}
  </div>
);

const Modal = ({open, onClose, title, children, wide}) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16, backdropFilter: "blur(6px)"}}>
      <div onClick={e => e.stopPropagation()} className="fade" style={{background: C2, border: `1px solid ${B}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: wide ? 700 : 480, maxHeight: "92vh", overflowY: "auto"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
          <div style={{fontWeight: 800, fontSize: 16}}>{title}</div>
          <button onClick={onClose} style={{background: "none", border: "none", color: M, fontSize: 22, cursor: "pointer"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const SC = ({label, value, sub, icon, color="red", delta}) => {
  const cl = {red: R, green: G, blue: BL, purple: PU}[color] || R;
  return (
    <Card>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
        <div style={{fontSize: 11, fontWeight: 600, color: M, letterSpacing: 0.5, textTransform: "uppercase"}}>{label}</div>
        {icon && <span style={{fontSize: 18}}>{icon}</span>}
      </div>
      <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 34, color: cl, lineHeight: 1, marginBottom: 4}}>{value}</div>
      {sub && <div style={{fontSize: 12, color: M}}>{sub}</div>}
      {delta !== undefined && (
        <div style={{marginTop: 6, fontSize: 11, fontWeight: 700, color: delta >= 0 ? G : "#ef4444"}}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% vs mois dernier
        </div>
      )}
    </Card>
  );
};

const Av = ({name, size = 36}) => (
  <div style={{
    width: size,
    height: size,
    background: R,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: size * 0.38,
    flexShrink: 0
  }}>
    {(name || "?").charAt(0).toUpperCase()}
  </div>
);

// ── TEMPLATES ─────────────────────────────────────────────
const BannerTemplate = ({variant,pseudo}) => {
  const variants = {
    dark: {bg: "#0a0a0a", accent: R, text: "white", sub: "rgba(255,255,255,0.4)"},
    red: {bg: R, accent: "white", text: "white", sub: "rgba(255,255,255,0.7)"},
    neon: {bg: "#050510", accent: "#7c3aed", text: "white", sub: "rgba(167,139,250,0.6)"},
  };
  const v = variants[variant] || variants.dark;
  return (
    <div style={{width: "100%", aspectRatio: "3/1", background: v.bg, borderRadius: 12, overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6%", border: `1px solid ${B}`}}>
      <div style={{position: "absolute", inset: 0, backgroundImage: `linear-gradient(${v.accent}10 1px,transparent 1px),linear-gradient(90deg,${v.accent}10 1px,transparent 1px)`, backgroundSize: "40px 40px"}}/>
      <div style={{position: "absolute", width: "50%", height: "200%", background: `radial-gradient(ellipse,${v.accent}22 0%,transparent 65%)`, top: "-50%", right: "-10%"}}/>
      <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 3, background: v.accent}}/>
      <div style={{position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: v.accent}}/>
      <div style={{position: "relative", zIndex: 2}}>
        <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(20px,4vw,36px)", color: v.text, letterSpacing: 2, lineHeight: 1}}>BELIVE <span style={{color: v.accent === "white" ? "rgba(255,255,255,0.7)" : v.accent}}>ACADEMY</span></div>
        <div style={{background: v.accent, borderRadius: 100, padding: "2px 10px", display: "inline-block", marginTop: 4}}>
          <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(8px,1.5vw,12px)", color: v.bg, letterSpacing: 3}}>CRÉATEUR OFFICIEL</div>
        </div>
      </div>
      <div style={{position: "relative", zIndex: 2, textAlign: "center"}}>
        <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: "clamp(16px,3.5vw,32px)", color: v.text, letterSpacing: 2}}>{pseudo || "TON PSEUDO"}</div>
        <div style={{fontSize: "clamp(8px,1.2vw,11px)", color: v.sub, letterSpacing: 2, textTransform: "uppercase"}}>Agence Créateurs & Influence</div>
      </div>
      <div style={{position: "relative", zIndex: 2, textAlign: "right"}}>
        <div style={{fontSize: "clamp(7px,1vw,10px)", color: v.sub, letterSpacing: 1}}>beliveacademy.com</div>
        <div style={{fontSize: "clamp(6px,0.9vw,9px)", color: v.sub, marginTop: 4, letterSpacing: 0.5}}>🔥 Rejoins la communauté</div>
      </div>
    </div>
  );
};

const ProfileFrameTemplate = ({variant,pseudo}) => {
  const variants = {
    dark: {bg: "#0a0a0a", ring: R, badge: "#0a0a0a", badgeText: R},
    red: {bg: R, ring: "white", badge: "white", badgeText: R},
    gold: {bg: "#1a1200", ring: "#ffd700", badge: "#ffd700", badgeText: "#1a1200"},
  };
  const v = variants[variant] || variants.dark;
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
      <div style={{position: "relative", width: 140, height: 140}}>
        <div style={{position: "absolute", inset: 0, borderRadius: "50%", background: `linear-gradient(135deg,${v.ring},${v.ring}88)`, padding: 4}}>
          <div style={{width: "100%", height: "100%", borderRadius: "50%", background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", inset: 6, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `2px dashed rgba(255,255,255,0.15)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4}}>
              <div style={{fontSize: 28, opacity: 0.3}}>📷</div>
              <div style={{fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.3}}>Ta photo ici</div>
            </div>
          </div>
        </div>
        <div style={{position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: v.badge, border: `2px solid ${v.bg}`, borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap"}}>
          <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 9, color: v.badgeText, letterSpacing: 2}}>BELIVE</div>
        </div>
        <div style={{position: "absolute", top: 2, right: 2, width: 24, height: 24, background: v.ring, borderRadius: "50%", border: `2px solid ${v.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11}}>✓</div>
      </div>
      {pseudo && <div style={{fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 14, color: "white", letterSpacing: 1, textAlign: "center"}}>@{pseudo}</div>}
    </div>
  );
};

// ── APPLICATION PRINCIPALE ─────────────────────────────────────────
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

  // Générer un code de parrainage unique
  function generateReferralCode() {
    if (!user?.name || !user?.email) return '';
    
    const namePart = user.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const emailPart = user.email.slice(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `BELIVE-${namePart}${randomPart}-${emailPart}`;
  }

  const monCodeParrain=user?.referral_code || generateReferralCode();

  // Sauvegarder le code de parrainage
  useEffect(() => {
    if (user?.email && !user.referral_code) {
      const code = generateReferralCode();
      db.updateUser(user.email, { referral_code: code }).catch(e=>console.log("Erreur code parrainage:", e));
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

  // Gérer les retours de paiement Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('payment') === 'success') {
      handlePaymentSuccess(user?.email).then(() => {
        alert('✅ Paiement réussi ! Bienvenue chez Belive Academy Premium 🎉');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Recharger les données utilisateur
        const sv = JSON.parse(localStorage.getItem("ba6_users") || "{}");
        if (sv[user?.email]) {
          const updatedUser = { ...user, ...sv[user?.email] };
          localStorage.setItem("ba6_session", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      });
    } else if (urlParams.get('payment') === 'cancelled') {
      alert('❌ Paiement annulé');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fonctions d'authentification
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
      return;
    }
    setAuthErr("Email ou mot de passe incorrect.");
  }

  async function doReg(){
    const{name,email,pass,phone,twitch,youtube,tiktok,instagram,code}=reg;
    if(!name||!email||!pass||!phone){alert("Nom, email, mot de passe et téléphone obligatoires.");return;}
    if(!regAge){alert("⚠️ Tu dois confirmer avoir 18 ans ou plus.");return;}
    if(!regCGU){alert("⚠️ Tu dois accepter les CGU et la politique de confidentialité.");return;}
    
    let plan="free";
    let trialDaysFromCode=14;
    let referredBy = null;
    let discountApplied = false;
    
    // Vérifier les codes de parrainage
    if(code){
      const referralSuccess = await applyReferralCode(code, email, name);
      if(referralSuccess){
        const usersData=JSON.parse(localStorage.getItem("ba6_users")||"{}");
        const referrer = Object.values(usersData).find(u => u.referral_code === code.toUpperCase());
        if(referrer){
          referredBy = referrer.email;
          discountApplied = true;
          trialDaysFromCode = 30;
        }
      } else {
        return; // Le message d'erreur est déjà affiché par applyReferralCode
      }
    }
    
    // Génère un code parrain unique
    const refCode=generateReferralCode();
    const nu={name,role:"createur",password:pass,av:name.charAt(0).toUpperCase(),plan,phone,twitch,youtube,tiktok,instagram,trialStart:new Date().toISOString(),referral_code:refCode,referred_by: referredBy, discount_applied: discountApplied};
    const usersStorage=JSON.parse(localStorage.getItem("ba6_users")||"{}");
    usersStorage[email]=nu;
    localStorage.setItem("ba6_users",JSON.stringify(usersStorage));
    
    // Sauvegarde dans Supabase
    try{
      await db.createUser({email,name,role:"createur",password:pass,plan,phone,twitch,youtube,tiktok,instagram,av:name.charAt(0).toUpperCase(),trial_start:new Date().toISOString(),referral_code:refCode,referred_by: referredBy});
    }catch(e){console.log("User save to Supabase failed");}
    
    // Connecter l'utilisateur
    setUser({email,role:"createur",name,phone,twitch,youtube,tiktok,instagram,plan,av:name.charAt(0).toUpperCase(),referral_code:refCode});
    localStorage.setItem("ba6_session",JSON.stringify({email,role:"createur",name,phone,twitch,youtube,tiktok,instagram,plan,av:name.charAt(0).toUpperCase(),referral_code:refCode}));
    
    // Réinitialiser le formulaire
    setReg({name:"",email:"",pass:"",phone:"",twitch:"",youtube:"",tiktok:"",instagram:"",code:"",referralCode:""});
    setRegAge(false);
    setRegCGU(false);
    setIsReg(false);
    
    alert(`✅ Bienvenue ${name} sur Belive Academy !\n\n${discountApplied ? "Tu as bénéficié de l'offre de parrainage !" : "Ton compte est créé avec succès !"}`);
  }

  const role=user?.role;
  const isPro=user?.plan==="pro"||user?.plan==="unlimited"||role==="admin";
  const trialStart=user?.trialStart?new Date(user.trialStart):null;
  const trialDays=14;
  const trialDaysLeft=trialStart?Math.max(0,trialDays-Math.floor((Date.now()-trialStart.getTime())/(1000*60*60*24))):0;
  const isInTrial=trialDaysLeft>0;
  const hasAccess=isPro||isInTrial;

  // Interface principale
  if(!user){
    return (
      <div style={{minHeight:"100vh",background:D,color:"white",fontFamily:"Manrope",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <style>{css}</style>
        <div style={{width:"100%",maxWidth:400}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:36,letterSpacing:2,marginBottom:8}}>
              BELIVE <span style={{color:R}}>ACADEMY</span>
            </div>
            <div style={{fontSize:14,color:M}}>L'agence qui accélère ta carrière de créateur</div>
          </div>

          <Card style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:18,marginBottom:20,textAlign:"center"}}>
              {isReg ? "Créer mon compte" : "Me connecter"}
            </div>

            {isReg ? (
              <>
                <Field label="Nom complet" value={reg.name} onChange={e=>setReg({...reg,name:e.target.value})} placeholder="Prénom Nom"/>
                <Field label="Email" type="email" value={reg.email} onChange={e=>setReg({...reg,email:e.target.value})} placeholder="email@exemple.com"/>
                <Field label="Mot de passe" type="password" value={reg.pass} onChange={e=>setReg({...reg,pass:e.target.value})} placeholder="••••••••"/>
                <Field label="Téléphone" type="tel" value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} placeholder="06 12 34 56 78"/>
                <Field label="Code de parrainage (optionnel)" value={reg.code} onChange={e=>setReg({...reg,code:e.target.value.toUpperCase()})} placeholder="BELIVE-XXXXX"/>
                
                <div style={{marginBottom:16}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
                    <input type="checkbox" checked={regAge} onChange={e=>setRegAge(e.target.checked)} style={{accentColor:R}}/>
                    J'ai 18 ans ou plus
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginTop:8}}>
                    <input type="checkbox" checked={regCGU} onChange={e=>setRegCGU(e.target.checked)} style={{accentColor:R}}/>
                    J'accepte les CGU et la politique de confidentialité
                  </label>
                </div>

                <Btn full onClick={doReg}>Créer mon compte</Btn>
              </>
            ) : (
              <>
                <Field label="Email" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="email@exemple.com"/>
                <Field label="Mot de passe" type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••••••"/>
                {authErr && <div style={{color:R,fontSize:12,marginBottom:12}}>{authErr}</div>}
                <Btn full onClick={doLogin}>Me connecter</Btn>
              </>
            )}

            <div style={{textAlign:"center",marginTop:16}}>
              <button 
                onClick={() => {
                  setIsReg(!isReg);
                  setAuthErr("");
                }}
                style={{background:"none",border:"none",color:M,cursor:"pointer",fontSize:13}}
              >
                {isReg ? "Déjà un compte ? Me connecter" : "Pas encore de compte ? Créer mon compte"}
              </button>
            </div>
          </Card>

          <div style={{textAlign:"center",fontSize:11,color:M}}>
            <div style={{marginBottom:8}}>
              <strong>Offres d'abonnement :</strong>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:8}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:700,color:"white"}}>Créateur Belive</div>
                <div style={{color:R}}>9,99€/mois</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:700,color:"white"}}>Premium</div>
                <div style={{color:"white"}}>14,99€/mois</div>
              </div>
            </div>
            <div>🔒 Paiement sécurisé via Stripe • Résiliable à tout moment</div>
          </div>
        </div>
      </div>
    );
  }

  // Tableau de bord principal
  return (
    <div style={{minHeight:"100vh",background:D,color:"white",fontFamily:"Manrope"}}>
      <style>{css}</style>
      
      {/* Header */}
      <div style={{background:C2,border:`1px solid ${B}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontFamily:"'Bebas Neue',Impact,sans-serif",fontSize:24,letterSpacing:2}}>
            BELIVE <span style={{color:R}}>ACADEMY</span>
          </div>
          {hasAccess && <Pill color="green">✅ Pro</Pill>}
          {isInTrial && <Pill color="yellow">⏳ {trialDaysLeft}j restants</Pill>}
        </div>
        
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:12,color:M}}>{user.email}</div>
            {user.referral_code && (
              <div style={{fontSize:11,color:M}}>
                Parrain : {user.referral_code}
              </div>
            )}
          </div>
          <Av name={user.name} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{display:"flex",background:C,borderBottom:`1px solid ${B}`}}>
        {["dashboard","parrainage","stats","communaute"].map(nav => (
          <button
            key={nav}
            onClick={() => setPage(nav)}
            style={{
              flex:1,
              padding:"16px",
              background:page===nav?"rgba(212,16,63,0.1)":"transparent",
              border:"none",
              borderBottom:page===nav?`2px solid ${R}`:"none",
              color:page===nav?R:"white",
              fontWeight:600,
              cursor:"pointer",
              textTransform:"uppercase",
              fontSize:12,
              letterSpacing:1
            }}
          >
            {nav==="dashboard"&&"🏠 Tableau de bord"}
            {nav==="parrainage"&&"🎁 Parrainage"}
            {nav==="stats"&&"📊 Statistiques"}
            {nav==="communaute"&&"👥 Communauté"}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div style={{padding:20,maxWidth:1200,margin:"0 auto"}}>
        {page === "dashboard" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:28,marginBottom:8}}>Bienvenue, {user.name} !</h1>
              <p style={{color:M}}>
                {hasAccess ? "Accès Premium activé" : isInTrial ? `Période d'essai : ${trialDaysLeft} jours restants` : "Passe à Premium pour débloquer toutes les fonctionnalités"}
              </p>
            </div>

            {/* Stats principales */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,marginBottom:24}}>
              <SC label="Abonnement" value={hasAccess ? "Premium" : "Gratuit"} icon="💳" color={hasAccess ? "green" : "gray"}/>
              <SC label="Code parrainage" value={user.referral_code || "Génération..."} icon="🎁" color="purple"/>
              <SC label="Filleuls parrainés" value={parrainages.length} icon="👥" color="blue"/>
            </div>

            {/* Section abonnement */}
            {!hasAccess && (
              <Card style={{marginBottom:24}}>
                <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>🚀 Passe à Premium</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <div style={{background:"rgba(212,16,63,0.1)",border:`1px solid rgba(212,16,63,0.3)`,borderRadius:12,padding:16}}>
                    <div style={{fontWeight:700,marginBottom:8}}>🎯 Créateur Belive</div>
                    <div style={{fontSize:24,color:R,fontWeight:800,marginBottom:8}}>9,99€<span style={{fontSize:14,color:M}}>/mois</span></div>
                    <div style={{fontSize:12,color:M,marginBottom:12}}>Accès complet • Coach IA • Partenariats</div>
                    <Btn full onClick={() => createSubscription("agency", user.email, user)}>
                      S'abonner à 9,99€
                    </Btn>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${B}`,borderRadius:12,padding:16}}>
                    <div style={{fontWeight:700,marginBottom:8}}>⚡ Premium</div>
                    <div style={{fontSize:24,color:"white",fontWeight:800,marginBottom:8}}>14,99€<span style={{fontSize:14,color:M}}>/mois</span></div>
                    <div style={{fontSize:12,color:M,marginBottom:12}}>Accès complet • Coach IA • Partenariats</div>
                    <Btn full v="ghost" onClick={() => createSubscription("premium", user.email, user)}>
                      S'abonner à 14,99€
                    </Btn>
                  </div>
                </div>
                {user.next_month_discount && (
                  <div style={{background:"rgba(251,191,36,0.1)",border:`1px solid rgba(251,191,36,0.3)`,borderRadius:8,padding:12,fontSize:12,color:YE}}>
                    🎉 Réduction de parrainage de -50% disponible sur votre prochain mois !
                  </div>
                )}
              </Card>
            )}

            {/* Section parrainage */}
            <Card>
              <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>🎁 Parrainage</div>
              <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{fontWeight:700,marginBottom:8}}>Votre code de parrainage</div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{flex:1,background:C,border:`1px solid ${B}`,borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,letterSpacing:2,color:R,textAlign:"center"}}>
                    {user.referral_code || "Génération..."}
                  </div>
                  <Btn 
                    onClick={() => {
                      navigator.clipboard.writeText(user.referral_code || "");
                      alert("✅ Code copié !");
                    }}
                    icon="📋"
                  >
                    Copier
                  </Btn>
                </div>
                <div style={{fontSize:12,color:M,marginTop:8,lineHeight:1.5}}>
                  Partagez ce code avec d'autres créateurs. Quand ils s'inscrivent et s'abonnent, vous gagnez -50% sur votre prochain mois d'abonnement !
                </div>
              </div>
              
              <div style={{fontSize:13,lineHeight:1.6,color:M}}>
                <strong>Comment ça marche :</strong><br/>
                1. Partagez votre code unique<br/>
                2. Un créateur s'inscrit avec votre code<br/>
                3. Il bénéficie de 30 jours d'essai au lieu de 14<br/>
                4. Quand il s'abonne, vous gagnez -50% sur votre prochain mois<br/>
                <strong>Maximum : 1 réduction par mois</strong>
              </div>
            </Card>
          </div>
        )}

        {page === "parrainage" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:28,marginBottom:8}}>🎁 Parrainage</h1>
              <p style={{color:M}}>Gérez vos parrainages et suivez vos récompenses</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,marginBottom:24}}>
              <SC label="Code personnel" value={user.referral_code || "---"} icon="🎁" color="purple"/>
              <SC label="Filleuls actifs" value={parrainages.length} icon="👥" color="blue"/>
              <SC label="Réductions gagnées" value={user.referral_discounts || 0} icon="💰" color="green"/>
            </div>

            <Card>
              <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>Mon code de parrainage</div>
              <div style={{background:"rgba(212,16,63,0.05)",border:`1px solid rgba(212,16,63,0.2)`,borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{flex:1,background:C,border:`1px solid ${B}`,borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,letterSpacing:2,color:R,textAlign:"center"}}>
                    {user.referral_code || "Génération..."}
                  </div>
                  <Btn 
                    onClick={() => {
                      navigator.clipboard.writeText(user.referral_code || "");
                      setParrainCopied(true);
                      setTimeout(() => setParrainCopied(false), 2000);
                    }}
                    icon={parrainCopied ? "✅" : "📋"}
                  >
                    {parrainCopied ? "Copié !" : "Copier"}
                  </Btn>
                </div>
              </div>

              <div style={{fontSize:13,lineHeight:1.6,color:M}}>
                <strong>Avantages pour vos filleuls :</strong><br/>
                • 30 jours d'essai au lieu de 14<br/>
                • Accès complet à toutes les fonctionnalités<br/>
                • Support prioritaire<br/><br/>
                <strong>Vos récompenses :</strong><br/>
                • -50% sur votre prochain mois d'abonnement<br/>
                • Valable pour chaque filleul qui s'abonne<br/>
                • Maximum 1 réduction par mois
              </div>
            </Card>
          </div>
        )}

        {page === "stats" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:28,marginBottom:8}}>📊 Mes statistiques</h1>
              <p style={{color:M}}>Suivez votre progression et vos performances</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16}}>
              <SC label="Abonnement" value={hasAccess ? "Premium" : "Gratuit"} icon="💳" color={hasAccess ? "green" : "gray"}/>
              <SC label="Statut" value={isInTrial ? "Essai" : user.plan} icon="📈" color={isInTrial ? "yellow" : "blue"}/>
              <SC label="Filleuls" value={parrainages.length} icon="👥" color="purple"/>
            </div>
          </div>
        )}

        {page === "communaute" && (
          <div>
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:28,marginBottom:8}}>👥 Communauté</h1>
              <p style={{color:M}}>Connectez-vous avec d'autres créateurs</p>
            </div>

            <Card>
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <div style={{fontSize:48,marginBottom:16}}>👥</div>
                <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>Espace Communauté</div>
                <div style={{color:M,marginBottom:20}}>
                  Rejoignez les autres créateurs Belive Academy pour échanger, collaborer et grandir ensemble
                </div>
                {hasAccess ? (
                  <div>
                    <Btn full>Accéder à la communauté</Btn>
                  </div>
                ) : (
                  <div>
                    <Btn full onClick={() => setPage("dashboard")}>Passer à Premium</Btn>
                    <div style={{fontSize:12,color:M,marginTop:8}}>
                      L'accès à la communauté est réservé aux membres Premium
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer avec gestion abonnement */}
      {hasAccess && (
        <div style={{position:"fixed",bottom:20,right:20,zIndex:100}}>
          <Card style={{padding:16,background:C2}}>
            <div style={{fontWeight:700,marginBottom:8}}>💳 Abonnement Premium</div>
            <div style={{fontSize:12,color:M,marginBottom:12}}>
              {user.subscription_cancelled ? "Votre abonnement sera annulé à la fin de la période" : "Abonnement actif"}
            </div>
            {!user.subscription_cancelled && (
              <Btn sz="sm" v="danger" onClick={() => cancelSubscription(user.email)}>
                Annuler l'abonnement
              </Btn>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
