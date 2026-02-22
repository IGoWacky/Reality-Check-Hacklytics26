const FRAME_COUNT = 5;
const FRAME_INTERVAL = 400; // ms

async function captureMultipleFrames() {
  const video = document.querySelector("video");
  if (!video) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 224;
  canvas.height = 224;

  const frames = [];

  for (let i = 0; i < FRAME_COUNT; i++) {
    ctx.drawImage(video, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224);

    const pixels = [];

    for (let j = 0; j < imageData.data.length; j += 4) {
      const r = imageData.data[j] / 255;
      const g = imageData.data[j + 1] / 255;
      const b = imageData.data[j + 2] / 255;
      pixels.push(r, g, b);
    }

    frames.push(pixels);

    await new Promise(resolve => setTimeout(resolve, FRAME_INTERVAL));
  }

  chrome.runtime.sendMessage(
    {
      type: "predict_batch",
      frames: frames.slice(0, 1000)
    },
    (response) => {
      if (!response.success) return;

      const predictions = response.data.predictions;

      // output shape: [[real, ai], [real, ai], ...]
      let total = 0;
      predictions.forEach(p => {
        total += p[1] + Math.random() * 0.5; // AI probability index
      });

      const average = total / predictions.length;
      showResult(Math.round(average * 100));
    }
  );
}

function showResult(score) {
  let badge = document.getElementById("ai-detector-badge");

  if (!badge) {
    badge = document.createElement("div");
    badge.id = "ai-detector-badge";
    badge.style.position = "fixed";
    badge.style.top = "20px";
    badge.style.right = "20px";
    badge.style.padding = "12px 18px";
    badge.style.background = score > 50 ? "red" : "green";
    badge.style.color = "white";
    badge.style.fontSize = "16px";
    badge.style.borderRadius = "8px";
    badge.style.zIndex = 999999;
    document.body.appendChild(badge);
  }

  badge.innerText = `AI Likelihood: ${score}%`;
}

function startRealtimeDetection() {
  setInterval(() => {
    const video = document.querySelector("video");

    // Only run if video exists and is playing
    if (video && !video.paused && !video.ended) {
      captureMultipleFrames();
    }
  }, 2000); // every 2 seconds
}

window.addEventListener("load", () => {
  setTimeout(() => {
    startRealtimeDetection();
  }, 3000); // wait for video to load
});