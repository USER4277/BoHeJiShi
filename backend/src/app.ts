import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import os from 'os';

// 创建Express应用
export const app: Express = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// JSON解析
app.use(express.json({ limit: '10mb' }));

// URL编码解析
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 图片上传
const dataDir = path.join(os.homedir(), 'Documents', '薄荷集市', 'data');
app.use('/uploads', express.static(path.join(dataDir, 'images')));

// 打印请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} [${duration}ms]`);
  });
  next();
});

// 导入路由
import routes from './routes';
app.use('/api', routes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '薄荷集市店铺管理系统',
    version: '1.0.0',
    status: 'running'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});