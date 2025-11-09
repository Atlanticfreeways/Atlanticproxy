// Utility functions extracted and modernized from old project
const crypto = require('crypto');

const Utils = {
  generateId: (length = 8) => crypto.randomBytes(length).toString('hex').slice(0, length),
  
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },
  
  sanitizeInput: (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>\"'&]/g, (match) => {
      const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return entities[match];
    });
  },

  generateReferralCode: (userId) => {
    return `AP${userId}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  },

  calculateCommission: (amount, rate) => {
    return Math.round(amount * (rate / 100) * 100) / 100;
  }
};

module.exports = Utils;