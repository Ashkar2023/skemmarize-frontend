# Skemmarize Application Flow Diagrams

## 1. Complete Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     main.ts                              │  │
│  │              bootstraps App Component                    │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │                  app.config.ts                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Providers (Dependency Injection Registry)          │  │  │
│  │  │  • provideRouter(routes)                           │  │  │
│  │  │  • provideHttpClient(withInterceptors([...]))      │  │  │
│  │  │  • providePrimeNG(theme)                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │               App Component (Root)                       │  │
│  │  template: <router-outlet/>                              │  │
│  │                                                           │  │
│  │  ngOnInit():                                              │  │
│  │    Check auth: GET /auth/me                              │  │
│  │    └─> authService.setLoggedIn(true/false)               │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│         ┌────────────────┴────────────────┐                    │
│         │                                 │                    │
│  ┌──────▼─────────┐              ┌───────▼────────┐           │
│  │  Login Page    │              │   Home Page    │           │
│  │  /login        │              │   /            │           │
│  │ [PublicGuard]  │              │ [PrivateGuard] │           │
│  └────────────────┘              └────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Dependency Injection System

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES (Singletons)                        │
│                 @Injectable({ providedIn: 'root' })             │
│                                                                 │
│  ┌────────────────────────┐      ┌─────────────────────────┐  │
│  │   AuthService          │      │ SummarizationService    │  │
│  │                        │      │                         │  │
│  │  - _loggedIn           │      │  - apiUrl               │  │
│  │  - _authChecked        │      │                         │  │
│  │                        │      │  Methods:               │  │
│  │  Methods:              │      │  • summarizeImage()     │  │
│  │  • checkAuthStatus()   │      │                         │  │
│  │  • logout()            │      │  Uses:                  │  │
│  │  • refreshToken()      │      │  • HttpClient           │  │
│  │  • setLoggedIn()       │      │                         │  │
│  │  • isLoggedIn()        │      │                         │  │
│  │                        │      │                         │  │
│  │  Uses:                 │      │                         │  │
│  │  • HttpClient          │      │                         │  │
│  │  • Router              │      │                         │  │
│  └────────┬───────────────┘      └────────┬────────────────┘  │
│           │                               │                    │
│           └───────────┬───────────────────┘                    │
│                       │ (Injected via constructor)             │
└───────────────────────┼────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐
   │   App   │    │   Home    │   │  Login  │
   │Component│    │ Component │   │Component│
   └─────────┘    └───────────┘   └─────────┘
```

## 3. Home Page Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Home Component                          │
│                      (Smart/Container)                          │
│                                                                 │
│  State (Signals):                                               │
│  • currentImage = signal<ImageData | null>(null)                │
│  • messages = signal<ChatMessage[]>([])                         │
│  • isLoading = signal<boolean>(false)                           │
│                                                                 │
│  Injected Services:                                             │
│  • SummarizationService                                         │
│  • Router                                                       │
│                                                                 │
│  Methods:                                                       │
│  • onImageSelected(imageData) → currentImage.set(imageData)     │
│  • onSummarize() → call API, update messages                    │
│                                                                 │
└────┬──────────────┬──────────────┬──────────────┬──────────────┘
     │              │              │              │
     │              │              │              │
┌────▼─────┐  ┌────▼──────┐  ┌────▼─────┐  ┌─────▼─────┐
│ Navbar   │  │   Image   │  │Summarize │  │   Chat    │
│Component │  │  Picker   │  │  Button  │  │  Display  │
│(Dumb)    │  │  (Dumb)   │  │  (Dumb)  │  │  (Dumb)   │
└──────────┘  └───────────┘  └──────────┘  └───────────┘
                    │              │              │
                    │ @Output      │ @Output      │ @Input
                    │ imageSelected│ summarize    │ messages
                    │              │              │
                    └──────────────┴──────────────┘
                           Events bubble UP
                           Data flows DOWN
```

## 4. HTTP Request Flow with Interceptor

