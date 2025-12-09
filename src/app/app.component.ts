import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
        <router-outlet/>
    `,
})
export class App implements OnInit {

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        // Check authentication status and load user data on app initialization
        this.authService.checkAuthStatus().subscribe({
            next: (isLoggedIn) => {
                if (isLoggedIn) {
                    console.log('User authenticated:', this.authService.getUser());
                } else {
                    console.log('User not authenticated');
                }
            },
            error: (err) => {
                console.error('Auth check failed:', err);
            }
        });
    }
}
