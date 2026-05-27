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


// POST /api/appointments - 创建预约
router.post('/', authenticate, async (req, res) => {
  console.log("req", req.user)
  const { house_id, appoint_time, remark } = req.body;
  const buyer_id = req.user.id;

  try {
    // 获取房源的 agent_id
    const [house] = await pool.query('SELECT user_id FROM houses WHERE id = ?', [house_id]);
    if (!house.length) {
      return res.status(404).json({ success: false, message: '房源不存在' });
    }
    // const agent_id = house[0].user_id;

    await pool.query(
      'INSERT INTO appointments (house_id, buyer_id, appoint_time, remark) VALUES (?, ?, ?, ?)',
      [house_id, buyer_id, appoint_time, remark || null]
    );
    res.json({ success: true, data: { message: '预约成功' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: { message: '预约失败' } });
  }
})

router.get('/list', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [appointments] = await pool.query(
      `SELECT a.*, 
              h.title AS house_title, 
              h.price AS house_price, 
              h.address AS house_address, 
              h.region AS house_region, 
              h.images AS house_images,
              h.type AS house_type,
              h.status AS house_status
       FROM appointments a 
       LEFT JOIN houses h ON a.house_id = h.id
       WHERE a.buyer_id = ?`,
      [user_id]
    );
    res.json({ success: true, data: { message: '查询成功', list: appointments } })
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: { message: '查询失败' } });
  }

})

router.get('/agent', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [aggents] = await pool.query(`select *,
      u.username as buyer_name,
      h.type as house_type,
      h.images as house_images
      from second_hand_house.appointments a
      left join houses h on a.house_id = h.id 
      left join users u on a.buyer_id = u.id 
      where h.user_id = ?`,
      [user_id]
    )
    res.json({ success: true, data: { list: aggents, message: '查询成功' } })
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: { message: '查询失败' } });
  }
})

router.post('/editAgentStatus', authenticate, async (req, res) => {
  const { id, status } = req.body;
  try {
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id])
    res.json({ success: true, data: { message: '状态更新成功' } })
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: { message: '状态更新失败' } });
  }
})

module.exports = router;