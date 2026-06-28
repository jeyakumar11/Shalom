@echo off
REM ═══════════════════════════════════════════════════════════════
REM Shalom Fashion - Complete Vercel Deployment Script
REM ═══════════════════════════════════════════════════════════════

chcp 65001 >nul 2>&1
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║       Shalom Fashion - Vercel Deployment Tool            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI is not installed!
    echo.
    echo Installing Vercel CLI globally...
    call npm install -g vercel
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Vercel CLI
        echo.
        echo Please install manually by running:
        echo   npm install -g vercel
        echo.
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI installed successfully
    echo.
)

echo ✅ Vercel CLI is installed
echo.

REM Check login status
echo Checking Vercel authentication...
call vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 🔑 Please login to Vercel
    echo Browser will open for authentication...
    echo.
    pause
    call vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Login failed
        pause
        exit /b 1
    )
)

echo ✅ Authenticated with Vercel
echo.

REM Menu
:MENU
echo ═══════════════════════════════════════════════════════════
echo What would you like to do?
echo ═══════════════════════════════════════════════════════════
echo.
echo [1] Setup Environment Variables (First Time)
echo [2] Deploy to Preview (Test)
echo [3] Deploy to Production
echo [4] View Environment Variables
echo [5] View Deployment Logs
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto SETUP_ENV
if "%choice%"=="2" goto DEPLOY_PREVIEW
if "%choice%"=="3" goto DEPLOY_PROD
if "%choice%"=="4" goto VIEW_ENV
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" goto END

echo Invalid choice, please try again.
echo.
goto MENU

:SETUP_ENV
echo.
echo ═══════════════════════════════════════════════════════════
echo Setting Up Environment Variables
echo ═══════════════════════════════════════════════════════════
echo.
echo Your environment variables from .env file:
echo.
echo   RAZORPAY_KEY_ID=rzp_test_T3oq9gSrBCfB3T
echo   RAZORPAY_KEY_SECRET=snCqYA9JvFUUT7aqPNM7nCdg
echo   EMAIL_APP_PASSWORD=tvrp vivx nxrt ilho
echo   ADMIN_PASSWORD=admin123
echo   ADMIN_TOKEN=shalom-admin-2026
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Choose where to apply these variables:
echo   1 = Production only
echo   2 = Production + Preview
echo   3 = All (Production + Preview + Development) [RECOMMENDED]
echo.
set /p env_scope="Enter choice (1-3): "

set ENV_FLAGS=
if "%env_scope%"=="1" set ENV_FLAGS=production
if "%env_scope%"=="2" set ENV_FLAGS=production preview
if "%env_scope%"=="3" set ENV_FLAGS=production preview development

echo.
echo Adding environment variables...
echo.

REM Add each variable with proper error handling
echo [1/5] Adding RAZORPAY_KEY_ID...
echo rzp_test_T3oq9gSrBCfB3T | call vercel env add RAZORPAY_KEY_ID %ENV_FLAGS% 2>nul
if %ERRORLEVEL% EQU 0 (echo ✅ Added) else (echo ⚠️  Already exists or error)

echo [2/5] Adding RAZORPAY_KEY_SECRET...
echo snCqYA9JvFUUT7aqPNM7nCdg | call vercel env add RAZORPAY_KEY_SECRET %ENV_FLAGS% 2>nul
if %ERRORLEVEL% EQU 0 (echo ✅ Added) else (echo ⚠️  Already exists or error)

echo [3/5] Adding EMAIL_APP_PASSWORD...
echo tvrp vivx nxrt ilho | call vercel env add EMAIL_APP_PASSWORD %ENV_FLAGS% 2>nul
if %ERRORLEVEL% EQU 0 (echo ✅ Added) else (echo ⚠️  Already exists or error)

echo [4/5] Adding ADMIN_PASSWORD...
echo admin123 | call vercel env add ADMIN_PASSWORD %ENV_FLAGS% 2>nul
if %ERRORLEVEL% EQU 0 (echo ✅ Added) else (echo ⚠️  Already exists or error)

echo [5/5] Adding ADMIN_TOKEN...
echo shalom-admin-2026 | call vercel env add ADMIN_TOKEN %ENV_FLAGS% 2>nul
if %ERRORLEVEL% EQU 0 (echo ✅ Added) else (echo ⚠️  Already exists or error)

echo.
echo ✅ Environment variable setup complete!
echo.
echo Verifying variables...
call vercel env ls

echo.
pause
goto MENU

:DEPLOY_PREVIEW
echo.
echo ═══════════════════════════════════════════════════════════
echo Deploying to Preview (Test Environment)
echo ═══════════════════════════════════════════════════════════
echo.
echo This will create a test deployment URL you can share.
echo It will NOT affect your production site.
echo.
pause

call vercel

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Preview deployment successful!
    echo.
    echo Your preview URL is shown above.
    echo Test it thoroughly before deploying to production.
) else (
    echo.
    echo ❌ Deployment failed
    echo Check the errors above.
)

echo.
pause
goto MENU

:DEPLOY_PROD
echo.
echo ═══════════════════════════════════════════════════════════
echo Deploying to PRODUCTION
echo ═══════════════════════════════════════════════════════════
echo.
echo ⚠️  WARNING: This will deploy to your live production URL!
echo.
echo Before deploying, make sure:
echo   ✓ Environment variables are set (Option 1)
echo   ✓ You tested with Preview deployment (Option 2)
echo   ✓ All features work correctly
echo.
set /p confirm="Are you sure you want to deploy to PRODUCTION? (y/n): "

if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    echo.
    pause
    goto MENU
)

echo.
echo Deploying to production...
call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Production deployment successful!
    echo.
    echo Your site is now LIVE at the URL shown above.
    echo.
    echo Next steps:
    echo   - Test the live site thoroughly
    echo   - Check admin panel login
    echo   - Test payment flows
    echo   - Verify order placement
) else (
    echo.
    echo ❌ Deployment failed
    echo Check the errors above.
)

echo.
pause
goto MENU

:VIEW_ENV
echo.
echo ═══════════════════════════════════════════════════════════
echo Current Environment Variables
echo ═══════════════════════════════════════════════════════════
echo.
call vercel env ls
echo.
pause
goto MENU

:VIEW_LOGS
echo.
echo ═══════════════════════════════════════════════════════════
echo Deployment Logs (Real-time)
echo ═══════════════════════════════════════════════════════════
echo.
echo Press Ctrl+C to stop viewing logs
echo.
pause
call vercel logs --follow
echo.
pause
goto MENU

:END
echo.
echo ═══════════════════════════════════════════════════════════
echo Thank you for using Vercel Deployment Tool!
echo ═══════════════════════════════════════════════════════════
echo.
echo Quick Commands Reference:
echo   vercel              - Deploy to preview
echo   vercel --prod       - Deploy to production
echo   vercel env ls       - List environment variables
echo   vercel logs         - View deployment logs
echo   vercel inspect      - View project details
echo.
pause
exit /b 0
