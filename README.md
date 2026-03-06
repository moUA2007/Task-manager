# Task Manager API

A RESTful API for managing tasks built with Node.js, Express, and MongoDB.

This project was created as a backend practice project to understand how real-world APIs are structured, including authentication, routing, middleware, and database modeling.

## Overview

The Task Manager API allows users to create and manage personal tasks securely through authenticated requests.

The project focuses on clean architecture, modular structure, and common backend development practices.

## Features

* User authentication
* CRUD operations for tasks
* Protected routes
* Centralized error handling
* Logging for incoming requests
* Modular project structure

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose

## Project Structure

```
Task-manager
│
├── Controllers
├── Models
├── Routes
├── API
├── public
│
├── app.js
├── server.js
├── package.json
└── vercel.json
```

## Installation

Clone the repository

git clone https://github.com/moUA2007/Task-manager.git

Navigate to the project folder

cd Task-manager

Install dependencies

npm install

Set up environment variables

Copy the `.env.example` file to `.env` and update it with your own values:

cp .env.example .env

Edit `.env` and add your configuration:
- MongoDB Atlas URI (CONNECT)
- Database credentials (USER, PASSWORD)
- JWT_SECRET for token signing
- Email service credentials (EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD)
- PORT (default: 5000)

**IMPORTANT: Never commit `.env` to version control. The `.env` file is already in `.gitignore`**

Start the development server

npm run dev

## API Endpoints

Authentication

POST /api/v1/auth/signup
POST /api/v1/auth/login

Tasks

GET /api/v1/tasks
POST /api/v1/tasks
PATCH /api/v1/tasks/:id
DELETE /api/v1/tasks/:id

## Purpose

This project was built to practice backend development concepts such as API design, routing, controllers, and working with databases.

## Future Improvements

Possible future improvements include:

* Pagination
* Rate limiting
* Docker support
* Redis caching
* API documentation
