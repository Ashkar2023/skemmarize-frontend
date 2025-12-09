import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { ChatDetail } from './pages/chat-detail/chat-detail';
import { PrivateGuard, PublicGuard } from './gaurds/auth.guard';

export const routes: Routes = [
    { path: "", component: Home, canActivate: [PrivateGuard] },
    { path: "home", redirectTo: "", pathMatch: "full" },
    { path: "chat/:id", component: ChatDetail, canActivate: [PrivateGuard] },
    { path: "login", component: LoginPage, canActivate: [PublicGuard] },
    { path: "**", redirectTo: "" },
];
