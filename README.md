Full-Stack To-Do Application

This is a simple yet complete to-do list application built with a modern full-stack architecture.

The application allows users to add, view, mark as complete, and delete tasks. All tasks are persisted in a PostgreSQL database.

Technology Stack

Frontend: Angular (Standalone Components)

Backend: PHP (using a simple REST API structure)

Database: PostgreSQL

Styling: Tailwind CSS (via CDN for simplicity)

Prerequisites

Before you begin, ensure you have the following installed on your system:

Node.js and npm: Required for the Angular frontend. You can download it from nodejs.org.

Angular CLI: The command-line interface for Angular. Install it globally after installing Node.js:

npm install -g @angular/cli


PHP: Required for the backend server. You can download it from php.net. Ensure the php command is available in your system's PATH.

PostgreSQL: The database for storing tasks. You can download it from postgresql.org.

Setup Guide

Follow these steps to get the application running locally.

1. Database Setup (PostgreSQL)

First, you need to create the database, the user, and the table for the application.

Log in to PostgreSQL as a superuser (e.g., postgres):

psql -U postgres


Create the Database and User: Run the following SQL commands. Replace 'pass' with a secure password of your choice.

-- Create the user 'dev' with a password
CREATE USER dev WITH PASSWORD 'pass';

-- Create the database named 'TODOapp'
CREATE DATABASE "TODOapp";

-- Grant all privileges on the new database to your user
GRANT ALL PRIVILEGES ON DATABASE "TODOapp" TO dev;


Connect to the New Database:

\c TODOapp


Create the todos Table: Paste the following SQL into the psql shell and press Enter. This creates the table and grants the necessary permissions to your dev user.

-- Create the 'todos' table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grant the 'dev' user permissions on the new table and its sequence
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE todos TO dev;
GRANT USAGE, SELECT ON SEQUENCE todos_id_seq TO dev;


You can now exit psql by typing \q. Your database is ready.

2. Backend Setup (PHP)

The backend is a set of PHP files located in the api/ directory.

Configure Database Connection:

Open the api/db.php file.

Verify that the credentials ($host, $port, $dbname, $user, $password) match the ones you just set up. If you used a different password, update it here.

// Inside api/db.php
$host = 'localhost';
$port = '5432';
$dbname = 'TODOapp';
$user = 'dev';
$password = 'pass'; // <-- Make sure this matches your password


Start the PHP Server:

Open a new terminal window.

Navigate to the api directory:

cd path/to/your/project/api


Start the PHP built-in development server on port 8000:

php -S localhost:8000


Keep this terminal window open. It is now serving your backend API. You can test it by visiting http://localhost:8000/get.php in your browser; you should see an empty array [].

3. Frontend Setup (Angular)

The frontend is an Angular application located in the todo-app/ directory.

Install Dependencies:

Open a separate terminal window (do not close the PHP server one).

Navigate to the todo-app directory:

cd path/to/your/project/todo-app


Install all the required Node.js packages:

npm install


Configure API URL:

Open the todo-app/src/app/app.ts file.

Ensure the apiUrl variable points to your running PHP server (including the port).

// Inside todo-app/src/app/app.ts
private apiUrl = 'http://localhost:8000/'; // <-- This must match your PHP server address


Running the Application

Once all setup steps are complete, you can run the full application.

Start the Backend: Make sure the terminal running the PHP server (php -S localhost:8000) is still open and running in the api directory.

Start the Frontend: In the second terminal (inside the todo-app directory), run the Angular development server:

ng serve --open


This command will build the Angular application and automatically open it in your default web browser, usually at http://localhost:4200.

You should now see your fully functional To-Do application!