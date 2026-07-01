@echo off
echo ================================================
echo Adding Environment Variables to Vercel
echo ================================================
echo.

echo Adding POSTGRES_URL...
echo postgres://postgres.uyisndbhhzinsxpbxfgy:gFIQ8RSlgKux4BpY@aws-0-us-east-1.pooler.supabase.com:6543/postgres | vercel env add POSTGRES_URL production

echo.
echo Adding CLOUDINARY_CLOUD_NAME...
echo djn3eb2ht | vercel env add CLOUDINARY_CLOUD_NAME production

echo.
echo Adding CLOUDINARY_API_KEY...
echo 538668853245255 | vercel env add CLOUDINARY_API_KEY production

echo.
echo Adding CLOUDINARY_API_SECRET...
echo gLF0dkFsIsi-JtzzTGWh9x90V9g | vercel env add CLOUDINARY_API_SECRET production

echo.
echo Adding RAZORPAY_KEY_ID...
echo rzp_test_T3oq9gSrBCfB3T | vercel env add RAZORPAY_KEY_ID production

echo.
echo Adding RAZORPAY_KEY_SECRET...
echo snCqYA9JvFUUT7aqPNM7nCdg | vercel env add RAZORPAY_KEY_SECRET production

echo.
echo Adding EMAIL_APP_PASSWORD...
echo tvrp vivx nxrt ilho | vercel env add EMAIL_APP_PASSWORD production

echo.
echo Adding ADMIN_PASSWORD...
echo admin123 | vercel env add ADMIN_PASSWORD production

echo.
echo Adding ADMIN_TOKEN...
echo shalom-admin-2026 | vercel env add ADMIN_TOKEN production

echo.
echo ================================================
echo All environment variables added!
echo ================================================
echo.
echo Next steps:
echo 1. Redeploy: vercel --prod
echo 2. Or push to GitHub for auto-deploy
echo ================================================
pause
