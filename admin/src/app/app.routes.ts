import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './account/login/login.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { AppointmentsComponent } from './layout/appointments/appointments.component';
import { HopitalsComponent } from './layout/hopitals/hopitals.component';
import { PatientComponent } from './layout/patient/patient.component';
import { StatisticalComponent } from './layout/statistical/statistical.component';
import { DoctorsComponent } from './layout/doctors/doctors.component';
import { AdddoctorsComponent } from './subpage/doctors/adddoctors/adddoctors.component';
import { EditdoctorsComponent } from './subpage/doctors/editdoctors/editdoctors.component';
import { AddhospitalsComponent } from './subpage/hospitals/addhospitals/addhospitals.component';
import { EdithospitalsComponent } from './subpage/hospitals/edithospitals/edithospitals.component';
import { AuthGuard } from './service/auth.guard';
import { DashboarddoctorComponent } from './doctor-hero/dashboarddoctor/dashboarddoctor.component';
import { UserDetailComponent } from './subpage/user-detail/user-detail.component';
import { AppointmentManagementComponent } from './doctor-hero/appointment-management/appointment-management.component';
import { LoginDoctorComponent } from './account/login-doctor/login-doctor.component';
import { DoctorAppointmentsComponent } from './doctor-hero/doctor-appointments/doctor-appointments.component';
import { DoctorConsultationComponent } from './doctor-hero/doctor-consultation/doctor-consultation.component';
import { AppointmentStatisticsComponent } from './layout/appointment-statistics/appointment-statistics.component';






export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, },
  { 
    path: 'admin', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    
    data: { role: 'admin' }, // Thêm role để phân quyền
    children: [
      { path: '', redirectTo: 'Statistical', pathMatch: 'full' },
      { path: 'Statistical', component: StatisticalComponent }, 
      { path: 'Appointment', component: AppointmentsComponent },
      { path: 'Doctor', component: DoctorsComponent },
      { path: 'Doctor/addDoctors', component: AdddoctorsComponent },
      { path: 'Doctor/editDoctors/:id', component: EditdoctorsComponent },
      { path: 'Hospital', component: HopitalsComponent },
      { path: 'Hospital/addhopitals', component: AddhospitalsComponent },
      { path: 'Hospital/edithopitals/:id', component: EdithospitalsComponent },
      { path: 'Patient', component: PatientComponent },
      { path: 'Patient/UserPatient/:id', component: UserDetailComponent },
      {path:'AppointmentStatistics',component:AppointmentStatisticsComponent}
    ]
  },
  { path: '', redirectTo: '/loginDoctor', pathMatch: 'full' },
  { path: 'loginDoctor', component: LoginDoctorComponent },
  {
    path: 'doctor',
    component: DashboarddoctorComponent,
    canActivate: [AuthGuard],
    data: { role: 'doctor' }, // Thêm role để phân quyền
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboarddoctorComponent },
      { path: 'appointment-management', component: AppointmentManagementComponent },
      {path:'doctor-appointment',component:DoctorAppointmentsComponent},
      {path:'doctor-consultation',component:DoctorConsultationComponent}
    ]
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }