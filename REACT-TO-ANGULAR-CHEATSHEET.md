# React to Angular Cheatsheet
## Quick Reference for React Developers

---

## 1. Component Definition

### React (Functional Component)
```jsx
import { useState, useEffect } from 'react';

const MyComponent = ({ title, onAction }) => {
    const [count, setCount] = useState(0);
    const [data, setData] = useState([]);
    
    useEffect(() => {
        // Component mounted
        console.log('Component initialized');
        
        return () => {
            // Component unmounted
            console.log('Component destroyed');
        };
    }, []);
    
    const handleClick = () => {
        setCount(count + 1);
        onAction(count);
    };
    
    return (
        <div>
            <h1>{title}</h1>
            <p>Count: {count}</p>
            <button onClick={handleClick}>Click me</button>
        </div>
    );
};

export default MyComponent;
```

### Angular (Standalone Component)
```typescript
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';

@Component({
    selector: 'my-component',
    standalone: true,
    template: `
        <div>
            <h1>{{ title }}</h1>
            <p>Count: {{ count() }}</p>
            <button (click)="handleClick()">Click me</button>
        </div>
    `
})
export class MyComponent implements OnInit, OnDestroy {
    // Props (Input)
    @Input() title: string = '';
    
    // Callbacks (Output)
    @Output() action = new EventEmitter<number>();
    
    // State (Signals)
    count = signal(0);
    data = signal<any[]>([]);
    
    ngOnInit() {
        // Component mounted
        console.log('Component initialized');
    }
    
    ngOnDestroy() {
        // Component unmounted
        console.log('Component destroyed');
    }
    
    handleClick() {
        this.count.update(c => c + 1);
        this.action.emit(this.count());
    }
}
```

---

## 2. State Management

### React (useState)
```jsx
// Simple state
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [items, setItems] = useState([]);

// Update state
setCount(count + 1);
setUser({ name: 'John', age: 30 });
setItems([...items, newItem]);

// Update based on previous state
setCount(prevCount => prevCount + 1);
setItems(prevItems => [...prevItems, newItem]);
```

### Angular (Signals)
```typescript
// Simple state
count = signal(0);
user = signal<User | null>(null);
items = signal<Item[]>([]);

// Update state
this.count.set(this.count() + 1);
this.user.set({ name: 'John', age: 30 });
this.items.set([...this.items(), newItem]);

// Update based on previous state
this.count.update(c => c + 1);
this.items.update(prevItems => [...prevItems, newItem]);

// Read state
const currentCount = this.count();
const currentUser = this.user();
```

---

## 3. Props & Events

### React
```jsx
// Parent
const Parent = () => {
    const [message, setMessage] = useState('');
    
    const handleChildEvent = (data) => {
        setMessage(data);
    };
    
    return (
        <Child 
            title="Hello"
            count={42}
            onAction={handleChildEvent}
        />
    );
};

// Child
const Child = ({ title, count, onAction }) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>{count}</p>
            <button onClick={() => onAction('clicked!')}>
                Click me
            </button>
        </div>
    );
};
```

### Angular
```typescript
// Parent
@Component({
    template: `
        <child-component 
            [title]="'Hello'"
            [count]="42"
            (action)="handleChildEvent($event)"
        />
    `
})
export class Parent {
    message = signal('');
    
    handleChildEvent(data: string) {
        this.message.set(data);
    }
}

// Child
@Component({
    selector: 'child-component',
    template: `
        <div>
            <h1>{{ title }}</h1>
            <p>{{ count }}</p>
            <button (click)="handleClick()">Click me</button>
        </div>
    `
})
export class Child {
    @Input() title: string = '';
    @Input() count: number = 0;
    @Output() action = new EventEmitter<string>();
    
    handleClick() {
        this.action.emit('clicked!');
    }
}
```

**Key Differences:**
- Angular uses `[property]="value"` for inputs (props)
- Angular uses `(event)="handler($event)"` for outputs (callbacks)
- `$event` in Angular = the emitted value

---

## 4. Computed Values

