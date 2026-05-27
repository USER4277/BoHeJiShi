#!/bin/bash

# 薄荷集市店铺管理系统 - 一键启动脚本
# 使用方法: ./start.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$HOME/Documents/薄荷集市"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   薄荷集市店铺管理系统 - 一键启动脚本${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# 1. 检查 Node.js
echo -e "${YELLOW}[1/7]${NC} 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js 未安装${NC}"
    echo "请先安装 Node.js 20.x: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 版本过低 (需要 >= 18)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# 2. 检查并创建数据目录
echo -e "${YELLOW}[2/7]${NC} 检查数据存储目录..."
if [ ! -d "$DATA_DIR" ]; then
    echo "  创建数据目录..."
    cd "$PROJECT_DIR/backend"
    npx tsx src/scripts/init-dirs.ts
fi
echo -e "${GREEN}✓ 数据目录就绪${NC}"

# 3. 安装后端依赖
echo -e "${YELLOW}[3/7]${NC} 检查后端依赖..."
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
    echo "  安装后端依赖..."
    npm install --silent
else
    echo -e "${GREEN}✓ 后端依赖已安装${NC}"
fi

# 4. 初始化数据库
echo -e "${YELLOW}[4/7]${NC} 检查数据库..."
DB_FILE="$DATA_DIR/data/shop.db"
if [ ! -f "$DB_FILE" ]; then
    echo "  初始化数据库..."
    npx prisma generate > /dev/null 2>&1
    npx prisma db push > /dev/null 2>&1
    echo "  创建管理员账户..."
    npx tsx src/scripts/init-admin.ts
    echo -e "${GREEN}✓ 数据库初始化完成${NC}"
else
    echo -e "${GREEN}✓ 数据库已存在${NC}"
fi

# 5. 安装前端依赖
echo -e "${YELLOW}[5/7]${NC} 检查前端依赖..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "  安装前端依赖..."
    npm install --silent
else
    echo -e "${GREEN}✓ 前端依赖已安装${NC}"
fi

# 6. 启动后端服务
echo -e "${YELLOW}[6/7]${NC} 启动后端服务..."
cd "$PROJECT_DIR/backend"

# 检查端口占用
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}  端口 3001 已被占用，尝试停止旧进程...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 确保日志目录存在
mkdir -p "$PROJECT_DIR/logs"

# 启动后端
nohup npm run dev > "$PROJECT_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_DIR/logs/backend.pid"
echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"

# 等待后端启动
echo "  等待后端服务就绪..."
sleep 5

# 检查后端是否正常运行
if curl -s http://localhost:3001/api/auth/me > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务健康检查通过${NC}"
else
    echo -e "${YELLOW}  后端服务可能需要更多时间启动...${NC}"
fi

# 7. 启动前端服务
echo -e "${YELLOW}[7/7]${NC} 启动前端服务..."
cd "$PROJECT_DIR/frontend"

# 检查端口占用
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}  端口 5173 已被占用，尝试停止旧进程...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动前端
nohup npm run dev > "$PROJECT_DIR/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_DIR/logs/frontend.pid"
echo -e "${GREEN}✓ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"

# 等待前端启动
echo "  等待前端服务就绪..."
sleep 5

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 系统启动成功！${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  前端: ${GREEN}http://localhost:5173${NC}"
echo -e "  后端: ${GREEN}http://localhost:3001/api${NC}"
echo ""
echo -e "${BLUE}默认账户:${NC}"
echo -e "  用户名: ${GREEN}admin${NC}"
echo -e "  密码:   ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}进程信息:${NC}"
echo -e "  后端PID: ${GREEN}$BACKEND_PID${NC}"
echo -e "  前端PID: ${GREEN}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}日志文件:${NC}"
echo -e "  后端日志: ${PROJECT_DIR}/logs/backend.log"
echo -e "  前端日志: ${PROJECT_DIR}/logs/frontend.log"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo -e "  查看后端日志: ${GREEN}tail -f $PROJECT_DIR/logs/backend.log${NC}"
echo -e "  查看前端日志: ${GREEN}tail -f $PROJECT_DIR/logs/frontend.log${NC}"
echo -e "  停止服务:     ${GREEN}./stop.sh${NC}"
echo -e "  重启服务:     ${GREEN}./restart.sh${NC}"
echo ""
echo -e "${BLUE}正在打开浏览器...${NC}"
sleep 2

# 自动打开浏览器
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo -e "${GREEN}✓ 完成${NC}"
