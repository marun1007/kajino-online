const db = firebase.database();
const searchBtn = document.getElementById("searchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const playersList = document.getElementById("playersList");

function renderPlayer(uid,data){
  const div=document.createElement("div");
  div.style.border="1px solid #000"; div.style.margin="5px"; div.style.padding="5px";
  div.innerHTML=`<b>${data.username}</b> | COIN: <input value="${data.coin}" size="4"> | 設定: <input value="${data.setting}" size="2"> | 確変: <input type="checkbox" ${data.kakuhen?"checked":""}> <button>保存</button>`;
  const coinInput = div.querySelectorAll("input")[0];
  const settingInput = div.querySelectorAll("input")[1];
  const kakuhenInput = div.querySelector("input[type=checkbox]");
  div.querySelector("button").onclick=()=>{
    db.ref("players/"+uid).update({
      coin: parseInt(coinInput.value),
      setting: parseInt(settingInput.value),
      kakuhen: kakuhenInput.checked
    });
    alert("更新完了");
  };
  playersList.appendChild(div);
}

function loadAllPlayers(){
  playersList.innerHTML="";
  db.ref("players").once("value").then(snap=>{
    snap.forEach(child=>{
      renderPlayer(child.key,child.val());
    });
  });
}

searchBtn.onclick=()=>{
  const name = document.getElementById("search").value.toLowerCase();
  playersList.innerHTML="";
  db.ref("players").once("value").then(snap=>{
    snap.forEach(child=>{
      if(child.val().username.toLowerCase().includes(name)){
        renderPlayer(child.key,child.val());
      }
    });
  });
};

refreshBtn.onclick=loadAllPlayers;
loadAllPlayers();
