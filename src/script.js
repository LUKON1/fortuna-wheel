// dom elements
const variants = document.querySelector('.variants-box textarea');
const spinBtn = document.querySelector('.spin-btn');
const wheelTitle = document.querySelector('.wheel-title');

// vars
const colors =["#fec89a","#d0d4df","#ef476f","#06d6a0","#ffd166"];
const maxLen = 22;
let variantList = [];
let currentRotation = 0; 

// functions
function drawWheel(variantList, colors) {
  const wheel = document.querySelector('.wheel');
  const ctx = wheel.getContext('2d');

  const rootStyles = getComputedStyle(document.body);
  const strokeColor = rootStyles.getPropertyValue('--bg-color').trim() || '#111218'; 
  const textColor = rootStyles.getPropertyValue('--wheel-text-color').trim() || '#000000ff';

  ctx.clearRect(0, 0, wheel.width, wheel.height);

  const centerX = wheel.width / 2;
  const centerY = wheel.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  if (variantList.length === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    return;
  }

  const arc = (Math.PI * 2) / variantList.length;

  variantList.forEach((item, index) => {
    const angle = index * arc;
    
    ctx.save();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc);
    ctx.lineTo(centerX, centerY);

    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arc / 2);
    
    ctx.textAlign = "right";
    ctx.fillStyle = textColor;
    
    let fontSize = Math.min(16, Math.max(8, (radius * arc) - 5));
    ctx.font = `bold ${fontSize}px sans-serif`;

    const maxTextWidth = radius - 40; 
    while (ctx.measureText(item).width > maxTextWidth && fontSize > 8) {
      fontSize--;
      ctx.font = `bold ${fontSize}px sans-serif`;
    }

    ctx.fillText(item, radius - 20, 5); 
    
    ctx.restore();
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fillStyle = strokeColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
}

function variantListHandler() {
  variantList = variants.value.split("\n")
  .filter(Boolean)
  .map(item => item.length >= maxLen ? item.substring(0,maxLen - 3) + "..." : item);
  drawWheel(variantList, colors);
}

async function spinHandler(){
  try{
    if (variantList.length <= 1) {
      wheelTitle.textContent = "Please enter at least 2 variants"
      return;
    }
    
    spinBtn.disabled = true;

    const response = await fetch('/api/random/wheel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantsCount: variantList.length })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    currentRotation += data.targetRotation;

    const wheel = document.querySelector('.wheel');
    const spinTime = 4000;

    wheel.style.transition = `transform ${spinTime}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    let isSpinning = true;
    
    function updateTitleRealtime() {
        if (!isSpinning) return;
        
        const style = window.getComputedStyle(wheel);
        if (style.transform !== 'none') {
            const matrix = new DOMMatrixReadOnly(style.transform);
            let angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            const sliceAngle = 360 / variantList.length;
            const normalizedAngle = (360 - angle) % 360;
            const currentIndex = Math.floor(normalizedAngle / sliceAngle);
            
            wheelTitle.textContent = variantList[currentIndex];
        }
        
        requestAnimationFrame(updateTitleRealtime);
    }
    
    requestAnimationFrame(updateTitleRealtime);

    setTimeout(() => {
        isSpinning = false;
        wheelTitle.textContent = `Winner: ${variantList[data.winnerIndex]}!`;
        spinBtn.disabled = false;
    }, spinTime);

  } catch (error) {
    console.log(error);
    wheelTitle.textContent = "Error! Check console.";
    spinBtn.disabled = false;
  }
}


// event listeners
spinBtn.addEventListener('click', spinHandler);
variants.addEventListener('input', variantListHandler);

window.onload = () => variants.value = ""
drawWheel([], colors);