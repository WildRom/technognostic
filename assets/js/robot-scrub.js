(() => {
  const section = document.querySelector('#robot-showcase');
  const video = section?.querySelector('[data-robot-video]');
  const progressBar = section?.querySelector('[data-robot-progress]');
  const instruction = section?.querySelector('[data-robot-instruction]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!section || !video || !progressBar || !instruction) return;

  const usefulTimeline = [
    { progress: 0, time: 0.42 },
    { progress: 0.60, time: 4.62 },
    { progress: 0.64, time: 5.16 },
    { progress: 1, time: 7.62 }
  ];

  let targetProgress = 0;
  let displayedProgress = 0;
  let frameRequest = 0;
  let ready = false;
  let desiredTime = usefulTimeline[0].time;
  let lastSeek = 0;

  const clamp = value => Math.max(0, Math.min(1, value));

  const timeForProgress = progress => {
    for (let index = 1; index < usefulTimeline.length; index += 1) {
      const current = usefulTimeline[index];
      const previous = usefulTimeline[index - 1];
      if (progress <= current.progress) {
        const segment = (progress - previous.progress) / (current.progress - previous.progress);
        return previous.time + ((current.time - previous.time) * segment);
      }
    }
    return usefulTimeline.at(-1).time;
  };

  const readScroll = () => {
    if (reducedMotion.matches) return;
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - window.innerHeight;
    targetProgress = distance > 0 ? clamp(-rect.top / distance) : 0;
    if (!frameRequest) frameRequest = requestAnimationFrame(render);
  };

  const render = () => {
    displayedProgress += (targetProgress - displayedProgress) * 0.16;
    progressBar.style.transform = `scaleX(${displayedProgress.toFixed(4)})`;
    instruction.classList.toggle('is-faded', displayedProgress > 0.035);

    desiredTime = timeForProgress(displayedProgress);
    const now = performance.now();
    if (ready && !video.seeking && now - lastSeek >= 32 && Math.abs(video.currentTime - desiredTime) > 0.018) {
      video.currentTime = desiredTime;
      lastSeek = now;
    }

    if (Math.abs(targetProgress - displayedProgress) > 0.0005) {
      frameRequest = requestAnimationFrame(render);
    } else {
      frameRequest = 0;
    }
  };

  const applyMotionPreference = () => {
    section.classList.toggle('is-reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) {
      targetProgress = 0;
      displayedProgress = 0;
      if (ready) video.currentTime = 0.7;
    } else {
      readScroll();
    }
  };

  const initialiseVideo = () => {
    if (ready) return;
    ready = true;
    video.pause();
    video.currentTime = reducedMotion.matches ? 0.7 : timeForProgress(displayedProgress);
    readScroll();
  };

  video.pause();
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) initialiseVideo();
  else video.addEventListener('loadedmetadata', initialiseVideo, { once: true });

  video.addEventListener('seeked', () => {
    if (!reducedMotion.matches && Math.abs(video.currentTime - desiredTime) > 0.018 && !frameRequest) {
      frameRequest = requestAnimationFrame(render);
    }
  });

  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  reducedMotion.addEventListener('change', applyMotionPreference);
  window.addEventListener('pageshow', () => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) initialiseVideo();
    readScroll();
  });
  applyMotionPreference();
})();
