-----

# Full-Stack CRM Application

This is a comprehensive, full-stack Customer Relationship Management (CRM) application built from the ground up. It features a modern, interactive frontend built with **React** and a robust backend API powered by **Node.js** and **Express**, with data persisted in a **PostgreSQL** database. The entire application is containerized with **Docker** for easy setup and deployment.

## Key Features

The application is designed with a role-based access control system, providing different features based on the logged-in user's role (e.g., Sales, Sales Manager, Product Manager, Supervisor).

### 📊 Dashboard & Analytics

  * **Dynamic Stat Cards**: A high-level overview of key metrics like New Leads, Open Opportunities, and Tasks Due Today. The data is filtered based on the user's role.
  * **Interactive Charts**: Visualizations for sales performance and lead conversion funnels.
  * **Recent Activity Feed**: A timeline of the latest events, such as new leads and won deals.
  * **Analytics Page**: A dedicated reporting page showing sales summaries, top-performing sales reps, and top-selling products.

### 💼 Sales & Customer Management

  * **Lead Management**: A full CRUD interface for managing leads, with sorting, searching, and pagination.
  * **Lead Conversion Workflow**: A one-click action to convert a qualified lead into a new Customer and a new Deal in the sales pipeline.
  * **Visual Sales Pipeline**: An interactive drag-and-drop board to manage deals across different sales stages (New, Qualifying, Proposal, Won, Lost).
  * **Deal Details**: A comprehensive modal view for each deal, showing linked products, notes, and attachments.
  * **Customer Management**: A full CRUD interface for managing customer accounts, with a 360-degree view of contacts, notes, and associated deals.

### 📦 Product & Quote Management

  * **Product Catalog**: A searchable and filterable catalog of all company products and services.
  * **Product Attachments**: Ability to add and manage attachments (e.g., datasheets, marketing materials) for each product.
  * **Product Requests**: A workflow for sales users to request new products from within a deal. Product managers can review, approve, and convert these requests into actual products.
  * **Quote Creation**: A seamless process to create a new quote directly from a deal, which automatically pre-populates linked products and customer information.

### 👤 User & Account Management

  * **Secure Authentication**: A complete login system using JSON Web Tokens (JWT) with secure password hashing (`bcryptjs`).
  * **Role-Based Access Control**: Menus and actions are dynamically shown or hidden based on the user's role (e.g., only supervisors can access User Management).
  * **User Management Page**: A secure page for supervisors to create, edit, and delete user accounts.
  * **Password Reset**: Supervisors can reset passwords for other users.
  * **User Profile Page**: Users can update their own profile information and change their password.
  * **Settings Page**: Includes user-specific settings like a **Dark Mode** toggle, with preferences saved in the browser.

## Tech Stack

#### **Backend**

  * **Node.js** with **Express.js** for the API server.
  * **PostgreSQL** for the relational database.
  * **JSON Web Tokens (JWT)** for secure authentication.
  * **bcrypt.js** for password hashing.
  * **Multer** for handling file uploads.

#### **Frontend**

  * **React** for building the user interface.
  * **React Router** for page navigation.
  * **Axios** for making API calls.
  * **React Dropzone** for drag-and-drop file uploads.
  * **Chart.js** with **react-chartjs-2** for data visualization.
  * **Bootstrap 5** for styling and layout.

#### **DevOps**

  * **Docker** and **Docker Compose** for containerizing the entire application stack (frontend, backend, database).

-----

## Installation & Setup

This application is fully containerized, making the setup process straightforward.

### 1\. Prerequisites

  * **Git**
  * **Docker** and **Docker Compose**

### 2\. Installation Steps

**1. Clone the Repository**
Open your terminal and clone the project:

```bash
git clone https://github.com/your-username/your-crm-repo.git
cd your-crm-repo
```

**2. Create the Environment File**
Create a new file named `.env` in the root directory of the project. Copy and paste the following content into it, replacing the placeholder values.

```env
# PostgreSQL Database Credentials
DB_USER=crm_user
DB_PASSWORD=your_secure_password
DB_DATABASE=crm_db
DB_HOST=db
DB_PORT=5432

# Backend Server Port
PORT=5000

# JSON Web Token Secret
JWT_SECRET=your_super_secret_key_that_is_long_and_random
```

### 3\. Running the Application

**1. Build and Run Containers**
In your terminal, from the project's root directory, run:

```bash
docker-compose up --build
```

On the first run, this command will build all the images and create the database with all tables and sample data.

**2. Access the Application**
Open your web browser and navigate to:
**`http://localhost:3000`**

**For Network Access from Other Computers:**
To access the application from other computers on your network, use:
**`http://192.168.31.32:3000`**

Note: Replace `192.168.31.32` with your server's actual IP address if it changes. You can update the `SERVER_IP` value in the `.env` file and restart the containers with `docker-compose down && docker-compose up --build`.

-----

## Default Login Credentials

  * **Supervisor / Admin (First-Time Setup)**:

      * **Email**: `admin@example.com`
      * **Password**: Enter any password to begin. You will be redirected to a setup page to create your permanent password.

  * **Sales Manager** (can see all data):

      * **Email**: `jane.smith@example.com`
      * **Password**: `password123`

  * **Sales User** (sees only their own data):

      * **Email**: `john.doe@example.com`
      * **Password**: `password123`

  * **Product Manager**:

      * **Email**: `peter.pan@example.com`
      * **Password**: `password123`

Product Manager:

Email: peter.pan@example.com

Password: password123

-----

## Network Access Configuration

### Accessing from Other Computers

By default, the application is configured to allow access from other computers on your network. The configuration automatically uses your server's IP address (`192.168.31.32` in the current setup).

### Updating Network Configuration

If your server's IP address changes, follow these steps:

1. **Find Your Server's IP Address:**
   ```bash
   ipconfig
   ```
   Look for your main network adapter's IPv4 address.

2. **Update the Configuration:**
   Edit the `.env` file and change the `SERVER_IP` value:
   ```env
   SERVER_IP=your_new_ip_address
   ```

3. **Restart the Application:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Firewall Considerations

Make sure your Windows Firewall allows connections on ports 3000 (frontend) and 5000 (backend). Docker Desktop usually handles this automatically, but you may need to allow these ports through your firewall if you encounter connection issues.

### Network Requirements

- **Frontend Port**: 3000
- **Backend Port**: 5000  
- **Database Port**: 5432 (internal access only)

Other computers on your network can access the application using:
- **Frontend**: `http://[SERVER_IP]:3000`
- **Backend API**: `http://[SERVER_IP]:5000`
