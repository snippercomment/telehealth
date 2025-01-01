
import { ToastrModule } from 'ngx-toastr';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { LoginComponent } from './account/login/login.component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { AdddoctorsComponent } from './subpage/doctors/adddoctors/adddoctors.component';
import { EditdoctorsComponent } from './subpage/doctors/editdoctors/editdoctors.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DoctorsComponent } from './layout/doctors/doctors.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,AdddoctorsComponent,EditdoctorsComponent,DoctorsComponent
  ],
  
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({  timeOut: 3000, 
      positionClass: 'toast-top-right',
      preventDuplicates: true 
    }),

  ],
  
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }