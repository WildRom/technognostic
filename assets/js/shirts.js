window.technognosticShirts = [
  { image: 'assets/images/shirts-cutout/shirt-001-white.png', title: 'Birdwatcher', subtitle: 'Observe More' },
  { image: 'assets/images/shirts-cutout/shirt-002-black.png', title: 'Birdwatcher Black', subtitle: 'See Differently' },
  { image: 'assets/images/shirts-cutout/shirt-003-white.png', title: 'Birdwatcher White', subtitle: 'Clarity In Form' },
  { image: 'assets/images/shirts-cutout/shirt-004-white.png', title: 'Dance on the Beach', subtitle: 'Summer Collection' },
  { image: 'assets/images/shirts-cutout/shirt-005-black.png', title: 'Frequency Harmony', subtitle: 'Tune Your Reality' },
  { image: 'assets/images/shirts-cutout/shirt-006-white.png', title: 'Frequency Harmony White', subtitle: 'Signal and Stillness' },
  { image: 'assets/images/shirts-cutout/shirt-007-black.png', title: 'Halloween', subtitle: 'You Will Be With Us' },
  { image: 'assets/images/shirts-cutout/shirt-008-black.png', title: 'Spiral Observer', subtitle: 'See the Patterns' },
  { image: 'assets/images/shirts-cutout/shirt-009-black.png', title: 'The Emperor', subtitle: 'Structure. Authority. Control.' },
  { image: 'assets/images/shirts-cutout/shirt-010-black.png', title: 'The Empress', subtitle: 'Creation. Nurture. Abundance.' },
  { image: 'assets/images/shirts-cutout/shirt-011-grey.png', title: 'Difficult Choice', subtitle: 'Find Your Path' },
  { image: 'assets/images/shirts-cutout/shirt-012-black.png', title: 'Difficult Choice Black', subtitle: 'Multiple Realities' },
  { image: 'assets/images/shirts-cutout/shirt-013-black.png', title: 'Dance on the Beach Black', subtitle: 'Summer After Dark' },
  { image: 'assets/images/shirts-cutout/shirt-014-black.png', title: 'Color Totem', subtitle: 'Balance Within' },
  { image: 'assets/images/shirts-cutout/shirt-015-white.png', title: 'Sacred Geometry', subtitle: 'Symbol in Motion' }
];

const shirtGallery = document.querySelector('[data-shirt-gallery]');

if (shirtGallery) {
  shirtGallery.innerHTML = window.technognosticShirts.map(({ image, title, subtitle }) => `
    <article class="shirt-gallery__item" role="listitem">
      <div class="shirt-gallery__image">
        <img src="${image}" width="1122" height="1402" loading="lazy" decoding="async" alt="${title} — ${subtitle} T-shirt">
      </div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </article>
  `).join('');
}
