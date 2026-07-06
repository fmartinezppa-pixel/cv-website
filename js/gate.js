(function(){
  // SHA-256 hash of the access code (code is never stored in plain text here)
  var HASH = 'd668096f6a737d0ea903c730297563da7552cc98f3a5c990ec36ad570cb12791';
  var KEY = 'fm_cv_unlocked_v1';

  async function sha256Hex(str){
    var enc = new TextEncoder().encode(str);
    var buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2, '0'); }).join('');
  }

  var form = document.getElementById('gateForm');
  var input = document.getElementById('gateInput');
  var error = document.getElementById('gateError');

  // If already unlocked on this device, skip straight to the site
  try {
    if (localStorage.getItem(KEY) === '1') {
      window.location.replace('home.html');
      return;
    }
  } catch (e) {}

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var val = input.value.trim();
    if (!val) return;
    var hash = await sha256Hex(val);
    if (hash === HASH) {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      window.location.href = 'home.html';
    } else {
      error.classList.add('show');
      input.value = '';
      input.focus();
    }
  });
})();
