export function initTableSelection() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.row-checkbox');

  if (selectAll && checkboxes.length > 0) {
    selectAll.addEventListener('change', () => {
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });
  }
}

export function getSelectedEmails() {
  return Array.from(document.querySelectorAll('.row-checkbox:checked'))
    .map(cb => cb.closest('tr').dataset.email);
}
