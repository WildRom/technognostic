(() => {
  const button = document.querySelector('.site-menu-button');
  const navigation = document.querySelector('#site-navigation');
  const narrowScreen = window.matchMedia('(max-width: 760px)');

  if (!button || !navigation) return;

  const closeMenu = () => {
    button.setAttribute('aria-expanded', 'false');
    if (narrowScreen.matches) navigation.hidden = true;
  };

  const syncMenu = () => {
    if (narrowScreen.matches) closeMenu();
    else {
      navigation.hidden = false;
      button.setAttribute('aria-expanded', 'false');
    }
  };

  button.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(willOpen));
    navigation.hidden = !willOpen;
  });

  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  narrowScreen.addEventListener('change', syncMenu);
  syncMenu();
})();

(() => {
  const robotSection = document.querySelector('#robot-showcase');
  if (!robotSection) return;

  if (!('IntersectionObserver' in window)) {
    robotSection.classList.add('ambient-ready');
    return;
  }

  const ambientObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    robotSection.classList.add('ambient-ready');
    ambientObserver.disconnect();
  }, { rootMargin: '75% 0px' });

  ambientObserver.observe(robotSection);
})();
