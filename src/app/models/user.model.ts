/**
 * User model representing authenticated user data
 */
export interface User {
    id: number;
    username: string;
    email?: string;
    avatarUrl?: string;
    // Add other fields based on your backend response from /auth/me
}

/**
 * API response from /auth/me endpoint
 */
export interface AuthMeResponse {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
    // Add other fields your backend returns
}
