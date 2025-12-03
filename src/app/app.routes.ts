import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LoginPage } from './pages/login/login';

export const routes: Routes = [
    { path: "oauth/callback", component: Home },
    { path: "login", component: LoginPage }
];
