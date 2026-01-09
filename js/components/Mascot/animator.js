export function playAnimation({
  img,
  path,
  fps = 6,
  loop = true,
  totalFrames = 10,
  onEnd,
}) {
  let frame = 1;
  let timer = null;

  function start() {
    timer = setInterval(() => {
      img.src = `${path}/${frame}.png`;
      frame++;

      if (frame > totalFrames) {
        if (loop) {
          frame = 1;
        } else {
          stop();
          onEnd && onEnd();
        }
      }
    }, 1000 / fps);
  }

  function stop() {
    clearInterval(timer);
  }

  start();
  return { stop };
}
