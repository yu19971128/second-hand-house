const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, phone, role = 'buyer' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ success: false, message: '用户名长度为2-20位' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码不能少于6位' });
    }
    if (!['buyer', 'agent'].includes(role)) {
      return res.status(400).json({ success: false, message: '角色参数无效' });
    }

    // 检查用户名是否已存在
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: '用户名已被注册' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, phone, role) VALUES (?, ?, ?, ?)',
      [username, passwordHash, phone || null, role]
    );

    const token = jwt.sign(
      { id: result.insertId, username, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { token, user: { id: result.insertId, username, role, phone: phone || null } }
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ success: false, message: '注册失败', error: err.message });
  }
});

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, phone, avatar, status FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const user = rows[0];

    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: '账号已被禁用，请联系管理员' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: '登录失败', error: err.message });
  }
});

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, phone, avatar, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
});

// POST /api/auth/edit - 编辑用户信息
router.post('/edit', authenticate, async (req, res) => {
  try {
    const { username, phone } = req.body;
    console.log('req', req)
    const [result] = await pool.query(
      'UPDATE users SET username = ?, phone = ? WHERE id = ?',
      [username, phone, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({
      success: true, data: {
        id: req.user.id,
        username,
        phone
      }, message: '编辑用户信息成功'
    });
  } catch (err) {
    console.error('[edit]', err);
    res.status(500).json({ success: false, message: '编辑用户信息失败' });
  }
});

module.exports = router;
