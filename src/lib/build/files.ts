// Virtual file system for the Build mode code panel

export interface BuildFile {
  name: string;
  path: string;
  language: string;
  icon: "tsx" | "css" | "json" | "html" | "file" | "ts" | "error";
  content: string;
}

export const FILE_TREE: {
  folders: { name: string; files: string[] }[];
  rootFiles: string[];
} = {
  folders: [
    { name: "assets", files: [] },
    { name: ".aistudio", files: [] },
    { name: "src", files: ["src/App.tsx", "src/index.css", "src/main.tsx"] },
  ],
  rootFiles: [
    ".env.example",
    ".gitignore",
    "index.html",
    "metadata.json",
    "package-lock.json",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
  ],
};

export const FILES: Record<string, BuildFile> = {
  "metadata.json": {
    name: "metadata.json",
    path: "metadata.json",
    language: "json",
    icon: "json",
    content: `{
  "name": "Todo List",
  "description": "A simple, clean, and functional todo list application for tracking daily tasks.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}
`,
  },
  "src/App.tsx": {
    name: "App.tsx",
    path: "src/App.tsx",
    language: "tsx",
    icon: "tsx",
    content: `import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1>Todo List</h1>
        <div className="input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
          />
          <button onClick={addTodo} aria-label="Add task">+</button>
        </div>
        {todos.length === 0 ? (
          <p className="empty">No tasks yet. Add one above!</p>
        ) : (
          <ul>
            {todos.map(todo => (
              <li key={todo.id} className={todo.completed ? 'done' : ''}>
                <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
`,
  },
  "src/index.css": {
    name: "index.css",
    path: "src/index.css",
    language: "css",
    icon: "css",
    content: `:root {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  background: #f7f7f8;
}

.app-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 40px;
  width: 100%;
  max-width: 448px;
}

.todo-card h1 {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  color: #111318;
}
`,
  },
  "src/main.tsx": {
    name: "main.tsx",
    path: "src/main.tsx",
    language: "tsx",
    icon: "tsx",
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
  },
  ".env.example": {
    name: ".env.example",
    path: ".env.example",
    language: "bash",
    icon: "file",
    content: `GEMINI_API_KEY=PLACEHOLDER_API_KEY
`,
  },
  ".gitignore": {
    name: ".gitignore",
    path: ".gitignore",
    language: "bash",
    icon: "file",
    content: `node_modules
dist
.env
.DS_Store
*.local
`,
  },
  "index.html": {
    name: "index.html",
    path: "index.html",
    language: "html",
    icon: "html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Todo List</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  },
  "package-lock.json": {
    name: "package-lock.json",
    path: "package-lock.json",
    language: "json",
    icon: "error",
    content: `{
  "name": "todo-list",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {}
}
`,
  },
  "package.json": {
    name: "package.json",
    path: "package.json",
    language: "json",
    icon: "json",
    content: `{
  "name": "todo-list",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@google/genai": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.0.5"
  }
}
`,
  },
  "tsconfig.json": {
    name: "tsconfig.json",
    path: "tsconfig.json",
    language: "json",
    icon: "json",
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
`,
  },
  "vite.config.ts": {
    name: "vite.config.ts",
    path: "vite.config.ts",
    language: "typescript",
    icon: "ts",
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
  },
};
