# Final Project – Async Web Services (Node.js + MongoDB)

This project implements RESTful Web Services using Express.js and MongoDB (via Mongoose).  
It includes a cost management backend that supports adding expenses, generating reports, and retrieving user info.

---

## 🔧 Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Jest + Supertest (for testing)
- dotenv
- JSDoc (for documentation)

---

## 📦 Project Features

### ✅ API Endpoints

- `POST /api/add` – Add a new cost item  
- `GET /api/report?id={userId}&year={yyyy}&month={mm}` – Get monthly report grouped by category  
- `GET /api/users/:id` – Get user details and total expenses  
- `GET /api/about` – Get names of the project team members  
- `POST /api/addUser` – Add test user (for development/testing only)

---

## 🧪 Testing

Run automated tests with:

```bash
npm test
