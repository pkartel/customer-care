import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Ticket } from "./types";

@Injectable({
    providedIn: 'root'
  })
  export class BulkTicketsService {
    private selectedTicketsSubject = new BehaviorSubject<any[]>([])
    selectedTickets$ = this.selectedTicketsSubject.asObservable();
    
    constructor(
        private http: HttpClient,
      ) { }

      updateSelectedTickets(tickets: Ticket[]): void {
        this.selectedTicketsSubject.next(tickets);
      }
  }