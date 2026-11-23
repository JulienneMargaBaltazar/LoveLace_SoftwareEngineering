cat << 'EOF' > public/js/permissions.js
// Complete 36-Right HOPE ERP Catalogue (for reference & validation)
window.RIGHTS_CATALOGUE = {
  customers: [
    'customer.view',
    'customer.add',
    'customer.edit',
    'customer.delete',
    'customer.export'
  ],
  products: [
    'product.view',
    'product.add',
    'product.edit',
    'product.delete',
    'product.adjust_stock',
    'product.export'
  ],
  hr: [
    'hr.view',
    'hr.add',
    'hr.edit',
    'hr.delete',
    'hr.view_job_history',
    'hr.edit_job_history',
    'hr.manage_departments',
    'hr.export'
  ],
  sales: [
    'sales.view',
    'sales.add',
    'sales.edit',
    'sales.void',
    'sales.view_invoices',
    'sales.export'
  ],
  reports: [
    'reports.view_sales',
    'reports.view_inventory',
    'reports.view_customers',
    'reports.view_hr',
    'reports.export_pdf',
    'reports.export_csv'
  ],
  admin: [
    'users.view',
    'users.assign_rights',
    'users.manage_status',
    'audit.view',
    'records.restore'
  ]
};

// Temporary mock user while wiring pages.
// Switch role to 'superadmin' | 'admin' | 'user' to preview any view.
window.CURRENT_USER = {
  id: 1,
  name: 'Julienne Baltazar',
  email: 'julienne@hope-erp.local',
  role: 'superadmin', // 'superadmin' | 'admin' | 'user'
  rights: ['*']       // '*' grants all rights; or test with e.g. ['customer.view', 'customer.add']
};

// Check if user matches one of the allowed roles: hasRole('admin', 'superadmin')
window.hasRole = function (...roles) {
  return roles.includes(window.CURRENT_USER.role);
};

// Check if user has a specific per-action right: hasRight('customer.delete')
window.hasRight = function (right) {
  const user = window.CURRENT_USER;
  if (user.role === 'superadmin' || user.rights.includes('*')) return true;
  return user.rights.includes(right);
};

// Check if user has AT LEAST ONE right in a module: hasModuleAccess('sales.')
window.hasModuleAccess = function (modulePrefix) {
  const user = window.CURRENT_USER;
  if (user.role === 'superadmin' || user.rights.includes('*')) return true;
  return user.rights.some((r) => r.startsWith(modulePrefix));
};

// Global logout helper
window.logoutUser = async function () {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    window.location.href = '/login';
  }
};
EOF