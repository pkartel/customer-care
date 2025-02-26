import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-message-input',
    templateUrl: './message-input.component.html',
    styleUrls: ['./message-input.component.scss']
  })
  export class MessageInputComponent {
    @Input('disabled') sendingDisabled!: boolean
    @Output() onMessageSubmit = new EventEmitter<string>()

    constructor(private fb: FormBuilder) {}

    messageForm = this.fb.group({
        text: this.fb.control('', [Validators.required]),
    });

    submitMessage() {
        const { text } = this.messageForm.value
        text ? this.onMessageSubmit.emit(text) : this.messageForm.setValue({ text: '' })
    }

    resetMessage() {
        this.messageForm.reset()
    }
  }