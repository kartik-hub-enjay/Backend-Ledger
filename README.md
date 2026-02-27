# 🏦 Backend Ledger System

A secure banking backend API built with Node.js that provides user authentication, account management, and financial transaction processing with double-entry bookkeeping.

## ✨ Features

- **User Authentication** - Secure registration/login with JWT tokens
- **Account Management** - Create and manage user accounts
- **Transaction Processing** - Transfer funds between accounts with proper validation
- **Ledger System** - Complete double-entry bookkeeping with automated debit/credit entries
- **Financial Audit Trail** - Every transaction creates corresponding ledger entries for transparency
- **Email Notifications** - Transaction confirmations via email
- **Idempotency** - Prevents duplicate transactions with idempotency keys

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt for password hashing
- **Email:** Nodemailer
- **Environment:** dotenv for configuration

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- SMTP credentials for email service

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kartik-hub-enjay/Backend-Ledger.git
   cd Backend-Ledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file with:
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=mongodb://localhost:27017/banking_app
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email@domain.com
   EMAIL_PASSWORD=your_email_password
   ```

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Accounts
- `POST /api/accounts` - Create account

### Transactions
- `POST /api/transactions` - Transfer funds (creates ledger entries)
- `GET /api/transactions` - Get transaction history

### Ledger
- Automatic ledger entry creation for each transaction
- Debit entries for sender accounts
- Credit entries for receiver accounts
- Complete audit trail maintained

## 🏗️ Transaction & Ledger Flow

The system implements a secure 10-step transfer process with automatic ledger management:
1. Request validation
2. Idempotency key check
3. Account status verification
4. Balance calculation from ledger entries
5. Transaction creation (PENDING status)
6. **Debit ledger entry** - Records money leaving sender account
7. **Credit ledger entry** - Records money entering receiver account
8. Transaction completion (COMPLETED status)
9. Database commit (ensures atomicity)
10. Email notification

> 💡 **Ledger Integrity**: Every financial transaction automatically creates corresponding ledger entries, ensuring perfect accounting balance and complete audit trail.

## 📁 Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── middlewares/     # Authentication middleware
├── models/          # MongoDB schemas (User, Account, Transaction, Ledger)
├── routes/          # API routes
└── services/        # Email service
```

## 🔒 Security & Integrity Features

- **Security**: Password hashing with bcrypt, JWT authentication, input validation
- **Financial Integrity**: Double-entry ledger system ensures accounting accuracy
- **Transaction Safety**: Atomic operations with MongoDB sessions
- **Duplicate Prevention**: Idempotency keys prevent duplicate transactions
- **Audit Trail**: Complete transaction and ledger history for transparency

## 📄 License

This project is licensed under the ISC License.

---

**Server runs on:** `http://localhost:3000`