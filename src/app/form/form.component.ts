import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { LocationService } from '../location.service';

@Component({
  selector: 'add-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {

  filteredStations: FirebaseListObservable<any[]>;
  userId: string;
  showForm: boolean;
  searchData;

  private clientId: string = '8e1349e63dfd43dc67a63e0de3befc68';
  private http: Http;

  constructor(public af: AngularFire, public locationService: LocationService, http: Http) {

    this.http = http;
		console.log('http', this.http);

    this.filteredStations = af.database.list('/stations');

    locationService.userId.subscribe(id => {
      this.userId = id;
    });

    locationService.showForm.subscribe(bool => {
      this.showForm = bool;
    });

    this.getSoundcloudPlaylists();
  }

  getSoundcloudPlaylists() {
    this.http.get('http://api.soundcloud.com/playlists?linked_partitioning=1&client_id=' + this.clientId + '&q=albeit+some+ep')
      .map(res => {
        res.text();
        console.log('res', res.json().collection);
      })
      .subscribe(
        data => this.searchData = data,
        err => this.logError(err)
      );
  }

  logError(err) {
    console.error('There was an error: ' + err);
  }

  addStation(newName: string, newLocation: string, newCoordinates: string, newUrl: string) {
    let d = new Date();
    if (newName && newLocation && newCoordinates && newUrl) {
      this.filteredStations.push({ name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl, user: this.userId, published: d.getTime(), likesTotal: 0 });
      this.af.database.list('/location-stations/' + newLocation).push({ name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl, published: d.getTime() });
      this.af.database.list('/users-stations/' + this.userId).push({ name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl, published: d.getTime() });
    }
  }
}
