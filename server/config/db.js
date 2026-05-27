const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'cj950212',
  database: process.env.DB_NAME || 'second_hand_house',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00',
  charset: 'utf8mb4'
});

// 测试数据库连接
pool.getConnection()
  .then(conn => {
    console.log('✅ 数据库连接成功');
    conn.release();
  })
  .catch(err => {
    console.error('❌ 数据库连接失败:', err.message);
  });

module.exports = pool;
