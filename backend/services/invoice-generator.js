const pool = require('../config/database');

class InvoiceGenerator {
  async createInvoice(userId, subscriptionId, amount, dueDate = null) {
    try {
      const due = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const result = await pool.query(
        `INSERT INTO invoices (user_id, subscription_id, amount, due_date) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, subscriptionId, amount, due]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Invoice creation error:', error);
      throw error;
    }
  }

  async markInvoicePaid(invoiceId, paymentDate = null) {
    try {
      const paidAt = paymentDate || new Date();

      await pool.query(
        'UPDATE invoices SET status = $1, paid_at = $2 WHERE id = $3',
        ['paid', paidAt, invoiceId]
      );

      return true;
    } catch (error) {
      console.error('Mark invoice paid error:', error);
      return false;
    }
  }

  async getUserInvoices(userId, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT i.*, s.plan_name 
         FROM invoices i 
         LEFT JOIN subscriptions s ON i.subscription_id = s.id 
         WHERE i.user_id = $1 
         ORDER BY i.created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get user invoices error:', error);
      return [];
    }
  }

  async getOverdueInvoices() {
    try {
      const result = await pool.query(
        `SELECT i.*, u.email, u.first_name, u.last_name 
         FROM invoices i 
         JOIN users u ON i.user_id = u.id 
         WHERE i.status = 'pending' AND i.due_date < NOW()`
      );

      return result.rows;
    } catch (error) {
      console.error('Get overdue invoices error:', error);
      return [];
    }
  }

  // Generate monthly invoices for active subscriptions
  async generateMonthlyInvoices() {
    try {
      const result = await pool.query(
        `SELECT s.*, u.email 
         FROM subscriptions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.status = 'active' AND s.ends_at <= NOW()`
      );

      const invoices = [];
      for (const subscription of result.rows) {
        const invoice = await this.createInvoice(
          subscription.user_id,
          subscription.id,
          subscription.price
        );
        invoices.push(invoice);

        // Extend subscription for another month
        await pool.query(
          'UPDATE subscriptions SET ends_at = ends_at + INTERVAL \'1 month\' WHERE id = $1',
          [subscription.id]
        );
      }

      return invoices;
    } catch (error) {
      console.error('Generate monthly invoices error:', error);
      return [];
    }
  }
}

module.exports = new InvoiceGenerator();