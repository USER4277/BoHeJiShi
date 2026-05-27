#!/bin/bash

# 薄荷集市店铺管理系统 - 状态检查脚本
# 使用方法: ./status.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   薄荷集市店铺管理系统 - 状态检查${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# 检查后端
echo -e "${YELLOW}后端服务:${NC}"
if [ -f "$PROJECT_DIR/logs/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_DIR/logs/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✓ 运行中${NC}"
        echo -e "  PID: $BACKEND_PID"

        # 检查端口
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "  端口: ${GREEN}✓ 3001 已监听${NC}"
        else
            echo -e "  端口: ${RED}✗ 3001 未监听${NC}"
        fi

        # 健康检查
        if curl -s http://localhost:3001/api/auth/me > /dev/null 2>&1; then
            echo -e "  健康: ${GREEN}✓ API响应正常${NC}"
        else
            echo -e "  健康: ${YELLOW}⚠ API无响应${NC}"
        fi
    else
        echo -e "  状态: ${RED}✗ 未运行${NC}"
    fi
else
    echo -e "  状态: ${RED}✗ 未运行 (无PID文件)${NC}"
fi

echo ""

# 检查前端
echo -e "${YELLOW}前端服务:${NC}"
if [ -f "$PROJECT_DIR/logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_DIR/logs/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✓ 运行中${NC}"
        echo -e "  PID: $FRONTEND_PID"

        # 检查端口
        if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "  端口: ${GREEN}✓ 5173 已监听${NC}"
        else
            echo -e "  端口: ${RED}✗ 5173 未监听${NC}"
        fi

        # 健康检查
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo -e "  健康: ${GREEN}✓ 页面响应正常${NC}"
        else
            echo -e "  健康: ${YELLOW}⚠ 页面无响应${NC}"
        fi
    else
        echo -e "  状态: ${RED}✗ 未运行${NC}"
    fi
else
    echo -e "  状态: ${RED}✗ 未运行 (无PID文件)${NC}"
fi

echo ""

# 检查数据库
echo -e "${YELLOW}数据库:${NC}"
DB_FILE="$HOME/Documents/薄荷集市/data/shop.db"
if [ -f "$DB_FILE" ]; then
    DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
    echo -e "  状态: ${GREEN}✓ 存在${NC}"
    echo -e "  大小: $DB_SIZE"
    echo -e "  路径: $DB_FILE"
else
    echo -e "  状态: ${RED}✗ 不存在${NC}"
fi

echo ""

# 日志文件
echo -e "${YELLOW}日志文件:${NC}"
if [ -f "$PROJECT_DIR/logs/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h "$PROJECT_DIR/logs/backend.log" | cut -f1)
    BACKEND_LOG_LINES=$(wc -l < "$PROJECT_DIR/logs/backend.log")
    echo -e "  后端日志: ${GREEN}✓${NC} $BACKEND_LOG_SIZE ($BACKEND_LOG_LINES 行)"
else
    echo -e "  后端日志: ${YELLOW}⚠ 不存在${NC}"
fi

if [ -f "$PROJECT_DIR/logs/frontend.log" ]; then
    FRONTEND_LOG_SIZE=$(du -h "$PROJECT_DIR/logs/frontend.log" | cut -f1)
    FRONTEND_LOG_LINES=$(wc -l < "$PROJECT_DIR/logs/frontend.log")
    echo -e "  前端日志: ${GREEN}✓${NC} $FRONTEND_LOG_SIZE ($FRONTEND_LOG_LINES 行)"
else
    echo -e "  前端日志: ${YELLOW}⚠ 不存在${NC}"
fi

echo ""

# 访问地址
echo -e "${YELLOW}访问地址:${NC}"
echo -e "  前端: ${BLUE}http://localhost:5173${NC}"
echo -e "  后端: ${BLUE}http://localhost:3001/api${NC}"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
