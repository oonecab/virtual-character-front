# 数据库配置说明

## 1. MySQL 数据库配置

### 前置条件
- 确保已安装 MySQL 服务器
- 确保 MySQL 服务正在运行

### 配置步骤

1. **更新数据库连接配置**
   
   编辑项目根目录下的 `.env` 文件，更新 `DATABASE_URL` 为你的实际 MySQL 连接信息：
   
   ```env
   # 格式: mysql://用户名:密码@主机:端口/数据库名
   DATABASE_URL="mysql://root:your_password@localhost:3306/react_demo"
   ```
   
   **示例配置：**
   - 如果你的 MySQL root 用户有密码：`mysql://root:123456@localhost:3306/react_demo`
   - 如果你的 MySQL root 用户没有密码：`mysql://root:@localhost:3306/react_demo`
   - 如果使用其他用户：`mysql://myuser:mypassword@localhost:3306/react_demo`

2. **创建数据库**
   
   连接到 MySQL 服务器并创建数据库：
   
   ```sql
   CREATE DATABASE IF NOT EXISTS react_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **推送数据库结构**
   
   在项目根目录运行以下命令：
   
   ```bash
   npx prisma db push
   ```

4. **生成 Prisma 客户端**
   
   ```bash
   npx prisma generate
   ```

5. **插入默认数据（可选）**
   
   可以手动执行以下 SQL 创建默认管理员用户：
   
   ```sql
   INSERT INTO t_user (username, password, real_name, phone, mail, create_time, update_time, del_flag) 
   VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理员', '13800138000', 'admin@example.com', NOW(), NOW(), 0);
   ```
   
   **默认管理员账号：**
   - 用户名：`admin`
   - 密码：`password123`
   - **重要：首次登录后请立即修改密码！**

## 2. 常见问题解决

### 连接失败问题

1. **认证失败 (P1000)**
   - 检查用户名和密码是否正确
   - 确认 MySQL 用户是否存在且有相应权限
   - 尝试在命令行中测试连接：`mysql -u root -p`

2. **数据库不存在**
   - 手动创建数据库：`CREATE DATABASE react_demo;`
   - 或者修改 `.env` 中的数据库名为已存在的数据库

3. **端口问题**
   - 确认 MySQL 服务运行在正确的端口（默认 3306）
   - 检查防火墙设置

### MySQL 服务管理

**Windows:**
```bash
# 启动 MySQL 服务
net start mysql

# 停止 MySQL 服务
net stop mysql
```

**macOS (使用 Homebrew):**
```bash
# 启动 MySQL 服务
brew services start mysql

# 停止 MySQL 服务
brew services stop mysql
```

**Linux:**
```bash
# 启动 MySQL 服务
sudo systemctl start mysql

# 停止 MySQL 服务
sudo systemctl stop mysql
```

## 3. 验证配置

配置完成后，可以通过以下方式验证：

1. **检查数据库连接**
   ```bash
   npx prisma db pull
   ```

2. **查看数据库结构**
   ```bash
   npx prisma studio
   ```
   这将打开 Prisma Studio 可视化界面

3. **测试 API 接口**
   启动开发服务器后，可以测试用户注册和登录功能

## 4. API 接口说明

配置完成后，以下 API 接口将可用：

- `POST /api/xunzhi/v1/users/register` - 用户注册
- `POST /api/xunzhi/v1/users/login` - 用户登录
- `GET /api/xunzhi/v1/users/has-username?username=xxx` - 检查用户名是否存在
- `GET /api/xunzhi/v1/users/[username]` - 根据用户名查询用户信息
- `GET /api/xunzhi/v1/users` - 获取用户列表（分页）
- `GET /api/xunzhi/v1/users/[id]` - 根据ID查询用户信息
- `PUT /api/xunzhi/v1/users/[id]` - 更新用户信息
- `DELETE /api/xunzhi/v1/users/[id]` - 删除用户（软删除）

所有接口都遵循统一的响应格式，包含 `code`、`message`、`data` 和 `requestId` 字段。