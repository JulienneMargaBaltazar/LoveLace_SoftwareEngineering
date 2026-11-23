cat << 'EOF' > public/js/layout.js
function applyLayoutAndPermissions() {
  const user = window.CURRENT_USER || { name: 'Guest', role: 'user', rights: [] };

  // 1. Fill in header user name & role badge if those IDs exist on the page
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role.toUpperCase();

  // 2. Hide elements restricted to specific roles (e.g., data-role="admin,superadmin")
  document.querySelectorAll('[data-role]').forEach((el) => {
    const allowedRoles = el.getAttribute('data-role').split(',').map((r) => r.trim());
    if (!allowedRoles.includes(user.role)) {
      el.remove();
    }
  });

  // 3. Hide action buttons/columns if user lacks the per-action right (e.g., data-right="customer.delete")
  document.querySelectorAll('[data-right]').forEach((el) => {
    const requiredRight = el.getAttribute('data-right').trim();
    if (!window.hasRight(requiredRight)) {
      el.remove();
    }
  });

  // 4. Hide sidebar links or dashboard tiles if user has NO rights in that module (e.g., data-module="sales.")
  document.querySelectorAll('[data-module]').forEach((el) => {
    const modulePrefix = el.getAttribute('data-module').trim();
    if (!window.hasModuleAccess(modulePrefix)) {
      el.remove();
    }
  });

  // 5. Highlight active sidebar link matching the current URL path
  const currentPath = window.location.pathname;
  document.querySelectorAll('nav a, .sidebar a').forEach((link) => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // 6. Wire up any logout button automatically
  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.logoutUser();
    });
  });
}

document.addEventListener('DOMContentLoaded', applyLayoutAndPermissions);
document.addEventListener('userLoaded', applyLayoutAndPermissions);
EOF