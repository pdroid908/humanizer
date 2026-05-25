let loaded = false;

export function loadAds() {
  if (loaded) return;
  loaded = true;

  

  const vignette = document.createElement("script");
  vignette.src = "https://n6wxm.com/vignette.min.js";
  vignette.dataset.zone = "11056877";
  vignette.async = true;
  document.body.appendChild(vignette);

  const tag = document.createElement("script");
  tag.src = "https://nap5k.com/tag.min.js";
  tag.dataset.zone = "11056881";
  tag.async = true;
  document.body.appendChild(tag);
}