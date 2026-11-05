# Inventory Management System

A full-stack **MERN** web application for managing product inventory. Users can add, view, update and delete products, with all data stored in a cloud-hosted MongoDB Atlas database.

| | Link |
|---|---|
| **Live app (Frontend)** | https://inventory-management-system-two-murex.vercel.app/ |
| **Live API (Backend)** | https://inventory-management-system-gyj2.onrender.com |

> The backend runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.

---

## Screenshots

**Home**

![Home page](screenshots/home.png)

**Products inventory**

![Products page](screenshots/products.png)

**About**

![About page](screenshots/about.png)

---

## Features

- Create new products (name, price, barcode)
- View all products in a table
- Update an existing product
- Delete a product
- Responsive Bootstrap interface
- Data stored persistently in MongoDB Atlas
- Frontend and backend deployed independently

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (ES6+) |
| Frontend | React 18, React Router v6, Bootstrap 5, Font Awesome |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, with Mongoose ODM |
| Tools | Postman or browser for API testing, MongoDB Compass for viewing data |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Architecture and Web Flow

```
┌──────────────┐    HTTPS (JSON)    ┌──────────────────┐    Mongoose    ┌─────────────────┐
│   Browser    │ ─────────────────► │  Express API     │ ─────────────► │  MongoDB Atlas  │
│  React App   │ ◄───────────────── │  (Node.js)       │ ◄───────────── │  (IMS database) │
│  on Vercel   │                    │  on Render       │                │                 │
└──────────────┘                    └──────────────────┘                └─────────────────┘
```

**How a request flows**

1. The user opens the React app (served by Vercel) and interacts with a page, for example by clicking **Add New Product**.
2. The React component sends an HTTP request using `fetch` to the backend URL stored in the `REACT_APP_API_URL` environment variable.
3. The Express server on Render receives the request, and the matching route handler runs.
4. The handler uses a Mongoose model to read or write data in MongoDB Atlas.
5. The database result goes back through Express as a JSON response.
6. React receives the response and updates the page.

CORS is enabled on the backend so the Vercel-hosted frontend is allowed to call the Render-hosted API.

---

## Project Structure

```
.
├── Backend/
│   ├── index.js          # Express server entry point
│   ├── db.js             # MongoDB Atlas connection
│   ├── Models/
│   │   └── Products.js   # Mongoose schema
│   ├── Routes/
│   │   └── router.js     # API routes
│   └── package.json
│
└── Frontend/
    └── inventory_management_system/
        ├── public/
        └── src/
            ├── App.js            # Routes and layout
            ├── config.js         # API base URL
            └── components/
                ├── Navbar.js
                ├── Home.js
                ├── About.js
                ├── Products.js        # List and delete
                ├── InsertProduct.js   # Add form
                └── UpdateProduct.js   # Edit form
```

---

## Data Model

**Products** collection:

| Field | Type | Required |
|---|---|---|
| `ProductName` | String | Yes |
| `ProductPrice` | Number | Yes |
| `ProductBarcode` | Number | Yes |

---

## API Endpoints

Base URL: `https://inventory-management-system-gyj2.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Get all products |
| `GET` | `/products/:id` | Get one product by ID |
| `POST` | `/insertproduct` | Add a new product |
| `PUT` | `/updateproduct/:id` | Update a product |
| `DELETE` | `/deleteproduct/:id` | Delete a product |

**Example request body** (`POST /insertproduct`):

```json
{
  "ProductName": "Socks",
  "ProductPrice": 80,
  "ProductBarcode": 8514
}
```

---

## Running Locally

### Prerequisites

- Node.js (v16 or later) and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and its connection string

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

### 2. Set up the backend

```bash
cd Backend
npm install
```

Create a file named `.env` inside `Backend/`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/IMS?retryWrites=true&w=majority
```

Start the server:

```bash
npm run server
```

The API runs on `http://localhost:3001`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd Frontend/inventory_management_system
npm install
npm start
```

The app opens at `http://localhost:3000`. By default it talks to `http://localhost:3001`. To point it at a different backend, create `Frontend/inventory_management_system/.env`:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

Restart `npm start` after changing it.

---

## Deployment

| Part | Platform | Key settings |
|---|---|---|
| Database | MongoDB Atlas | Database user created, network access allows Render's servers |
| Backend | Render (Web Service) | Root directory `Backend`, build `npm install`, start `npm start`, env var `MONGO_URI` |
| Frontend | Vercel | Root directory `Frontend/inventory_management_system`, env var `REACT_APP_API_URL` set to the Render URL |

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `PORT` | Backend | Provided automatically by Render |
| `REACT_APP_API_URL` | Frontend | Base URL of the backend API |


---

## Future Improvements

- Working search and filtering on the products table
- User authentication
- Stock quantity and low-stock alerts
- Input validation and clearer error messages

