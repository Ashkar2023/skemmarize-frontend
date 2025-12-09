import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { Observable, tap, catchError, of, map } from "rxjs";
import { User, AuthMeResponse } from "../models/user.model";


@Injectable({ providedIn: 'root' })
export class AuthService {
    private _loggedIn = false;
    private _authChecked = false;

    // User data signal (reactive state)
    private _currentUser = signal<User | null>(null);

    // Expose as read-only to prevent external modification
    public readonly currentUser = this._currentUser.asReadonly();

    constructor(private http: HttpClient, private router: Router) { }

    /**
     * Check if user has a valid JWT cookie on app initialization
     * This should be called when the app starts
     * Returns Observable<boolean> for backward compatibility
     */
    checkAuthStatus(): Observable<boolean> {
        if (this._authChecked) {
            return of(this._loggedIn);
        }

        return this.http.get<{ user: AuthMeResponse }>(environment.backendBaseUrl + "/auth/me", {
            withCredentials: true
        }).pipe(
            tap((body) => {
                const { id, email, username, avatar } = body.user;

                this._currentUser.set({
                    id,
                    username,
                    email,
                    avatarUrl: avatar
                });
                this._loggedIn = true;
                this._authChecked = true;
            }),
            map(() => true), // Return boolean for backward compatibility
            catchError(() => {
                this._currentUser.set(null);
                this._loggedIn = false;
                this._authChecked = true;
                return of(false);
            })
        );
    }

    logout() {
        this.http.get(environment.backendBaseUrl + "/auth/logout", {
            withCredentials: true
        }).subscribe({
            next: () => {
                this._loggedIn = false;
                this._currentUser.set(null); // Clear user data
                this.router.navigate(["/login"]);
            },
            error: (err) => {
                console.error("logout failed on server\n", err);
                // Force logout on client side even if server request fails
                this._loggedIn = false;
                this._currentUser.set(null); // Clear user data
                this.router.navigate(["/login"]);
            },
            complete: () => {
                this._loggedIn = false;
                this._currentUser.set(null); // Clear user data
            }
        });
    }

    refreshToken(): Observable<any> {
        return this.http.get(environment.backendBaseUrl + "/auth/refresh", {
            withCredentials: true
        }).pipe(
            tap(() => {
                console.log("token refreshed");
                this._loggedIn = true;
            })
        );
    }

    setLoggedIn(value: boolean) {
        this._loggedIn = value;
        this._authChecked = true;

        // Clear user data if logging out
        if (!value) {
            this._currentUser.set(null);
        }
    }

    /**
     * Set user data manually (used after OAuth login)
     */
    setUser(user: User | null) {
        this._currentUser.set(user);
        if (user) {
            this._loggedIn = true;
            this._authChecked = true;
        }
    }

    isLoggedIn(): boolean {
        return this._loggedIn;
    }

    isAuthChecked(): boolean {
        return this._authChecked;
    }

    /**
     * Get current user data (returns null if not logged in)
     */
    getUser(): User | null {
        return this._currentUser();
    }
}