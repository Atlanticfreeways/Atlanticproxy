const pool = require('../config/database');

// Role definitions with permissions
const ROLES = {
  user: {
    name: 'User',
    permissions: ['proxy:read', 'proxy:create', 'proxy:delete', 'profile:read', 'profile:update', 'billing:read']
  },
  reseller: {
    name: 'Reseller',
    permissions: [
      'proxy:read', 'proxy:create', 'proxy:delete', 'proxy:manage',
      'profile:read', 'profile:update', 'billing:read', 'billing:manage',
      'referrals:read', 'referrals:manage', 'analytics:read',
      'customers:read', 'customers:manage'
    ]
  },
  admin: {
    name: 'Admin',
    permissions: [
      'proxy:*', 'profile:*', 'billing:*', 'referrals:*', 'analytics:*',
      'customers:*', 'users:*', 'support:*', 'system:*'
    ]
  }
};

// Check if user has specific permission
const hasPermission = (userRole, permission) => {
  const role = ROLES[userRole];
  if (!role) return false;
  
  return role.permissions.some(p => {
    if (p === permission) return true;
    if (p.endsWith(':*')) {
      const prefix = p.slice(0, -1);
      return permission.startsWith(prefix);
    }
    return false;
  });
};

// Middleware to check role permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: userRole
      });
    }
    
    next();
  };
};

// Middleware to require specific role
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roleArray.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient role',
        required: roleArray,
        userRole: userRole
      });
    }
    
    next();
  };
};

// Upgrade user to reseller
const upgradeToReseller = async (userId) => {
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['reseller', userId]);
    return true;
  } catch (error) {
    console.error('Role upgrade error:', error);
    return false;
  }
};

module.exports = {
  ROLES,
  hasPermission,
  requirePermission,
  requireRole,
  upgradeToReseller
};