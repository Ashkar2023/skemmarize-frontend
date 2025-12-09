import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'summarize-button',
    templateUrl: './summarize-button.component.html',
    standalone: true,
    imports: [CommonModule, ButtonModule]
})
export class SummarizeButton {
    @Input() disabled: boolean = false;
    @Input() loading: boolean = false;
    @Output() summarize = new EventEmitter<void>();

    onSummarize(): void {
        this.summarize.emit();
    }
}
