# NeoCart

NeoCart is a comprehensive, full-stack e-commerce application featuring a user-facing storefront, an administrative dashboard, and a robust backend API.

## Live Demo

🚀 **[View the Application Here](https://neocart-frontend.onrender.com/)**

## Project Structure

The repository is organized into three main directories:

- `/frontend` - The customer-facing web application (React).
- `/admin` - The administrative dashboard for managing products, orders, and users.
- `/backend` - The Node.js/Express server that powers both the frontend and admin panel, handling authentication, database operations, and API routing.

## Features

- **User Authentication**: Secure signup, login, and profile management.
- **Product Catalog**: Browse products, view details, and explore related items.
- **Shopping Cart**: Add items to the cart, manage quantities, and proceed to checkout.
- **Order Management**: Place orders and track order history.
- **Admin Dashboard**: Manage inventory, view all user orders, and handle administrative tasks.

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB instance (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd NeoCart
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file and add necessary environment variables (e.g., MongoDB URI, Port, JWT Secret)
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Admin Setup:**
   ```bash
   cd ../admin
   npm install
   npm run dev
   ```

## Technologies Used

- **Frontend & Admin**: React.js, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Deployment**: Render (Frontend hosted at the link above)

## Performance

The backend includes a suite of performance tests located in the `/backend/perf` directory to ensure optimal loading times and API response speeds under various conditions.
