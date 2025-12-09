# User Data Storage Implementation Guide

## Overview

This document explains how user data is now stored and accessed throughout your Angular application using **Signals** for reactive state management.

---

## 🎯 What Was Implemented

### 1. **User Model** (`src/app/models/user.model.ts`)

Defined TypeScript interfaces for type safety:

```typescript
export interface User {
    id: number;
    username: string;
    email?: string;
    avatarUrl?: string;
}

export interface AuthMeResponse {
    id: number;
    username: string;
    email?: string;
    avatarUrl?: string;
}
```

**📝 Note:** Update these interfaces to match your actual backend response from `/auth/me`.

---

### 2. **AuthService with User Storage** (`src/app/service/auth.service.ts`)

#### Added User Signal

```typescript
// Private signal (internal state)
private _currentUser = signal<User | null>(null);

// Public read-only signal (prevents external modification)
public readonly currentUser = this._currentUser.asReadonly();
```

**Why Signals?**
- Reactive: UI automatically updates when user data changes
- Type-safe: TypeScript knows the exact structure
- Performance: Only components using the signal re-render
- Simple: No complex state management library needed

#### Key Methods

| Method | Purpose | Usage |
|--------|---------|-------|
| `checkAuthStatus()` | Fetches user data from `/auth/me` and stores it | Called on app initialization |
| `currentUser` | Read-only signal with user data | Access in any component: `authService.currentUser()` |
| `getUser()` | Get current user (non-reactive) | For one-time reads: `authService.getUser()` |
| `setUser(user)` | Manually set user data | After OAuth login |
| `logout()` | Clears user data and redirects | User logout |

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    App Initialization                       │
│                    (app.component.ts)                       │
│                                                             │
│  ngOnInit() → authService.checkAuthStatus()                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                              │
│                                                             │
│  HTTP GET /auth/me                                          │
│       ↓                                                     │
│  Response: { id, username, email, avatarUrl }              │
│       ↓                                                     │
│  _currentUser.set(userData)  ← Stores in Signal            │
│       ↓                                                     │
│  Returns: Observable<boolean>                               │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│   Route Guards   │          │   Home Component     │
│  Check isLoggedIn│          │  Display user data   │
└──────────────────┘          └──────────────────────┘
```

---

## 🔧 How to Access User Data in Components

### Method 1: Direct Signal Access (Reactive)

**In Component TypeScript:**

```typescript
export class MyComponent {
    constructor(public authService: AuthService) {}
    
    // Access user signal directly
    get currentUser() {
        return this.authService.currentUser;
    }
}
```

**In Component Template:**

```html
<div>
    <h1>Welcome, {{ authService.currentUser()?.username }}!</h1>
    
    @if (authService.currentUser()) {
        <p>Email: {{ authService.currentUser()!.email }}</p>
        <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar">
    } @else {
        <p>Not logged in</p>
    }
</div>
```

### Method 2: Computed Values (Derived State)

**In Component TypeScript:**

```typescript
import { computed } from '@angular/core';

export class MyComponent {
    constructor(private authService: AuthService) {}
    
    // Computed value - automatically updates when user changes
    displayName = computed(() => {
        const user = this.authService.currentUser();
        return user?.username || 'Guest';
    });
    
    isAdmin = computed(() => {
        const user = this.authService.currentUser();
        return user?.role === 'admin';
    });
}
```

**In Template:**

```html
<h1>Hello, {{ displayName() }}!</h1>

@if (isAdmin()) {
    <button>Admin Panel</button>
}
```

### Method 3: One-Time Read (Non-Reactive)

```typescript
export class MyComponent implements OnInit {
    constructor(private authService: AuthService) {}
    
    ngOnInit() {
        // Get user once (won't update if user changes)
        const user = this.authService.getUser();
        console.log('Current user:', user);
    }
}
```

---

## 🏠 Home Page Implementation Example

**TypeScript (`home.ts`):**

```typescript
export class Home {
    constructor(public authService: AuthService) {}
    
    // Expose user signal
    get currentUser() {
        return this.authService.currentUser;
    }
    
    // Computed display name with fallback
    displayName = computed(() => {
        const user = this.authService.currentUser();
        return user?.username || 'Guest User';
    });
}
```

**Template (`home.html`):**

```html
<div class="user-profile">
    <!-- Avatar with fallback -->
    @if (currentUser()?.avatarUrl) {
        <img [src]="currentUser()!.avatarUrl" alt="Avatar">
    } @else {
        <div class="avatar-placeholder">
            {{ displayName().charAt(0).toUpperCase() }}
        </div>
    }
    
    <!-- User info -->
    <div>
        <h3>{{ displayName() }}</h3>
        @if (currentUser()?.email) {
            <p>{{ currentUser()!.email }}</p>
        }
    </div>
    
    <!-- Logout button -->
    <button (click)="authService.logout()">Logout</button>
