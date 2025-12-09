import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatHistoryItem, SummarizationService } from '../../service/summarization.service';

@Component({
    selector: 'app-chat-detail',
    imports: [CommonModule],
    templateUrl: "./chat-detail.html"
})
export class ChatDetail implements OnInit {
    chatItem = signal<ChatHistoryItem | null>(null);
    loading = signal<boolean>(true);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private summarizationService: SummarizationService
    ) { }

    ngOnInit(): void {
        // Get chat data from navigation state first (instant display)
        const navigation = this.router.getCurrentNavigation();
        const state = history.state as { chatItem?: ChatHistoryItem };
        
        if (state?.chatItem) {
            this.chatItem.set(state.chatItem);
            this.loading.set(false);
        } else {
            // Fallback: load from ID if no state was passed
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.loadChatById(Number(id));
            } else {
                this.loading.set(false);
            }
        }
    }

    /**
     * Load chat item by ID (fallback method)
     */
    loadChatById(id: number): void {
        this.loading.set(true);
        
        // Load all history and find the specific item
        this.summarizationService.getHistory().subscribe({
            next: (history) => {
                const item = history.find(h => h.id === id);
                this.chatItem.set(item || null);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error loading chat:', error);
                this.loading.set(false);
            }
        });
    }

    /**
     * Navigate back to home page
     */
    goBack(): void {
        this.router.navigate(['/home']);
    }
}

