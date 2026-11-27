window.RIGHTS_CATALOGUE = {
  customers: ['customer.view', 'customer.add', 'customer.edit', 'customer.delete', 'customer.export', 'customer.restore'],
  products: ['product.view', 'product.add', 'product.edit', 'product.delete', 'product.adjust_stock', 'product.export'],
  hr: ['hr.view', 'hr.add', 'hr.edit', 'hr.delete', 'hr.view_job_history', 'hr.edit_job_history', 'hr.manage_departments', 'hr.export'],
  sales: ['sales.view', 'sales.add', 'sales.edit', 'sales.void', 'sales.view_invoices', 'sales.export'],
  reports: ['reports.view_sales', 'reports.view_inventory', 'reports.view_customers', 'reports.view_hr', 'reports.export_pdf', 'reports.export_csv'],
  admin: ['users.view', 'users.assign_rights', 'users.manage_status', 'audit.view', 'records.restore']
};

window.CURRENT_USER = { id: null, name: '', email: '', roleId: null, role: 'user', rights: [] };

function normalizeRole(rawRole) {
  const val = String(rawRole ?? '').toLowerCase();
  if (val === '1' || val === 'superadmin') return 'superadmin';
  if (val === '2' || val === 'admin') return 'admin';
  return 'user';
}

function formatRoleLabel(role) {
  if (role === 'superadmin') return 'Superadmin';
  if (role === 'admin') return 'Admin';
  return 'User';
}

window.loadCurrentUserSession = async function () {
  const publicPages = [
    '/', '/landingpage', '/landingpage.html',
    '/login', '/login.html',
    '/signup', '/signup.html',
    '/forgotpassword', '/forgotpassword.html',
    '/passwordreset', '/passwordreset.html',
    '/set-password', '/set-password.html',
    '/terms', '/terms.html'
  ];

  try {
    const res = await fetch('/api/dashboard', { credentials: 'include' });
    if (!res.ok) {
      if (!publicPages.includes(window.location.pathname)) {
        window.location.href = '/login.html';
      }
      return null;
    }

    const data = await res.json();
    const session = data.userSessionData || {};
    const first = session.firstName || session.first_name || '';
    const last = session.lastName || session.last_name || '';
    const fullName = `${first} ${last}`.trim() || session.email || 'User';
    const role = normalizeRole(session.roleId ?? session.role_id);
    const roleLabel = formatRoleLabel(role);

    const activeRights = Array.isArray(data.rights)
      ? data.rights.filter((r) => r.is_allowed).map((r) => r.action_key)
      : [];

    window.CURRENT_USER = {
      id: session.userId || session.user_id || session.id,
      name: fullName,
      email: session.email || '',
      roleId: session.roleId ?? session.role_id,
      role,
      rights: role === 'superadmin' ? ['*'] : activeRights
    };

    const nameEl = document.getElementById('user-name');
    const profileEl = document.getElementById('userProfileInfo');
    const roleEl = document.getElementById('user-role');
    const badgeEl = document.getElementById('roleBadge');

    if (nameEl) nameEl.textContent = fullName;
    if (profileEl) profileEl.innerText = fullName;
    if (roleEl) roleEl.textContent = roleLabel;
    if (badgeEl) badgeEl.innerText = roleLabel;
    document.querySelectorAll('.role, .user-badge-top').forEach((el) => {
      el.textContent = roleLabel;
    });

    document.dispatchEvent(new CustomEvent('userLoaded', { detail: window.CURRENT_USER }));
    return window.CURRENT_USER;
  } catch (err) {
    console.error('Failed to load user session:', err);
    return null;
  }
};

window.hasRole = (...roles) => roles.includes(window.CURRENT_USER.role);
window.hasRight = (right) => window.CURRENT_USER.role === 'superadmin' || window.CURRENT_USER.rights.includes('*') || window.CURRENT_USER.rights.includes(right);
window.hasModuleAccess = (prefix) => window.CURRENT_USER.role === 'superadmin' || window.CURRENT_USER.rights.includes('*') || window.CURRENT_USER.rights.some((r) => r.startsWith(prefix));
window.logoutUser = async () => {
  try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); }
  finally { window.location.href = '/login.html'; }
};

document.addEventListener('DOMContentLoaded', () => { window.loadCurrentUserSession(); });
