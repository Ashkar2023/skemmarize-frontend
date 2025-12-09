import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../service/auth.service";

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError(err => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                // If refresh token endpoint fails, logout
                if (err.url?.includes("/auth/refresh")) {
                    authService.logout();
                    return throwError(() => err);
                }

                return handle401Error(req, next, authService, router);
            }

            return throwError(() => err);
        })
    );
};

function handle401Error(
    req: HttpRequest<any>,
    next: HttpHandlerFn,
    authService: AuthService,
    router: Router
) {
    if (isRefreshing) {
        return refreshTokenSubject.pipe(
            filter(token => token === true),
            take(1),
            switchMap(() => next(req))
        );
    }

    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
        switchMap(() => {
            isRefreshing = false;
            refreshTokenSubject.next(true);
            return next(req);
        }),
        catchError((err) => {
            isRefreshing = false;
            refreshTokenSubject.next(false);

            authService.logout();
            router.navigate(['/login']);
            return throwError(() => err);
        })
    );
}