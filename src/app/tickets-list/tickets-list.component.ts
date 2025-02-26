import { Component, Input, OnInit } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { Ticket } from '../api/types';
import { concat, map, Observable, race, switchMap, take } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { BulkTicketsService } from '../api/bulk-tickets.service';

type ItemList = Ticket & {}

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit {

  tickets = new Observable<ItemList[]>();
  filterStatus = this.fb.control<"all" | "resolved" | "unresolved">("all");
  hoveredTicket: number | null = null

  constructor(
    private api: TicketsService,
    private bulk: BulkTicketsService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.tickets = concat(
      this.api.getTickets(),
      this.filterStatus.valueChanges.pipe(
        map(value => {
          if (!value || value === "all") return undefined;
          return value;
        }),
        switchMap(status => this.api.getTickets(status)),
         // might be more efficient to filter tickets on frontend
         // and maybe user SSE in case of any tickets related updates?
      )
    );
  }

  onTicketSelectChange(ticket: Ticket) {
    this.bulk.selectedTickets$.pipe(
      take(1),
      map((currentSelection: Ticket[]) => {
        const ticketIndex = currentSelection.findIndex(t => t.id === ticket.id);
        return ticketIndex === -1 
          ? [...currentSelection, ticket]
          : currentSelection.filter(t => t.id !== ticket.id);
      })
    ).subscribe(updatedSelection => {
      this.bulk.updateSelectedTickets(updatedSelection);
    });
  }

  isTicketBulkSelected(ticket: Ticket): Observable<boolean> {
    return this.bulk.selectedTickets$.pipe(map(v => v.some(t => t.id === ticket.id)))
  }
}
