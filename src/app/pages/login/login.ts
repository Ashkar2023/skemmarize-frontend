import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginPage {
    onSignup() {
        let redirect_uri = encodeURIComponent("http://localhost:4200/oauth/callback");
        let scopes = encodeURIComponent("read:user user:email");
        let client_id = "Ov23liYz1WyBW3i4SthW";

        window.location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scopes}&state=SOME_RANDOM_STRING`;
    }
}
