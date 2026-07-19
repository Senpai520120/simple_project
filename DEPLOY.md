# Деплой на Contabo VPS

Проект разворачивается через Docker Compose: PostgreSQL + backend (FastAPI) + frontend (nginx, отдаёт статику и проксирует `/api` на backend). Понадобится один compose-файл — `docker-compose.prod.yml`.

## 1. Подготовка VPS

Подключитесь по SSH (обычно Ubuntu/Debian на Contabo):

```bash
ssh root@ВАШ_IP
```

Установите Docker и Docker Compose:

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
```

Проверка: `docker compose version`.

## 2. Firewall

Откройте порт 80 (и 22 для SSH, обычно уже открыт):

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw enable
```

(В панели Contabo также убедитесь, что порт 80 не заблокирован на уровне облачного firewall, если он у вас настроен.)

## 3. Клонирование проекта

```bash
apt install -y git
git clone https://github.com/Senpai520120/simple_project.git
cd simple_project
```

## 4. Пароль базы данных

По умолчанию `docker-compose.prod.yml` берёт пароль Postgres из переменной окружения `POSTGRES_PASSWORD` (со значением `postgres` по умолчанию). Для прода задайте свой пароль:

```bash
echo "POSTGRES_PASSWORD=ваш_надёжный_пароль" > .env
```

Docker Compose автоматически подхватит `.env` из текущей директории.

## 5. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
curl http://localhost/api/users
docker compose -f docker-compose.prod.yml ps
```

Сайт будет доступен по адресу `http://ВАШ_IP` (порт 80).

## 6. Домен и HTTPS (опционально)

Если у вас есть домен, направьте A-запись на IP сервера, затем поставьте Certbot прямо на хосте перед контейнером nginx, либо смените порт хостового nginx на 8080 и поставьте отдельный nginx/Caddy с TLS. Самый простой вариант — Caddy:

```bash
apt install -y caddy
```

и настроить `Caddyfile` с `reverse_proxy localhost:80` под вашим доменом (Caddy сам выпустит сертификат Let's Encrypt).

## 7. Обновление после изменений в коде

```bash
cd simple_project
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Полезные команды

```bash
docker compose -f docker-compose.prod.yml logs -f backend   # логи бэкенда
docker compose -f docker-compose.prod.yml down               # остановить всё
docker compose -f docker-compose.prod.yml down -v             # остановить и удалить данные БД
```