```
┌─────────────────────────────────────────────────────────────────┐
│                        Component                                │
│  this.summarizationService.summarizeImage(file)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SummarizationService                          │
│  return this.http.post('/chats/summarize', formData, {          │
│      withCredentials: true  // Include JWT cookie               │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HttpClient (Angular)                         │
│  Prepares HTTP request                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AuthInterceptor (Intercepts ALL requests)      │
│                                                                 │
│  next(request).pipe(                                            │
│      catchError(err => {                                        │
│          if (err.status === 401) {                              │
│              ┌─────────────────────────────────────┐            │
│              │  Token Refresh Flow                 │            │
│              │  1. Call /auth/refresh              │            │
│              │  2. If success → retry original req │            │
│              │  3. If fail → logout & redirect     │            │
│              └─────────────────────────────────────┘            │
│          }                                                       │
│      })                                                          │
│  )                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  NETWORK        │
                   │  (Backend API)  │
                   └─────────┬───────┘
                             │
                             ▼ (Response)
┌─────────────────────────────────────────────────────────────────┐
│                     Component Subscribe                         │
│  .subscribe({                                                   │
│      next: (response) => {                                      │
│          this.messages.update(msgs => [...msgs, aiMessage])     │
│          this.isLoading.set(false)                              │
│      },                                                          │
│      error: (err) => { /* handle error */ }                     │
│  })                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    App Startup (App Component)                  │
│                                                                 │
│  ngOnInit() {                                                   │
│      this.http.get('/auth/me', { withCredentials: true })      │
│          .subscribe({                                           │
│              next: () => authService.setLoggedIn(true),         │
│              error: () => authService.setLoggedIn(false)        │
│          })                                                      │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼ (Logged In)             ▼ (Not Logged In)
     ┌─────────────────────┐   ┌─────────────────────────┐
     │  Navigate to "/"    │   │  Navigate to "/login"   │
     └──────────┬──────────┘   └──────────┬──────────────┘
                │                         │
                ▼                         ▼
     ┌─────────────────────┐   ┌─────────────────────────┐
     │  PrivateGuard       │   │  PublicGuard            │
     │  Checks:            │   │  Checks:                │
     │  isLoggedIn()       │   │  !isLoggedIn()          │
     │  ✓ Allow → Home     │   │  ✓ Allow → Login        │
     │  ✗ Deny → /login    │   │  ✗ Deny → /            │
     └─────────────────────┘   └─────────────────────────┘
```

