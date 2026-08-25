let LISTINGS = [];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch ' + url);
  return res.json();
}

async function loadListings() {
  const manifest = await fetchJSON('/_data/listings/manifest.json');
  const listings = await Promise.all(
    manifest.map(async (fname) => {
      const data = await fetchJSON('/_data/listings/' + fname);
      return { id: fname.replace(/\.json$/, ''), ...data };
    })
  );
  LISTINGS = listings.filter(l => l.published !== false);
  renderGallery('all');
  initScrollReveal();
}

function getSpec(l, label) {
  const found = (l.specs || []).find(s => s.label === label);
  return found ? found.value : '';
}

async function loadAboutContent() {
  let about;
  try {
    about = await fetchJSON('/_data/pages/about.json');
  } catch (e) {
    return;
  }

  const setPhoto = (id, src) => {
    const img = document.getElementById(id);
    const wrap = img.closest('.about-photo');
    if (src) { img.src = src; img.alt = about.founder_name || ''; wrap.style.display = ''; }
    else { wrap.style.display = 'none'; }
  };
  setPhoto('about-photo-1', about.photo_1);
  setPhoto('about-photo-2', about.photo_2);

  document.getElementById('about-bio').innerHTML = (about.bio || []).map(p => `<p>${p}</p>`).join('');
  document.getElementById('about-name').textContent = about.founder_name || '';
  document.getElementById('about-title').textContent = about.founder_title || '';

  matchAboutPhotoHeight();
  window.addEventListener('resize', matchAboutPhotoHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(matchAboutPhotoHeight);
  }
}

function matchAboutPhotoHeight(){
  const copy = document.getElementById('about-copy');
  const photos = document.getElementById('about-photos');
  if (!copy || !photos) return;
  photos.style.setProperty('--about-photos-h', copy.offsetHeight + 'px');
}

function renderGallery(filter){
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';
  const items = filter === 'all' ? LISTINGS : LISTINGS.filter(l => l.status === filter);
  items.forEach(l => {
    const card = document.createElement('div');
    card.className = 'find-card reveal in';
    card.onclick = () => showDetail(l.id);
    card.innerHTML = `
      <div class="find-photo">
        <span class="find-status ${l.status}">${l.status === 'forsale' ? 'For Sale' : 'Sold'}</span>
        <img src="${l.photos[0]}" alt="${l.title}">
      </div>
      <div class="find-body">
        <h4>${l.title}</h4>
        <div class="find-price">${l.price}</div>
        <div class="find-specs">
          <span><b>Mileage:</b> ${getSpec(l, 'Mileage')}</span>
          <span><b>Drivetrain:</b> ${getSpec(l, 'Drivetrain')}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterListings(type, btn){
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(type);
}

function showDetail(id){
  const l = LISTINGS.find(x => x.id === id);
  if(!l) return;
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('detail-view').style.display = 'block';
  window.scrollTo(0,0);

  document.getElementById('detail-status').textContent = l.status === 'forsale' ? 'For Sale' : 'Sold';
  document.getElementById('detail-status').className = 'detail-status-badge ' + l.status;
  document.getElementById('detail-title').textContent = l.title;
  document.getElementById('detail-price').textContent = l.price;
  document.getElementById('detail-main-photo').src = l.photos[0];
  document.getElementById('detail-main-photo').alt = l.title;

  const thumbs = document.getElementById('detail-thumbs');
  thumbs.innerHTML = '';
  l.photos.forEach(p => {
    const img = document.createElement('img');
    img.src = p; img.alt = l.title;
    img.onclick = () => { document.getElementById('detail-main-photo').src = p; };
    thumbs.appendChild(img);
  });

  const specs = document.getElementById('detail-specs');
  specs.innerHTML = '';
  (l.specs || []).forEach(({label, value}) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${label}</span><span>${value}</span>`;
    specs.appendChild(li);
  });

  const story = document.getElementById('detail-story');
  story.innerHTML = (l.story || []).map(p => `<p>${p}</p>`).join('');
}

function showHome(hash){
  document.getElementById('detail-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
  window.scrollTo(0,0);
  if(hash){ setTimeout(()=>goHash(hash), 30); }
}

function goHash(hash){
  const el = document.querySelector(hash);
  if(el) el.scrollIntoView({behavior:'smooth'});
}

async function handleContactSubmit(event, form){
  event.preventDefault();
  const submitRow = form.querySelector('.submit-row');
  const button = submitRow.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending...';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      submitRow.innerHTML = '<p style="font-family:Work Sans, sans-serif; font-size:13px; color:#565C45;">Got it — we will follow up with a valuation within one business day.</p>';
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    button.disabled = false;
    button.textContent = 'Submit For Valuation';
    submitRow.insertAdjacentHTML('beforeend', '<p style="font-family:Work Sans, sans-serif; font-size:13px; color:#b23b3b; margin-top:10px;">Something went wrong — please email us directly at Jack@wilder4x4.com.</p>');
  }
  return false;
}

function initScrollReveal(){
  const reveals = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  reveals.forEach(el=>io.observe(el));
}

loadListings();
loadAboutContent();
initScrollReveal();
