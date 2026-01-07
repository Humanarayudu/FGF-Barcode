function generateCard() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  const dpi = 96;
  const maxWidthPx = (6 - 1) * dpi; // 6in - 0.25in*2 margins

  // auto scale barcode width for long data
  const calcWidth = (textLength) => Math.min(2, maxWidthPx / (textLength * 11));

  const userWidth = calcWidth(username.length);
  const passWidth = calcWidth(password.length);

  // Web preview
  JsBarcode("#barcode-user", username, {
    format: "CODE128",
    width: userWidth,
    height: 80,
    displayValue: true,
    fontSize: Math.min(14, 400 / username.length),
  });
  JsBarcode("#barcode-pass", password, {
    format: "CODE128",
    width: passWidth,
    height: 80,
    displayValue: false,
  });

  document.getElementById("front").style.display = "flex";
  document.getElementById("back").style.display = "flex";

  // Print pages
  JsBarcode("#print-barcode-user", username, {
    format: "CODE128",
    width: userWidth,
    height: 80,
    displayValue: true,
    fontSize: Math.min(14, 400 / username.length),
  });
  JsBarcode("#print-barcode-pass", password, {
    format: "CODE128",
    width: passWidth,
    height: 80,
    displayValue: false,
  });
}

function flipCard() {
  document.querySelector(".card-container").classList.toggle("flipped");
}

function printCard() {
  window.print(); // only #print-pages will show
}

function downloadJPEG() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Generate a card first!");
    return;
  }

  // Get the card elements (front and back)
  const frontCard = document.getElementById("front");
  const backCard = document.getElementById("back");

  if (!frontCard || !backCard) {
    alert("Generate a card first!");
    return;
  }

  // Download front card
  downloadCardAsJPEG(frontCard, "barcode-username.jpg");

  // Small delay before downloading second file
  setTimeout(() => {
    downloadCardAsJPEG(backCard, "barcode-password.jpg");
  }, 200);
}

function downloadCardAsJPEG(cardElement, filename) {
  // Create a canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size to match card (3.37in x 2.125in at 300 DPI for print quality)
  const dpi = 300;
  canvas.width = 3.37 * dpi;
  canvas.height = 2.125 * dpi;

  // Fill white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get the SVG element and text from the card
  const svg = cardElement.querySelector("svg");
  const heading = cardElement.querySelector("h3");

  if (!svg) return;

  // Draw heading text
  if (heading) {
    ctx.fillStyle = "#000000";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(heading.textContent, canvas.width / 2, 120);
  }

  // Convert SVG to image
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    // Calculate position to center the barcode
    const x = (canvas.width - img.width) / 2;
    const y = (canvas.height - img.height) / 2 + 60;

    // Draw the barcode
    ctx.drawImage(img, x, y);

    // Convert canvas to JPEG and download
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
    ); // 0.95 is quality (0-1)

    URL.revokeObjectURL(url);
  };

  img.src = url;
}
