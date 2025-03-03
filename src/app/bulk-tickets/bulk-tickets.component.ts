import { Component, OnInit } from "@angular/core";
import { BulkTicketsService } from "./bulk-tickets.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TicketsService } from "../api/tickets.service";
import { map, take } from "rxjs";
import { Ticket } from "../api/types";

@Component({
    selector: 'app-bulk-tickets',
    templateUrl: './bulk-tickets.component.html',
    styleUrls: ['./bulk-tickets.component.scss']
  })
  export class BulkTicketsComponent {
    constructor(
      public bulk: BulkTicketsService,
      private api: TicketsService,
      private snackBar: MatSnackBar,
    ) {}

    sendMessage(text: string) {
      const senderType = "operator", senderId = "operator1";

      this.bulk.selectedTickets$.pipe(take(1), map((tickets: Ticket[]) => tickets.map(t => t.id))).subscribe(
        ticketIds => {
           this.api.bulkAddMessage(ticketIds, { text: text!, senderType, senderId }).subscribe(res => {
            const msg = res.status == 'success' ? 'Messages are sending. Stay tuned' : 'Error while sending messages. Retry'
            this.snackBar.open(msg.toString(), "Close", { duration: 3000 });
           })
        }
      )
    }

    closeTicket(ticketId: number) {
      this.api.resolveTicket(ticketId).subscribe(t => {
        this.snackBar.open('Ticket resolved', "Close", { duration: 3000 });
      });
    }
  }