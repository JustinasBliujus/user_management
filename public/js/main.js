import { initTableSelection } from './table-selection.js';
import { initToolbar } from './toolbar-actions.js';
import { initLogout } from './logout.js';

document.addEventListener('DOMContentLoaded', () => {
  initTableSelection();
  initToolbar();
  initLogout();
});
