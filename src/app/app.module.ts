import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing/app-routing/app-routing.module';

import { AppComponent } from './app.component';
import { TreeComponent } from './components/tree/tree.component';
import { SearchComponent } from './components/search/search.component';
import { UsersInfoComponent } from './components/users-info/users-info.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    TreeComponent,
    SearchComponent,
    UsersInfoComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
