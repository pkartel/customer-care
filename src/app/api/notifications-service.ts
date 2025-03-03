import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiMessage } from './tickets.service';

export type ApiNotification = {
  progress: number;
  results: Array<ApiNotificationResult>
}

type ApiNotificationResult =  Pick<ApiMessage, 'senderId' | 'senderType' | 'text'> & {
  ticketId: number;
  success: boolean;
  createdAt?: Date;
  error?: any;
}

@Injectable({
   providedIn: 'root'
})
export class NotificationsService {
  private eventSource: EventSource | null = null;
  private baseUrl = "http://localhost:8000/api/v1"
  private url = `${this.baseUrl}/tickets/notifications/clients`;

  constructor(private zone: NgZone) {}

  openStream = (senderId: string): Observable<ApiNotification> => {
    this.eventSource = new EventSource(`${this.url}/${senderId}`);

    return new Observable(observer => {
      this.eventSource!.onmessage = (event) => {
        this.zone.run(() => {
          console.log('Received event:', event.data);
          
          const data = JSON.parse(event.data);
          observer.next(data)
        });
      };

      this.eventSource!.onerror = (error) => {
        this.zone.run(() => observer.error(error));
      };

      return () => {
        this.close();
      };
    });
  }

  close(): void {
    if (!this.eventSource) {
        return;
    }

    this.eventSource.close();
    this.eventSource = null;
  }
}