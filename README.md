# IS212G6T2 Project

Welcome to the IS212G6T2 project repository. This guide will help you set up and run the project locally.

## Table of Contents
- [Prerequisites](#1-prerequisites)
- [Clone the Repository](#2-clone-the-repository)
- [Install Dependencies](#3-install-dependencies)
- [Environment Setup](#4-environment-setup)
- [Running the Project](#5-running-the-project)
- [Contact](#contact)

## 1. Prerequisites
Before setting up the project, ensure that your machine has the following software installed:
- **Git**: Version 2.40.1 or higher
- **Node.js**: Version 18.17.1 or higher
- **NPM**: Version 9.6.7 or higher (included with Node.js)

## 2. Clone the Repository
To get the latest version of the project, clone the repository using Git:

```bash
git clone https://github.com/ryanang333/IS212G6T2.git
```

Navigate into the project directory:

```bash
cd IS212G6T2
```

## 3. Install Dependencies
Install all necessary packages and dependencies for both the frontend and backend.

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd ../backend
npm install
```

Ensure that all dependencies are successfully installed before proceeding.

## 4. Environment Setup
Environment-specific configurations are required to secure sensitive data like API keys and endpoints. Follow the steps below to set up the environment:

1. Create a `.env` file in the `backend/` folder.
2. Create another `.env` file in the `frontend/` folder.

> **Note:** The separation of `.env` files ensures that each application (frontend and backend) only accesses the secrets it requires.

### Example .env File Structure
Populate each `.env` file with the necessary keys and secrets. If you do not have the required keys or need assistance, you can reach out via [Telegram](#contact).

## 5. Running the Project
Start the application in development mode using the following commands.

### Run the Vue.js App (Frontend)
From the project root folder:

```bash
cd frontend
npm run dev
```

If the frontend runs successfully, you should see a message confirming that it is up and running.

### Run the Express Server (Backend)
From the project root folder:

```bash
cd backend
node api/index.js
```

You should see a success message indicating that the Express server is running properly.

## Contact
For further assistance or questions, feel free to contact:
- **Ryan Ang** at [@ryanang333](https://t.me/ryanang333) on Telegram.

---

