# Psychotherapist AI Quicknote updater

A specialized tool for psychotherapists to create, audit and improve session progress notes. The application provides a way for clinical directors and supervisors to share the guidelines and create an anonymous link for their associates to check how well their notes are written, receive feedback and have AI write notes for them.

## Features

- **Note Management**: Create and edit session notes with a rich text editor
- **Share System**: Share notes with unique, optionally expiring links
- **Sample Notes**: Pre-loaded examples showing good note-taking practices
- **Error Handling**: Clear error messages and graceful error recovery
- **Rich Text Editor**: Write and format your notes with ease
- **Mobile Friendly**: Access your notes from any device

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/windsurf-progress-note-taker.git
cd windsurf-progress-note-taker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with:
PORT=3000
NODE_ENV=development
```

4. Initialize the database
```bash
npm run init-db
```

5. Start the development server
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## Usage

1. Create a new note using the rich text editor
2. Format your note using the toolbar options
3. Save your note to keep track of student progress
4. Share notes with other instructors or students using share links
5. View sample notes for inspiration and best practices

## Documentation

For detailed information about the application:
- [Full Documentation](docs/DOCUMENTATION.md)
- [Database Schema](docs/DATABASE-SCHEMA.md)

## Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Note creation and management
- Share functionality
- Sample notes system
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run the tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
