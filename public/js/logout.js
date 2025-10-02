export function initLogout() {
  const logOutBtn = document.getElementById('logOutBtn');
  if (!logOutBtn) return;

  logOutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  });
}
