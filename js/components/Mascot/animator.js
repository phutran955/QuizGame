export function playAnimation({ img, path, fps = 6, loop = true }) {
  let frame = 1;
  let timer = null;

  function start() {
    timer = setInterval(() => {
      img.src = `${path}/${frame}.png`;
      frame++;

      // giả sử tối đa 10 frame
      if (frame > 10) {
        if (loop) frame = 1;
        else stop();
      }
    }, 1000 / fps);
  }

  function stop() {
    clearInterval(timer);
  }

  start();

  return { stop };
}
