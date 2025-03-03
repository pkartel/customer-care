import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { Ticket } from '../api/types';
import { concat, map, Observable, switchMap, take, tap } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { BulkTicketsService } from '../bulk-tickets/bulk-tickets.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    public bulk: BulkTicketsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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

  trackByTicketId(index: number, item: Ticket) {
    return item.id;
  }

  navigateToTicket(item: Ticket, e: Event) {
    e.preventDefault()
    e.stopPropagation()

    const isSelectBoxClicked = (e.target as HTMLElement).tagName == 'INPUT'

    this.bulk.selectedTickets$.pipe(
      take(1),
      tap(selectedTickets => {
        if (selectedTickets?.length && !isSelectBoxClicked) {
          this.bulk.updateSelectedTickets([])
        }
      })
    ).subscribe(
      selectedTickets => {
        if (!selectedTickets?.length || !isSelectBoxClicked) {
          this.router.navigate(['tickets', item.id.toString()], { relativeTo: this.route })
        } else if (selectedTickets?.length) {
          this.router.navigate(['tickets', 'bulk'], { relativeTo: this.route })
        }
      }
    )
  }

  onTicketSelectChange(ticket: Ticket, event: any) {
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

  selectAllToggle(event: Event) {
    this.bulk.selectedTickets$.pipe(
      take(1)
    ).subscribe(selectedTickets => {
      if (selectedTickets.length) {
        this.bulk.updateSelectedTickets([])
        this.router.navigate(['home'])
      } else {
        this.tickets.subscribe(tickets => {
          this.bulk.updateSelectedTickets(tickets.filter(t => t.status === 'unresolved'))
          this.router.navigate(['tickets', 'bulk'], { relativeTo: this.route })
        })
      }
    })
  }

  isTicketBulkSelected(ticket: Ticket): Observable<boolean> {
    return this.bulk.selectedTickets$.pipe(map(v => v.some(t => t.id == ticket.id)))
  }
}
