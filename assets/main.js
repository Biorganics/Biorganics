const WA_NUMBER = "524432029447";
function waLink(text){ return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }

/* Fill any element with class js-wa using its data-msg attribute */
document.querySelectorAll('.js-wa').forEach(el=>{
  const msg = el.getAttribute('data-msg') || "Hola, vengo de la página de Biorganics Hidalgo y quiero hacer una consulta.";
  el.href = waLink(msg);
});

/* ---------- Catalog rendering (menudeo / mayoreo) ---------- */
function renderCatalog(items, gridId, filterId, isMayoreo){
  const grid = document.getElementById(gridId);
  const filterBar = document.getElementById(filterId);
  if(!grid || !filterBar) return;
  const cats = ["Todos", ...new Set(items.map(i=>i.cat))];
  let active = "Todos";
  function draw(){
    grid.innerHTML = "";
    const filtered = active === "Todos" ? items : items.filter(i=>i.cat===active);
    if(filtered.length === 0){ grid.innerHTML = '<div class="empty-state">Sin productos en esta categoría por ahora.</div>'; return; }
    filtered.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'card';
      const msg = isMayoreo
        ? `Hola, quiero cotizar por mayoreo: ${p.nombre} (código ${p.codigo}).`
        : `Hola, quiero consultar precio y disponibilidad de: ${p.nombre} (código ${p.codigo}).`;
      card.innerHTML = `
        <span class="tag">${p.cat}</span>
        <h4>${p.nombre}</h4>
        <div class="price-row">
          <span class="price-label">Consultar precio</span>
          <a class="btn-mini" href="${waLink(msg)}" target="_blank" rel="noopener">Consultar →</a>
        </div>`;
      grid.appendChild(card);
    });
  }
  filterBar.innerHTML = "";
  cats.forEach(c=>{
    const pill = document.createElement('button');
    pill.className = 'pill' + (c===active ? ' active' : '');
    pill.textContent = c;
    pill.onclick = ()=>{ active = c; [...filterBar.children].forEach(el=>el.classList.remove('active')); pill.classList.add('active'); draw(); };
    filterBar.appendChild(pill);
  });
  draw();
}

function renderKits(kits){
  const grid = document.getElementById('gridKits');
  if(!grid) return;
  grid.innerHTML = "";
  kits.forEach(k=>{
    const el = document.createElement('div');
    el.className = 'kit-card';
    const msg = `Hola, quiero pedir el ${k.nombre} ($${k.precio_kit} MXN).`;
    el.innerHTML = `
      <div class="kit-top"><span class="kit-badge">Precio fijo</span><span class="kit-badge">Ahorras $${(k.precio_normal - k.precio_kit).toFixed(0)}</span></div>
      <div class="kit-body">
        <h3>${k.nombre}</h3>
        <p class="desc">${k.desc}</p>
        <ul class="kit-includes">${k.incluye.map(i=>`<li>${i}</li>`).join('')}</ul>
        <div class="kit-price-row"><span class="kit-price">$${k.precio_kit.toFixed(0)}</span><span class="kit-price-old">$${k.precio_normal.toFixed(0)}</span></div>
        <a class="btn-primary" style="width:100%; justify-content:center;" href="${waLink(msg)}" target="_blank" rel="noopener">Pedir este kit →</a>
      </div>`;
    grid.appendChild(el);
  });
}

if(typeof CATALOG_DATA !== 'undefined'){
  renderCatalog(CATALOG_DATA.menudeo, 'gridMenudeo', 'filtersMenudeo', false);
  renderCatalog(CATALOG_DATA.mayoreo, 'gridMayoreo', 'filtersMayoreo', true);
  renderKits(CATALOG_DATA.kits);
}

/* ---------- Nav toggle (mobile) ---------- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if(navToggle && mainNav){
  navToggle.addEventListener('click', ()=> mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=> mainNav.classList.remove('open')));
}

/* ---------- Scroll reveal + count-up ---------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el){
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  if(prefersReducedMotion){ el.textContent = target + suffix; return; }
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      entry.target.querySelectorAll('[data-count]').forEach(animateCount);
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.2, rootMargin:'0px 0px -60px 0px'});

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el=>revealObserver.observe(el));

/* ---------- Subtle hero video parallax (Apeel-style, kept light) ---------- */
const heroMedia = document.querySelector('.hero-media');
if(heroMedia && !prefersReducedMotion){
  let ticking = false;
  window.addEventListener('scroll', ()=>{
    if(!ticking){
      requestAnimationFrame(()=>{
        const y = window.scrollY;
        if(y < window.innerHeight){
          heroMedia.style.transform = `translateY(${y * 0.25}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, {passive:true});
}
