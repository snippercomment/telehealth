
import { RouterModule, Routes  } from '@angular/router';
import { TrangchuComponent } from './pages/trangchu/trangchu.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { HeaderComponent } from './pages/header/header.component';
import { DichvuComponent } from './pages/dichvu/dichvu.component';

import { AppointmentLinkComponent } from './decoration/appointment-link/appointment-link.component';
import { DatlichenComponent } from './pages/datlichen/datlichen.component';
import { TuvanComponent } from './pages/tuvan/tuvan.component';
import { LienheComponent } from './pages/lienhe/lienhe.component';
import { SecurityComponent } from './decoration/security/security.component';
import { ProvisionComponent } from './decoration/provision/provision.component';
import { ProfileComponent } from './file/profile/profile.component';
import { HospitalsDetailComponent } from './pages/hospitals-detail/hospitals-detail.component';
import { NgModule } from '@angular/core';
import { HospitalListComponent } from './decoration/hospital-list/hospital-list.component';
import { MedicalHistoryComponent } from './file/medical-history/medical-history.component';
import { AuthGuard } from '../guards/auth.guard';
// import { ConsultationHistoryComponent } from './file/consultation-history/consultation-history.component';

export const approutes: Routes = [ 
  {
    path: '',
    component: HeaderComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
      { path: 'home', component: TrangchuComponent },
      { path: 'services', component: DichvuComponent },
      { path: 'appointment-link/:id', component: AppointmentLinkComponent ,canActivate: [AuthGuard] },
      { path: 'appointment', component: DatlichenComponent,},
      { path: 'consultation/:id', component: TuvanComponent ,canActivate: [AuthGuard]},
      { path: 'about', component: LienheComponent },
      { path: 'security', component: SecurityComponent },
      { path: 'provision', component: ProvisionComponent },
      { path: 'profile', component: ProfileComponent },
      // {path:'consultation-history',component:ConsultationHistoryComponent},
      {path:'medical-history',component:MedicalHistoryComponent},
      { path: 'hospitals-detail', component: HospitalsDetailComponent },
      {path:'hospitals-detail/admin/Hospital/:id',component:HospitalListComponent}
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }

  
];

@NgModule({
    imports: [RouterModule.forRoot(approutes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
