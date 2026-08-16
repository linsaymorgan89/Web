async function submitForm(form) {
  const status = form.querySelector('#form-status');
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
    const data = await res.json();
    if (data.ok) {
      form.reset();
      status.textContent = data.message || 'Submitted. Thank you.';
      status.style.color = '#1a7f37';
      if (data.redirect) setTimeout(() => { location.href = data.redirect; }, 1500);
    } else {
      status.textContent = data.error || 'Something went wrong. Email morgan@theeroticmorgan.com.';
      status.style.color = '#b00020';
    }
  } catch {
    status.textContent = 'Network error. Text 945-397-2900 or email morgan@theeroticmorgan.com.';
    status.style.color = '#b00020';
  }
}
document.addEventListener('DOMContentLoaded', () => {
  for (const id of ['register-form', 'login-form', 'booking-form']) {
    const form = document.getElementById(id);
    if (!form) continue;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitForm(form); });
  }
});
