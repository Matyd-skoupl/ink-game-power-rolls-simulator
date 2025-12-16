<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ink Game – Power Spin</title>

<style>
body {
  margin: 0;
  background: #111;
  color: white;
  font-family: Arial, sans-serif;
  text-align: center;
}
.container { padding: 20px; }
.info {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 10px auto;
  font-weight: bold;
}
.wheel {
  position: relative;
  margin: 30px auto;
  max-width: 700px;
}
.row-wrapper {
  overflow: hidden;
  border: 2px solid white;
  border-radius: 10px;
  background: #000;
}
.row { display: flex; }
.arrow {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  color: yellow;
}
.box {
  width: 140px;
  height: 90px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

/* RARITY BARVY */
.Common { background:#2ecc71; }
.Rare { background:#f1c40f; color:black; }
.Epic { background:#3498db; }
.Legendary { background:#9b59b6; }

/* MYTHIC – DUHOVÝ */
.Mythic {
  background: linear-gradient(270deg,
    #ff0000,#ff9900,#ffee00,
    #00ff00,#00ffff,#0000ff,#cc00ff
  );
  background-size: 400% 400%;
  animation: mythicGlow 4s ease infinite;
  color: white;
  text-shadow: 0 0 6px black;
}
@keyframes mythicGlow {
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}

/* SECRET */
.Secret {
  background: linear-gradient(45deg,#888,#b084ff);
  color: black;
}

button {
  padding: 12px 30px;
  font-size: 18px;
  margin-top: 15px;
  border-radius: 8px;
  cursor: pointer;
}
.result {
  margin-top: 15px;
  font-size: 20px;
  font-weight: bold;
}
.unlocked {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
.unlocked-box {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
}
</style>
</head>

<body>
<div class="container">
  <h1>Ink Game – Power Spin</h1>

  <div class="info">
    <div id="pitty">PITTY: 0 / 75</div>
    <div id="collected">Collected: 0 / 16 powers</div>
  </div>

  <div class="wheel">
    <div class="arrow">▼</div>
    <div class="row-wrapper">
      <div id="row" class="row"></div>
    </div>
  </div>

  <button id="spinBtn">SPIN</button>
  <div id="result" class="result"></div>

  <h2>Unlocked Powers</h2>
  <div id="unlocked" class="unlocked"></div>
</div>

<script>
const rarities = [
  { name:"Common", chance:72, powers:["Medic","Player 120"] },
  { name:"Rare", chance:17, powers:["Player 100","Trickster","Parkour Artist","Bulldozer"] },
  { name:"Epic", chance:8, powers:["Super Strength","Coin Flip","Black Flash"] },
  { name:"Legendary", chance:2.9, powers:["Phantom Step","Necromancer","Weapon Smuggler","Hercules"] },
  { name:"Mythic", chance:0.1, powers:[
    "Quicksilver","Vampire","Lightning God",
    "Doctor","Time Stop","Teleporting Gambit","Reality Jumper"
  ]}
];

const PITTY_MAX = 75;
const BOX_COUNT = 80;
const CENTER_INDEX = Math.floor(BOX_COUNT/2);

const row = document.getElementById("row");
const spinBtn = document.getElementById("spinBtn");
const pittyText = document.getElementById("pitty");
const collectedText = document.getElementById("collected");
const unlockedDiv = document.getElementById("unlocked");
const result = document.getElementById("result");

const ALL_POWERS = rarities.flatMap(r=>r.powers);
const TOTAL_POWERS = ALL_POWERS.length;
const MYTHIC_POWERS = rarities.find(r=>r.name==="Mythic").powers;

let pitty = 0;
let unlocked = new Set();
let spinning = false;
let finalOffset = 0;
let pending = null;
let secretGiven = false;

function updateCollected(){
  collectedText.textContent =
    `Collected: ${unlocked.size} / ${TOTAL_POWERS} powers`;
}
function updatePitty(){
  pittyText.textContent = `PITTY: ${pitty} / ${PITTY_MAX}`;
}
function getRandomRarity(){
  let r=Math.random()*100,sum=0;
  for(const rar of rarities){
    sum+=rar.chance;
    if(r<=sum) return rar;
  }
  return rarities[0];
}
function getMissingMythics(){
  return MYTHIC_POWERS.filter(p=>!unlocked.has(p));
}
function generateRow(targetPower,rarity){
  row.innerHTML="";
  for(let i=0;i<BOX_COUNT;i++){
    let r=rarity,p=targetPower;
    if(i!==CENTER_INDEX){
      r=getRandomRarity();
      p=r.powers[Math.floor(Math.random()*r.powers.length)];
    }
    const box=document.createElement("div");
    box.className="box "+r.name;
    box.textContent=p;
    row.appendChild(box);
  }
  row.style.transition="none";
  row.style.transform="translateX(0)";
}

spinBtn.onclick=()=>{
  if(spinning){
    row.style.transition="none";
    row.style.transform=`translateX(-${finalOffset}px)`;
    finishSpin();
    return;
  }

  spinning=true;
  spinBtn.textContent="SKIP";
  result.textContent="";

  let rarity,power;

  if(unlocked.size===TOTAL_POWERS && !secretGiven){
    rarity={name:"Secret"};
    power="Collector";
    secretGiven=true;
  } else if(pitty>=PITTY_MAX){
    rarity=rarities.find(r=>r.name==="Mythic");
    pitty=0;
    const miss=getMissingMythics();
    power=miss.length?miss[Math.floor(Math.random()*miss.length)]
                     :rarity.powers[Math.floor(Math.random()*rarity.powers.length)];
  } else {
    rarity=getRandomRarity();
    pitty++;
    if(rarity.name==="Mythic") pitty=0;
    power=rarity.powers[Math.floor(Math.random()*rarity.powers.length)];
  }

  updatePitty();
  if(!unlocked.has(power)){
    collectedText.textContent=
      `Collected: ${unlocked.size+1} / ${TOTAL_POWERS} powers`;
  }

  pending={rarity,power};
  generateRow(power,rarity.name==="Secret"?rarities[0]:rarity);

  const boxWidth=row.children[CENTER_INDEX].offsetWidth+20;
  finalOffset=CENTER_INDEX*boxWidth-row.parentElement.offsetWidth/2+boxWidth/2;

  requestAnimationFrame(()=>{
    row.style.transition="transform 3s cubic-bezier(.1,.8,.2,1)";
    row.style.transform=`translateX(-${finalOffset}px)`;
  });

  setTimeout(()=>spinning&&finishSpin(),3000);
};

function finishSpin(){
  if(!spinning) return;
  const {rarity,power}=pending;
  result.textContent=`UNLOCKED: ${power} (${rarity.name})`;

  if(!unlocked.has(power)){
    unlocked.add(power);
    const d=document.createElement("div");
    d.className="unlocked-box "+rarity.name;
    d.textContent=power;
    unlockedDiv.appendChild(d);
  }
  updateCollected();
  spinBtn.textContent="SPIN";
  spinning=false;
}

updateCollected();
updatePitty();
</script>
</body>
</html>
