import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { Ticket } from '../api/types';
import { combineLatest, concat, map, Observable, shareReplay, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
import { BulkTicketsService } from '../bulk-tickets/bulk-tickets.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxChange } from '@angular/material/checkbox';

type ItemList = Ticket & {}

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit {
  tickets$ = new Observable<ItemList[]>();
  filterStatus = this.fb.control<"all" | "resolved" | "unresolved">("all");
  selectedTicketsForm = this.fb.group<{key?: boolean}>({});
  hoveredTicket: number | null = null

  constructor(
    private api: TicketsService,
    public bulk: BulkTicketsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.tickets$ = concat(
      this.api.getTickets(),
      this.filterStatus.valueChanges.pipe(
        map(value => {
          if (!value || value === "all") return undefined;
          return value;
        }),
        switchMap(status => this.api.getTickets(status)),
      )
    ).pipe(
      shareReplay(1), // Cache the last emitted value to prevent multiple calls
      switchMap(tickets => 
        this.bulk.selectedTickets$.pipe(
          map(selectedTickets => ({
            tickets,
            selectedTickets
          }))
        )
      ),
      tap(this.updateTicketsForm),
      map(({ tickets }) => tickets)
    );
  }

  updateTicketsForm = ({ tickets, selectedTickets }: {[key: string]: Ticket[]}) => {
    tickets.forEach((ticket: Ticket) => {
      const controlName = `ticket-${ticket.id}`;
      const isSelected = selectedTickets.some(t => t.id === ticket.id);
      
      if (this.selectedTicketsForm.contains(controlName)) {
        this.selectedTicketsForm.get(controlName)?.setValue(isSelected, { emitEvent: false });
      } else {
        this.selectedTicketsForm.addControl(`ticket-${ticket.id}`, new FormControl(isSelected))
      }
    });
  }

  trackByTicketId(index: number, item: Ticket) {
    return item.id;
  }

  navigateToTicket(ticket: Ticket, e: Event) {
    const isCheckboxTargeted = (e.target as HTMLElement).tagName == 'INPUT'

    this.bulk.selectedTickets$.pipe(
      take(1),
      tap(selectedTickets => {
        if (selectedTickets?.length && !isCheckboxTargeted) {
          this.bulk.updateSelectedTickets([])
        }
      })
    ).subscribe(
      selectedTickets => {
        if (!selectedTickets?.length || !isCheckboxTargeted) {
          this.router.navigate(['tickets', ticket.id.toString()], { relativeTo: this.route })
        } else if (selectedTickets?.length) {
          this.router.navigate(['tickets', 'bulk'], { relativeTo: this.route })
        }
      }
    )
  }

  onTicketSelectChange(ticket: Ticket, event: MatCheckboxChange) {
    this.bulk.selectedTickets$.pipe(
      take(1),
      map((currentSelection: Ticket[]) => {
        return event.checked 
          ? [...currentSelection, ticket]
          : currentSelection.filter(t => t.id !== ticket.id);
      })
    ).subscribe(updatedSelection => {
      this.bulk.updateSelectedTickets(updatedSelection);
    });
  }

  selectAllToggle() {
    combineLatest([
      this.tickets$.pipe(map(t => t.filter( t => t.status == 'unresolved'))),
      this.bulk.selectedTickets$
    ])
    .pipe(take(1))
    .subscribe(([unresolvedTickets, selectedTickets]) => {
      if (selectedTickets.length) {
        this.bulk.updateSelectedTickets([])
        this.router.navigate(['home'])
      } else {
        this.bulk.updateSelectedTickets(unresolvedTickets)
        this.router.navigate(['tickets', 'bulk'], { relativeTo: this.route })
      }
    })
  }
}
