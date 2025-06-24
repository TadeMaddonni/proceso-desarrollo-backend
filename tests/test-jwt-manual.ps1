# Script de PowerShell para probar la implementación JWT
# Ejecutar con: .\tests\test-jwt-manual.ps1

Write-Host "🔐 Script de pruebas JWT para la API" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$email = "test-jwt-$(Get-Date -Format 'yyyyMMddHHmmss')@email.com"
$password = "password123"

Write-Host "`n1️⃣ Registrando usuario de prueba..." -ForegroundColor Yellow

# Registro
$signupBody = @{
    nombre = "Usuario Test JWT"
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
    Write-Host "✅ Usuario registrado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2️⃣ Haciendo login para obtener token..." -ForegroundColor Yellow

# Login
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login exitoso, token obtenido" -ForegroundColor Green
    Write-Host "🔑 Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Probando ruta protegida SIN token (debería fallar)..." -ForegroundColor Yellow

try {
    $protectedWithoutToken = Invoke-RestMethod -Uri "$baseUrl/api/usuarios" -Method Get
    Write-Host "❌ La ruta protegida debería haber rechazado la petición sin token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Ruta protegida rechaza correctamente peticiones sin token" -ForegroundColor Green
    } else {
        Write-Host "❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n4️⃣ Probando ruta protegida CON token (debería funcionar)..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $protectedWithToken = Invoke-RestMethod -Uri "$baseUrl/api/usuarios" -Method Get -Headers $headers
    Write-Host "✅ Ruta protegida acepta correctamente token válido" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al acceder a ruta protegida con token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5️⃣ Probando ruta con autenticación opcional SIN token..." -ForegroundColor Yellow

try {
    $optionalWithoutToken = Invoke-RestMethod -Uri "$baseUrl/api/deportes" -Method Get
    Write-Host "✅ Ruta con autenticación opcional funciona sin token" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en ruta con autenticación opcional sin token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Probando ruta con autenticación opcional CON token..." -ForegroundColor Yellow

try {
    $optionalWithToken = Invoke-RestMethod -Uri "$baseUrl/api/deportes" -Method Get -Headers $headers
    Write-Host "✅ Ruta con autenticación opcional funciona con token" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en ruta con autenticación opcional con token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7️⃣ Probando operación CRUD protegida (crear deporte)..." -ForegroundColor Yellow

$deporteBody = @{
    nombre = "Deporte Test JWT PowerShell"
} | ConvertTo-Json

try {
    $createDeporte = Invoke-RestMethod -Uri "$baseUrl/api/deportes" -Method Post -Body $deporteBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Creación de deporte con JWT exitosa" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al crear deporte con JWT: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n8️⃣ Probando operación CRUD protegida SIN token (debería fallar)..." -ForegroundColor Yellow

try {
    $createDeporteSinToken = Invoke-RestMethod -Uri "$baseUrl/api/deportes" -Method Post -Body $deporteBody -ContentType "application/json"
    Write-Host "❌ La creación de deporte debería haber sido rechazada sin token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Creación de deporte sin JWT es rechazada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Pruebas completadas!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n📝 Comandos curl equivalentes para pruebas manuales:" -ForegroundColor Gray
Write-Host "# Registro:" -ForegroundColor Gray
Write-Host "curl -X POST $baseUrl/auth/signup -H 'Content-Type: application/json' -d '{\"nombre\":\"Test\",\"email\":\"test@email.com\",\"password\":\"123\"}'" -ForegroundColor Gray
Write-Host "`n# Login:" -ForegroundColor Gray
Write-Host "curl -X POST $baseUrl/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@email.com\",\"password\":\"123\"}'" -ForegroundColor Gray
Write-Host "`n# Ruta protegida:" -ForegroundColor Gray
Write-Host "curl -X GET $baseUrl/api/usuarios -H 'Authorization: Bearer YOUR_TOKEN'" -ForegroundColor Gray
