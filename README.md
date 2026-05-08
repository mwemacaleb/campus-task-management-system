# Campus Task Management System

A comprehensive platform designed for university campuses to manage tasks, bidding, and community services. This repository contains both the frontend and backend applications.

## 📁 Repository Structure

- **/campus-task-hub-main**: The frontend application built with React and Vite.
- **/community-tasker-master**: The backend API built with Django.

---

## 🚀 Frontend: Campus Task Hub

A modern, responsive task marketplace where students can post tasks, bid on jobs, and manage their campus life.

### Features
- **Task Marketplace**: Browse and post campus tasks.
- **Bidding System**: Real-time bidding on available tasks.
- **User Dashboards**: Separate views for Residents and Taskers.
- **Wallet & Payments**: Manage earnings and task payments.
- **Profile Management**: Customizable user profiles and verification.

### Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Getting Started (Frontend)
```bash
cd campus-task-hub-main
npm install
npm run dev
```

---

## ⚙️ Backend: Community Tasker

A robust REST API that handles user authentication, task management, bidding logic, and reviews.

### Features
- **Authentication**: Custom user accounts and roles.
- **Task Management**: CRUD operations for tasks and categories.
- **Bidding Logic**: Secure handling of task bids and selections.
- **Reviews & Ratings**: System for community feedback.
- **CORS Enabled**: Configured for seamless frontend integration.

### Tech Stack
- **Framework**: Django 5.x / 6.x
- **API**: Django REST Framework (DRF)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Middleware**: Django-cors-headers

### Getting Started (Backend)
```bash
cd community-tasker-master
# Create a virtual environment
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Run migrations
python manage.py migrate
# Start server
python manage.py runserver
```

---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the MIT License.
