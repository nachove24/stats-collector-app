# Stats Collector App

This project is a statistics collector application designed to manage and display match statistics. It is built using TypeScript and React, and it utilizes Firebase for backend functions.

## Project Structure

```
stats-collector-app
├── public
│   ├── index.html
│   └── manifest.json
├── src
│   ├── assets
│   ├── components
│   ├── features
│   │   ├── match
│   │   └── config
│   ├── pages
│   │   ├── Home.tsx
│   │   ├── Setup.tsx
│   │   ├── Match.tsx
│   │   └── Summary.tsx
│   ├── types
│   ├── hooks
│   ├── utils
│   ├── App.tsx
│   └── main.tsx
├── functions
├── firebase.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Features

- **Real-time Match Statistics**: Collect and display live statistics for ongoing matches.
- **Custom Hooks**: Utilize custom hooks for timer management and keyboard interactions.
- **TypeScript Support**: Strongly typed codebase for better maintainability and developer experience.
- **Firebase Integration**: Backend functions for data handling and storage.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd stats-collector-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.