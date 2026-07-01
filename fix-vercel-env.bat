@echo off
echo ================================================
echo FIXING VERCEL ENVIRONMENT VARIABLES
echo ================================================
echo.
echo Removing empty variables and adding correct ones...
echo.

REM Remove all empty variables first
echo Cleaning up empty variables...
vercel env rm ADMIN_PASSWORD production --yes 2>nul
vercel env rm ADMIN_TOKEN production --yes 2>nul
vercel env rm POSTGRES_URL production --yes 2>nul

echo.
echo ================================================
echo Adding correct values...
echo ================================================
echo.

echo [1/9] Adding ADMIN_TOKEN...
echo shalom-admin-2026 | vercel env add ADMIN_TOKEN production

echo.
echo [2/9] Adding ADMIN_PASSWORD...
echo admin123 | vercel env add ADMIN_PASSWORD production

echo.
echo [3/9] Adding CLOUDINARY_CLOUD_NAME...
echo djn3eb2ht | vercel env add CLOUDINARY_CLOUD_NAME production

echo.
echo [4/9] Adding CLOUDINARY_API_KEY...
echo 538668853245255 | vercel env add CLOUDINARY_API_KEY production

echo.
echo [5/9] Adding CLOUDINARY_API_SECRET...
echo gLF0dkFsIsi-JtzzTGWh9x90V9g | vercel env add CLOUDINARY_API_SECRET production

echo.
echo [6/9] Adding RAZORPAY_KEY_ID...
echo rzp_test_T3oq9gSrBCfB3T | vercel env add RAZORPAY_KEY_ID production

echo.
echo [7/9] Adding RAZORPAY_KEY_SECRET...
echo snCqYA9JvFUUT7aqPNM7nCdg | vercel env add RAZORPAY_KEY_SECRET production

echo.
echo [8/9] Adding EMAIL_APP_PASSWORD...
echo tvrp vivx nxrt ilho | vercel env add EMAIL_APP_PASSWORD production

echo.
echo [9/9] Adding POSTGRES_URL...
echo postgres://postgres.uyisndbhhzinsxpbxfgy:gFIQ8RSlgKux4BpY@aws-0-us-east-1.pooler.supabase.com:6543/postgres | vercel env add POSTGRES_URL production

echo.
echo ================================================
echo DONE! All environment variables updated!
echo ================================================
echo.
echo Now deploying with correct variables...
vercel --prod

echo.
echo ================================================
echo DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Test your admin panel at:
echo https://shalom-six.vercel.app/admin.html
echo.
echo Login with:
echo Password: admin123
echo Token: shalom-admin-2026
echo ================================================
pause
