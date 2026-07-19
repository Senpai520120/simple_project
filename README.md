# User Management

Простое веб-приложение для управления пользователями: backend на Python (FastAPI + PostgreSQL), frontend на чистом HTML/CSS/JS.

## База данных

Локально через Docker:

```bash
docker compose up -d
```

Поднимет PostgreSQL на `localhost:5433` (база `simple_project_db`, пользователь/пароль `postgres`/`postgres`). Порт 5433 выбран, чтобы не конфликтовать с локально установленным PostgreSQL на стандартном 5432.

Если нужно подключиться к другой базе, задайте переменную окружения `DATABASE_URL` (см. `backend/.env.example`).

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API будет доступно на `http://127.0.0.1:8000`. Документация Swagger: `http://127.0.0.1:8000/docs`.

## Frontend

Просто откройте `frontend/index.html` в браузере, либо запустите локальный сервер:

```bash
cd frontend
python -m http.server 5500
```

Затем откройте `http://127.0.0.1:5500`.

## API

- `GET /api/users` — список пользователей
- `GET /api/users/{id}` — получить пользователя
- `POST /api/users` — создать пользователя
- `PUT /api/users/{id}` — обновить пользователя
- `DELETE /api/users/{id}` — удалить пользователя
