import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { ImagePicker, ImageData } from "../../components/fileUpload/image-picker.component";
import { SummarizeButton } from "../../components/summarize-button/summarize-button.component";
import { ChatDisplay, ChatMessage } from "../../components/chat-display/chat-display.component";
import { SummarizationService, ChatHistoryItem } from "../../service/summarization.service";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { ButtonModule } from 'primeng/button';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-home',
    imports: [
        CommonModule,
        ImagePicker,
        SummarizeButton,
        ChatDisplay,
        ButtonModule
    ],
    templateUrl: "./home.html"
})
export class Home implements OnInit {
    // State management
    currentImage = signal<ImageData | null>(null);
    messages = signal<ChatMessage[]>([]);
    isLoading = signal<boolean>(false);

    // Chat history state
    chatHistory = signal<ChatHistoryItem[]>([]);
    historyLoading = signal<boolean>(false);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private summarizationService: SummarizationService,
        public authService: AuthService,
    ) { }

    // Expose user data from AuthService (accessed after constructor)
    get currentUser() {
        const user = this.authService.currentUser();

        return {
            email: user?.email,
            username: user?.username,
            id: user?.id,
            avatarUrl: user?.avatarUrl,
        };
    }

    // // Computed property for display name with fallback
    // computedCurrentUser = computed(() => {
    //     const user = this.authService.currentUser();
    //     return user?.username || 'Guest User';
    // });

    ngOnInit(): void {
        // Log user data for debugging
        console.log('Current user in Home:', this.currentUser);

        // Load chat history
        this.loadChatHistory();
    }

    /**
     * Load chat history from the server
     */
    loadChatHistory(): void {
        this.historyLoading.set(true);

        this.summarizationService.getHistory().subscribe({
            next: (history) => {
                this.chatHistory.set(history);
                this.historyLoading.set(false);
                console.log('Chat history loaded:', history);
            },
            error: (error) => {
                console.error('Error loading chat history:', error);
                this.historyLoading.set(false);
            }
        });
    }

    getImageUrl(imageUrl: string): string {
        return new URL(imageUrl, environment.backendBaseUrl).href;
    }

    onImageSelected(imageData: ImageData): void {
        this.currentImage.set(imageData);
    }

    onSummarize(): void {
        const image = this.currentImage();

        if (!image) {
            return;
        }

        // Store base64 data URL for later use
        const imageDataUrl = image.dataUrl;

        // Add user message with image
        const userMessage: ChatMessage = {
            type: 'user',
            content: 'Please summarize this image',
            imageUrl: imageDataUrl,
            timestamp: new Date()
        };

        this.messages.update(msgs => [...msgs, userMessage]);
        this.isLoading.set(true);

        // Call API to get summary
        this.summarizationService.summarizeImage(image.file).subscribe({
            next: (response) => {
                const aiMessage: ChatMessage = {
                    type: 'ai',
                    content: response.response,
                    timestamp: new Date()
                };

                this.messages.update(msgs => [...msgs, aiMessage]);
                this.isLoading.set(false);

                // Add new item to the front of chat history (since we're ordering by desc)
                // Use the base64 data URL directly instead of backend's imageUrl
                const newHistoryItem: ChatHistoryItem = {
                    id: response.id,
                    userId: response.userId,
                    imageUrl: imageDataUrl, // Use base64 directly
                    response: response.response,
                    createdAt: new Date().toISOString()
                };
                this.chatHistory.update(history => [newHistoryItem, ...history]);
            },
            error: (error) => {
                console.error('Error summarizing image:', error);

                // Extract error details for debugging
                let errorDetails = 'Unknown error';
                if (error?.error?.message) {
                    errorDetails = error.error.message;
                } else if (error?.message) {
                    errorDetails = error.message;
                } else if (error?.statusText) {
                    errorDetails = error.statusText;
                }

                const errorMessage: ChatMessage = {
                    type: 'ai',
                    content: `Sorry, I encountered an error while processing your image.\n\nError Details: ${errorDetails}\n\nStatus Code: ${error?.status || 'N/A'}`,
                    timestamp: new Date(),
                    isError: true
                };

                this.messages.update(msgs => [...msgs, errorMessage]);
                this.isLoading.set(false);
            },
            complete: () => {
                this.currentImage.set(null);

            }
        });
    }

    onLogout(): void {
        this.authService.logout();
    }

    /**
     * Navigate to chat detail page
     */
    onChatClick(chatItem: ChatHistoryItem): void {
        this.router.navigate(['/chat', chatItem.id], {
            state: { chatItem }
        });
    }
}
