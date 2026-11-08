import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';
import { requireAdmin, requireAuth, requireSuperadmin } from '../middleware/authMiddleware.js';
import { requireAnyRight, requireOneOfRights } from '../middleware/requireRight.js';

const router = express.Router();

const rightsModules = {
    customer: ['add-customer', 'delete-customer', 'edit-customer'],
    product: ['add-product', 'delete-product', 'edit-product', 'add-price', 'edit-price', 'delete-price'],
    'human-resources': ['add-job', 'delete-job', 'edit-job', 'add-department', 'delete-department', 'edit-department', 'add-employee', 'delete-employee', 'edit-employee', 'view-job-history', 'add-job-history', 'delete-job-history', 'edit-job-history'],
    sales: ['add-sale', 'edit-sale', 'delete-sale', 'add-sale-detail', 'view-sale-details', 'edit-sale-detail', 'delete-sale-detail'],
    reports: ['top-customers', 'top-products', 'all-employees', 'active-employees', 'employee-job-history', 'top-sales', 'product-master-list']
};

export const requireModuleRight = (module, action) => async (req, res, next) => {
    if (req.session.roleId === 1 || req.session.roleId === 2) return next();

    try {
        const normalizedModule = module.toLowerCase();
        const { data, error } = await supabase
            .from('user_rights')
            .select('action_key')
            .eq('user_id', String(req.session.userId))
            .eq('module_name', normalizedModule)
            .eq('action_key', action)
            .eq('is_allowed', true)
            .eq('is_deleted', false)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return res.status(403).json({ error: `You do not have permission to perform '${action}'.` });
        }
        next();
    } catch (err) {
        console.error(`Error checking ${module} right:`, err.message);
        return res.status(500).json({ error: 'Unable to verify permission.' });
    }
};

const requireEmployeeRight = action => requireOneOfRights('human-resources', [action]);

// ---------------------------------------------------------
// STANDARD ADMIN & SUPERADMIN ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

// 1. GET /api/admin/users - Retrieve user directory
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;

    let query = supabase
      .from('app_user')
      .select('user_id, first_name, last_name, email, role_id, is_blocked, status, stamp');

    if (requesterRoleId === 2) {
      query = query.neq('role_id', 1);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching user directory:', err.message);
    res.status(500).json({ error: 'Internal server error while fetching users.' });
  }
});

// 2. POST /api/admin/users - Add a new user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, password } = req.body; 

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('app_user')
      .insert([{
        email,
        password_hash: hashedPassword,
        role_id: 3, // FORCE new users to be regular users by default
        status: 'active',
        is_blocked: false
      }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully', user: data[0] });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Internal server error while creating user.' });
  }
});

// 3. PATCH /api/admin/users/:userId/status - Toggle block/unblock status
router.patch('/users/:userId/status', requireAdmin, async (req, res) => {
  try {
    const requesterRoleId = req.session.roleId;
    const { userId } = req.params;
    const { is_blocked } = req.body;

    const { data: targetUser, error: fetchError } = await supabase
      .from('app_user')
      .select('role_id, is_blocked')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (requesterRoleId === 2 && targetUser.role_id === 1) {
      return res.status(403).json({ error: 'Unauthorized: Cannot modify Superadmin status.' });
    }

    if (targetUser.role_id === 1 && is_blocked === true) {
      const { count, error: countError } = await supabase
        .from('app_user')
        .select('user_id', { count: 'exact', head: true })
        .eq('role_id', 1)
        .eq('is_blocked', false);

      if (countError) throw countError;

      if (count <= 1) {
        return res.status(400).json({ 
          error: 'Action blocked: Cannot disable or block the last remaining Superadmin.' //Blocks the last superadmin from being blocked or disabled
        });
      }
    }

    const { error: updateError } = await supabase
      .from('app_user')
      .update({ is_blocked })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    res.status(200).json({ message: `User successfully ${is_blocked ? 'blocked' : 'unblocked'}.` });
  } catch (err) {
    console.error('Error updating user status:', err.message);
    res.status(500).json({ error: 'Internal server error while updating user status.' });
  }
});


// ---------------------------------------------------------
// SUPERADMIN-ONLY ROUTES (Protected by requireSuperadmin)
// ---------------------------------------------------------

// 4. GET /api/admin/pending-users - Review pending registrations
router.get('/pending-users', requireSuperadmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('app_user')
      .select('user_id, first_name, last_name, email, role_id, status, stamp')
      .eq('status', 'pending');

    if (error) throw error;
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching pending users:', err.message);
    res.status(500).json({ error: 'Internal server error while fetching pending users.' });
  }
});

