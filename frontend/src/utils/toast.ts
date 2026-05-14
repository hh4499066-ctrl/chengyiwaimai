export function notify(message: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  const phoneShell = document.querySelector<HTMLElement>('.app-phone-shell');
  if (phoneShell) {
    toast.classList.add('app-toast--phone');
    phoneShell.appendChild(toast);
  } else {
    document.body.appendChild(toast);
  }

  window.requestAnimationFrame(() => toast.classList.add('is-visible'));
  window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  window.setTimeout(() => toast.remove(), 2500);
}
