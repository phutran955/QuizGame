 export default function HeartBar(maxHearts, currentHearts) {
  const div = document.createElement("div");
  div.className = "heart-bar";

  for (let i = 0; i < maxHearts; i++) {
    const img = document.createElement("img");
    img.className = "heart";

    img.src =
      i < currentHearts
        ? "assets/images/tops/heart.png"
        : "assets/images/tops/heartblank.png";

    div.appendChild(img);
  }

  return div;
}