// 5. PATCH /api/admin/users/:userId/approve - Approve pending user
router.patch('/users/:userId/approve', requireSuperadmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_id } = req.body;

    const updatePayload = { status: 'active' };
    if (role_id) updatePayload.role_id = role_id;

    const { data, error } = await supabase
      .from('app_user')
      .update(updatePayload)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    res.status(200).json({ message: 'User approved and activated successfully.', user: data[0] });
  } catch (err) {
    console.error('Error approving user:', err.message);
    res.status(500).json({ error: 'Internal server error while approving user.' });
  }
});

// 6. PATCH /api/admin/users/:userId/role - Elevate or modify roles
router.patch('/users/:userId/role', requireSuperadmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { target_role_id } = req.body; 
    const currentSessionUserId = req.session.userId;

    if (currentSessionUserId && userId === currentSessionUserId) {
      return res.status(403).json({ 
        error: 'Action blocked: You cannot modify your own account role from the user directory.' 
      });
    }

    const { data: targetUser, error: fetchError } = await supabase
      .from('app_user')
      .select('role_id, is_blocked')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (targetUser.role_id === 1 && Number(target_role_id) !== 1) {
      const { count, error: countError } = await supabase
        .from('app_user')
        .select('user_id', { count: 'exact', head: true })
        .eq('role_id', 1)
        .eq('is_blocked', false);

      if (countError) throw countError;

      if (count <= 1) {
        return res.status(400).json({ 
          error: 'Action blocked: Cannot demote the last remaining Superadmin account.' 
        });
      }
    }

    const { data, error: updateError } = await supabase
      .from('app_user')
      .update({ role_id: Number(target_role_id) })
      .eq('user_id', userId)
      .select('user_id, email, role_id, is_blocked');

    if (updateError) throw updateError;

    res.status(200).json({ message: 'User role updated successfully.', user: data[0] });
  } catch (err) {
    console.error('Error updating user role:', err.message);
    res.status(500).json({ error: 'Internal server error while updating user role.' });
  }
});


// ---------------------------------------------------------
// CUSTOMER MANAGEMENT ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

router.get('/customers', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('customer')
            .select('*')
            .order('stamp', { ascending: false });

        if (error) throw error;

        res.status(200).json({ customers: data || [] });
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).json({ error: 'Failed to load customer records: ' + err.message });
    }
});

router.post('/customers', requireAuth, requireModuleRight('customer', 'add-customer'), async (req, res) => {
    const { custno, custname, address, payterm } = req.body;

    if (!custno || !custname || !address || !payterm) {
        return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    try {
        const { error } = await supabase
            .from('customer')
            .insert([{ 
                custno, 
                custname, 
                address, 
                payterm, 
                stamp: new Date().toISOString(), 
                is_blocked: false 
            }]);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Customer created successfully.' });
    } catch (err) {
        console.error('Error creating customer:', err.message);
        res.status(500).json({ error: 'Failed to create customer: ' + err.message });
    }
});

router.put('/customers/:custno', requireAuth, requireModuleRight('customer', 'edit-customer'), async (req, res) => {
    const { custno } = req.params;
    const { custname, address, payterm } = req.body;

    try {
        const { error } = await supabase
            .from('customer')
            .update({ 
                custname, 
                address, 
                payterm, 
                stamp: new Date().toISOString() 
            })
            .eq('custno', custno);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Customer updated successfully.' });
    } catch (err) {
        console.error('Error updating customer:', err.message);
        res.status(500).json({ error: 'Failed to update customer: ' + err.message });
    }
});

router.delete('/customers/:custno', requireAuth, requireModuleRight('customer', 'delete-customer'), async (req, res) => {
    try {
        const { error } = await supabase
            .from('customer')
            .delete()
            .eq('custno', req.params.custno);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Customer deleted successfully.' });
    } catch (err) {
        console.error('Error deleting customer:', err.message);
        res.status(500).json({ error: 'Failed to delete customer: ' + err.message });
    }
});

router.patch('/customers/:custno/status', requireAuth, requireModuleRight('customer', 'edit-customer'), async (req, res) => {
    const { custno } = req.params;
    const { is_blocked } = req.body;

    try {
        const { error } = await supabase
            .from('customer')
            .update({ 
                is_blocked: !!is_blocked, 
                stamp: new Date().toISOString() 
            })
            .eq('custno', custno);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Customer status updated.' });
    } catch (err) {
        console.error('Error updating status:', err.message);
        res.status(500).json({ error: 'Failed to update status: ' + err.message });
    }
});

// ---------------------------------------------------------
// PRODUCT MANAGEMENT ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

router.get('/product', requireAuth, async (req, res) => {
    try {
        const [productsRes, pricesRes] = await Promise.all([
            supabase.from('product').select('prodcode, description, unit').eq('is_deleted', false).order('prodcode'),
            supabase.from('pricehist_active').select('prodcode, unitprice')
        ]);
        if (productsRes.error) throw productsRes.error;
        if (pricesRes.error) throw pricesRes.error;

        const prices = Object.fromEntries((pricesRes.data || []).map(price => [price.prodcode, price.unitprice]));
        res.status(200).json({
            products: (productsRes.data || []).map(product => ({
                ...product,
                unitprice: prices[product.prodcode] ?? null
            }))
        });
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: 'Failed to load product records: ' + err.message });
    }
});

