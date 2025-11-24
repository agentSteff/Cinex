---
applyTo: "**/components/**/*.tsx,**/components/**/*.jsx"
---

# Cinex React Component Instructions

## Prohibited Files / Anti-Patterns
- Do NOT create placeholder example files named `file.example.tsx` (or any `*.example.*`) in component folders.
- Do NOT create per-component README files. Keep documentation centralized in this instruction file.
- Component folders should contain only: component `.tsx`, optional tests, and related assets. Nothing else.

## Project Context

- **Repository**: Cinex (Movie cataloging and rating application)
- **Architecture**: Single-page application with component-based structure
- **Tech Stack**: React 19.2, Radix UI, Tailwind CSS, shadcn/ui, Axios, Vite 6
- **Data Sources**: TMDB API (external) + Cinex Express API (Node.js backend)
- **Node Version**: 24.11.0
- **Backend**: Express.js + TypeScript + PostgreSQL (Railway) + Prisma ORM

## Component Location Patterns

### Shared UI Components (shadcn/ui)
```
src/components/ui/
├── button.tsx           # Reusable UI primitives
├── input.tsx
├── card.tsx
└── dialog.tsx
```

**Naming Rule**: Use lowercase kebab-case for shadcn/ui components.

**Examples**: `button`, `input`, `card`, `dialog`, `dropdown-menu`

### Feature Components
```
src/components/
├── HomePage.tsx         # Main feature components
├── LoginPage.tsx
├── MovieCard.tsx
├── MovieDetail.tsx
├── MyLists.tsx
├── NavBar.tsx
└── StarRating.tsx
```

**Naming Rule**: Use PascalCase for feature components.

---

## Component Structure Template

Every component must follow this structure:

**Use TypeScript** for all components with proper type definitions.

**Formatting**: The project uses Prettier + ESLint. Ensure your editor applies formatting on save.

```tsx
// 1. Imports (grouped: React → External Libraries → Local → Styles)
import { useState, useEffect } from 'react';
import { Search, Film } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Movie } from '@/types';
import { getMovieKey } from '../lib/movieKey';

// 2. Interface/Type definitions
interface ComponentProps {
  title: string;
  onAction?: () => void;
  isLoading?: boolean;
}

// 3. Component definition
export function ComponentName({ title, onAction, isLoading = false }: ComponentProps) {
  // 4. State
  const [localState, setLocalState] = useState('');
  
  // 5. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 6. Event handlers
  const handleClick = () => {
    onAction?.();
  };
  
  // 7. Early returns for loading/error states
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <p>Loading...</p>
      </div>
    );
  }
  
  // 8. Main JSX return
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl mb-2">{title}</h2>
      <Button onClick={handleClick}>
        <Search className="size-4 mr-2" />
        Action
      </Button>
    </div>
  );
}
```

### Example Component (HomePage.tsx pattern)

```tsx
import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Input } from './ui/input';
import { Movie } from '@/types';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onViewMovie: (id: number) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigate, onViewMovie, onLogout }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);

  return (
    <div className="min-h-screen bg-black">
      <NavBar onNavigate={onNavigate} currentPage="home" onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-6 text-yellow-500" />
            <h1 className="text-white">Popular Movies</h1>
          </div>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={getMovieKey(movie)}
              movie={movie}
              onClick={() => onViewMovie(movie.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Styling with Tailwind CSS

### Approach

- **Tailwind CSS** - Primary styling approach using utility classes
- **shadcn/ui** - Pre-built components with Tailwind
- **CSS Variables** - For theme customization (see `globals.css`)

### Common Patterns

```tsx
// Layout
<div className="flex items-center justify-between gap-4">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="container mx-auto px-4 py-8">

// Colors (following Cinex theme)
<div className="bg-black text-white">
<div className="bg-yellow-500 text-black">
<div className="text-gray-400">

// Spacing
<div className="p-4 m-2">        // padding, margin
<div className="px-6 py-8">      // horizontal, vertical
<div className="space-y-4">      // vertical spacing between children

// Sizing
<div className="w-full h-screen">
<div className="min-h-screen">
<div className="size-6">          // width and height (for icons)

// Borders & Rounded
<div className="border border-yellow-500/20 rounded-lg">
<div className="rounded-full">

// Hover & Focus States
<button className="hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500">

// Responsive Design
<div className="text-sm md:text-base lg:text-lg">
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

### Icons with lucide-react

