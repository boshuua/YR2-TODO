# Full-Stack To-Do Application

<p align="center">
  <img src="https://placehold.co/600x300/111827/4F46E5?text=Angular+%2B+PHP+Todo+App" alt="Project Banner">
</p>

A simple yet complete to-do list application built with a modern full-stack architecture. The application allows users to add, view, mark as complete, and delete tasks, with all data persisted in a PostgreSQL database.

---

## ✨ Features

-   **Create:** Add new tasks to your list.
-   **Read:** View all your current tasks.
-   **Update:** Mark tasks as complete or incomplete.
-   **Delete:** Remove tasks from your list.

---

## 🛠️ Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

* **Frontend:** Angular (Standalone Components)
* **Backend:** PHP (Simple REST API)
* **Database:** PostgreSQL
* **Styling:** Tailwind CSS (via CDN for development)

---

## 🚀 Getting Started

Follow these steps to get the application running locally.

### ✅ Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Node.js and npm:** Required for the Angular frontend. Download from [nodejs.org](https://nodejs.org/).
2.  **Angular CLI:** The command-line interface for Angular. Install it globally:
    ```bash
    npm install -g @angular/cli
    ```
3.  **PHP:** Required for the backend server. Download from [php.net](https://www.php.net/). Ensure the `php` command is in your system's PATH.
4.  **PostgreSQL:** The database for storing tasks. Download from [postgresql.org](https://www.postgresql.org/).

### 📦 Installation & Setup

#### 1. Database Setup (PostgreSQL)

First, create the database, user, and table.

1.  **Log in to PostgreSQL** as a superuser (e.g., `postgres`):
    ```bash
    psql -U postgres
    ```

2.  **Create the Database and User:** Run the following SQL commands. Replace `'pass'` with a secure password.
    ```sql
    -- Create the user 'dev' with a password
    CREATE USER dev WITH PASSWORD 'pass';

    -- Create the database named 'TODOapp'
    CREATE DATABASE "TODOapp";

    -- Grant all privileges on the new database to your user
    GRANT ALL PRIVILEGES ON DATABASE "TODOapp" TO dev;
    ```

3.  **Connect to the New Database:**
    ```sql
    \c TODOapp
    ```

4.  **Create the `todos` Table:** Paste this SQL into the `psql` shell.
    ```sql
    -- Create the 'todos' table
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task VARCHAR(255) NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Grant permissions to the 'dev' user
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE todos TO dev;
    GRANT USAGE, SELECT ON SEQUENCE todos_id_seq TO dev;
    ```

5.  Exit `psql` by typing `\q`.

#### 2. Backend Setup (PHP)

1.  **Configure Database Connection:**
    * Open `api/db.php`.
    * Verify the credentials match your setup. **If you used a different password, update it here.**
        ```php
        // Inside api/db.php
        $host = 'localhost';
        $port = '5432';
        $dbname = 'TODOapp';
        $user = 'dev';
        $password = 'pass'; // <-- Make sure this matches your password
        ```

2.  **Start the PHP Server:**
    * In a terminal, navigate to the `api` directory:
        ```bash
        cd path/to/your/project/api
        ```
    * Start the PHP built-in server on port 8000:
        ```bash
        php -S localhost:8000
        ```
    * **Keep this terminal running.** You can test it by visiting `http://localhost:8000/get.php` in your browser.

#### 3. Frontend Setup (Angular)

1.  **Install Dependencies:**
    * Open a **new terminal** window.
    * Navigate to the `todo-app` directory:
        ```bash
        cd path/to/your/project/todo-app
        ```
    * Install the Node.js packages:
        ```bash
        npm install
        ```

2.  **Configure API URL:**
    * Open `todo-app/src/app/app.ts`.
    * Ensure the `apiUrl` variable points to your running PHP server.
        ```typescript
        // Inside todo-app/src/app/app.ts
        private apiUrl = 'http://localhost:8000/'; // <-- This must match your PHP server address
        ```

---

### ▶️ Running the Application

With all setup complete, you can now run the full application.

1.  **Start the Backend:** Make sure your PHP server terminal is still running.
2.  **Start the Frontend:** In your second terminal (inside the `todo-app` directory), run the Angular development server:
    ```bash
    ng serve --open
    ```

Your browser will automatically open to `http://localhost:4200`, where you can use the application.

---