router.post('/product', requireAuth, requireModuleRight('product', 'add-product'), async (req, res) => {
    const { prodcode, description, unit, unitprice } = req.body;
    const price = Number(unitprice);
    if (!prodcode?.trim() || !description?.trim() || !unit?.trim() || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: 'Product code, description, unit, and a valid non-negative price are required.' });
    }

    try {
        const { error: productError } = await supabase.from('product').insert({
            prodcode: prodcode.trim(),
            description: description.trim(),
            unit: unit.trim(),
            is_deleted: false
        });
        if (productError) throw productError;

        const { error: priceError } = await supabase.from('pricehist').insert({
            prodcode: prodcode.trim(),
            unitprice: price,
            effdate: new Date().toISOString().slice(0, 10),
            is_deleted: false
        });
        if (priceError) throw priceError;

        res.status(201).json({ success: true, message: 'Product created successfully.' });
    } catch (err) {
        console.error('Error creating product:', err.message);
        res.status(500).json({ error: 'Failed to create product: ' + err.message });
    }
});

router.put('/product/:prodcode', requireAuth, requireModuleRight('product', 'edit-product'), async (req, res) => {
    const { prodcode } = req.params;
    const { description, unit, unitprice } = req.body;
    const price = Number(unitprice);
    if (!description?.trim() || !unit?.trim() || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: 'Description, unit, and a valid non-negative price are required.' });
    }

    try {
        const { data: product, error: productError } = await supabase
            .from('product')
            .update({ description: description.trim(), unit: unit.trim() })
            .eq('prodcode', prodcode)
            .eq('is_deleted', false)
            .select('prodcode')
            .maybeSingle();
        if (productError) throw productError;
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        const { error: priceError } = await supabase.from('pricehist').insert({
            prodcode,
            unitprice: price,
            effdate: new Date().toISOString().slice(0, 10),
            is_deleted: false
        });
        if (priceError) throw priceError;

        res.status(200).json({ success: true, message: 'Product updated successfully.' });
    } catch (err) {
        console.error('Error updating product:', err.message);
        res.status(500).json({ error: 'Failed to update product: ' + err.message });
    }
});

router.delete('/product/:prodcode', requireAuth, requireModuleRight('product', 'delete-product'), async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('product')
            .update({ is_deleted: true })
            .eq('prodcode', req.params.prodcode)
            .eq('is_deleted', false)
            .select('prodcode')
            .maybeSingle();
        if (error) throw error;
        if (!product) return res.status(404).json({ error: 'Product not found.' });

        res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ error: 'Failed to delete product: ' + err.message });
    }
});

// ---------------------------------------------------------
// HUMAN RESOURCES ROUTES
// ---------------------------------------------------------

router.get('/employees', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .select('empno, firstname, lastname, jobcode, deptcode, gender, hiredate, sepdate')
            .eq('is_deleted', false)
            .order('empno');
        if (error) throw error;

        res.json({
            employees: (data || []).map(employee => ({
                ...employee,
                empname: `${employee.firstname || ''} ${employee.lastname || ''}`.trim()
            }))
        });
    } catch (err) {
        console.error('Error fetching employees:', err.message);
        res.status(500).json({ error: 'Failed to load employee records.' });
    }
});

router.post('/employees', requireAuth, requireEmployeeRight('add-employee'), async (req, res) => {
    const { empno, empname, jobcode, deptcode } = req.body;
    const [firstname, ...lastParts] = String(empname || '').trim().split(/\s+/);
    const lastname = lastParts.join(' ');

    if (!empno?.trim() || !firstname || !lastname || !jobcode?.trim() || !deptcode?.trim()) {
        return res.status(400).json({ error: 'Employee number, name, job, and department are required.' });
    }

    try {
        const { error } = await supabase.from('employee').insert({
            empno: empno.trim(),
            firstname,
            lastname,
            jobcode: jobcode.trim(),
            deptcode: deptcode.trim(),
            is_deleted: false
        });
        if (error) throw error;
        res.status(201).json({ success: true, message: 'Employee created successfully.' });
    } catch (err) {
        console.error('Error creating employee:', err.message);
        res.status(500).json({ error: 'Failed to create employee record.' });
    }
});

