import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { Message, Ticket } from '../api/types';
import { catchError, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MessageInputComponent } from '../shared/message-input/message-input.component';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnDestroy {
  _ticketId = 0;
  ticket$ = new Observable<Ticket>();
  messages$ = new Observable<Message[]>();
  private destroy$ = new Subject<void>();

  @Input()
  set ticketId(ticketId: number) {
    this._ticketId = ticketId;
    this.ticket$ = this.api.getTicket(this._ticketId).pipe(
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.messages$ = this.ticket$.pipe(
      switchMap(({ id }) => this.api.getTicketMessages(id)),
      shareReplay(1),
      catchError((_err, caught) => {
        this.router.navigate(["home", "tickets", "not-found"]);
        return caught;
      }),
      takeUntil(this.destroy$)
    )

    this.messageInputComponent?.resetMessage();
  }

  get ticketId() {
    return this._ticketId;
  }

  @ViewChild(MessageInputComponent)
  private messageInputComponent!: MessageInputComponent 

  constructor(
    private api: TicketsService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByItems(index: number, item: Message): number {
    return item.id;
  }

  closeTicket(ticketId: number) {
    this.api.resolveTicket(ticketId).subscribe(t => {
      this.ticketId = this._ticketId;
      this.snackBar.open("Ticket resolved", "Close", { duration: 3000 });
    });
  }

  sendMessage(text: string) {
    const senderType = "operator", senderId = "operator1";
    this.api.addMessageToTicket(this._ticketId, { text: text!, senderType, senderId }).subscribe(_message => {
      this.ticketId = this._ticketId;
      this.snackBar.open("Message sent", "Close", { duration: 3000 });
    });
  }
}
