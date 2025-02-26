import { Component, OnInit } from "@angular/core";
import { BulkTicketsService } from "../api/bulk-tickets.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TicketsService } from "../api/tickets.service";

@Component({
    selector: 'app-bulk-tickets',
    templateUrl: './bulk-tickets.component.html',
    styleUrls: ['./bulk-tickets.component.scss']
  })
  export class BulkTicketsComponent implements OnInit {
    constructor(
      public bulk: BulkTicketsService,
      private api: TicketsService,
      private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
    }

    sendMessage(text: string) {
      const senderType = "operator", senderId = "operator1";
      // this.bulk.sendMessage({ text: text!, senderType, senderId }).subscribe(_message => {
      //   this.snackBar.open("Messages are sent", "Close", { duration: 3000 });
      // });
    }

    closeTicket(ticketId: number) {
      this.api.resolveTicket(ticketId).subscribe(t => {
        this.snackBar.open('Ticket resolved', "Close", { duration: 3000 });
      });
    }
  }