// Radyo Vizyon 360 — Patisipasyon oditè yo
// Koneksyon Firebase san deranje Radiocast AutoDJ

import {
  initializeApp,
  getApps
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';

import {
  getDatabase,
  ref,
  onValue
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD4FFwUrUA4ENmVCGdjYw-_jHPmjaTUfWk',
  authDomain: 'radyo-vizyon-360.firebaseapp.com',
  databaseURL: 'https://radyo-vizyon-360-default-rtdb.firebaseio.com',
  projectId: 'radyo-vizyon-360',
  storageBucket: 'radyo-vizyon-360.firebasestorage.app',
  messagingSenderId: '778239278735',
  appId: '1:778239278735:web:857600d5a5dc226bd57afa',
  measurementId: 'G-LW2L189Z8H'
};

const existingApp = getApps().find(
  app => app.options.projectId === firebaseConfig.projectId
);

const app = existingApp || initializeApp(
  firebaseConfig,
  'radyo-vizyon-360-calls'
);

const db = getDatabase(app);

let panel = document.querySelector('[data-rv360-call-status]');

if (!panel) {
  panel = document.createElement('section');

  panel.setAttribute('data-rv360-call-status', '');

  panel.style.cssText = `
    background: white;
    border: 2px solid #6435a5;
    border-radius: 14px;
    padding: 24px;
    margin: 20px auto;
    max-width: 1000px;
    text-align: center;
    font-family: Arial, sans-serif;
  `;

  panel.innerHTML = `
    <h2 style="color:#6435a5">
      🎙️ Patisipe nan emisyon LIVE
    </h2>

    <p id="rv360-call-state"
       role="status"
       aria-live="polite"
       style="font-weight:bold">
      ⏳ N ap verifye liy yo…
    </p>

    <p id="rv360-call-desc">
      Patisipasyon WhatsApp disponib sèlman
      lè animatè a ouvri apèl yo.
    </p>

    <a
      id="rv360-whatsapp-link"
      href="https://wa.me/16194197319?text=Bonjou%20Radyo%20Vizyon%20360%2C%20mwen%20ta%20renmen%20patisipe%20nan%20emisyon%20an%20direk."
      target="_blank"
      rel="noopener noreferrer"
      hidden
      style="
        background:#157e50;
        color:white;
        padding:12px 20px;
        border-radius:9px;
        text-decoration:none;
        font-weight:bold;
      "
    >
      📱 Kontakte animatè a sou WhatsApp
    </a>
  `;

  const radioPlayer = document.getElementById('radioPlayer');

  if (radioPlayer) {
    radioPlayer.insertAdjacentElement('afterend', panel);
  } else {
    (document.querySelector('main') || document.body)
      .appendChild(panel);
  }
}

const stateEl = panel.querySelector('#rv360-call-state');
const descEl = panel.querySelector('#rv360-call-desc');
const linkEl = panel.querySelector('#rv360-whatsapp-link');

let callsOpen = null;
let loadFailed = false;

function render() {
  const french = document.documentElement.lang
    .toLowerCase()
    .startsWith('fr');

  if (loadFailed) {
    stateEl.textContent = french
      ? '⚠️ Statut indisponible'
      : '⚠️ Estati a pa disponib';

    descEl.textContent = french
      ? 'Réessayez plus tard.'
      : 'Eseye ankò pita.';

  } else if (callsOpen === true) {
    stateEl.textContent = french
      ? '🟢 APPELS OUVERTS'
      : '🟢 APÈL OUVRI';

    descEl.textContent = french
      ? 'Contactez l’animateur sur WhatsApp pour demander à participer.'
      : 'Kontakte animatè a sou WhatsApp pou mande patisipasyon.';

    linkEl.textContent = french
      ? '📱 Contacter sur WhatsApp'
      : '📱 Kontakte animatè a sou WhatsApp';

  } else if (callsOpen === false) {
    stateEl.textContent = french
      ? '🔴 APPELS FERMÉS'
      : '🔴 APÈL FÈMEN';

    descEl.textContent = french
      ? 'Les demandes de participation sont fermées pour le moment.'
      : 'Nou poko ap resevwa oditè nan emisyon an.';

  } else {
    stateEl.textContent = french
      ? '⏳ Vérification des lignes…'
      : '⏳ N ap verifye liy yo…';
  }

  linkEl.hidden = callsOpen !== true || loadFailed;

  linkEl.style.display = linkEl.hidden
    ? 'none'
    : 'inline-block';
}

onValue(
  ref(db, 'radioControls/callsOpen'),

  snapshot => {
    const value = snapshot.val();

    callsOpen = typeof value === 'boolean'
      ? value
      : null;

    loadFailed = false;
    render();
  },

  error => {
    console.error('Firebase:', error);
    callsOpen = null;
    loadFailed = true;
    render();
  }
);

new MutationObserver(render).observe(
  document.documentElement,
  {
    attributes: true,
    attributeFilter: ['lang']
  }
);

render();