### React (useMemo)
```jsx
import { useMemo } from 'react';

const Component = () => {
    const [count, setCount] = useState(0);
    const [multiplier, setMultiplier] = useState(2);
    
    const result = useMemo(() => {
        return count * multiplier;
    }, [count, multiplier]);
    
    return <p>Result: {result}</p>;
};
```

### Angular (computed)
```typescript
import { computed } from '@angular/core';

@Component({
    template: `<p>Result: {{ result() }}</p>`
})
export class Component {
    count = signal(0);
    multiplier = signal(2);
    
    result = computed(() => {
        return this.count() * this.multiplier();
    });
}
```

---

## 5. Side Effects

### React (useEffect)
```jsx
import { useEffect } from 'react';

const Component = () => {
    const [data, setData] = useState(null);
    const [userId, setUserId] = useState(1);
    
    // Run once on mount
    useEffect(() => {
        console.log('Component mounted');
        
        return () => {
            console.log('Component unmounted');
        };
    }, []);
    
    // Run when userId changes
    useEffect(() => {
        fetchUser(userId).then(setData);
    }, [userId]);
    
    return <div>{data?.name}</div>;
};
```

### Angular (effect & lifecycle hooks)
```typescript
import { effect } from '@angular/core';

@Component({
    template: `<div>{{ data()?.name }}</div>`
})
export class Component implements OnInit, OnDestroy {
    data = signal<User | null>(null);
    userId = signal(1);
    
    constructor(private http: HttpClient) {
        // Run whenever userId changes
        effect(() => {
            const id = this.userId();
            this.fetchUser(id).subscribe(user => this.data.set(user));
        });
    }
    
    ngOnInit() {
        // Run once on mount
        console.log('Component mounted');
    }
    
    ngOnDestroy() {
        // Run once on unmount
        console.log('Component unmounted');
    }
    
    fetchUser(id: number) {
        return this.http.get<User>(`/api/users/${id}`);
    }
}
```

---

## 6. Context / Global State

### React (Context API)
```jsx
import { createContext, useContext, useState } from 'react';

// Create context
const AuthContext = createContext();

// Provider
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    
    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Consumer (in any component)
const MyComponent = () => {
    const { user, login, logout } = useContext(AuthContext);
    
    return (
        <div>
            {user ? (
                <button onClick={logout}>Logout</button>
            ) : (
                <button onClick={() => login({ name: 'John' })}>Login</button>
            )}
        </div>
    );
};

// App
const App = () => (
    <AuthProvider>
        <MyComponent />
    </AuthProvider>
);
```

### Angular (Services + Dependency Injection)
```typescript
// Service (like Context)
@Injectable({ providedIn: 'root' })  // Global singleton
export class AuthService {
    private user = signal<User | null>(null);
    
    // Expose as read-only
    currentUser = this.user.asReadonly();
    
    login(userData: User) {
        this.user.set(userData);
    }
    
    logout() {
        this.user.set(null);
    }
}

// Consumer (in any component) - NO PROVIDER NEEDED!
@Component({
    template: `
        <div>
            @if (authService.currentUser()) {
                <button (click)="authService.logout()">Logout</button>
            } @else {
                <button (click)="login()">Login</button>
            }
        </div>
    `
})
export class MyComponent {
    // Inject service (automatic)
    constructor(public authService: AuthService) {}
    
    login() {
        this.authService.login({ name: 'John' });
    }
}

// App - NO PROVIDER WRAPPER NEEDED!
@Component({
    template: `<my-component />`
})
export class App {}
```

**Key Advantages:**
- No Provider wrapper needed
- Automatic injection in any component
- True singleton (one instance app-wide)
- Can inject other services into services

---

## 7. API Calls

### React (fetch or axios)
```jsx
import { useState, useEffect } from 'react';

const Component = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/data');
                const json = await response.json();
                setData(json);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return <div>{data?.name}</div>;
};

// With custom hook
const useData = () => {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(setData);
    }, []);
    
    return data;
};
```

