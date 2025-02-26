import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TicketsListComponent } from './tickets-list/tickets-list.component';
import { TicketComponent } from './ticket/ticket.component';
import { TicketsService } from './api/tickets.service';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSelectModule } from "@angular/material/select";
import { TicketNotFoundComponent } from './ticket-not-found/ticket-not-found.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageInputComponent } from './shared/message-input/message-input.component';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { BulkTicketsService } from './api/bulk-tickets.service';
import { BulkTicketsComponent } from './bulk-tickets/bulk-tickets.component';
import { TicketSummaryComponent } from './shared/ticket-summary/ticket-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TicketsListComponent,
    TicketComponent,
    TicketNotFoundComponent,
    MessageInputComponent,
    BulkTicketsComponent,
    TicketSummaryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  providers: [
    importProvidersFrom(HttpClientModule),
    TicketsService,
    BulkTicketsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
