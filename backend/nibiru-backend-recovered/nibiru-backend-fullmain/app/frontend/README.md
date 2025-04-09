# Nibiru Frontend

The frontend application for the Nibiru marketplace, built with React, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive UI with dark mode support
- Type-safe API integration
- Component-based architecture
- Toast notifications system
- Invocation key management
- Code listing integration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd nibiru/app/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

The production build will be created in the `build` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Components

### CodexCard
A card component for displaying invocation keys with their metadata and actions.

### GlyphBadge
A badge component for displaying glyph hashes in a compact format.

### StatusBadge
A badge component for displaying key statuses with appropriate colors.

### Toast
A notification system for displaying feedback to users.

## API Integration

The frontend communicates with the backend API through the `InvocationService` class, which handles all invocation key-related operations.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 