### Angular (HttpClient)
```typescript
import { HttpClient } from '@angular/common/http';

// Service (like custom hook)
@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(private http: HttpClient) {}
    
    getData(): Observable<Data> {
        return this.http.get<Data>('/api/data');
    }
}

// Component
@Component({
    template: `
        @if (loading()) {
            <div>Loading...</div>
        } @else if (error()) {
            <div>Error: {{ error() }}</div>
        } @else {
            <div>{{ data()?.name }}</div>
        }
    `
})
export class Component implements OnInit {
    data = signal<Data | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);
    
    constructor(private dataService: DataService) {}
    
    ngOnInit() {
        this.loading.set(true);
        
        this.dataService.getData().subscribe({
            next: (result) => {
                this.data.set(result);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.loading.set(false);
            }
        });
    }
}
```

---

## 8. Conditional Rendering

### React
```jsx
const Component = ({ isLoggedIn, items }) => {
    return (
        <div>
            {/* If statement */}
            {isLoggedIn && <p>Welcome!</p>}
            
            {/* If-else */}
            {isLoggedIn ? (
                <button>Logout</button>
            ) : (
                <button>Login</button>
            )}
            
            {/* List rendering */}
            <ul>
                {items.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            
            {/* Empty list */}
            {items.length === 0 && <p>No items</p>}
        </div>
    );
};
```

### Angular
```typescript
@Component({
    template: `
        <div>
            <!-- If statement -->
            @if (isLoggedIn) {
                <p>Welcome!</p>
            }
            
            <!-- If-else -->
            @if (isLoggedIn) {
                <button>Logout</button>
            } @else {
                <button>Login</button>
            }
            
            <!-- List rendering -->
            <ul>
                @for (item of items; track item.id) {
                    <li>{{ item.name }}</li>
                }
            </ul>
            
            <!-- Empty list -->
            @if (items.length === 0) {
                <p>No items</p>
            }
        </div>
    `
})
export class Component {
    @Input() isLoggedIn: boolean = false;
    @Input() items: Item[] = [];
}
```

**Note:** Angular 17+ uses `@if`, `@for`, `@else`. Older versions use `*ngIf`, `*ngFor`.

---

## 9. Forms

### React (Controlled Components)
```jsx
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ email, password });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    );
};
```

### Angular (Template-driven)
```typescript
import { FormsModule } from '@angular/forms';

@Component({
    imports: [FormsModule],
    template: `
        <form (ngSubmit)="handleSubmit()">
            <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="Email"
            />
            <input
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Password"
            />
            <button type="submit">Login</button>
        </form>
    `
})
export class LoginForm {
    email = '';
    password = '';
    
    handleSubmit() {
        console.log({ email: this.email, password: this.password });
    }
}
```

