import { NgModule } from '@angular/core'
import {RouterModule, Routes} from '@angular/router'
import { WebComponentWrapper } from '@angular-architects/module-federation-tools';
import { TreeComponent } from 'src/app/components/tree/tree.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import {environment} from '../../../environments/environment';

const appRoutes: Routes = [
  {path: 'users', component: TreeComponent},
  {
    path: 'add-user',
    component: WebComponentWrapper,
    data: {
      remoteEntry: `${environment.add_user_path}/add-user/remoteEntry.js`,
      remoteName: 'addUser',
      exposedModule: './Add',
      elementName: 'react-element'
    }
  },
  {path: 'profile', children:[{path: ':id', component: ProfileComponent}, {path: '', redirectTo: '/users', pathMatch: 'full'}]},
  {path: "**", redirectTo: 'users'}
];

@NgModule({
  declarations: [],
  providers: [],
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

