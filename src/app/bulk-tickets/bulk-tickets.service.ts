import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Ticket } from "../api/types";

@Injectable({
    providedIn: 'root'
  })
  export class BulkTicketsService {
    private selectedTicketsSubject = new BehaviorSubject<any[]>([])
    selectedTickets$ = this.selectedTicketsSubject.asObservable();
    
    constructor() { }

    updateSelectedTickets(tickets: Ticket[]): void {
      this.selectedTicketsSubject.next(tickets);
    }
  }