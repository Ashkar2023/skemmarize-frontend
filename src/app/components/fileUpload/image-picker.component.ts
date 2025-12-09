import { Component, EventEmitter, Output } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';

type FileUploadEvent = {
    originalEvent: Event,
    currentFiles: File[]
}

export interface ImageData {
    file: File;
    dataUrl: string;
}

@Component({
    selector: 'image-picker',
    templateUrl: './image-picker.component.html',
    standalone: true,
    imports: [FileUpload, CommonModule],
    providers: []
})
export class ImagePicker {
    @Output() imageSelected = new EventEmitter<ImageData>();

    constructor() { }

    onFileSelect(event: FileUploadEvent): void {
        const imageFile = event.currentFiles[0];

        if (imageFile) {
            const fileReader = new FileReader();
            
            fileReader.onload = (e: ProgressEvent<FileReader>) => {
                const dataUrl = e.target?.result as string;
                this.imageSelected.emit({
                    file: imageFile,
                    dataUrl: dataUrl
                });
            }

            fileReader.readAsDataURL(imageFile);
        }
    }
}