**`[(ngModel)]`** = two-way binding (like React's value + onChange combined)

---

## 10. Routing

### React Router
```jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Route config
const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </BrowserRouter>
);

// Navigation
const MyComponent = () => {
    const navigate = useNavigate();
    
    const goToLogin = () => {
        navigate('/login');
    };
    
    return <button onClick={goToLogin}>Login</button>;
};

// Route params
const UserDetail = () => {
    const { id } = useParams();
    return <div>User ID: {id}</div>;
};

// Protected route
const PrivateRoute = ({ children }) => {
    const isLoggedIn = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" />;
};
```

### Angular Router
```typescript
import { Router, ActivatedRoute, Routes } from '@angular/router';

// Route config
export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'users/:id', component: UserDetail },
    { path: '**', redirectTo: '' }
];

// Navigation
@Component({
    template: `<button (click)="goToLogin()">Login</button>`
})
export class MyComponent {
    constructor(private router: Router) {}
    
    goToLogin() {
        this.router.navigate(['/login']);
    }
}

// Route params
@Component({
    template: `<div>User ID: {{ userId }}</div>`
})
export class UserDetail implements OnInit {
    userId: string = '';
    
    constructor(private route: ActivatedRoute) {}
    
    ngOnInit() {
        this.userId = this.route.snapshot.params['id'];
        
        // Or subscribe for dynamic changes
        this.route.params.subscribe(params => {
            this.userId = params['id'];
        });
    }
}

// Protected route (Guard)
export const PrivateGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};

// Apply guard
{ path: '', component: Home, canActivate: [PrivateGuard] }
```

---

## 11. Refs (DOM Access)

### React
```jsx
import { useRef, useEffect } from 'react';

const Component = () => {
    const inputRef = useRef(null);
    
    useEffect(() => {
        inputRef.current.focus();
    }, []);
    
    const handleClick = () => {
        console.log(inputRef.current.value);
    };
    
    return (
        <div>
            <input ref={inputRef} type="text" />
            <button onClick={handleClick}>Get Value</button>
        </div>
    );
};
```

### Angular
```typescript
import { ViewChild, ElementRef } from '@angular/core';

@Component({
    template: `
        <div>
            <input #myInput type="text" />
            <button (click)="handleClick()">Get Value</button>
        </div>
    `
})
export class Component implements AfterViewInit {
    @ViewChild('myInput') inputRef!: ElementRef;
    
    ngAfterViewInit() {
        this.inputRef.nativeElement.focus();
    }
    
    handleClick() {
        console.log(this.inputRef.nativeElement.value);
    }
}
```

---

## 12. Styling

### React
```jsx
// Inline styles
const Component = () => (
    <div style={{ color: 'red', fontSize: '16px' }}>
        Hello
    </div>
);

// CSS Modules
import styles from './Component.module.css';

const Component = () => (
    <div className={styles.container}>
        Hello
    </div>
);

// Conditional classes
const Component = ({ isActive }) => (
    <div className={`container ${isActive ? 'active' : ''}`}>
        Hello
    </div>
);
```

### Angular
```typescript
// Inline styles
@Component({
    template: `
        <div [style.color]="'red'" [style.font-size.px]="16">
            Hello
        </div>
    `
})

// Component styles
@Component({
    template: `<div class="container">Hello</div>`,
    styles: [`
        .container {
            color: red;
            font-size: 16px;
        }
    `]
    // Or: styleUrls: ['./component.css']
})

// Conditional classes
@Component({
    template: `
        <div [class.active]="isActive" class="container">
            Hello
        </div>
        
        <!-- Or -->
        <div [ngClass]="{ 'active': isActive, 'disabled': !enabled }">
            Hello
        </div>
    `
})
export class Component {
    @Input() isActive: boolean = false;
    enabled = true;
}
```

---

## 13. HTTP Interceptors

### React (Axios)
```jsx
import axios from 'axios';

// Request interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // Refresh token logic
            await refreshToken();
            return axios(error.config);  // Retry request
        }
        return Promise.reject(error);
    }
);
```

### Angular
```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');
    
    // Add token to request
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }
    
    // Handle response
    return next(req).pipe(
        catchError(err => {
            if (err.status === 401) {
                // Refresh token logic
                return refreshToken().pipe(
                    switchMap(() => next(req))  // Retry request
                );
            }
            return throwError(() => err);
        })
    );
};

// Register in config
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withInterceptors([authInterceptor]))
    ]
};
```

---

## Key Takeaways

| Feature | React | Angular |
|---------|-------|---------|
| **State** | `useState` | `signal()` |
| **Derived State** | `useMemo` | `computed()` |
| **Side Effects** | `useEffect` | `effect()` or lifecycle hooks |
| **Global State** | Context/Redux | Services + DI |
| **Props** | Props | `@Input()` |
| **Callbacks** | Callback props | `@Output()` + EventEmitter |
| **Forms** | Controlled components | `[(ngModel)]` or Reactive Forms |
| **Routing** | React Router | Angular Router |
| **Protected Routes** | HOC/Component | Route Guards |
| **HTTP** | fetch/axios | HttpClient |
| **HTTP Middleware** | Axios interceptors | HTTP Interceptors |
| **Refs** | `useRef` | `@ViewChild` |
| **Lifecycle** | `useEffect` | `ngOnInit`, `ngOnDestroy`, etc. |

---

## Mental Model Shift

### React Philosophy
- "Everything is a component"
- State flows down, events bubble up
- Hooks for logic reuse
- Props drilling or Context for shared state

### Angular Philosophy
- "Components for UI, Services for logic"
- Dependency Injection for sharing
- No props drilling - inject services anywhere
- Strong separation of concerns

---

**With this cheatsheet, you should be able to translate your React knowledge directly to Angular!** 🚀

