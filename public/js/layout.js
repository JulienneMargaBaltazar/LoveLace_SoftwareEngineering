function applyLayoutAndPermissions() {
  const user = window.CURRENT_USER;
  if (!user || !user.id) return;

  const roleLabel = user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin' ? 'Admin' : 'User';

  const nameEl = document.getElementById('user-name');
  const profileEl = document.getElementById('userProfileInfo');
  const roleEl = document.getElementById('user-role');
  const badgeEl = document.getElementById('roleBadge');

  if (nameEl) nameEl.textContent = user.name;
  if (profileEl) profileEl.innerText = user.name;
  if (roleEl) roleEl.textContent = roleLabel;
  if (badgeEl) badgeEl.innerText = roleLabel;
  document.querySelectorAll('.role, .user-badge-top').forEach((el) => {
    el.textContent = roleLabel;
  });

  document.querySelectorAll('[data-role]').forEach((el) => {
    const allowed = el.getAttribute('data-role').split(',').map((r) => r.trim());
    if (!allowed.includes(user.role)) el.remove();
  });

  document.querySelectorAll('[data-right]').forEach((el) => {
    if (!window.hasRight(el.getAttribute('data-right').trim())) el.remove();
  });

  document.querySelectorAll('[data-module]').forEach((el) => {
    if (!window.hasModuleAccess(el.getAttribute('data-module').trim())) el.remove();
  });

  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a, .sidebar a').forEach((link) => {
    if (link.getAttribute('href') === currentPath) link.classList.add('active');
  });

  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.logoutUser();
    });
  });
}

document.addEventListener('userLoaded', applyLayoutAndPermissions);
