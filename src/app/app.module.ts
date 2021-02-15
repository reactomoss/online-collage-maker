import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// firebase imports
// import { AngularFireModule } from '@angular/fire';
// import { AngularFirestoreModule } from '@angular/fire/firestore';

// import { AngularFireAuthModule } from '@angular/fire/auth';

import { MaterialModule } from './material/material.module';

import { SidenavComponent } from './sidenav/sidenav.component';
import { CollageMakeComponent } from "./collage-make/collage-make.component";
import { ControlPanelComponent } from "./control-panel/control-panel.component";
import { ImageEditorComponent } from "./image-editor/image-editor.component";
import { ImageUploadComponent } from "./image-upload/image-upload.component";
import { FooterComponent } from './footer/footer.component';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CartComponent } from './cart/cart.component';

import { CrudComponent } from './crud/crud.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from "@angular/material/select";
import { MatSliderModule } from "@angular/material/slider";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NgxDropzoneModule } from "ngx-dropzone";
import { ColorPickerModule } from "ngx-color-picker";
import { MainNavComponent } from './main-nav/main-nav.component';
import { PreviewDialog, DialogLoginComponent } from './order/preview/preview.component';
import { MatCarouselModule } from '@ngbmodule/material-carousel';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { TokenInterceptor } from './services/token-interceptor';
import { TokenService } from './services/token.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NgMasonryGridModule } from 'ng-masonry-grid';
import { GalleryComponent } from './gallery/gallery.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrModule } from "ngx-toastr";


const appRoutes: Routes = [
  { path: '', component: CollageMakeComponent },
  { path: 'home', pathMatch: 'full', redirectTo: '' },
  { path: 'login', loadChildren: './login/login.module#LoginModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfileModule' },
  { path: 'product', loadChildren: './product/product.module#ProductModule' },
  { path: 'order', loadChildren: './order/order.module#OrderModule' },
  { path: 'cart', component: CartComponent },
  { path: 'crud', component: CrudComponent },
  { path: 'success', component: OrderSuccessComponent },
  { path: 'gallary/:slug', component: GalleryComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    FooterComponent,
    CollageMakeComponent,
    CartComponent,
    CrudComponent,
    ControlPanelComponent,
    ImageEditorComponent,
    ImageUploadComponent,
    MainNavComponent,
    PreviewDialog,
    DialogLoginComponent,
    OrderSuccessComponent,
    GalleryComponent,
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    HttpClientModule,
    MatMenuModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    NgxDropzoneModule,
    ColorPickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatCarouselModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot(appRoutes, { useHash: false }),
    HttpClientModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [
    TokenService,
    NgxImageCompressService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  entryComponents: [PreviewDialog, DialogLoginComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
