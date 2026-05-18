const jwt = require('jsonwebtoken');

/**
 * JWT 鉴权中间件
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录，请先登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期，请重新登录' });
  }
};

/**
 * 管理员权限中间件（必须先经过 authenticate）
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '权限不足，需要管理员权限' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
