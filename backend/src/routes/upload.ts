import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { success, error } from '../utils/response';

const router = Router();

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(os.homedir(), 'Documents', '薄荷集市', 'data', 'images');
    // 确保目录存在
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持图片格式: jpeg, jpg, png, gif, webp'));
  }
});

// 上传图片
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 400, '请选择要上传的图片');
    }
    
    const url = `/uploads/${req.file.filename}`;
    success(res, { url, filename: req.file.filename }, '上传成功');
  } catch (err: any) {
    console.error('上传图片失败:', err);
    error(res, 500, err.message || '上传失败');
  }
});

export default router;