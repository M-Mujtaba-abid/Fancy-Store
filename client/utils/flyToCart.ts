// src/utils/animations.ts

export const flyToCart = (e: React.MouseEvent | MouseEvent) => {
  const cartIcon = document.getElementById("cart-icon-target");
  if (!cartIcon) return;

  const flyer = document.createElement("div");
  flyer.style.width = "50px";
  flyer.style.height = "50px";
  flyer.style.backgroundColor = "#d4af37"; // Red color (Aap isko primary color de sakte hain)
  flyer.style.borderRadius = "50%";
  flyer.style.position = "fixed";
  flyer.style.zIndex = "9999";
  flyer.style.pointerEvents = "none";
  flyer.style.transition = "all 1.2s cubic-bezier(0.25, 1, 0.5, 1)";

  flyer.style.left = `${e.clientX}px`;
  flyer.style.top = `${e.clientY}px`;
  document.body.appendChild(flyer);

  const cartRect = cartIcon.getBoundingClientRect();

  requestAnimationFrame(() => {
    flyer.style.left = `${cartRect.left + cartRect.width / 2 - 25}px`;
    flyer.style.top = `${cartRect.top + cartRect.height / 2 - 25}px`;
    flyer.style.transform = "scale(0.2)";
    flyer.style.opacity = "0.5";
  });

  setTimeout(() => {
    flyer.remove();
  }, 800);
};