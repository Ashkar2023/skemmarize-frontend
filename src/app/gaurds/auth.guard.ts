import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../service/auth.service";
import { map, take } from "rxjs";

export const PrivateGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If auth hasn't been checked yet, check it first
    if (!authService.isAuthChecked()) {
        return authService.checkAuthStatus().pipe(
            take(1),
            map(isLoggedIn => {
                if (isLoggedIn) {
                    return true;
                } else {
                    router.navigate(["/login"]);
                    return false;
                }
            })
        );
    }

    // Auth already checked, use cached value
    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(["/login"]);
        return false;
    }
};

export const PublicGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If auth hasn't been checked yet, check it first
    if (!authService.isAuthChecked()) {
        return authService.checkAuthStatus().pipe(
            take(1),
            map(isLoggedIn => {
                if (!isLoggedIn) {
                    return true;
                } else {
                    router.navigate(["/"]);
                    return false;
                }
            })
        );
    }

    // Auth already checked, use cached value
    if (!authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(["/"]);
        return false;
    }
};