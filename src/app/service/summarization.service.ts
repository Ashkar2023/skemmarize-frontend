import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SummarizationResponse {
    id: number;
    userId: number;
    imageUrl: string;
    response: string;
}

export interface ChatHistoryItem {
    id: number;
    userId: number;
    imageUrl: string;
    response: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class SummarizationService {
    private apiUrl = `${environment.backendBaseUrl}/chats/summarize`;
    private historyUrl = `${environment.backendBaseUrl}/chats/history`;

    constructor(private http: HttpClient) { }

    summarizeImage(imageFile: File): Observable<SummarizationResponse> {
        const formData = new FormData();
        formData.append('image', imageFile);

        return this.http.post<SummarizationResponse>(this.apiUrl, formData, {
            withCredentials: true // Include JWT cookie (ajwt) in request
        });
    }

    /**
     * Get chat history for the current user
     * @returns Observable array of chat history items
     */
    getHistory(): Observable<ChatHistoryItem[]> {
        return this.http.get<ChatHistoryItem[]>(this.historyUrl, {
            withCredentials: true // Include JWT cookie (ajwt) in request
        });
    }
}
