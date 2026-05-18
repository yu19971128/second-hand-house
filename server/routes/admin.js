const express = require('express');
const pool = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 所有管理路由都需要登录 + admin 权限
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - 数据统计
router.get('/stats', async (req, res) => {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
    const [[houseCount]] = await pool.query('SELECT COUNT(*) as count FROM houses');
    const [[activeHouseCount]] = await pool.query('SELECT COUNT(*) as count FROM houses WHERE status = "active"');
    const [[favoriteCount]] = await pool.query('SELECT COUNT(*) as count FROM favorites');

    // 最近7天每天新增房源
    const [dailyHouses] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM houses
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 最近7天每天新增用户
    const [dailyUsers] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND role != 'admin'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 地区分布
    const [regionDist] = await pool.query(`
      SELECT region, COUNT(*) as count
      FROM houses WHERE status = 'active'
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    // 户型分布
    const [typeDist] = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM houses WHERE status = 'active'
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: {
          userCount: userCount.count,
          houseCount: houseCount.count,
          activeHouseCount: activeHouseCount.count,
          favoriteCount: favoriteCount.count
        },
        dailyHouses,
        dailyUsers,
        regionDist,
        typeDist
      }
    });
  } catch (err) {
    console.error('[GET /admin/stats]', err);
    res.status(500).json({ success: false, message: '获取统计数据失败', error: err.message });
  }
});

// GET /api/admin/houses - 获取所有房源（含下架）
router.get('/houses', async (req, res) => {
  try {
    const { keyword, region, type, status, page = 1, pageSize = 10 } = req.query;

    const conditions = [];
    const params = [];

    if (keyword) {
      conditions.push('(h.title LIKE ? OR h.address LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (region) { conditions.push('h.region = ?'); params.push(region); }
    if (type) { conditions.push('h.type = ?'); params.push(type); }
    if (status) { conditions.push('h.status = ?'); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM houses h ${where}`, params);

    const [rows] = await pool.query(
      `SELECT h.id, h.title, h.price, h.area, h.region, h.type, h.status,
              h.view_count, h.created_at, u.username as publisher
       FROM houses h
       LEFT JOIN users u ON h.user_id = u.id
       ${where}
       ORDER BY h.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: { list: rows, total, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (err) {
    console.error('[GET /admin/houses]', err);
    res.status(500).json({ success: false, message: '获取房源列表失败' });
  }
});

// PUT /api/admin/houses/:id/status - 更改房源状态（上架/下架）
router.put('/houses/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'offline', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: '状态值无效' });
    }
    const [result] = await pool.query('UPDATE houses SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '房源不存在' });
    }
    res.json({ success: true, message: '房源状态已更新' });
  } catch (err) {
    console.error('[PUT /admin/houses/:id/status]', err);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

// DELETE /api/admin/houses/:id - 物理删除房源
router.delete('/houses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM houses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '房源不存在' });
    }
    res.json({ success: true, message: '房源已删除' });
  } catch (err) {
    console.error('[DELETE /admin/houses/:id]', err);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// GET /api/admin/users - 获取所有用户
router.get('/users', async (req, res) => {
  try {
    const { keyword, role, status, page = 1, pageSize = 10 } = req.query;

    const conditions = ['role != "admin"'];
    const params = [];

    if (keyword) {
      conditions.push('(username LIKE ? OR phone LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (role) { conditions.push('role = ?'); params.push(role); }
    if (status) { conditions.push('status = ?'); params.push(status); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${where}`, params);

    const [rows] = await pool.query(
      `SELECT id, username, phone, role, status, created_at FROM users ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: { list: rows, total, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (err) {
    console.error('[GET /admin/users]', err);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
});

// PUT /api/admin/users/:id/status - 启用/禁用用户
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: '状态值无效' });
    }
    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ? AND role != "admin"', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在或无法操作管理员' });
    }
    res.json({ success: true, message: `用户已${status === 'active' ? '启用' : '禁用'}` });
  } catch (err) {
    console.error('[PUT /admin/users/:id/status]', err);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

module.exports = router;
