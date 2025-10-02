import { getSelectedEmails } from './table-selection.js';

export function initToolbar() {
  const setupButton = (id, url, requireSelection = true) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const emails = getSelectedEmails();

      if (requireSelection && emails.length === 0) {
        showMessage('warning', 'Select at least one user.');
        return;
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: emails.length ? JSON.stringify({ emails }) : undefined
        });

        const message = await res.text();
        showMessage(res.ok ? 'success' : 'danger', message);

        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        console.error(err);
        showMessage('danger', 'Error performing action.');
      }
    });
  };

  const showMessage = (type, text) => {
    const container = document.getElementById('statusMessages');
    if (!container) return;

    container.innerHTML = '';

    container.insertAdjacentHTML(
      'afterbegin',
      `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${text}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`
    );
  };

  setupButton('blockBtn', '/users/block');
  setupButton('unblockBtn', '/users/unblock');
  setupButton('deleteBtn', '/users/delete');
  setupButton('deleteUnverifiedBtn', '/users/delete-unverified', false);
}
