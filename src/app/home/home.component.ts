import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiNotification, NotificationsService } from '../api/notifications-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private notificationsApi: NotificationsService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const senderId = "operator1"
    this.notificationsApi
      .openStream(senderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ApiNotification) => {
        if (data) {
          const failedTickets = data.results.reduce((err: string, r) => 
            `${err}${r.success ? '' : (', ' + r.ticketId)}`
          , '')

          const msg = `Progress ${data.progress}% ${failedTickets?.length ? 'Update failed for tickets: ' + failedTickets : ''}`
          this.snackBar.open(msg);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
