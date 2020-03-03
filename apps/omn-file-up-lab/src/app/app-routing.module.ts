import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileDropContainerComponent } from './file-drop/file-drop-container.component';
import { NavigateAwayComponent } from './navigate-away/navigate-away.component';


const routes: Routes = [
  {path: 'drop', component: FileDropContainerComponent},
  {path: 'away', component: NavigateAwayComponent},
  { path: '',
    redirectTo: '/drop',
    pathMatch: 'full'
  }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
