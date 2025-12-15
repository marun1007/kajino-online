const uid = localStorage.getItem("currentPlayer");
if(!uid) location.href="index.html";

const db = firebase.database();
const reels = [r1,r2,r3];
const coinText = coin;
const message = document.getElementById("message");
const spinBtn = document.getElementById("spin");
const workBtn = document.getElementById("work");
const slotFrame = document.getElementById("slot-frame");
const playerNameDiv = document.getElementById("playerName");

const cost = 10;
const symbols = ["🍒","🍋","🍉","⭐"];
const payout = {"🍒":10,"🍋":30,"🍉":50,"⭐":120};

let coinVal = 0;
let kakuhen = false;
let username = "";

// Firebaseからデータ取得
function loadPlayer(){
  db.ref("players/"+uid).once("value").then(snap=>{
    const data = snap.val();
    if(!data){ location.href="index.html"; return; }
    coinVal = data.coin;
    kakuhen = data.kakuhen;
    username = data.username;
    playerNameDiv.textContent = "プレイヤー: "+username;
    updateKakuhenEffect();
    coinText.textContent = "COIN: "+coinVal;
  });
}
loadPlayer();

// 確変管理
function isKakuhen(){ return kakuhen; }
function setKakuhen(v){
  kakuhen=v;
  updateKakuhenEffect();
  db.ref("players/"+uid+"/kakuhen").set(kakuhen);
}
function updateKakuhenEffect(){ if(kakuhen) slotFrame.classList.add("kakuhen"); else slotFrame.classList.remove("kakuhen"); }

// 絵柄抽選
function lotterySymbol(){
  const r = Math.random();
  if(r<0.50) return "🍒";
  if(r<0.80) return "🍋";
  if(r<0.95) return "🍉";
  return "⭐";
}

// 当たり率
function getHitRate(){ return isKakuhen()?0.9:0.3; }

// 保存コイン
function saveCoin(){ db.ref("players/"+uid+"/coin").set(coinVal); }

// スピン
spinBtn.onclick=()=>{
  if(coinVal<cost){ message.textContent="コイン不足"; return; }
  coinVal-=cost;
  coinText.textContent="COIN: "+coinVal;
  message.textContent="";
  reels.forEach(r=>{ r.classList.add("spin"); r.textContent="❔"; });
  const hit=Math.random()<getHitRate();
  const sym=lotterySymbol();
  const result=hit?[sym,sym,sym]:symbols.slice().sort(()=>Math.random()-0.5).slice(0,3);
  [600,1000,hit?1600:1200].forEach((t,i)=>setTimeout(()=>{
    reels[i].classList.remove("spin"); reels[i].textContent=result[i];
  },t));
  setTimeout(()=>{
    if(hit){
      coinVal+=payout[sym];
      if(sym==="⭐"&&!isKakuhen()){ setKakuhen(true); message.textContent="🌈 BIG！確変突入！"; }
      else message.textContent="当たり！ +"+payout[sym];
    }else{
      message.textContent="ハズレ";
      if(isKakuhen()){ setKakuhen(false); message.textContent+="（確変終了）"; }
    }
    coinText.textContent="COIN: "+coinVal;
    saveCoin();
  },1700);
};

// 仕事
let canWork=true; const WORK_COOLDOWN=1000;
workBtn.onclick=()=>{
  if(!canWork) return;
  canWork=false; workBtn.disabled=true; workBtn.textContent="仕事中...";
  coinVal+=1; coinText.textContent="COIN: "+coinVal; message.textContent="仕事で +1 コイン"; saveCoin();
  setTimeout(()=>{ canWork=true; workBtn.disabled=false; workBtn.textContent="仕事する（+1コイン）"; },WORK_COOLDOWN);
};
