import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DoctorComponent } from './components/doctor/doctor.component';
import { CategoryDetailsComponent } from './components/category-details/category-details.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { DoctorDetailsComponent } from './components/doctor-details/doctor-details.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { SubcategoryDetailComponent } from './components/subcategory-detail/subcategory-detail.component';
import { PaymentComponent } from './components/payment/payment.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';
import { HotelDetailComponent } from './components/hotel-detail/hotel-detail.component';
import { ClinicDetailComponent } from './components/clinic-detail/clinic-detail.component';
import { DoctorsListComponent } from './components/doctors-list/doctors-list.component';


export const routes: Routes = [

    {
        path: '', component: HomeComponent,
    },
    {
        path: 'home', component: HomeComponent,
    },
    { path: 'order', component: OrderFormComponent },
    { path: 'doctors', component: DoctorComponent },
    { path: 'doctors/:id', component: DoctorDetailsComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'category/:id', component: CategoryDetailsComponent },
    { path: 'subcategory/:id', component: SubcategoryDetailComponent },
    { path: 'pay/:id', component: PaymentComponent },
    { path: 'payment/success', component: PaymentSuccessComponent },
    { path: 'payment/cancel', component: PaymentCancelComponent },
    {
        path: 'hotel/:id',
        component: HotelDetailComponent
    },
    {
        path: 'clinic/:id',
        component: ClinicDetailComponent
    },
    {
        path: 'doctors',
        component: DoctorsListComponent
    },
];
