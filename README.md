# Shalom Fashion - E-Commerce Website

A modern e-commerce platform for fashion clothing with admin panel and inventory management.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

**Access:**
- Website: http://localhost:3001
- Admin Panel: http://localhost:3001/admin
- Default Admin Password: `admin123`

## Features

### Customer Website
- Browse Indian, Western, Bridal & Accessories collections
- Shopping cart with real-time updates
- Multiple payment options (UPI, COD)
- Email order confirmations
- Responsive design for all devices

### Admin Panel
- Product management (Add, Edit, Delete)
- Image upload functionality
- Order management
- Stock tracking & history
- Excel export for orders
- Secure authentication

## Configuration

### Environment Variables (.env)
```env
EMAIL_APP_PASSWORD=your_gmail_app_password
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=shalom-admin-2026
```

## Project Structure

```
shalom-fashion/
├── public/
│   ├── uploads/          # Uploaded product images
│   ├── index.html        # Customer website
│   ├── admin.html        # Admin panel
│   ├── app.js           # Website logic
│   └── styles.css       # Website styles
├── server.js            # Express server
├── database.js          # Orders database
├── products-database.js # Products database
├── products.json        # Product data (persistent)
├── orders.json          # Order data (persistent)
├── .env                 # Configuration
└── package.json         # Dependencies
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: File-based JSON storage
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Features**: File uploads, Email, QR codes, Excel export

## License

Private project for Shalom Fashion
