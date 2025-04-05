# Game Platform Backend

  

A scalable, distributed gaming platform backend system that handles player management, score tracking, and leaderboard functionality.

  

## Architecture Overview

  

The system consists of multiple microservices:

- Player Service: User management

- Score Service: Score submission and tracking

- Leaderboard Service: Real-time leaderboard

- Log API Service: Centralized logging

- Log Worker Services:

- High Priority Log Worker: Processes high priority logs

- Low Priority Log Worker: Processes low priority logs

- Log Retry Worker Service: Handles failed log processing

- DLQ Service: Dead Letter Queue processing

  

## Prerequisites

  

- Docker and Docker Compose

- Node.js (v16 or higher)

- MongoDB Atlas account

- Redis

- Kafka

  

## Quick Start

  

1. Clone the repository:

```bash

git clone <repository-url>

cd game-backend

```

  

2. Start all services using Docker Compose:

```bash

docker-compose up -d

```

  

This will start all services:

- Player Service (port 3001)

- Score Service (port 3002)

- Leaderboard Service (port 3003)

- Log API Service (port 3004)

- High Priority Log Worker

- Low Priority Log Worker

- Log Retry Worker

- DLQ Worker

- Redis (port 6379)

- Kafka (port 9092)

  

## API Documentation

  

Each service provides Swagger documentation at the following URLs:

  

- Player Service: http://localhost:3001/docs

- Score Service: http://localhost:3002/docs

- Leaderboard Service: http://localhost:3003/docs

- Log API Service: http://localhost:3004/docs

  

## Service Endpoints

  

### Player Service (port 3001)

- POST /players - Create player

- GET /players/:id - Get player

- PUT /players/:id - Update player

- DELETE /players/:id - Delete player

  

### Score Service (port 3002)

- POST /scores - Submit score

- GET /scores/top - Get top scores

  

### Leaderboard Service (port 3003)

- GET /players/leaderboard - Get leaderboard

  

### Log API Service (port 3004)

- POST /logs - Submit log

  

## Environment Variables

  

Create a `.env` file in each service directory with the following variables:

  

```env

# Common

KAFKA_BROKER=kafka:9092

REDIS_URL=redis://localhost:6379

LOG_API_URL=http://localhost:3004
  

# Player Service (port 3001)

PORT=3001

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/playerdb?retryWrites=true&w=majority

REDIS_URL=redis://localhost:6379

LOG_API_URL=http://localhost:3004

  

# Score Service (port 3002)

PORT=3002

MONGO_URI=mongodb+srv://username:password@cluster0.qgwsi10.mongodb.net/scoredb?retryWrites=true&w=majority&appName=Cluster0

REDIS_URL=redis://localhost:6379

LOG_API_URL=http://localhost:3004


  

# Leaderboard Service (port 3003)

PORT=3003

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/scoredb?retryWrites=true&w=majority

REDIS_URL=redis://localhost:6379

LOG_API_URL=http://localhost:3004


# Log API Service (port 3004)

PORT=3004

LOG_BATCH_SIZE=50

LOG_BATCH_TIMEOUT_MS=5000

KAFKA_BROKER=localhost:9092

KAFKA_TOPIC=log-events

KAFKA_HIGH_PRIORITY_TOPIC=log-events-high

KAFKA_LOW_PRIORITY_TOPIC=log-events-low
  

# High Priority Log Worker

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/logdb?retryWrites=true&w=majority

KAFKA_LOG_TOPIC=log-events-high

KAFKA_CONSUMER_GROUP=high-priority-log-consumer-group

MAX_CONCURRENT_WRITES=5

MAX_WRITE_RATE_PER_SECOND=20

  

# Low Priority Log Worker

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/logdb?retryWrites=true&w=majority

KAFKA_LOG_TOPIC=log-events-low

KAFKA_CONSUMER_GROUP=low-priority-log-consumer-group

MAX_CONCURRENT_WRITES=3

MAX_WRITE_RATE_PER_SECOND=10

  

# Log Retry Worker Service

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/logdb?retryWrites=true&w=majority

KAFKA_RETRY_TOPIC=log-retries

KAFKA_DLQ_TOPIC=log-dlq

MAX_RETRY_ATTEMPTS=3

  

# DLQ Service

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dlqdb?retryWrites=true&w=majority

KAFKA_DLQ_TOPIC=log-dlq

KAFKA_CONSUMER_GROUP=dlq-group

```

  

## Development

  

To run services individually:

  

```bash

# Player Service (port 3001)

cd player-service

npm install

npm run dev

  

# Score Service (port 3002)

cd score-service

npm install

npm run dev

  

# Leaderboard Service (port 3003)

cd leaderboard-service

npm install

npm run dev

  

# Log API Service (port 3004)

cd log-api-service

npm install

npm run dev

  

# Log Worker Service (High Priority)

cd log-worker-service

npm install

KAFKA_LOG_TOPIC=log-events-high KAFKA_CONSUMER_GROUP=high-priority-log-consumer-group npm run dev

  

# Log Worker Service (Low Priority)

cd log-worker-service

npm install

KAFKA_LOG_TOPIC=log-events-low KAFKA_CONSUMER_GROUP=low-priority-log-consumer-group npm run dev

  

# Log Retry Worker Service

cd log-retry-worker-service

npm install

npm run dev

  

# DLQ Service

cd dlq-service

npm install

npm run dev

```

  

## Architecture


The system follows a microservices architecture with:

- Stateless services

- Message queue for async processing

- Caching layer for performance

- Centralized logging with priority-based processing

- Dead letter queue for error handling

- Separate worker services for high and low priority logs

- Retry mechanism for failed operations