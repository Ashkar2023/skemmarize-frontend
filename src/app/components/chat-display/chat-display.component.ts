import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChatMessage {
    type: 'user' | 'ai';
    content: string;
    imageUrl?: string;
    timestamp: Date;
    isError?: boolean;
}

@Component({
    selector: 'chat-display',
    templateUrl: './chat-display.component.html',
    standalone: true,
    imports: [CommonModule],
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
    `]
})
export class ChatDisplay implements AfterViewChecked {
    @Input() messages: ChatMessage[] = [];

    @ViewChild("scrollAnchor")
    private scrollAnchor!: ElementRef;

    ngAfterViewChecked(): void {
        try {
            (this.scrollAnchor.nativeElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: "end" });
        } catch (error) {
            console.error("scroll err: ",error)            
        }
    }
}
