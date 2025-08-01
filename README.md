# Frontend Omar - React Dashboard

This project is set up with React 19, Vite, TypeScript, React Router DOM, ESLint, and Prettier, following best practices for modern web development.

## 🚀 Deployment Status

- **Frontend**: Ready for Vercel deployment
- **Backend**: Deployed at https://waheed-web.vercel.app/
- **Environment**: Production-ready configuration

## 🛠️ Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- React Router DOM for routing
- Tailwind CSS for styling
- Shadcn/ui for UI components
- Framer Motion for animations
- ESLint for linting
- Prettier for code formatting

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## 🔧 Development

Run the development server:
```bash
npm run dev
```

## 🏗️ Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🚀 Deployment to Vercel

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main branch
3. Environment variables are automatically configured

### Manual Deployment
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## 🌐 Environment Configuration

The project uses environment variables for API configuration:

- **Production**: `VITE_API_BASE_URL=https://waheed-web.vercel.app`
- **Development**: `VITE_API_BASE_URL=http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   └── ...             # Feature components
├── pages/              # Page components
├── utils/              # Utility functions
│   ├── api.ts          # API configuration
│   └── ...
├── lib/                # Shared libraries
└── assets/             # Static assets
```

---

For more details, see the documentation for [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [React Router](https://reactrouter.com/), [ESLint](https://eslint.org/), and [Prettier](https://prettier.io/).

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
