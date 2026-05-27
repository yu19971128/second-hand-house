const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 配置图片上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `house_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// GET /api/houses - 搜索/筛选房源
router.get('/', async (req, res) => {
  try {
    const {
      keyword,
      region,
      type,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const allowedSortFields = ['created_at', 'price', 'area', 'view_count'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const conditions = ['h.status = "active"'];
    const params = [];

    if (keyword) {
      conditions.push('(h.title LIKE ? OR h.description LIKE ? OR h.address LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (region) {
      conditions.push('h.region = ?');
      params.push(region);
    }
    if (type) {
      conditions.push('h.type = ?');
      params.push(type);
    }
    if (minPrice) {
      conditions.push('h.price >= ?');
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push('h.price <= ?');
      params.push(parseFloat(maxPrice));
    }
    if (minArea) {
      conditions.push('h.area >= ?');
      params.push(parseFloat(minArea));
    }
    if (maxArea) {
      conditions.push('h.area <= ?');
      params.push(parseFloat(maxArea));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const countSql = `SELECT COUNT(*) as total FROM houses h ${where}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT h.id, h.title, h.price, h.area, h.region, h.address, h.type, h.floor,
             h.year, h.images, h.status, h.view_count, h.created_at,
             u.username as publisher, u.phone as publisher_phone
      FROM houses h
      LEFT JOIN users u ON h.user_id = u.id
      ${where}
      ORDER BY h.${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [...params, parseInt(pageSize), offset]);

    res.json({
      success: true,
      data: {
        list: rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (err) {
    console.error('[GET /houses]', err);
    res.status(500).json({ success: false, message: '获取房源列表失败', error: err.message });
  }
});

// POST /api/houses/upload-temp - 临时图片上传（必须在 /:id 之前定义）
router.post('/upload-temp', authenticate, upload.single('images'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }
  res.json({
    success: true,
    path: `/uploads/${req.file.filename}`
  });
});

// GET /api/houses/user/my - 获取当前用户发布的房源（必须在 /:id 之前定义）
router.get('/user/my', authenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM houses WHERE user_id = ?',
      [req.user.id]
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT id, title, price, area, region, type, images, status, view_count, created_at
       FROM houses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: {
        list: rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    console.error('[GET /houses/user/my]', err);
    res.status(500).json({ success: false, message: '获取我的房源失败' });
  }
});

// GET /api/houses/user/favorites - 获取我的收藏列表（必须在 /:id 之前定义）
router.get('/user/favorites', authenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
      [req.user.id]
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT h.id, h.title, h.price, h.area, h.region, h.type, h.images, h.status, f.created_at as favorited_at
       FROM favorites f
       JOIN houses h ON f.house_id = h.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: { list: rows, total, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (err) {
    console.error('[GET /houses/user/favorites]', err);
    res.status(500).json({ success: false, message: '获取收藏列表失败' });
  }
});

// GET /api/houses/:id - 房源详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT h.*, u.username as publisher, u.phone as publisher_phone, u.avatar as publisher_avatar
       FROM houses h
       LEFT JOIN users u ON h.user_id = u.id
       WHERE h.id = ? AND h.status != 'offline'`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '房源不存在或已下架' });
    }
    // 增加浏览次数
    await pool.query('UPDATE houses SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[GET /houses/:id]', err);
    res.status(500).json({ success: false, message: '获取房源详情失败' });
  }
});

// POST /api/houses - 发布房源
router.post('/', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, price, area, region, address, type, floor, year, description } = req.body;

    if (!title || !price || !area || !region || !type) {
      return res.status(400).json({ success: false, message: '标题、价格、面积、地区、户型为必填项' });
    }

    const images = [
      ...(req.files ? req.files.map(f => `/uploads/${f.filename}`) : []),
      ...(req.body.imageUrls
        ? (Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls])
        : [])
    ];

    const [result] = await pool.query(
      `INSERT INTO houses (title, price, area, region, address, type, floor, year, description, images, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, parseFloat(price), parseFloat(area), region, address || null, type,
        floor || null, year ? parseInt(year) : null, description || null,
        JSON.stringify(images), req.user.id]
    );

    res.status(201).json({
      success: true,
      message: '房源发布成功',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error('[POST /houses]', err);
    res.status(500).json({ success: false, message: '发布房源失败', error: err.message });
  }
});

// PUT /api/houses/:id - 编辑房源
router.put('/:id', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT user_id, images FROM houses WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '房源不存在' });
    }
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限修改该房源' });
    }

    const { title, price, area, region, address, type, floor, year, description, status } = req.body;

    // 优先用 imageUrls（前端传来的所有图片 url，含已有和新上传的）
    // 若没有 imageUrls 则用 req.files 新上传的文件
    let newImages = null;
    const imageUrls = req.body.imageUrls;
    if (imageUrls !== undefined) {
      newImages = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    } else if (req.files && req.files.length > 0) {
      newImages = req.files.map(f => `/uploads/${f.filename}`);
    }

    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title); }
    if (price) { updates.push('price = ?'); params.push(parseFloat(price)); }
    if (area) { updates.push('area = ?'); params.push(parseFloat(area)); }
    if (region) { updates.push('region = ?'); params.push(region); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (type) { updates.push('type = ?'); params.push(type); }
    if (floor !== undefined) { updates.push('floor = ?'); params.push(floor); }
    if (year !== undefined) { updates.push('year = ?'); params.push(year ? parseInt(year) : null); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (newImages) { updates.push('images = ?'); params.push(JSON.stringify(newImages)); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有需要更新的内容' });
    }

    await pool.query(`UPDATE houses SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);

    res.json({ success: true, message: '房源更新成功' });
  } catch (err) {
    console.error('[PUT /houses/:id]', err);
    res.status(500).json({ success: false, message: '更新房源失败', error: err.message });
  }
});

// DELETE /api/houses/:id - 下架/删除房源
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT user_id FROM houses WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '房源不存在' });
    }
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限操作该房源' });
    }
    // 改为下架而非物理删除
    await pool.query('UPDATE houses SET status = "offline" WHERE id = ?', [id]);
    res.json({ success: true, message: '房源已下架' });
  } catch (err) {
    console.error('[DELETE /houses/:id]', err);
    res.status(500).json({ success: false, message: '操作失败', error: err.message });
  }
});

// POST /api/houses/:id/favorite - 收藏/取消收藏
router.post('/:id/favorite', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND house_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND house_id = ?', [userId, id]);
      res.json({ success: true, data: { message: '已取消收藏', favorited: false } });
    } else {
      await pool.query('INSERT INTO favorites (user_id, house_id) VALUES (?, ?)', [userId, id]);
      res.json({ success: true, data: { message: '收藏成功', favorited: true } });
    }
  } catch (err) {
    console.error('[POST /houses/:id/favorite]', err);
    res.status(500).json({ success: false, data: { message: '操作失败' } });
  }
});


module.exports = router;