</div>
```

---

## 🔐 Authentication Flow with User Data

### 1. **App Initialization**

```typescript
// app.component.ts
ngOnInit() {
    this.authService.checkAuthStatus().subscribe({
        next: (isLoggedIn) => {
            if (isLoggedIn) {
                // User data is now stored in authService.currentUser
                console.log('User:', this.authService.getUser());
            }
        }
    });
}
```

### 2. **Login Flow (OAuth)**

```typescript
// After OAuth redirect to /login?success=true
this.authService.checkAuthStatus().subscribe(isLoggedIn => {
    if (isLoggedIn) {
        // User data automatically fetched and stored
        this.router.navigate(['/']);
    }
});
```

### 3. **Logout Flow**

```typescript
// In any component
this.authService.logout();

// This automatically:
// 1. Calls /auth/logout API
// 2. Clears user data: _currentUser.set(null)
// 3. Updates login state: _loggedIn = false
// 4. Redirects to /login
```

---

## 🧪 Testing Guide

### Test 1: Check User Data on Login

1. Start your backend server
2. Start your Angular app: `npm start`
3. Navigate to `http://localhost:4200`
4. Open browser DevTools → Console
5. You should see: `"User authenticated:" { id: ..., username: ... }`

### Test 2: Display User Data in Home Page

1. Login via GitHub OAuth
2. On home page, check the sidebar
3. You should see:
   - Your GitHub avatar (or first letter of username)
   - Your username
   - Your email or user ID

### Test 3: Logout Clears User Data

1. Click logout button
2. Check Console - user data should be cleared
3. Redirected to login page

### Test 4: User Data Persists on Refresh

1. Login and note your user data
2. Refresh the page (F5)
3. User data should be automatically loaded again
4. Check sidebar - should still show your info

---

## 🐛 Debugging Tips

### Check if User Data is Loaded

```typescript
// In any component
console.log('Current user:', this.authService.currentUser());
console.log('Is logged in:', this.authService.isLoggedIn());
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| User data is `null` | Backend not returning user data | Check backend `/auth/me` endpoint |
| User data not updating in UI | Not using signal correctly | Use `currentUser()` with parentheses |
| Type errors | Backend returns different fields | Update `User` interface in `user.model.ts` |
| Avatar not showing | Backend returns wrong field name | Check backend response, update interface |

### Backend Response Check

Open Network tab and check `/auth/me` response:

```json
{
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "avatarUrl": "https://..."
}
```

If your backend returns different fields, update `src/app/models/user.model.ts`.

---

## 🔄 Migration from React

If you're coming from React, here's the comparison:

### React (Context + useState)

```jsx
// Context Provider
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// In Component
const MyComponent = () => {
    const { user } = useContext(AuthContext);
    return <div>{user?.username}</div>;
};
```

### Angular (Service + Signals)

```typescript
// Service (like Context)
@Injectable({ providedIn: 'root' })
export class AuthService {
    private _currentUser = signal<User | null>(null);
    public readonly currentUser = this._currentUser.asReadonly();
}

// In Component (NO PROVIDER NEEDED!)
@Component({
    template: `<div>{{ authService.currentUser()?.username }}</div>`
})
export class MyComponent {
    constructor(public authService: AuthService) {}
}
```

**Key Differences:**
- ✅ No Provider wrapper needed
- ✅ Automatic injection everywhere
- ✅ Type-safe by default
- ✅ True singleton (one instance)

---

## 📝 Customization

### Add More User Fields

1. Update backend to return new fields in `/auth/me`
2. Update interfaces in `src/app/models/user.model.ts`:

```typescript
export interface User {
    id: number;
    username: string;
    email?: string;
    avatarUrl?: string;
    role?: 'user' | 'admin';           // NEW
    createdAt?: string;                 // NEW
    preferences?: { theme: string };    // NEW
}
```

3. Use in components:

```html
@if (authService.currentUser()?.role === 'admin') {
    <button>Admin Panel</button>
}
```

### Add User Loading State

```typescript
// In AuthService
private _userLoading = signal(false);
public readonly userLoading = this._userLoading.asReadonly();

checkAuthStatus(): Observable<boolean> {
    this._userLoading.set(true);
    
    return this.http.get<AuthMeResponse>(...).pipe(
        tap(() => this._userLoading.set(false)),
        catchError(() => {
            this._userLoading.set(false);
            return of(false);
        })
    );
}
```

---

## ✅ Summary

### What You Now Have:

1. ✅ **Global user state** stored in `AuthService`
2. ✅ **Reactive updates** using Signals
3. ✅ **Type-safe** user data with TypeScript interfaces
4. ✅ **Automatic fetching** on app initialization
5. ✅ **Clean logout** that clears all user data
6. ✅ **Easy access** from any component via DI

### How to Use in Any Component:

```typescript
// 1. Inject AuthService
constructor(public authService: AuthService) {}

// 2. Access in template
{{ authService.currentUser()?.username }}

// 3. Or create computed values
displayName = computed(() => 
    this.authService.currentUser()?.username || 'Guest'
);
```

### Nothing Breaks:

- ✅ Existing authentication logic unchanged
- ✅ Route guards still work the same way
- ✅ Login/logout flows unchanged
- ✅ Backward compatible with all existing code

---

## 🚀 Next Steps

1. **Update User Interface**: Match your backend's actual response fields
2. **Test Authentication**: Login and check user data in console
3. **Customize Display**: Update home page with your design
4. **Add Features**: Use user data for personalization
5. **Add Error Handling**: Handle cases where user data fails to load

---

**Happy Coding! 🎉**

