-- 创建数据库
CREATE DATABASE IF NOT EXISTS second_hand_house DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE second_hand_house;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  role ENUM('buyer', 'agent', 'admin') NOT NULL DEFAULT 'buyer' COMMENT '角色',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 房源表
CREATE TABLE IF NOT EXISTS houses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL COMMENT '标题',
  price DECIMAL(12,2) NOT NULL COMMENT '价格（万元）',
  area DECIMAL(8,2) NOT NULL COMMENT '面积（平方米）',
  region VARCHAR(50) NOT NULL COMMENT '地区',
  address VARCHAR(200) DEFAULT NULL COMMENT '详细地址',
  type ENUM('一室', '二室', '三室', '四室', '五室及以上') NOT NULL DEFAULT '二室' COMMENT '户型',
  floor VARCHAR(50) DEFAULT NULL COMMENT '楼层',
  year INT DEFAULT NULL COMMENT '建造年份',
  description TEXT DEFAULT NULL COMMENT '房源描述',
  images JSON DEFAULT NULL COMMENT '图片URL数组',
  status ENUM('active', 'offline', 'pending') NOT NULL DEFAULT 'active' COMMENT '状态',
  user_id INT NOT NULL COMMENT '发布者ID',
  view_count INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  house_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, house_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员账号（密码: admin123）
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- 插入示例房源数据
INSERT INTO users (username, password_hash, role, phone) VALUES
('张三', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'agent', '13800138001'),
('李四', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'buyer', '13800138002');

INSERT INTO houses (title, price, area, region, address, type, floor, year, description, images, user_id) VALUES
('朝阳区精装两居室 近地铁', 320.00, 89.5, '朝阳区', '朝阳区建国路88号', '二室', '12/25层', 2015, '精装修，拎包入住，南北通透，采光好，小区环境优美，配套齐全。', '[]', 2),
('海淀区学区房 三居室', 580.00, 120.0, '海淀区', '海淀区中关村大街1号', '三室', '8/18层', 2010, '优质学区房，周边名校林立，交通便利，近地铁4号线。', '[]', 2),
('西城区老城区二居室', 450.00, 75.0, '西城区', '西城区西单北大街10号', '二室', '5/6层', 2000, '老城区核心地段，生活便利，交通发达，适合自住投资。', '[]', 2),
('顺义区新房 四居室', 280.00, 150.0, '顺义区', '顺义区空港经济区', '四室', '6/11层', 2020, '全新精装，四室两厅两卫，小区绿化好，停车位充足。', '[]', 2),
('丰台区两居室 价格实惠', 180.00, 68.0, '丰台区', '丰台区马家堡东路88号', '二室', '3/7层', 2008, '性价比高，交通便利，近多条地铁线，周边配套完善。', '[]', 2);
