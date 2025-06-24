@echo off
echo 🔐 Script de pruebas JWT para la API
echo ====================================

set BASE_URL=http://localhost:3000
set EMAIL=test-jwt-%RANDOM%@email.com
set PASSWORD=password123

echo.
echo 1️⃣ Probando endpoint de salud...
curl -s %BASE_URL%/health
echo.

echo.
echo 2️⃣ Registrando usuario de prueba...
curl -X POST %BASE_URL%/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Usuario Test JWT\",\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"
echo.

echo.
echo 3️⃣ Haciendo login para obtener token...
echo Guardando respuesta en temp_login.json...
curl -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}" ^
  -o temp_login.json
echo.
echo Respuesta del login:
type temp_login.json
echo.

echo.
echo 4️⃣ Probando ruta protegida SIN token (debería fallar con 401)...
curl -X GET %BASE_URL%/api/usuarios -w "Status: %%{http_code}\n"
echo.

echo.
echo 5️⃣ Probando ruta con autenticación opcional SIN token...
curl -X GET %BASE_URL%/api/deportes -w "Status: %%{http_code}\n"
echo.

echo.
echo 6️⃣ Probando creación de deporte SIN token (debería fallar con 401)...
curl -X POST %BASE_URL%/api/deportes ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Deporte Test\"}" ^
  -w "Status: %%{http_code}\n"
echo.

echo.
echo ⚠️  Para probar con token JWT:
echo 1. Copia el token del archivo temp_login.json
echo 2. Ejecuta: curl -X GET %BASE_URL%/api/usuarios -H "Authorization: Bearer TU_TOKEN"
echo 3. Ejecuta: curl -X POST %BASE_URL%/api/deportes -H "Authorization: Bearer TU_TOKEN" -H "Content-Type: application/json" -d "{\"nombre\":\"Deporte Con Token\"}"

echo.
echo 🎉 Pruebas básicas completadas!
echo Revisa temp_login.json para obtener el token JWT

del temp_login.json 2>nul
