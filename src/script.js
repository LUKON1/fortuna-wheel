// dom elements
import confetti from "@hiseb/confetti";
const variants = document.querySelector('.variants-box textarea');
const spinBtn = document.querySelector('.spin-btn');
const wheelTitle = document.querySelector('.wheel-title');
const clearBtn = document.querySelector('.clear-btn');

// vars
const colors = ["#4f46e5", "#db2777", "#059669", "#d97706", "#2563eb", "#7c3aed"];
const maxLen = 22;
let variantList = [];
let currentRotation = 0; 
let isSpinning = false;

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
    
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
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
    clearBtn.disabled = true;
    variants.disabled = true;
    isSpinning = true;

    /* Abort fetch if server doesn't respond within 8 seconds */
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/random/wheel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantsCount: variantList.length, currentRotation }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    currentRotation = data.targetRotation;

    const wheel = document.querySelector('.wheel');
    const spinTime = 4000;

    wheel.style.transition = `transform ${spinTime}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // isSpinning is set globally to true at the start of spinHandler
    
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
        clearBtn.disabled = false;
        variants.disabled = false;

        /* Normalize rotation to prevent CSS transform value accumulation over many spins */
        currentRotation = data.targetRotation % 360;
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${currentRotation}deg)`;

        /* Fire confetti burst from the center of the wheel canvas */
        const wheelRect = wheel.getBoundingClientRect();
        const originX = wheelRect.left + wheelRect.width / 2;
        const originY = wheelRect.top + wheelRect.height / 2;

        confetti({ position: { x: originX, y: originY }, count: 150, velocity: 220 });

        /* Push the confetti canvas below the wheel layer */
        const confettiCanvas = document.body.querySelector('canvas[style*="pointer-events: none"]');
        if (confettiCanvas) confettiCanvas.style.zIndex = '1';
    }, spinTime);

  } catch (error) {
    console.error(error);
    wheelTitle.textContent = error.name === 'AbortError' ? "Request timed out." : "Error! Check console.";
    spinBtn.disabled = false;
    clearBtn.disabled = false;
    variants.disabled = false;
    isSpinning = false;
  }
}


// event listeners
spinBtn.addEventListener('click', spinHandler);
variants.addEventListener('input', variantListHandler);
clearBtn.addEventListener('click',() => {
  if (isSpinning) return;
  variants.value = "";
  variantList = [];
  drawWheel([], colors);
});

window.onload = () => variants.value = ""
drawWheel([], colors);