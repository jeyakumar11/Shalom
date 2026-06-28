@echo off
REM ═══════════════════════════════════════════════════════════════
REM Vercel Environment Variables Setup Script
REM ═══════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   Shalom Fashion - Vercel Environment Setup              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI is not installed!
    echo.
    echo Installing Vercel CLI...
    npm install -g vercel
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Vercel CLI
        echo Please install manually: npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI found
echo.

REM Check if user is logged in
echo Checking Vercel login status...
vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 🔑 You need to login to Vercel
    echo Opening browser for login...
    echo.
    vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
)

echo ✅ Logged in to Vercel
echo.

echo ═══════════════════════════════════════════════════════════
echo Setting up Environment Variables
echo ═══════════════════════════════════════════════════════════
echo.
echo This script will add environment variables from your .env file
echo to Vercel. You'll need to select which environments to apply
echo them to (Production, Preview, Development).
echo.
echo 💡 TIP: Select ALL environments by pressing Enter for each
echo.
pause

echo.
echo [1/5] Adding RAZORPAY_KEY_ID...
echo rzp_test_T3oq9gSrBCfB3T | vercel env add RAZORPAY_KEY_ID

echo.
echo [2/5] Adding RAZORPAY_KEY_SECRET...
echo snCqYA9JvFUUT7aqPNM7nCdg | vercel env add RAZORPAY_KEY_SECRET

echo.
echo [3/5] Adding EMAIL_APP_PASSWORD...
echo tvrp vivx nxrt ilho | vercel env add EMAIL_APP_PASSWORD

echo.
echo [4/5] Adding ADMIN_PASSWORD...
echo admin123 | vercel env add ADMIN_PASSWORD

echo.
echo [5/5] Adding ADMIN_TOKEN...
echo shalom-admin-2026 | vercel env add ADMIN_TOKEN

echo.
echo ═══════════════════════════════════════════════════════════
echo Verifying Environment Variables
echo ═══════════════════════════════════════════════════════════
echo.

vercel env ls

echo.
echo ✅ Environment variables setup complete!
echo.
echo Next steps:
echo   1. Deploy to Vercel: vercel --prod
echo   2. Check deployment: vercel logs
echo.
pause