## 6. Login Flow (OAuth with GitHub)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Login Page                               │
│  User clicks "Sign in with GitHub"                              │
│  window.location.href = '/oauth2/authorization/github'          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                        │
│  Redirects to GitHub OAuth                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub                                  │
│  User authorizes app                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                        │
│  1. Receives authorization code                                 │
│  2. Exchanges for access token                                  │
│  3. Fetches user profile from GitHub                            │
│  4. Creates user in database (if new)                           │
│  5. Generates JWT tokens (access + refresh)                     │
│  6. Sets HTTP-only cookies:                                     │
│     • ajwt (access token)                                       │
│     • rjwt (refresh token)                                      │
│  7. Redirects to: /login?success=true                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Login Page                               │
│  ngOnInit() {                                                   │
│      this.route.queryParams.subscribe(params => {               │
│          if (params['success'] === 'true') {                    │
│              authService.setLoggedIn(true)                      │
│              router.navigate(['/'])                             │
│          }                                                       │
│      })                                                          │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   Home Page    │
                    └────────────────┘
```

## 7. Image Summarization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User selects image                                      │
│                                                                 │
│  ImagePicker Component                                          │
│  onFileSelect(event) {                                          │
│      const file = event.currentFiles[0]                         │
│      const reader = new FileReader()                            │
│      reader.onload = (e) => {                                   │
│          this.imageSelected.emit({                              │
│              file: file,                                        │
│              dataUrl: e.target.result  // base64 string         │
│          })                                                      │
│      }                                                           │
│      reader.readAsDataURL(file)                                 │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ @Output imageSelected
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Parent receives image data                              │
│                                                                 │
│  Home Component                                                 │
│  onImageSelected(imageData) {                                   │
│      this.currentImage.set(imageData)  // Update signal         │
│  }                                                               │
│                                                                 │
│  Template:                                                      │
│  <image-picker (imageSelected)="onImageSelected($event)"/>      │
│                                                                 │
│  Signal triggers UI update:                                     │
│  • Display image preview                                        │
│  • Enable "Summarize" button                                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: User clicks "Summarize" button                          │
│                                                                 │
│  SummarizeButton Component                                      │
│  onSummarize() {                                                │
│      this.summarize.emit()  // Emit event to parent             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ @Output summarize
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Parent handles summarize event                          │
│                                                                 │
│  Home Component                                                 │
│  onSummarize() {                                                │
│      const image = this.currentImage()  // Read signal          │
│                                                                 │
│      // 1. Add user message to chat                             │
│      const userMessage = {                                      │
│          type: 'user',                                          │
│          content: 'Please summarize this image',                │
│          imageUrl: image.dataUrl,                               │
│          timestamp: new Date()                                  │
│      }                                                           │
│      this.messages.update(msgs => [...msgs, userMessage])       │
│                                                                 │
│      // 2. Set loading state                                    │
│      this.isLoading.set(true)                                   │
│                                                                 │
│      // 3. Call API                                             │
│      this.summarizationService.summarizeImage(image.file)       │
│          .subscribe({ /* ... */ })                              │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Service makes API call                                  │
│                                                                 │
│  SummarizationService                                           │
│  summarizeImage(file) {                                         │
│      const formData = new FormData()                            │
│      formData.append('image', file)                             │
│                                                                 │
│      return this.http.post('/chats/summarize', formData, {      │
│          withCredentials: true  // Include JWT cookie           │
│      })                                                          │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼ (goes through AuthInterceptor)
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Spring Boot)                    │
│  1. Validates JWT from cookie                                   │
│  2. Receives image file                                         │
│  3. Calls AI service (e.g., OpenAI Vision API)                  │
│  4. Gets summary/description                                    │
│  5. Saves to database                                           │
│  6. Returns response:                                           │
│     {                                                            │
│         id: 123,                                                │
│         userId: 456,                                            │
│         imageUrl: "...",                                        │
│         response: "This image shows..."                         │
│     }                                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Handle response in component                            │
│                                                                 │
│  Home Component                                                 │
│  .subscribe({                                                   │
│      next: (response) => {                                      │
│          // 1. Create AI message                                │
│          const aiMessage = {                                    │
│              type: 'ai',                                        │
│              content: response.response,                        │
│              timestamp: new Date()                              │
│          }                                                       │
│                                                                 │
│          // 2. Update messages                                  │
│          this.messages.update(msgs => [...msgs, aiMessage])     │
│                                                                 │
│          // 3. Clear loading & current image                    │
│          this.isLoading.set(false)                              │
│          this.currentImage.set(null)                            │
│      },                                                          │
│      error: (err) => {                                          │
│          // Add error message to chat                           │
│          this.messages.update(msgs => [...msgs, errorMessage])  │
│          this.isLoading.set(false)                              │
│      }                                                           │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: UI updates automatically                                │
│                                                                 │
│  ChatDisplay Component                                          │
│  @Input() messages: ChatMessage[]                               │
│                                                                 │
│  • Receives updated messages array                              │
│  • Renders new AI message                                       │
│  • Auto-scrolls to bottom (ngAfterViewChecked)                  │
│                                                                 │
│  Template:                                                      │
│  @for (msg of messages; track msg.timestamp) {                  │
│      <div class="message">{{ msg.content }}</div>               │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Route Guard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              User navigates to a route                          │
│              (e.g., router.navigate(['/']))                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Router                                       │
│  Looks up route configuration:                                  │
│  { path: "", component: Home, canActivate: [PrivateGuard] }    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PrivateGuard (Route Guard)                     │
│                                                                 │
│  const authService = inject(AuthService)                        │
│  const router = inject(Router)                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Check: isAuthChecked()?                          │          │
│  └────┬─────────────────────────────────────┬───────┘          │
│       │ NO                                   │ YES              │
│       ▼                                      ▼                  │
│  ┌─────────────────────┐      ┌─────────────────────────┐     │
│  │ Call checkAuthStatus│      │ Use cached value        │     │
│  │ GET /auth/me        │      │ isLoggedIn()            │     │
│  │                     │      └────┬────────────┬───────┘     │
│  │ Returns Observable  │           │ true       │ false        │
│  └──────┬──────────────┘           │            │              │
│         │                           ▼            ▼              │
│         │ map(isLoggedIn => ...)  Allow     Redirect /login    │
│         │                                                       │
│         └─> Allow or Deny                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Return true                 │ Return false
              ▼                             ▼
     ┌────────────────┐           ┌────────────────────┐
     │ Load Component │           │ Block navigation   │
     │ (Home)         │           │ Redirect to /login │
     └────────────────┘           └────────────────────┘
```

## 9. Token Refresh Flow (401 Error Handling)

```
┌─────────────────────────────────────────────────────────────────┐
│             Component makes API request                         │
│             http.get('/api/data')                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Request sent to backend                      │
│                    (includes ajwt cookie)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Backend       │
                    │  Returns 401   │ (Token expired)
                    └────────┬───────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AuthInterceptor catches error                │
│                                                                 │
│  catchError(err => {                                            │
│      if (err.status === 401) {                                  │
│          return handle401Error(...)                             │
│      }                                                           │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  handle401Error Function                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Check: Is token refresh already in progress?    │          │
│  └────┬─────────────────────────────────────┬───────┘          │
│       │ YES                                  │ NO               │
│       ▼                                      ▼                  │
│  ┌─────────────────────┐      ┌─────────────────────────┐     │
│  │ Wait for existing   │      │ Start refresh process   │     │
│  │ refresh to complete │      │ isRefreshing = true     │     │
│  │                     │      │                         │     │
│  │ refreshTokenSubject │      │ Call:                   │     │
│  │  .pipe(             │      │ authService             │     │
│  │    filter(token=>   │      │   .refreshToken()       │     │
│  │      token===true), │      │                         │     │
│  │    take(1),         │      │ GET /auth/refresh       │     │
│  │    switchMap(() =>  │      │ (uses rjwt cookie)      │     │
│  │      next(req))     │      └─────────┬───────────────┘     │
│  │  )                  │                │                      │
│  │                     │      ┌─────────▼───────────┐         │
│  │ Then retry original │      │ Backend validates   │         │
│  │ request             │      │ refresh token       │         │
│  └─────────────────────┘      │ Issues new ajwt     │         │
│                               └─────────┬───────────┘         │
│                                         │                      │
│                               ┌─────────┴───────────┐         │
│                               │ Success │ Failure   │         │
│                               ▼         ▼           │         │
│                      ┌───────────┐  ┌──────────┐   │         │
│                      │ Set flags │  │ Logout   │   │         │
│                      │ isRefresh-│  │ Redirect │   │         │
│                      │ ing=false │  │ /login   │   │         │
│                      │           │  └──────────┘   │         │
│                      │ Broadcast │                 │         │
│                      │ success   │                 │         │
│                      │           │                 │         │
│                      │ Retry     │                 │         │
│                      │ original  │                 │         │
│                      │ request   │                 │         │
│                      └───────────┘                 │         │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               Original request succeeds with new token          │
│               Component receives data                           │
└─────────────────────────────────────────────────────────────────┘
```

## 10. Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│             User clicks "Logout" button                         │
│             (e.g., in NavbarComponent)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Component calls service                      │
│                    authService.logout()                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AuthService.logout()                         │
│                                                                 │
│  this.http.get('/auth/logout', {                                │
│      withCredentials: true                                      │
│  }).subscribe({                                                 │
│      next: () => {                                              │
│          this._loggedIn = false                                 │
│          this.router.navigate(['/login'])                       │
│      },                                                          │
│      error: () => {                                             │
│          // Force logout even if API fails                      │
│          this._loggedIn = false                                 │
│          this.router.navigate(['/login'])                       │
│      }                                                           │
│  })                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                        │
│  1. Invalidates JWT cookies (ajwt, rjwt)                        │
│  2. Clears session                                              │
│  3. Returns 200 OK                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AuthService                                  │
│  • Sets _loggedIn = false                                       │
│  • Navigates to /login                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Router                                       │
│  • Runs PublicGuard                                             │
│  • Loads LoginPage component                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary of Key Patterns

### 1. **Data Flow Direction**
- **Down:** Parent → Child via `@Input()`
- **Up:** Child → Parent via `@Output()` + EventEmitter
- **Sideways:** Via Services (Dependency Injection)

### 2. **State Locations**
- **Local:** Component Signals (`signal()`)
- **Shared:** Services (`@Injectable`)
- **URL:** Route Parameters/Query Params

### 3. **Communication Patterns**
- **Parent-Child:** Props & Events
- **Sibling-Sibling:** Shared Service
- **Unrelated Components:** Shared Service
- **Cross-cutting Concerns:** Interceptors

### 4. **Lifecycle Flow**
1. Constructor → Dependency Injection
2. ngOnInit → Component initialization
3. Render → Template with data bindings
4. User Interaction → Event handlers
5. State Change → Signals trigger re-render
6. ngOnDestroy → Cleanup (unsubscribe)

---

**This visual guide should help you understand how data flows through your Angular application!**

