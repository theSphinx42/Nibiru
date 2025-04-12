# Nibiru Application

A modern web application with dynamic sigil generation and profile management.

## Download and Setup

### Option 1: Download Pre-packaged Release

1. Download the latest release zip file from the releases page
2. Extract the zip file to your desired location
3. Navigate to the extracted directory
4. Run the appropriate development script:
   - On Windows: `scripts\dev.bat`
   - On Unix: `./scripts/dev.sh`

### Option 2: Build from Source

1. Clone the repository:
```bash
git clone <repository-url>
cd nibiru
```

2. Package the project:
   - On Windows: `scripts\package.bat`
   - On Unix: `./scripts/package.sh`

3. The script will create a `nibiru.zip` file containing the complete project.

4. Extract the zip file and follow the instructions in the extracted README.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd nibiru
```

2. Run the development script:

For Unix-based systems (Linux/macOS):
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

For Windows:
```bash
scripts\dev.bat
```

This will:
- Create necessary directories
- Build and start all services
- Set up the database and Redis
- Start the frontend and backend servers

## Accessing the Application

Once the services are running, you can access:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development

### Frontend Development

The frontend is built with React and Vite. For local development:

```bash
cd app/frontend
npm install
npm run dev
```

### Backend Development

The backend is built with FastAPI. For local development:

```bash
cd app/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Database

The application uses:
- PostgreSQL for persistent storage
- Redis for caching

Database credentials:
- Host: localhost
- Port: 5432
- Database: nibiru
- Username: postgres
- Password: postgres

## Redis

Redis is used for caching profile data and sigil images:
- Host: localhost
- Port: 6379
- Database: 0

## Media Storage

Uploaded files (avatars, backgrounds) are stored in:
- `app/backend/media/avatars/`
- `app/backend/media/backgrounds/`

## Testing

### Running Tests

```bash
# Backend tests
cd app/backend
pytest

# Frontend tests
cd app/frontend
npm test
```

### API Testing

You can use the interactive API documentation at http://localhost:8000/docs to test the endpoints.

## Troubleshooting

1. If services fail to start:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. To view logs:
   ```bash
   docker-compose logs -f
   ```

3. To reset the database:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 