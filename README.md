# Backend Technical Interview Task (Node/SQLite)

## Overview
This project is a backend service implemented using **Node.js** with **Express.js** and **TypeScript**, integrated with an **SQLite** database. The service provides two primary functionalities:
1. Creating and storing city data in an SQLite database.
2. Fetching weather information for cities using the OpenWeatherMap API.

---

## Features
1. **City Creation Endpoint**:
  - Allows adding new cities to the database.
  - Stores the city name and generates a unique City ID.

2. **Weather Data Retrieval**:
  - Fetches weather data (city name, temperature, and description) from the OpenWeatherMap API using the stored city name.
  - Responds with structured weather information.

3. **Error Handling**:
  - Validates City IDs.
  - Handles database and network errors gracefully.

---

## Technologies Used
- **Node.js**: Backend runtime environment.
- **Express.js**: Framework for building the REST API.
- **TypeScript**: Provides type safety and better development experience.
- **SQLite**: Lightweight relational database for local storage.
- **Prisma**: ORM for database interactions.
- **Jest**: Testing framework.
- **Supertest**: For integration testing.

---

## Prerequisites
Since the development environment is pre-configured:
1. All necessary packages are pre-installed in the virtual IDE.
2. SQLite is set up locally for database interactions.

---

## Testing
To run the test suite, use:

```bash
npm test
```

---

## Important Commands

**Install Dependencies**:
```bash
npm install
```

**Run the Project in Development Mode**:
```bash
npm run dev
```