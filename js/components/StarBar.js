export default function StarBar(maxStars, currentStars) {
  const div = document.createElement("div");
  div.className = "Star-bar";

  for (let i = 0; i < maxStars; i++) {
    const img = document.createElement("img");
    img.className = "star";

    img.src =
      i < currentStars
        ? "assets/images/tops/Star.png"
        : "assets/images/tops/Starblank.png";

    if (i === currentStars - 1) {
      img.classList.add("star-new");
    }

    div.appendChild(img);
  }

  return div;
}
