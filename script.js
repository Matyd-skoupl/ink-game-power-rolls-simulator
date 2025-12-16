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
const CENTER_INDEX = Math.floor(BOX_COUNT / 2);

const row = document.getElementById("row");
const spinBtn = document.getElementById("spinBtn");
const pittyText = document.getElementById("pitty");
const collectedText = document.getElementById("collected");
const unlockedDiv = document.getElementById("unlocked");
const result = document.getElementById("result");

const ALL_POWERS = rarities.flatMap(r => r.powers);
const TOTAL_POWERS = ALL_POWERS.length;
const MYTHIC_POWERS = rarities.find(r => r.name === "Mythic").powers;

let pitty = 0;
let unlocked = new Set();
let spinning = false;
let finalOffset = 0;
let pending = null;
let secretGiven = false;

function updateCollected() {
  collectedText.textContent =
    `Collected: ${unlocked.size} / ${TOTAL_POWERS} powers`;
}
function updatePitty() {
  pittyText.textContent = `PITTY: ${pitty} / ${PITTY_MAX}`;
}

function getRandomRarity() {
  let r = Math.random() * 100, sum = 0;
  for (const rar of rarities) {
    sum += rar.chance;
    if (r <= sum) return rar;
  }
  return rarities[0];
}
function getMissingMythics() {
  return MYTHIC_POWERS.filter(p => !unlocked.has(p));
}

function generateRow(targetPower, rarity) {
  row.innerHTML = "";
  for (let i = 0; i < BOX_COUNT; i++) {
    let r = rarity, p = targetPower;
    if (i !== CENTER_INDEX) {
      r = getRandomRarity();
      p = r.powers[Math.floor(Math.random() * r.powers.length)];
    }
    const box = document.createElement("div");
    box.className = "box " + r.name;
    box.textContent = p;
    row.appendChild(box);
  }
  row.style.transition = "none";
  row.style.transform = "translateX(0)";
}

spinBtn.onclick = () => {
  if (spinning) {
    row.style.transition = "none";
    row.style.transform = `translateX(-${finalOffset}px)`;
    finishSpin();
    return;
  }

  spinning = true;
  spinBtn.textContent = "SKIP";
  result.textContent = "";

  let rarity, power;

  if (unlocked.size === TOTAL_POWERS && !secretGiven) {
    rarity = { name:"Secret" };
    power = "Collector";
    secretGiven = true;
  } else if (pitty >= PITTY_MAX) {
    rarity = rarities.find(r => r.name === "Mythic");
    pitty = 0;
    const missing = getMissingMythics();
    power = missing.length
      ? missing[Math.floor(Math.random() * missing.length)]
      : rarity.powers[Math.floor(Math.random() * rarity.powers.length)];
  } else {
    rarity = getRandomRarity();
    pitty++;
    if (rarity.name === "Mythic") pitty = 0;
    power = rarity.powers[Math.floor(Math.random() * rarity.powers.length)];
  }

  updatePitty();

  if (!unlocked.has(power)) {
    collectedText.textContent =
      `Collected: ${unlocked.size + 1} / ${TOTAL_POWERS} powers`;
  }

  pending = { rarity, power };
  generateRow(power, rarity.name === "Secret" ? rarities[0] : rarity);

  const boxWidth = row.children[CENTER_INDEX].offsetWidth + 20;
  finalOffset =
    CENTER_INDEX * boxWidth -
    row.parentElement.offsetWidth / 2 +
    boxWidth / 2;

  requestAnimationFrame(() => {
    row.style.transition = "transform 3s cubic-bezier(.1,.8,.2,1)";
    row.style.transform = `translateX(-${finalOffset}px)`;
  });

  setTimeout(() => spinning && finishSpin(), 3000);
};

function finishSpin() {
  if (!spinning) return;

  const { rarity, power } = pending;
  result.textContent = `UNLOCKED: ${power} (${rarity.name})`;

  if (!unlocked.has(power)) {
    unlocked.add(power);
    const d = document.createElement("div");
    d.className = `unlocked-box ${rarity.name}`;
    d.textContent = power;
    unlockedDiv.appendChild(d);
  }

  updateCollected();
  spinBtn.textContent = "SPIN";
  spinning = false;
}

updateCollected();
updatePitty();
