# Сброс пароля PostgreSQL на Windows (если пароль забыт)

## Вариант 1 — pgAdmin (без остановки сервера, если помните хотя бы один логин)
1. Откройте pgAdmin (обычно есть в меню Пуск вместе с PostgreSQL).
2. Если подключение к серверу сохранено и работает — ПКМ по серверу → «Свойства» не поможет;
   вместо этого: Login/Group Roles → egypt_user (или postgres) → ПКМ → Reset Password…
3. Если pgAdmin тоже требует пароль и вы его не знаете — переходите к варианту 2.

## Вариант 2 — правка pg_hba.conf (trust) + сброс через psql
Папка данных по умолчанию: C:\Program Files\PostgreSQL\<версия>\data

1. Остановите службу PostgreSQL (PowerShell от администратора):
   Get-Service -Name postgres*   # узнать точное имя службы
   Stop-Service postgresql-x64-17

2. Откройте файл data\pg_hba.conf (от имени администратора, например через Notepad).
   Найдите строки вида:
   host    all    all    127.0.0.1/32    scram-sha-256
   Временно замените метод аутентификации у строк для 127.0.0.1/32 ::1/128
   с scram-sha-256 (или md5) на trust. Сохраните файл.

3. Запустите службу обратно:
   Start-Service postgresql-x64-17

4. Подключитесь без пароля (из папки bin, либо после добавления её в PATH):
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
   Внутри psql выполните (точка с запятой обязательна!):
   ALTER USER postgres WITH PASSWORD 'Strotal398';
   ALTER USER egypt_user WITH PASSWORD 'Strotal398';
   \q

5. ВАЖНО: верните в pg_hba.conf метод scram-sha-256 (trust небезопасен!)
   и снова перезапустите службу:
   Restart-Service postgresql-x64-17

6. Проверьте подключение:
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U egypt_user -d egypt_estate
   (должен запросить пароль, затем показать prompt базы)

## Вариант 3 — установка нового пароля егypt_user из-под postgres
Если вы помните пароль именно от пользователя postgres, но не задавали/забыли
пароль egypt_user:
   psql -U postgres
   ALTER USER egypt_user WITH PASSWORD 'Strotal398';
   \q

## После сброса пароля
1. Добавьте в D:\Qwen_mcp\project\NetWorkers\.env строку:
   DB_PASSWORD=Strotal398
2. Убедитесь, что остальные параметры корректны:
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=egypt_user
   DB_NAME=egypt_estate
3. Перезапустите сервер: npm run start
