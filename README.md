# SpotSave

**Know exactly where to go, every time.**

SpotSave is a mobile-first platform that solves the campus study spot discovery problem through real-time, crowdsourced availability data.

---

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Setup

**⚠️ IMPORTANT: Read `SECURITY.md` first!**

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/SpotSave.git
cd SpotSave

# 2. Set up environment variables (CRITICAL!)
cp env.example .env
# Edit .env and generate strong passwords (see SECURITY.md)

# 3. Start infrastructure
docker-compose up -d

# 4. Set up backend
cd backend
go mod download
# Run migrations (see backend/README.md)

# 5. Set up mobile app
cd ../mobile
npm install
npm start
```

---

## 📁 Project Structure

```
SpotSaver/
├── backend/          # Go backend (Gin + PostgreSQL + Redis)
├── mobile/           # React Native mobile app
├── docs/             # Complete documentation
├── env.example       # Environment template (COPY TO .env)
├── SECURITY.md       # Security best practices (READ THIS!)
└── docker-compose.yml # Local development infrastructure
```

---

## 📚 Documentation

- **[Project Scope](docs/projectscope.md)** - Overview, goals, tech stack
- **[MVP Specification](docs/mvp.md)** - Technical requirements, database schema
- **[Design System](docs/design.md)** - UI/UX patterns, components
- **[API Specification](docs/api-spec.md)** - Complete API documentation
- **[Security Guide](SECURITY.md)** - **READ THIS BEFORE DEVELOPMENT!**

---

## 🔒 Security

**Before you start development:**

1. ✅ Read `SECURITY.md` completely
2. ✅ Set up `.env` file (never commit this!)
3. ✅ Generate strong passwords using the instructions
4. ✅ Enable pre-commit hooks to prevent secret leaks

**Never commit:**
- `.env` files
- Actual passwords or API keys
- JWT secrets
- AWS credentials

---

## 🛠️ Development

### Backend
```bash
cd backend
go run cmd/server/main.go
```

See `backend/README.md` for full details.

### Mobile App
```bash
cd mobile
npm start
```

See `mobile/README.md` for full details.

---

## 🚢 Deployment

See individual service READMEs:
- `backend/README.md` - Backend deployment
- `mobile/README.md` - Mobile app deployment

---

## 🤝 Contributing

1. Never commit secrets or passwords
2. Follow the coding standards in `.cursorrules`
3. Write tests for new features
4. Update documentation
5. Use conventional commits

---

## 📄 License

[Add your license here]

---

## 🙏 Acknowledgments

Built with:
- Go + Gin Web Framework
- React Native + Expo
- PostgreSQL + PostGIS
- Redis
- Docker

---

**Questions?** Check the docs folder or open an issue!
