import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { MaterialModule } from '@angular/material';
import { Ng2MapModule} from 'ng2-map';
import { Pipe, PipeTransform } from '@angular/core';

// Must export the config
export const firebaseConfig = {
  apiKey: "AIzaSyDIrmC834Tivjh8EM0G2h8oUbC2gIye86o",
  authDomain: "music-map-23635.firebaseapp.com",
  databaseURL: "https://music-map-23635.firebaseio.com",
  storageBucket: "music-map-23635.appspot.com",
  messagingSenderId: "1038601253190"
};

const firebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect
};

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Pipe({ name: 'get' })
export class GetPipe implements PipeTransform {
  transform(val, args) {
    if (val === null) return val;
    return val[args];
  }
}

@Pipe({ name: 'first' })
export class FirstPipe implements PipeTransform {
  transform(val, args) {
    if (val === null) return val;
    return val[0];
  }
}

@Pipe({ name: 'withParent', pure: false })
export class WithParentPipe implements PipeTransform {
    transform(value: Array<any>, args: any[] = null): any {
        return value.map(t=> {
            return {
                item: t,
                parent: value
            }
        });
    }
} 

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    GetPipe,
    FirstPipe,
    WithParentPipe,
    SafePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    MaterialModule,
    Ng2MapModule.forRoot({apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyD9e_lkQIiKtphl0vGK3MjbC589jQcRtvk&libraries=places'})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
