#!/bin/bash

# 薄荷集市店铺管理系统 - 停止脚本
# 使用方法: ./stop.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   薄荷集市店铺管理系统 - 停止服务${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# 停止后端
if [ -f "$PROJECT_DIR/logs/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_DIR/logs/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止后端服务 (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}  强制停止...${NC}"
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}✗ 后端服务未运行${NC}"
    fi
    rm -f "$PROJECT_DIR/logs/backend.pid"
else
    echo -e "${YELLOW}✗ 未找到后端进程文件${NC}"
fi

# 停止前端
if [ -f "$PROJECT_DIR/logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_DIR/logs/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止前端服务 (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 2
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}  强制停止...${NC}"
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ 前端服务已停止${NC}"
    else
        echo -e "${YELLOW}✗ 前端服务未运行${NC}"
    fi
    rm -f "$PROJECT_DIR/logs/frontend.pid"
else
    echo -e "${YELLOW}✗ 未找到前端进程文件${NC}"
fi

# 额外检查端口占用
echo ""
echo -e "${YELLOW}检查端口占用...${NC}"

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  端口 3001 仍被占用，清理中...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  端口 5173 仍被占用，清理中...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
fi

echo -e "${GREEN}✓ 端口已清理${NC}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓ 所有服务已停止${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
