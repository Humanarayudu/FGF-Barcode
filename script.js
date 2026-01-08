function generateCard() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  const containerPx = 3.37 * 96;
  const DPI = 96;

  // Card = 3.37in
  // Padding = 0.3in left + 0.3in right
  const usableWidthPx = (3.37 - 0.6) * DPI; // ≈ 266px

  function calcCode128Width(charCount) {
    const modules = charCount * 11 + 35;
    const width = usableWidthPx / modules;
    return Math.max(1, Math.min(2, width));
  }
  const userWidth = calcCode128Width(username.length);
  const passWidth = calcCode128Width(password.length);

  // Web preview - black barcodes for green background
  JsBarcode("#barcode-user", username, {
    format: "CODE128",
    width: userWidth,
    height: 90,
    displayValue: true,
    fontSize: Math.min(14, 400 / username.length),
    lineColor: "#000000",
    background: "transparent",
  });

  JsBarcode("#barcode-pass", password, {
    format: "CODE128",
    width: passWidth,
    height: 80,
    displayValue: true,
    fontSize: Math.min(14, 400 / password.length),
    lineColor: "#000000",
    background: "transparent",
  });

  document.getElementById("front").style.display = "flex";
  document.getElementById("back").style.display = "flex";

  // Print pages - black barcodes
  JsBarcode("#print-barcode-user", username, {
    format: "CODE128",
    width: userWidth,
    height: 80,
    displayValue: true,
    fontSize: Math.min(14, 400 / username.length),
    lineColor: "#000000",
    background: "transparent",
  });

  JsBarcode("#print-barcode-pass", password, {
    format: "CODE128",
    width: passWidth,
    height: 80,
      displayValue: true,
    fontSize: Math.min(14, 400 / password.length),
    lineColor: "#000000",
    background: "transparent",
  });
}

function flipCard() {
  document.querySelector(".card-container").classList.toggle("flipped");
}

function printCard() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    alert("Generate a card first!");
    return;
  }
  window.print();
}

function downloadJPEG() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Generate a card first!");
    return;
  }

  const frontCard = document.getElementById("front");
  const backCard = document.getElementById("back");

  if (!frontCard || !backCard) {
    alert("Generate a card first!");
    return;
  }

  downloadCardAsJPEG(frontCard, "FGF-barcode-username.jpg");

  setTimeout(() => {
    downloadCardAsJPEG(backCard, "FGF-barcode-password.jpg");
  }, 200);
}

function downloadCardAsJPEG(cardElement, filename) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Match exact card dimensions: 3.37in x 2.125in at 300 DPI
  const dpi = 300;
  const cardWidthInches = 3.37;
  const cardHeightInches = 2.125;

  canvas.width = cardWidthInches * dpi;
  canvas.height = cardHeightInches * dpi;

  // FGF Green gradient background - exactly like web display
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#8BC53F");
  gradient.addColorStop(1, "#76b32f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rounded corners border (matching web display)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 6;
  const cornerRadius = 48; // 16px * 3 (scaled for 300dpi)

  // Draw rounded rectangle border
  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0);
  ctx.lineTo(canvas.width - cornerRadius, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
  ctx.lineTo(canvas.width, canvas.height - cornerRadius);
  ctx.quadraticCurveTo(
    canvas.width,
    canvas.height,
    canvas.width - cornerRadius,
    canvas.height
  );
  ctx.lineTo(cornerRadius, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
  ctx.lineTo(0, cornerRadius);
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
  ctx.closePath();
  ctx.stroke();

  const svg = cardElement.querySelector("svg");
  const heading = cardElement.querySelector("h3");
  const logoElement = cardElement.querySelector(".card-logo-small");

  if (!svg) return;

  // Draw FGF logo in top right (matching position from web)
  if (logoElement) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Montserrat, Arial";
    ctx.textAlign = "right";
    ctx.globalAlpha = 0.9;
    ctx.fillText("FGF", canvas.width - 60, 90);
    ctx.globalAlpha = 1.0;
  }

  // Draw heading text (matching web display)
  if (heading) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Montserrat, Arial";
    ctx.textAlign = "center";
    ctx.fillText(heading.textContent, canvas.width / 2, 180);
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    // Scale up the barcode to match web display size
    // Web display uses 96 DPI, we're rendering at 300 DPI
    const svgRect = svg.getBoundingClientRect();
    const scale = dpi / 96;

    const drawWidth = svgRect.width * scale;
    const drawHeight = svgRect.height * scale;

    // Center the barcode (matching web display position)

    // Draw scaled barcode
    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2 + 100;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    canvas.toBlob(
      function (blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      },
      "image/jpeg",
      0.95
    );

    URL.revokeObjectURL(url);
  };

  img.src = url;
}



