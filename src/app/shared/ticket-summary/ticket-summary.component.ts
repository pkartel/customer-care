import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Ticket } from "src/app/api/types";

@Component({
    selector: 'app-ticket-summary',
    templateUrl: './ticket-summary.component.html',
    styleUrls: ['./ticket-summary.component.scss']
  })
  export class TicketSummaryComponent {
    @Input() ticket!: Ticket | null
    @Output() onTicketResolve = new EventEmitter<number>()
  }