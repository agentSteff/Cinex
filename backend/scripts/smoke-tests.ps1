<#
Simple smoke test script for Cine backend.
Run from PowerShell (in project root):
  cd backend
  .\scripts\smoke-tests.ps1

It performs: health, register/login, profile, optional movie/list/rating flows.
#>

param(
  [string]$BaseUrl = 'http://localhost:5000',
  # Seed creates movies with ids starting at 13 in this environment
  [int]$MovieId = 13
)

function Invoke-Json {
  param($Method, $Url, $Body=$null, $Headers=@{})
  try {
    if ($Body -ne $null) {
      return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ContentType 'application/json' -Body ($Body | ConvertTo-Json -Depth 5)
    } else {
      return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers
    }
  } catch {
    return @{ __error = $_.Exception.Response.StatusCode.Value__  ; __message = $_.Exception.Message }
  }
}

Write-Host "Smoke tests starting against $BaseUrl" -ForegroundColor Cyan

# 1) Health check (try root, then /health)
Write-Host "[1/8] Health check..." -NoNewline
$health = Invoke-Json -Method Get -Url "$BaseUrl/"
if ($health -and ($health.status -eq 'OK' -or $health.message)) { Write-Host " OK" -ForegroundColor Green }
else {
  $health = Invoke-Json -Method Get -Url "$BaseUrl/health"
  if ($health -and $health.status -eq 'OK') { Write-Host " OK" -ForegroundColor Green } else { Write-Host " FAIL" -ForegroundColor Red; Write-Host "Response:"; $health; exit 2 }
}

# 2) Register user
$ts = (Get-Date).ToString('yyyyMMddHHmmss')
$email = "smoke$ts@example.com"
$username = "smoke$ts"
$password = 'Password123'
Write-Host "[2/8] Registering user $email..." -NoNewline
$reg = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/register" -Body @{ email = $email; username = $username; password = $password }
if ($reg -and $reg.token) { Write-Host " OK" -ForegroundColor Green } elseif ($reg.__error -eq 409) { Write-Host " AlreadyExists (will login)" -ForegroundColor Yellow } else { Write-Host " FAIL" -ForegroundColor Red; $reg; exit 3 }

# 3) Login
Write-Host "[3/8] Logging in..." -NoNewline
$login = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/login" -Body @{ email = $email; password = $password }
if ($login -and $login.token) { $token = $login.token; Write-Host " OK" -ForegroundColor Green } else { Write-Host " FAIL" -ForegroundColor Red; $login; exit 4 }
$authHeader = @{ Authorization = "Bearer $token" }

# 4) Perfil
Write-Host "[4/8] Getting profile..." -NoNewline
$perfil = Invoke-Json -Method Get -Url "$BaseUrl/api/auth/perfil" -Headers $authHeader
if ($perfil -and $perfil.id) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " FAIL" -ForegroundColor Red; $perfil; exit 5 }

# 5) Optional: ensure a movie exists (try TMDB popular endpoint, then fallback to local DB)
Write-Host "[5/8] Finding a movie via /api/peliculas/populares (auto-discover)..." -NoNewline
$popResponse = Invoke-Json -Method Get -Url "$BaseUrl/api/peliculas/populares"
$localMovieId = $null
$tmdbMovies = $null
if ($popResponse -and $popResponse.data) { $tmdbMovies = $popResponse.data }

if ($tmdbMovies -is [System.Collections.IEnumerable] -and $tmdbMovies.Count -gt 0) {
  $first = $tmdbMovies[0]
  # Attempt to create a local movie using the TMDB result (some deployments may expose POST /api/peliculas)
  try {
    if ($first.tmdbId) {
      $tryCreate = Invoke-Json -Method Post -Url "$BaseUrl/api/peliculas" -Body @{ titulo = $first.titulo; genero = $first.genero; sinopsis = $first.sinopsis; imagenUrl = $first.imagenUrl; tmdbId = $first.tmdbId } -Headers $authHeader
      if ($tryCreate -and $tryCreate.id) { $localMovieId = $tryCreate.id }
    }
  } catch {
    # ignore create errors and fall back
  }

  if (-not $localMovieId) {
    Write-Host " OK (TMDB results, but could not create local movie)" -ForegroundColor Green
  } else {
    Write-Host " OK (created local movie from TMDB)" -ForegroundColor Green
  }
} else {
  Write-Host " NO TMDB results" -ForegroundColor Yellow
}

if (-not $localMovieId) {
  Write-Host " Falling back to local DB" -ForegroundColor Yellow
  try {
    $nodeOut = node .\scripts\list_peliculas_db.js 2>$null | Out-String
    if ($nodeOut -and $nodeOut.Trim().Length -gt 0) {
      $json = $nodeOut | ConvertFrom-Json
      if ($json -is [System.Collections.IEnumerable] -and $json.Count -gt 0) {
        $localMovieId = $json[0].id
        Write-Host " Found local movie id $localMovieId" -ForegroundColor Green
      } else { Write-Host " No local movies found in DB" -ForegroundColor Yellow }
    } else { Write-Host " Local DB helper produced no output" -ForegroundColor Yellow }
  } catch {
    Write-Host " Fallback to local DB failed (node or script error)" -ForegroundColor Yellow
  }
}

# 6) Lists: add to Por Ver and mark as visto (if we have a movie)
if ($localMovieId -eq $null) { $localMovieId = $MovieId }
Write-Host "[6/8] Add to Por Ver (movie id $localMovieId)..." -NoNewline
$add = Invoke-Json -Method Post -Url "$BaseUrl/api/listas/por-ver/$localMovieId" -Headers $authHeader
if ($add -and ($add.message -or $add.pelicula)) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " WARN/FAIL (may be missing movie or endpoint)"; $add | Format-List; }

Write-Host "[7/8] Mark as vista (movie id $localMovieId)..." -NoNewline
$vista = Invoke-Json -Method Post -Url "$BaseUrl/api/listas/marcar-vista/$localMovieId" -Headers $authHeader
if ($vista -and ($vista.message -or $vista.pelicula)) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " WARN/FAIL"; $vista | Format-List }

# 7) Calificación: create and fetch (use calificaciones endpoints)
Write-Host "[8/8] Create rating for movie $localMovieId..." -NoNewline
# POST /api/calificaciones expects body with peliculaId and puntuacion
$rating = Invoke-Json -Method Post -Url "$BaseUrl/api/calificaciones" -Headers $authHeader -Body @{ peliculaId = $localMovieId; puntuacion = 4; comentario = 'Smoke test' }
if ($rating -and ($rating.calificacion -or $rating.message)) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " WARN/FAIL"; $rating | Format-List }

# Try to fetch my rating via GET /api/calificaciones/mi-calificacion/:peliculaId
$ratingGet = Invoke-Json -Method Get -Url "$BaseUrl/api/calificaciones/mi-calificacion/$localMovieId" -Headers $authHeader
Write-Host "Rating fetch result:"; $ratingGet | Format-List

Write-Host "Smoke tests complete." -ForegroundColor Cyan
