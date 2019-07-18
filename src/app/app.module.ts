import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopHeaderComponent } from './top-header/top-header.component';
import { HomeComponent } from './home/home.component';
import { TocFormComponent } from './toc-form/toc-form.component';
import { TocComponent } from './toc/toc.component';

@NgModule({
  declarations: [
    AppComponent,
    TopHeaderComponent,
    HomeComponent,
    TocFormComponent,
    TocComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
