#!/bin/bash

# 薄荷集市店铺管理系统 - 重启脚本
# 使用方法: ./restart.sh

set -e

# 颜色定义
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   薄荷集市店铺管理系统 - 重启服务${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 停止服务
bash "$PROJECT_DIR/stop.sh"

echo ""
echo -e "${GREEN}等待 3 秒...${NC}"
sleep 3

# 启动服务
bash "$PROJECT_DIR/start.sh"
