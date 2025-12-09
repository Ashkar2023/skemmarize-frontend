# Skemmarize Frontend Architecture Guide
## For React Developers Transitioning to Angular

---

## Table of Contents
1. [Application Overview](#application-overview)
2. [State Management](#state-management)
3. [Component Hierarchy](#component-hierarchy)
4. [Services](#services)
5. [Routing & Guards](#routing--guards)
6. [Interceptors](#interceptors)
7. [Data Flow](#data-flow)
8. [React vs Angular Comparison](#react-vs-angular-comparison)

---

## Application Overview

**Skemmarize** is an image summarization application that:
- Authenticates users via GitHub OAuth
- Allows users to upload images
- Uses AI to summarize/analyze images
- Displays chat-like conversation with AI responses

**Tech Stack:**
- Angular 19+ (Standalone Components)
- PrimeNG (UI Components)
- RxJS (Reactive Programming)
- TypeScript

---

## State Management

### React Comparison
In React, you typically use:
- `useState` for local component state
- Context API or Redux for global state
- Props for passing data down

In Angular:
- **Signals** (Angular 16+) replace `useState` - they're reactive primitives
- **Services** with dependency injection replace Context API/Redux
- **@Input/@Output** decorators replace props and callbacks

### State in This Application

#### 1. **Global State (AuthService)**
Location: `src/app/service/auth.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
    private _loggedIn = false;        // Global auth state
    private _authChecked = false;     // Track if auth was verified
    
    isLoggedIn(): boolean {
        return this._loggedIn;
    }
    
    setLoggedIn(value: boolean) {
        this._loggedIn = value;
    }
}
```

**React Equivalent:**
```jsx
// Would be like a Context Provider
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    
    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
```

**Key Differences:**
- Angular: Service is a **singleton** (one instance app-wide) - `providedIn: 'root'`
- React: Context requires Provider wrapper
- Angular: Inject service anywhere via **Dependency Injection**
- React: Use `useContext` hook

#### 2. **Local Component State (Signals)**
Location: `src/app/pages/home/home.ts`

```typescript
export class Home {
    // Signals - like useState in React
    currentImage = signal<ImageData | null>(null);
    messages = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);
    
    onImageSelected(imageData: ImageData): void {
        this.currentImage.set(imageData);  // Update signal
    }
    
    onSummarize(): void {
        const image = this.currentImage();  // Read signal value
        this.messages.update(msgs => [...msgs, userMessage]);  // Update array
        this.isLoading.set(true);
    }
}
```

**React Equivalent:**
```jsx
const Home = () => {
    const [currentImage, setCurrentImage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const onImageSelected = (imageData) => {
        setCurrentImage(imageData);
    };
    
    const onSummarize = () => {
        const image = currentImage;
        setMessages([...messages, userMessage]);
        setIsLoading(true);
    };
};
```

**Signal Methods:**
- `.set(value)` - Replace entire value
- `.update(fn)` - Update based on current value
- `()` - Read current value (like calling signal as function)

---

## Component Hierarchy

```
App (Root Component)
└── RouterOutlet (renders current route)
    ├── LoginPage (/login)
    │   └── [OAuth button]
    │
    └── Home (/)
        ├── NavbarComponent
        ├── ImagePicker
        │   └── PrimeNG FileUpload
        ├── SummarizeButton
        │   └── PrimeNG Button
        └── ChatDisplay
            └── Message List (dynamic)
```

### Component Communication

#### Parent to Child (Props)
**Angular:**
```typescript
// Parent (Home)
<chat-display [messages]="messages()"/>

// Child (ChatDisplay)
export class ChatDisplay {
    @Input() messages: ChatMessage[] = [];
}
```

**React:**
```jsx
// Parent
<ChatDisplay messages={messages} />

// Child
const ChatDisplay = ({ messages }) => { ... }
```

#### Child to Parent (Callbacks/Events)
**Angular:**
```typescript
// Parent (Home)
<image-picker (imageSelected)="onImageSelected($event)"/>

// Child (ImagePicker)
export class ImagePicker {
    @Output() imageSelected = new EventEmitter<ImageData>();
    
    onFileSelect(event: FileUploadEvent): void {
        this.imageSelected.emit(imageData);  // Emit event
    }
}
```

**React:**
```jsx
// Parent
<ImagePicker onImageSelected={handleImageSelected} />

// Child
const ImagePicker = ({ onImageSelected }) => {
    const handleSelect = (imageData) => {
        onImageSelected(imageData);
    };
};
```

### Component Types

1. **Page Components** (`/pages`)
   - Route containers (like route components in React Router)
   - Manage page-level state
   - Coordinate child components

2. **Presentational Components** (`/components`)
   - Reusable UI elements
   - Receive data via `@Input`
   - Emit events via `@Output`
   - Minimal business logic

---

## Services

### What Are Services?
Services are **singleton classes** that handle:
- API calls (like React Query or custom hooks)
- Shared state (like Context or Redux)
- Business logic
- Utilities

**Key Point:** Services are **injected** via Dependency Injection (constructor).

### AuthService
Location: `src/app/service/auth.service.ts`

**Purpose:** Manage authentication state and API calls

```typescript
@Injectable({ providedIn: 'root' })  // Singleton
export class AuthService {
    constructor(
        private http: HttpClient,    // Injected dependency
        private router: Router       // Injected dependency
    ) { }
    
    checkAuthStatus(): Observable<boolean> {
        return this.http.get('/auth/me').pipe(
            tap(() => this._loggedIn = true),
            catchError(() => of(false))
        );
    }
    
    logout() {
        this.http.get('/auth/logout').subscribe({
            next: () => {
                this._loggedIn = false;
                this.router.navigate(["/login"]);
            }
        });
    }
}
```

**How It's Used:**
```typescript
// In any component
export class Home {
    constructor(private authService: AuthService) { }  // Injected
    
    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            // Do something
        }
    }
}
```

**React Equivalent:**
```jsx
// Custom hook
const useAuth = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    
    const checkAuthStatus = async () => {
        const response = await fetch('/auth/me');
        setLoggedIn(response.ok);
    };
    
    const logout = async () => {
        await fetch('/auth/logout');
        setLoggedIn(false);
        navigate('/login');
    };
    
    return { loggedIn, checkAuthStatus, logout };
};

// In component
const Home = () => {
    const { loggedIn, checkAuthStatus } = useAuth();
};
```

### SummarizationService
Location: `src/app/service/summarization.service.ts`

**Purpose:** Handle image summarization API calls

```typescript
@Injectable({ providedIn: 'root' })
export class SummarizationService {
    constructor(private http: HttpClient) { }
    
    summarizeImage(imageFile: File): Observable<SummarizationResponse> {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        return this.http.post<SummarizationResponse>(this.apiUrl, formData, {
            withCredentials: true
        });
    }
}
```

**React Equivalent:**
```jsx
const useSummarization = () => {
    const summarizeImage = async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('/summarize', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        return response.json();
    };
    
    return { summarizeImage };
};
```

---

## Routing & Guards

### Routes Configuration
Location: `src/app/app.routes.ts`

```typescript
export const routes: Routes = [
    { 
        path: "", 
        component: Home, 
        canActivate: [PrivateGuard]  // Protected route
    },
    { 
        path: "login", 
        component: LoginPage, 
        canActivate: [PublicGuard]   // Redirect if logged in
    },
    { 
        path: "**", 
        redirectTo: ""               // Catch-all
    },
];
```

**React Router Equivalent:**
```jsx
<Routes>
    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

### Route Guards
Location: `src/app/gaurds/auth.guard.ts`

**Purpose:** Protect routes based on authentication

```typescript
export const PrivateGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.isAuthChecked()) {
        // Check auth status first
        return authService.checkAuthStatus().pipe(
            take(1),
            map(isLoggedIn => {
                if (isLoggedIn) return true;
                router.navigate(["/login"]);
                return false;
            })
        );
    }
    
    // Use cached auth status
    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(["/login"]);
        return false;
    }
};
```

**React Equivalent:**
```jsx
const PrivateRoute = ({ children }) => {
    const { isLoggedIn, isAuthChecked, checkAuthStatus } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isAuthChecked) {
            checkAuthStatus().then(loggedIn => {
                if (!loggedIn) navigate('/login');
            });
        }
    }, [isAuthChecked]);
    
    if (!isAuthChecked) return <Loading />;
    return isLoggedIn ? children : <Navigate to="/login" />;
};
```

**Guard Flow:**
1. User navigates to route
2. Guard runs **before** component loads
3. Returns `true` (allow) or `false` (block)
4. Can return `Observable<boolean>` for async checks

---

## Interceptors

### What Are Interceptors?
**Angular interceptors** = **Axios interceptors** or **fetch middleware**

They intercept **all** HTTP requests/responses to add logic like:
- Adding auth headers
- Handling errors globally
- Refreshing tokens
- Logging

### AuthInterceptor
Location: `src/app/interceptors/auth.interceptor.ts`

**Purpose:** Handle 401 errors and refresh JWT tokens

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    return next(req).pipe(
        catchError(err => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                // If refresh endpoint fails, logout
                if (err.url?.includes("/auth/refresh")) {
                    authService.logout();
                    return throwError(() => err);
                }
                
                // Try refreshing token
                return handle401Error(req, next, authService, router);
            }
            
            return throwError(() => err);
        })
    );
};

function handle401Error(req, next, authService, router) {
    if (isRefreshing) {
        // Wait for refresh to complete, then retry request
        return refreshTokenSubject.pipe(
            filter(token => token === true),
            take(1),
            switchMap(() => next(req))
        );
    }
    
    isRefreshing = true;
    
    return authService.refreshToken().pipe(
        switchMap(() => {
            isRefreshing = false;
            refreshTokenSubject.next(true);
            return next(req);  // Retry original request
        }),
        catchError((err) => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => err);
        })
    );
}
```

**Flow:**
1. Any HTTP call returns 401
2. Interceptor catches error
3. Calls `/auth/refresh` to get new token
4. **Retries original request** with new token
5. If refresh fails → logout

**React Equivalent (Axios):**
```jsx
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            if (error.config.url.includes('/auth/refresh')) {
                logout();
                return Promise.reject(error);
            }
            
            if (!isRefreshing) {
                isRefreshing = true;
                
                try {
                    await axios.get('/auth/refresh');
                    isRefreshing = false;
                    // Retry original request
                    return axios(error.config);
                } catch (err) {
                    isRefreshing = false;
                    logout();
                    return Promise.reject(err);
                }
            }
        }
        
        return Promise.reject(error);
    }
);
```

### Registering Interceptors
Location: `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([authInterceptor])  // Register interceptor
        ),
        // ... other providers
    ]
};
```

---

## Data Flow

### Complete User Flow Example: Image Summarization

```
1. USER UPLOADS IMAGE
   ↓
2. ImagePicker Component
   - onFileSelect() reads file
   - Converts to base64 (dataUrl)
   - Emits: imageSelected.emit({ file, dataUrl })
   ↓
3. Home Component (Parent)
   - Receives event: onImageSelected(imageData)
   - Updates signal: currentImage.set(imageData)
   - Template re-renders with new image
   ↓
4. USER CLICKS SUMMARIZE
   ↓
5. SummarizeButton Component
   - Emits: summarize.emit()
   ↓
6. Home Component
   - Receives event: onSummarize()
   - Reads state: const image = currentImage()
   - Updates UI state:
     * messages.update(msgs => [...msgs, userMessage])
     * isLoading.set(true)
   - Calls service: summarizationService.summarizeImage(image.file)
   ↓
7. SummarizationService
   - Creates FormData
   - Makes POST request: http.post('/summarize', formData)
   - Returns Observable<SummarizationResponse>
   ↓
8. AuthInterceptor (Automatic)
   - Request goes through interceptor
   - Adds withCredentials: true (JWT cookie)
   - If 401 error → refresh token → retry
   ↓
9. Backend API
   - Receives request with JWT cookie
   - Processes image
   - Returns summary
   ↓
10. Home Component (Subscribe Callback)
    - Receives response
    - Creates AI message
    - Updates state:
      * messages.update(msgs => [...msgs, aiMessage])
      * isLoading.set(false)
      * currentImage.set(null)
    ↓
11. ChatDisplay Component
    - Receives updated messages via @Input
    - Renders new message
    - Auto-scrolls to bottom (ngAfterViewChecked)
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────┐
│         Global State (Services)                 │
│  ┌─────────────────────────────────────────┐   │
│  │  AuthService                            │   │
│  │  - _loggedIn: boolean                   │   │
│  │  - _authChecked: boolean                │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    ↓ (Injected)
┌─────────────────────────────────────────────────┐
│         App Component                           │
│  - Checks auth on startup (ngOnInit)           │
│  - Sets authService.setLoggedIn(true/false)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Router Guards                           │
│  - Check authService.isLoggedIn()               │
│  - Allow/Deny route access                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Home Component (Local State)            │
│  ┌──────────────────────────────────────────┐  │
│  │  Signals (Component State)               │  │
│  │  - currentImage: signal<ImageData|null>  │  │
│  │  - messages: signal<ChatMessage[]>       │  │
│  │  - isLoading: signal<boolean>            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Child Components                        │  │
│  │  ┌────────────────┐  ┌────────────────┐ │  │
│  │  │  ImagePicker   │  │ ChatDisplay    │ │  │
│  │  │  @Output       │  │ @Input         │ │  │
│  │  │  imageSelected │  │ messages       │ │  │
│  │  └────────────────┘  └────────────────┘ │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## React vs Angular Comparison

### Quick Reference Table

| Concept | React | Angular |
|---------|-------|---------|
| **Local State** | `useState` | `signal()` |
| **Global State** | Context/Redux | Services + DI |
| **Props** | Props | `@Input()` |
| **Callbacks** | Callback props | `@Output()` + EventEmitter |
| **Effects** | `useEffect` | Lifecycle hooks (`ngOnInit`, etc.) |
| **API Calls** | `fetch`/axios | `HttpClient` (injected) |
| **Routing** | React Router | Angular Router |
| **Route Protection** | Higher-order components | Route Guards |
| **HTTP Middleware** | Axios interceptors | HTTP Interceptors |
| **Computed Values** | `useMemo` | `computed()` (signals) |
| **Refs** | `useRef` | `@ViewChild` / `ElementRef` |
| **Context** | `useContext` | Dependency Injection |

### Key Conceptual Differences

#### 1. **Dependency Injection vs Imports**

**React:**
```jsx
import { useAuth } from './useAuth';

const MyComponent = () => {
    const auth = useAuth();  // Call hook
};
```

**Angular:**
```typescript
import { AuthService } from './auth.service';

export class MyComponent {
    constructor(private auth: AuthService) { }  // Injected
}
```

#### 2. **Reactive State Updates**

**React:**
```jsx
const [count, setCount] = useState(0);
setCount(count + 1);  // Triggers re-render
```

**Angular:**
```typescript
count = signal(0);
count.update(c => c + 1);  // Triggers re-render automatically
```

#### 3. **Template Syntax**

**React (JSX):**
```jsx
<div>
    {isLoading && <Spinner />}
    {messages.map(msg => <Message key={msg.id} data={msg} />)}
</div>
```

**Angular (HTML Template):**
```html
<div>
    @if (isLoading()) {
        <spinner />
    }
    @for (msg of messages(); track msg.id) {
        <message [data]="msg" />
    }
</div>
```

#### 4. **Observables vs Promises**

**React (Promises):**
```jsx
const fetchData = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    setData(data);
};
```

**Angular (Observables):**
```typescript
fetchData() {
    this.http.get('/api/data').subscribe({
        next: (data) => this.data.set(data),
        error: (err) => console.error(err)
    });
}
```

**Observables are:**
- **Lazy**: Don't execute until subscribed
- **Cancellable**: Can unsubscribe
- **Composable**: Use RxJS operators (map, filter, etc.)

---

## Application Initialization Flow

```
1. main.ts
   - Bootstraps App component
   - Provides app configuration (providers)
   ↓
2. app.config.ts
   - Registers routes
   - Registers HTTP client + interceptors
   - Registers services
   ↓
3. App Component (app.component.ts)
   - Renders <router-outlet/>
   - Checks auth status on startup (ngOnInit)
   - Calls authService.checkAuthStatus()
   ↓
4. Router
   - Evaluates current URL
   - Runs route guards (PrivateGuard/PublicGuard)
   - Loads appropriate component (Home or Login)
   ↓
5. Component Lifecycle
   - Constructor: DI resolution
   - ngOnInit: Component initialization
   - Render: Template with data bindings
   - User interactions: Event handlers
```

---

## Best Practices from Your Codebase

### ✅ Good Patterns

1. **Standalone Components**: Modern Angular approach (no NgModules)
2. **Signals**: Reactive state management
3. **Services for State**: AuthService as singleton
4. **HTTP Interceptor**: Global error handling
5. **Route Guards**: Protect private routes
6. **Type Safety**: TypeScript interfaces for API responses

### ⚠️ Potential Improvements

1. **Unsubscribe Management**: Use `takeUntilDestroyed()` for subscriptions
   ```typescript
   import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
   
   constructor() {
       this.http.get('/api').pipe(
           takeUntilDestroyed()  // Auto-unsubscribe on destroy
       ).subscribe(/* ... */);
   }
   ```

2. **Error Handling**: Add global error boundaries
3. **Loading States**: Centralize loading state management
4. **Form Validation**: Use Reactive Forms for complex forms

---

## Summary for React Developers

Think of Angular as:

- **Services** = Custom Hooks + Context combined
- **@Input/@Output** = Props + Callbacks
- **Signals** = useState (but more powerful)
- **Dependency Injection** = Context without Provider hell
- **Observables** = Promises + cancellation + operators
- **Guards** = Route-level HOCs
- **Interceptors** = Axios interceptors

**Key Mental Shift:**
- React: "Everything is a component, state flows down"
- Angular: "Components for UI, services for logic, DI for sharing"

**State Philosophy:**
- React: Top-down data flow, lift state up
- Angular: Services hold shared state, inject where needed

---

## Quick Start Checklist

To work effectively in this codebase:

- [ ] Understand **Signals** (reactive state primitives)
- [ ] Learn **Dependency Injection** (constructor injection)
- [ ] Master **RxJS Observables** (subscribe, pipe, operators)
- [ ] Use **@Input/@Output** for component communication
- [ ] Leverage **Services** for shared logic and state
- [ ] Implement **Route Guards** for access control
- [ ] Use **HTTP Interceptors** for global request/response handling
- [ ] Follow **Standalone Component** pattern (no modules)

---

## Useful Resources

- [Angular Signals Guide](https://angular.io/guide/signals)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular HTTP Client](https://angular.io/guide/http)
- [Dependency Injection](https://angular.io/guide/dependency-injection)

---

**Happy Coding! 🚀**

