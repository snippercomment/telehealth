import { AppRoutingModule } from './../../../admin/src/app/app.routes';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { approutes } from './app.routes';
import { HeaderComponent } from './pages/header/header.component';
import { TrangchuComponent } from './pages/trangchu/trangchu.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { DichvuComponent } from './pages/dichvu/dichvu.component';
import { DatlichenComponent } from './pages/datlichen/datlichen.component';
import { TuvanComponent } from './pages/tuvan/tuvan.component';
import { LienheComponent } from './pages/lienhe/lienhe.component';
import { ProfileComponent } from './file/profile/profile.component';
import { HospitalsDetailComponent } from './pages/hospitals-detail/hospitals-detail.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TrangchuComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    DichvuComponent,
    DatlichenComponent,
    TuvanComponent,
    LienheComponent,
    ProfileComponent,
    HospitalsDetailComponent,
    HttpClientModule
   
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(approutes),
    FormsModule,
    AppRoutingModule
     ,
     HttpClientModule,
     
  ],
  providers: [],
  
  bootstrap: [AppComponent]
})
export class AppModule { }