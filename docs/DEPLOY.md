# 部署指南 - Render.com

## 前置准备

1. 注册 [Render.com](https://render.com) 账号（可用 GitHub 登录）
2. 注册 [GitHub](https://github.com) 账号（如果没有）

---

## 步骤 1：上传代码到 GitHub

### 1.1 初始化 Git 仓库

```bash
cd /Users/jiaqi/Myprojects/RA/Website_Database

# 初始化 git
git init

# 创建 .gitignore
cat > .gitignore << 'EOF'
node_modules/
__pycache__/
*.pyc
.DS_Store
.env
*.log
frontend/dist/
backend/static/
backend/mab_database.sqlite
EOF

# 添加所有文件
git add .
git commit -m "Initial commit: Antibody Database Explorer"
```

### 1.2 创建 GitHub 仓库

1. 打开 https://github.com/new
2. 仓库名称：`antibody-database` （或你喜欢的名字）
3. 选择 **Private**（私有仓库）
4. 点击 **Create repository**

### 1.3 推送代码

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/antibody-database.git
git branch -M main
git push -u origin main
```

---

## 步骤 2：在 Render 上部署

### 2.1 创建新服务

1. 登录 https://dashboard.render.com
2. 点击 **New** → **Web Service**
3. 选择 **Connect a repository**
4. 授权 Render 访问你的 GitHub
5. 选择 `antibody-database` 仓库

### 2.2 配置服务

填写以下配置：

| 设置项 | 值 |
|--------|-----|
| **Name** | `antibody-database` |
| **Region** | Oregon (US West) 或最近的区域 |
| **Branch** | `main` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r backend/requirements.txt && cd backend && python ingest.py && cd ../frontend && npm install && npm run build && cp -r dist ../backend/static` |
| **Start Command** | `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### 2.3 部署

1. 点击 **Create Web Service**
2. 等待构建完成（首次约 5-10 分钟）
3. 部署成功后会显示 URL，格式类似：`https://antibody-database.onrender.com`

---

## 步骤 3：访问网站

部署成功后，你会得到一个公网 URL，例如：
```
https://antibody-database.onrender.com
```

把这个链接发给 Ian 即可。

---

## 注意事项

### 免费版限制

- 服务闲置 15 分钟后会休眠
- 首次访问（唤醒）需要 30-60 秒
- 每月 750 小时免费额度（足够个人使用）

### 更新部署

每次推送到 `main` 分支，Render 会自动重新部署：

```bash
git add .
git commit -m "Update: xxx"
git push
```

### 查看日志

在 Render Dashboard → 你的服务 → **Logs** 可以查看运行日志。

---

## 常见问题

**Q: 部署失败怎么办？**
A: 查看 Render 的 Build Logs，通常是依赖安装问题。确保 `requirements.txt` 和 `package.json` 都正确。

**Q: 网站打开很慢？**
A: 免费版首次访问需要唤醒服务，等待 30-60 秒后会恢复正常速度。

**Q: 如何更新数据？**
A: 替换 `data/Full_mab_datasets.xlsx` 文件，然后 `git push`，Render 会自动重新生成数据库。

**Q: 为什么不直接上传数据库文件？**
A: SQLite 数据库（144MB）超过 GitHub 100MB 文件限制。我们上传 Excel 源文件（36MB），在部署时自动生成数据库。

---

## 快速命令汇总

```bash
# 首次部署
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/antibody-database.git
git push -u origin main

# 后续更新
git add .
git commit -m "Update: description"
git push
```
