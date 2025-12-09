import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginPage {
    
    constructor() { }

    onSignup() {
        window.location.href = `${environment.backendBaseUrl}/oauth2/authorization/github`;
    }
}