```tsx
import { Search, Film, Star, TrendingUp } from 'lucide-react';

<Search className="size-5 text-gray-400" />
<Film className="size-6 text-yellow-500" />
<Star className="size-4" />
```

**Icon Library**: Use `lucide-react` for all icons (consistent with shadcn/ui).

---

## State Management in Components

### Decision Tree

**Use Component State (useState)** for:
- Form inputs
- UI state (modals, dropdowns)
- Component-specific data
- Temporary/ephemeral state

**Use Context API** for:
- Authentication state
- Theme preferences
- Cross-component communication

**Use React Query / TanStack Query** (optional future addition) for:
- Server state
- Cache management
- Automatic refetching

### Local State (useState)

```tsx
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
const [movies, setMovies] = useState<Movie[]>([]);
```

### Custom Hooks Pattern

Extract reusable logic into custom hooks:

```tsx
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and fetch user
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Login logic
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, isLoading, login, logout };
}
```

---

## Data Fetching Pattern

### Centralized API Client

Use a centralized Axios instance for all API calls:

```tsx
// lib/api.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
);

export default api;
```

### Component Data Fetching Pattern

```tsx
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Movie {
  id: number;
  title: string;
  genre: string;
}

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await api.get('/api/peliculas/populares');
        setMovies(data);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {movies.map((movie) => (
        <div key={getMovieKey(movie)}>{movie.title}</div>
      ))}
    </div>
  );
}
```

### Custom Hook for API Calls

```tsx
// hooks/useMovies.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopular = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get('/api/peliculas/populares');
      setMovies(data);
    } catch (err) {
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  const searchMovies = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get(`/api/peliculas/buscar?q=${query}`);
      setMovies(data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { movies, isLoading, error, fetchPopular, searchMovies };
}
```

### Error Handling

Always handle errors gracefully:

```tsx
try {
  const data = await api.post('/api/calificaciones', {
    peliculaId: movieId,
    puntuacion: rating,
  });
  // Show success message
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error || 'Something went wrong';
    // Show error to user
  }
}
```

---

## Common Patterns

### Form Handling Pattern

```tsx
const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/api/auth/login', formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </Button>
    </form>
  );
};
```

### Debounced Search Pattern

```tsx
import { useState, useEffect } from 'react';

export function SearchMovies() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search with debouncedQuery
    }
  }, [debouncedQuery]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Modal/Dialog Pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function MovieDetailModal({ movieId, isOpen, onClose }: Props) {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    if (isOpen && movieId) {
      api.get(`/api/peliculas/${movieId}`).then(setMovie);
    }
  }, [isOpen, movieId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{movie?.title}</DialogTitle>
        </DialogHeader>
        <div>{movie?.synopsis}</div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Component Size & Organization

### Size Guidelines

- Keep components **under 200 lines**
- Extract complex logic to **custom hooks**
- Split large components into **smaller subcomponents**
- Create **reusable components** for repeated patterns

### When to Extract

**Extract to Custom Hook** when:
- Logic is reused across components
- Complex state management needs isolation
- API calls can be abstracted

**Extract to Subcomponent** when:
- JSX block repeats multiple times
- Component exceeds 200 lines
- Logical separation improves readability

---

## Accessibility Guidelines

- Interactive elements (buttons, links) must have descriptive labels
- Forms: label every input with proper `<label>` or `aria-label`
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Ensure keyboard navigation works (Tab, Enter, Space)
- Icon buttons must have `aria-label` for screen readers
- Color alone should not convey information
- Maintain sufficient contrast ratios (WCAG AA minimum)

---

## Performance Optimization

### When to Use React.memo

Only for components that:
- Render frequently
- Receive same props often
- Are expensive to render

```tsx
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

### When to Use useMemo

Only for:
- Expensive calculations
- Object/array references in dependencies

```tsx
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
);
```

### When to Use useCallback

Only for:
- Functions passed to memoized children
- Functions in effect dependencies

```tsx
const handleUpdate = useCallback(() => {
  updateData(id);
}, [id]);
```

---

## Key Reminders

1. Use TypeScript for all components with proper type definitions
2. Follow Tailwind CSS utility-first approach
3. Use shadcn/ui components for consistent UI
4. Centralize API calls in `lib/api.ts`
5. Keep components under 200 lines
6. Extract reusable logic into custom hooks
7. Ensure accessibility for all interactive elements
8. Use `lucide-react` for all icons
9. Follow the naming convention: PascalCase for components, kebab-case for shadcn/ui
10. No placeholder `.example.*` files in component folders