router.put('/employees/:empno', requireAuth, requireEmployeeRight('edit-employee'), async (req, res) => {
    const { empname, jobcode, deptcode } = req.body;
    const [firstname, ...lastParts] = String(empname || '').trim().split(/\s+/);
    const lastname = lastParts.join(' ');

    if (!firstname || !lastname || !jobcode?.trim() || !deptcode?.trim()) {
        return res.status(400).json({ error: 'Employee name, job, and department are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('employee')
            .update({ firstname, lastname, jobcode: jobcode.trim(), deptcode: deptcode.trim() })
            .eq('empno', req.params.empno)
            .eq('is_deleted', false)
            .select('empno')
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Employee not found.' });
        res.json({ success: true, message: 'Employee updated successfully.' });
    } catch (err) {
        console.error('Error updating employee:', err.message);
        res.status(500).json({ error: 'Failed to update employee record.' });
    }
});

router.delete('/employees/:empno', requireAuth, requireEmployeeRight('delete-employee'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .update({ is_deleted: true })
            .eq('empno', req.params.empno)
            .eq('is_deleted', false)
            .select('empno')
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Employee not found.' });
        res.json({ success: true, message: 'Employee deleted successfully.' });
    } catch (err) {
        console.error('Error deleting employee:', err.message);
        res.status(500).json({ error: 'Failed to delete employee record.' });
    }
});

// ---------------------------------------------------------
// SALES MANAGEMENT ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

router.get('/sales/options', requireAuth, async (req, res) => {
    try {
        const [customerRes, employeeRes, productRes] = await Promise.all([
            supabase.from('customer_active').select('custno, custname').order('custname'),
            supabase.from('employee_active').select('empno, firstname, lastname').order('lastname'),
            supabase.from('pricehist_active').select('prodcode').order('prodcode')
        ]);

        if (customerRes.error) throw customerRes.error;
        if (employeeRes.error) throw employeeRes.error;
        if (productRes.error) throw productRes.error;

        const products = [...new Set((productRes.data || []).map(product => product.prodcode))].map(prodcode => ({
            prodcode
        }));

        res.status(200).json({
            customers: customerRes.data || [],
            employees: (employeeRes.data || []).map(employee => ({
                empno: employee.empno,
                empname: `${employee.firstname || ''} ${employee.lastname || ''}`.trim()
            })),
            products
        });
    } catch (err) {
        console.error('Error fetching sales options:', err.message);
        res.status(500).json({ error: 'Failed to load sales form options.' });
    }
});

router.post('/sales', requireAuth, requireModuleRight('sales', 'add-sale'), async (req, res) => {
    const { custno, empno, items } = req.body;

    if (!custno || !empno || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            error: 'Customer, employee, and at least one sale item are required.'
        });
    }

    const normalizedItems = items.map(item => ({
        prodcode: typeof item?.prodcode === 'string' ? item.prodcode.trim() : '',
        quantity: Number(item?.quantity)
    }));

    if (normalizedItems.some(item => !item.prodcode || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
        return res.status(400).json({
            error: 'Each sale item must include a product code and a positive whole-number quantity.'
        });
    }

    try {
        const [customerRes, employeeRes, priceRes] = await Promise.all([
            supabase.from('customer_active').select('custno').eq('custno', custno).maybeSingle(),
            supabase.from('employee_active').select('empno').eq('empno', empno).maybeSingle(),
            supabase.from('pricehist_active').select('prodcode').in(
                'prodcode',
                [...new Set(normalizedItems.map(item => item.prodcode))]
            )
        ]);

        if (customerRes.error) throw customerRes.error;
        if (employeeRes.error) throw employeeRes.error;
        if (priceRes.error) throw priceRes.error;
        if (!customerRes.data) return res.status(400).json({ error: 'Selected customer is not active.' });
        if (!employeeRes.data) return res.status(400).json({ error: 'Selected employee is not active.' });

        const activeProducts = new Set((priceRes.data || []).map(product => product.prodcode));
        const missingProduct = normalizedItems.find(item => !activeProducts.has(item.prodcode));
        if (missingProduct) {
            return res.status(400).json({ error: `Product ${missingProduct.prodcode} is not active or has no price.` });
        }

        const transno = `TR-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const { data: sale, error: saleError } = await supabase.rpc('create_sale_transaction', {
            p_transno: transno,
            p_salesdate: new Date().toISOString().slice(0, 10),
            p_custno: custno,
            p_empno: empno,
            p_items: normalizedItems
        });

        if (saleError) throw saleError;

        res.status(201).json({ success: true, sale });
    } catch (err) {
        console.error('Error creating sale:', err.message);
        res.status(500).json({ error: 'Failed to create sale transaction.' });
    }
});

router.get('/sales', requireAuth, async (req, res) => {
    console.log('[API] GET /api/admin/sales called');
    try {
        const { data: salesRecords, error: salesError } = await supabase
            .from('sales')
            .select('transno, salesdate, custno, empno, stamp, is_deleted')
            .order('salesdate', { ascending: false });

        if (salesError) throw salesError;

        const [customerRes, employeeRes, lineRes, priceRes] = await Promise.all([
            supabase.from('customer_active').select('custno, custname'),
            supabase.from('employee_active').select('empno, firstname, lastname'),
            supabase.from('salesdetail_active').select('transno, prodcode, quantity'),
            supabase.from('pricehist_active').select('prodcode, unitprice, effdate').order('effdate', { ascending: false })
        ]);

        if (customerRes.error) throw customerRes.error;
        if (employeeRes.error) throw employeeRes.error;
        if (lineRes.error) throw lineRes.error;
        if (priceRes.error) throw priceRes.error;

        const customerMap = {};
        (customerRes.data || []).forEach(c => { customerMap[c.custno] = c.custname; });

        const employeeMap = {};
        (employeeRes.data || []).forEach(e => { 
            employeeMap[e.empno] = `${e.firstname || ''} ${e.lastname || ''}`.trim(); 
        });

        const latestPrices = {};
        (priceRes.data || []).forEach(p => {
            if (!latestPrices[p.prodcode]) {
                latestPrices[p.prodcode] = Number(p.unitprice) || 0;
            }
        });

        const totalsMap = {};
        (lineRes.data || []).forEach(item => {
            const unitPrice = latestPrices[item.prodcode] || 0;
            const lineTotal = (Number(item.quantity) || 0) * unitPrice;
            totalsMap[item.transno] = (totalsMap[item.transno] || 0) + lineTotal;
        });

        const formattedSales = (salesRecords || []).map(sale => {
            const isDeleted = sale.is_deleted === true;
            const computedTotal = isDeleted ? 0.00 : (totalsMap[sale.transno] || 0.00);

            return {
                transno: sale.transno,
                salesdate: sale.salesdate,
                custno: sale.custno,
                customerName: customerMap[sale.custno] || sale.custno,
                empno: sale.empno,
                employeeName: employeeMap[sale.empno] || sale.empno,
                status: isDeleted ? 'Deleted' : 'Completed',
                stamp: sale.stamp,
                totalSales: computedTotal
            };
        });

        res.status(200).json({ success: true, sales: formattedSales });
    } catch (err) { 
        console.error('Error fetching sales:', err.message);
        res.status(500).json({ error: 'Failed to load sales records: ' + err.message });
    }
});


// ---------------------------------------------------------
// REPORT ROUTES (Read-only)
// ---------------------------------------------------------

const reportKeys = new Set([
    'top-customers',
    'product-master',
    'top-products',
    'active-employees',
    'all-employees',
    'employee-history',
    'top-sales'
]);

const reportActionByKey = {
    'top-customers': 'top-customers',
    'product-master': 'product-master-list',
    'top-products': 'top-products',
    'active-employees': 'active-employees',
    'all-employees': 'all-employees',
    'employee-history': 'employee-job-history',
    'top-sales': 'top-sales'
};

const parseReportDate = (value, field) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`${field} must use YYYY-MM-DD format.`);
    }
    return value;
};

const parseReportTopN = value => {
    const topN = Number(value);
    if (!Number.isInteger(topN) || topN < 1 || topN > 100) {
        throw new Error('topN must be a whole number between 1 and 100.');
    }
    return topN;
};

async function requireReportRight(req, res, next) {
    const { reportKey } = req.params;
    if (!reportKeys.has(reportKey)) return res.status(404).json({ error: 'Unknown report.' });
    if (req.session.roleId === 1 || req.session.roleId === 2) return next();

    try {
        const { data, error } = await supabase
            .from('user_rights')
            .select('action_key')
            .eq('user_id', String(req.session.userId))
            .eq('module_name', 'reports')
            .eq('action_key', reportActionByKey[reportKey])
            .eq('is_allowed', true)
            .eq('is_deleted', false)
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(403).json({ error: 'You do not have permission to open this report.' });
        next();
    } catch (err) {
        console.error('Error checking report right:', err.message);
        res.status(500).json({ error: 'Unable to verify report access.' });
    }
}

router.get('/reports/options', requireAnyRight('reports'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('employee_active')
            .select('empno, firstname, lastname')
            .order('lastname');
        if (error) throw error;
        res.json({
            employees: (data || []).map(employee => ({
                empno: employee.empno,
                empname: `${employee.firstname || ''} ${employee.lastname || ''}`.trim()
            }))
        });
    } catch (err) {
        console.error('Error fetching report options:', err.message);
        res.status(500).json({ error: 'Failed to load report options.' });
    }
});

router.get('/reports/:reportKey', requireAuth, requireReportRight, async (req, res) => {
    const { reportKey } = req.params;
    try {
        let records = [];

        if (reportKey === 'product-master') {
            const [productsRes, pricesRes] = await Promise.all([
                supabase.from('product').select('prodcode, description, unit').eq('is_deleted', false).order('prodcode'),
                supabase.from('pricehist_active').select('prodcode, unitprice')
            ]);
            if (productsRes.error) throw productsRes.error;
            if (pricesRes.error) throw pricesRes.error;
            const prices = Object.fromEntries((pricesRes.data || []).map(price => [price.prodcode, price.unitprice]));
            records = (productsRes.data || []).map(product => ({
                prodcode: product.prodcode,
                description: product.description,
                unit: product.unit,
                unitprice: prices[product.prodcode] || 0
            }));
        } else if (reportKey === 'active-employees' || reportKey === 'all-employees') {
            const source = reportKey === 'active-employees' ? 'employee_active' : 'employee';
            const query = supabase.from(source).select('empno, firstname, lastname, gender, hiredate, sepdate');
            const { data, error } = await query.order('empno');
            if (error) throw error;
            records = data || [];
        } else if (reportKey === 'employee-history') {
            if (typeof req.query.empNo !== 'string' || !req.query.empNo.trim()) {
                return res.status(400).json({ error: 'empNo is required.' });
            }
            const { data, error } = await supabase
                .from('employee_job_history')
                .select('empno, jobcode, deptcode, effdate, salary, employee:employee(empno, firstname, lastname)')
                .eq('empno', req.query.empNo.trim())
                .order('effdate', { ascending: false });
            if (error) throw error;
            records = (data || []).map(row => ({
                empno: row.empno,
                empName: `${row.employee?.firstname || ''} ${row.employee?.lastname || ''}`.trim(),
                jobcode: row.jobcode,
                deptcode: row.deptcode,
                effdate: row.effdate,
                salary: row.salary
            }));
        } else {
            const fromDate = parseReportDate(req.query.fromDate, 'fromDate');
            const toDate = parseReportDate(req.query.toDate, 'toDate');
            if (fromDate > toDate) throw new Error('fromDate cannot be after toDate.');
            const topN = parseReportTopN(req.query.topN);

            const [salesRes, detailsRes, pricesRes, customersRes, productsRes, employeesRes] = await Promise.all([
                supabase.from('sales')
                    .select('transno, salesdate, custno, empno')
                    .eq('is_deleted', false)
                    .gte('salesdate', fromDate)
                    .lte('salesdate', toDate),
                supabase.from('salesdetail').select('transno, prodcode, quantity'),
                supabase.from('pricehist').select('prodcode, unitprice, effdate, is_deleted')
                    .eq('is_deleted', false)
                    .lte('effdate', toDate)
                    .order('effdate', { ascending: false }),
                supabase.from('customer_active').select('custno, custname'),
                supabase.from('product').select('prodcode, description'),
                supabase.from('employee').select('empno, firstname, lastname')
            ]);
            if (salesRes.error) throw salesRes.error;
            if (detailsRes.error) throw detailsRes.error;
            if (pricesRes.error) throw pricesRes.error;
            if (customersRes.error) throw customersRes.error;
            if (productsRes.error) throw productsRes.error;
            if (employeesRes.error) throw employeesRes.error;

            const customers = Object.fromEntries((customersRes.data || []).map(row => [row.custno, row.custname]));
            const products = Object.fromEntries((productsRes.data || []).map(row => [row.prodcode, row.description]));
            const employees = Object.fromEntries((employeesRes.data || []).map(row => [
                row.empno, `${row.firstname || ''} ${row.lastname || ''}`.trim()
            ]));
            const salesById = Object.fromEntries((salesRes.data || []).map(sale => [sale.transno, sale]));
            const detailsByProduct = {};
            (pricesRes.data || []).forEach(price => {
                detailsByProduct[price.prodcode] ||= [];
                detailsByProduct[price.prodcode].push(price);
            });
            const lines = (detailsRes.data || [])
                .filter(detail => salesById[detail.transno])
                .map(detail => {
                    const sale = salesById[detail.transno];
                    const price = (detailsByProduct[detail.prodcode] || [])
                        .find(candidate => candidate.effdate <= sale.salesdate);
                    return {
                        ...detail,
                        ...sale,
                        lineTotal: (Number(detail.quantity) || 0) * (Number(price?.unitprice) || 0)
                    };
                });
            const amount = line => Number(line.lineTotal) || 0;

            if (reportKey === 'top-customers') {
                const grouped = {};
                lines.forEach(line => {
                    grouped[line.custno] = (grouped[line.custno] || 0) + amount(line);
                });
                records = Object.entries(grouped)
                    .map(([custno, totalSales]) => ({ custno, custname: customers[custno] || custno, totalSales }))
                    .sort((a, b) => b.totalSales - a.totalSales).slice(0, topN);
            } else if (reportKey === 'top-products') {
                const grouped = {};
                lines.forEach(line => {
                    grouped[line.prodcode] ||= { totalQuantity: 0, totalRevenue: 0 };
                    grouped[line.prodcode].totalQuantity += Number(line.quantity) || 0;
                    grouped[line.prodcode].totalRevenue += amount(line);
                });
                records = Object.entries(grouped)
                    .map(([prodcode, totals]) => ({ prodcode, description: products[prodcode] || prodcode, ...totals }))
                    .sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, topN);
            } else {
                const grouped = {};
                lines.forEach(line => {
                    grouped[line.transno] ||= {
                        transno: line.transno,
                        salesdate: line.salesdate,
                        customerName: customers[line.custno] || line.custno,
                        employeeName: employees[line.empno] || line.empno,
                        totalSales: 0
                    };
                    grouped[line.transno].totalSales += amount(line);
                });
                records = Object.values(grouped).sort((a, b) => b.totalSales - a.totalSales).slice(0, topN);
            }
        }

        res.json({ records });
    } catch (err) {
        if (err.message.includes('must ') || err.message.includes('cannot ') || err.message.includes('required')) {
            return res.status(400).json({ error: err.message });
        }
        console.error(`Error generating ${reportKey} report:`, err.message);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

router.put('/reports/rights/:userId/:reportKey', requireAdmin, async (req, res) => {
    const { userId, reportKey } = req.params;
    if (!reportKeys.has(reportKey)) return res.status(404).json({ error: 'Unknown report.' });
    const { error } = await supabase.rpc('set_module_right', {
        p_actor_user_id: String(req.session.userId),
        p_target_user_id: userId,
        p_module: 'reports',
        p_action: reportActionByKey[reportKey],
        p_granted: true
    });
    if (error) {
        console.error('Error granting report right:', error.message);
        return res.status(500).json({ error: 'Failed to grant report right.' });
    }
    res.status(204).send();
});

router.delete('/reports/rights/:userId/:reportKey', requireAdmin, async (req, res) => {
    const { userId, reportKey } = req.params;
    if (!reportKeys.has(reportKey)) return res.status(404).json({ error: 'Unknown report.' });
    const { error } = await supabase.rpc('set_module_right', {
        p_actor_user_id: String(req.session.userId),
        p_target_user_id: userId,
        p_module: 'reports',
        p_action: reportActionByKey[reportKey],
        p_granted: false
    });
    if (error) {
        console.error('Error revoking report right:', error.message);
        return res.status(500).json({ error: 'Failed to revoke report right.' });
    }
    res.status(204).send();
});


// ---------------------------------------------------------
// GRANULAR RIGHTS MANAGEMENT ROUTES (Protected by requireAdmin)
// ---------------------------------------------------------

// ==========================================
// GET User Rights
// ==========================================
router.get('/users/:userId/rights', requireAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('user_rights')
            .select('module_name, action_key, is_allowed')
            .eq('user_id', String(userId))
            .eq('is_deleted', false)
            .eq('is_allowed', true); // Ensures only active permissions are fetched

        if (error) throw error;

        return res.status(200).json({
            success: true,
            modules: rightsModules,
            rights: data || []
        });
    } catch (err) {
        console.error('Error fetching user rights:', err.message);
        return res.status(500).json({ error: 'Failed to load user rights.' });
    }
});

// ==========================================
// PUT Update User Right (Supports Single Toggles & Arrays)
// ==========================================
router.put('/users/:id/rights', async (req, res) => {
    try {
        // Ensure the logged-in user has admin privileges
        const userRoleId = Number(req.session.roleId);
        if (userRoleId !== 1 && userRoleId !== 2) { 
            return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
        }

        const targetUserId = req.params.id;
        const body = req.body;

        let rightsToProcess = [];

        if (Array.isArray(body.rights)) {
            rightsToProcess = body.rights;
        } else if (body.module && body.action !== undefined) {
            rightsToProcess = [{
                module_name: body.module,
                action_key: body.action,
                is_allowed: body.granted !== undefined ? body.granted : (body.is_allowed !== undefined ? body.is_allowed : true)
            }];
        }

        if (rightsToProcess.length === 0) {
            return res.status(400).json({ error: 'Invalid payload: no valid rights data provided.' });
        }

        // Loop and upsert into Supabase user_rights table
        for (const right of rightsToProcess) {
            const { error: upsertError } = await supabase
                .from('user_rights')
                .upsert({
                    user_id: targetUserId,
                    module_name: right.module_name,
                    action_key: right.action_key,
                    is_allowed: right.is_allowed,
                    is_deleted: !right.is_allowed,
                    stamp: new Date()
                }, { onConflict: 'user_id,module_name,action_key' });

            if (upsertError) {
                console.error('Supabase upsert error:', upsertError);
                throw upsertError;
            }
        }

        return res.status(200).json({ success: true, message: 'Rights updated successfully.' });
    } catch (err) {
        console.error('Error updating rights:', err);
        return res.status(500).json({ error: err.message });
    }
});

// ==========================================
// REPORTS & ANALYTICS API ENDPOINTS
// ==========================================

// 1. Top Customers by Sales
router.get('/reports/top-customers', requireAuth, async (req, res) => {
    try {
        const { fromDate, toDate, topN = 10 } = req.query;
        // Adjust table/column names to fit your exact schema if needed
        const { data, error } = await supabase
            .from('sales_summary_view') // or your custom join query
            .select('custno, custname, totalSales')
            .order('totalSales', { ascending: false })
            .limit(Number(topN));

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching top customers:', err);
        return res.status(500).json({ error: 'Failed to generate top customers report.' });
    }
});

// 2. Product Master List
router.get('/reports/product-master', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('app_product') // Adjust to your product table name
            .select('prodcode, description, unit, unitprice')
            .order('prodcode', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching product master:', err);
        return res.status(500).json({ error: 'Failed to generate product master list.' });
    }
});

// 3. Top Products by Sales
router.get('/reports/top-products', requireAuth, async (req, res) => {
    try {
        const { topN = 10 } = req.query;
        const { data, error } = await supabase
            .from('product_sales_summary')
            .select('prodcode, description, totalQuantity, totalRevenue')
            .order('totalRevenue', { ascending: false })
            .limit(Number(topN));

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching top products:', err);
        return res.status(500).json({ error: 'Failed to generate top products report.' });
    }
});

// 4. Active Employees Directory
router.get('/reports/active-employees', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('app_employee')
            .select('empno, firstname, lastname, gender, hiredate, sepdate')
            .is('sepdate', null)
            .order('empno', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching active employees:', err);
        return res.status(500).json({ error: 'Failed to fetch active employees.' });
    }
});

// 5. Complete Employee Roster
router.get('/reports/all-employees', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('app_employee')
            .select('empno, firstname, lastname, gender, hiredate, sepdate')
            .order('empno', { ascending: true });

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching all employees:', err);
        return res.status(500).json({ error: 'Failed to fetch employee roster.' });
    }
});

// 6. Employee Options Dropdown (Used for Employee History filter)
router.get('/reports/options', requireAnyRight('reports'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('app_employee')
            .select('empno, firstname, lastname');

        if (error) throw error;
        const employees = (data || []).map(e => ({
            empno: e.empno,
            empname: `${e.firstname} ${e.lastname}`
        }));

        return res.status(200).json({ employees });
    } catch (err) {
        console.error('Error fetching employee options:', err);
        return res.status(500).json({ error: 'Failed to load options.' });
    }
});

// 7. Employee Job & Salary History
router.get('/reports/employee-history', requireAuth, async (req, res) => {
    try {
        const { empNo } = req.query;
        let query = supabase.from('employee_history_view').select('*');
        if (empNo) {
            query = query.eq('empno', empNo);
        }
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching employee history:', err);
        return res.status(500).json({ error: 'Failed to load employee history.' });
    }
});

// 8. Top Sales Transactions
router.get('/reports/top-sales', requireAuth, async (req, res) => {
    try {
        const { topN = 10 } = req.query;
        const { data, error } = await supabase
            .from('sales_transactions_view')
            .select('transno, salesdate, customerName, employeeName, totalSales')
            .order('totalSales', { ascending: false })
            .limit(Number(topN));

        if (error) throw error;
        return res.status(200).json({ records: data || [] });
    } catch (err) {
        console.error('Error fetching top sales:', err);
        return res.status(500).json({ error: 'Failed to load top sales.' });
    }
});

export default router;
