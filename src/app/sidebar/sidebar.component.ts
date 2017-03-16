import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { LocationService } from '../location.service';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  map;
  filteredStations: FirebaseListObservable<any[]>;
  user: FirebaseObjectObservable<any>;
  users: FirebaseObjectObservable<any>;
  userId: string;
  orderValue: string;
  filterKey: string;
  filterValue: string;
  showReset: boolean;
  headline: string;
  playerUrl: string;
  showForm: boolean;

  constructor(public af: AngularFire, public locationService: LocationService) {
    this.filterKey = null;
    this.filterValue = null;
    this.orderValue = '-published';
    this.filteredStations = af.database.list('/stations');
    this.users = af.database.object('/users');
    this.playerUrl = null;
    this.showForm = false;

    let me = this;

    this.af.auth.subscribe(auth => {
      if (auth) {
        this.userId = auth.uid;
        locationService.updateUserId(this.userId);
        af.database.object('/users/' + this.userId).update({ name: auth.auth.displayName, uid: auth.uid, photoURL: auth.auth.photoURL, email: auth.auth.email });
        this.user = af.database.object('/users/' + this.userId);
        this.user.subscribe(user => {
          console.log('thieuser', user);
        });
      }
    });

    locationService.map.subscribe(themap => {
      this.map = themap;
    });
    locationService.filterKey.subscribe(key => {
      this.filterKey = key;
    });
    locationService.filterValue.subscribe(value => {
      this.filterValue = value;
    });
    locationService.showReset.subscribe(bool => {
      this.showReset = bool;
    });
    locationService.playerUrl.subscribe(url => {
      this.playerUrl = url;
    });
    locationService.showForm.subscribe(bool => {
      this.showForm = bool;
    });
  }

  login() {
    this.af.auth.login();
  }
  logout() {
     this.af.auth.logout();
  }
  updateStation(key: string, newName: string, newLocation: string, newCoordinates: string, newUrl: string) {
    this.filteredStations.update(key, { name: newName, location: newLocation, coordinates: newCoordinates, url: newUrl });
  }
  deleteStation(key: string, location: string) {
    this.filteredStations.remove(key);
    this.af.database.list('/user-stations/' + this.userId).remove(key);
    this.af.database.list('/location-stations/' + location).remove(key);
  }
  deleteEverything() {
    this.filteredStations.remove();
  }
  likeStation(key: string) {
    this.af.database.list('/users/' + this.userId + '/likes/' + key).push(key);
    this.af.database.list('/stations/' + key + '/likes/' + this.userId).push(this.userId);
    let likes = this.af.database.list('/stations/' + key + '/likes/');
    likes.subscribe(subscribe => {
      let length = subscribe.length;
      this.af.database.object('/stations/' + key).update({ likesTotal: length });
    });
  }
  unlikeStation(key: string) {
    this.af.database.list('/users/' + this.userId + '/likes').remove(key);
    this.af.database.list('/stations/' + key + '/likes').remove(this.userId);
    let likes = this.af.database.list('/stations/' + key + '/likes/');
    likes.subscribe(subscribe => {
      let length = subscribe.length;
      this.af.database.object('/stations/' + key).update({ likesTotal: length });
    });
  }
  resetStations() {
    this.showReset = false;
    this.filterKey = null;
    this.filterValue = null;
    this.map.setZoom(3);
    this.headline = null;
  }
  changeOrder(neworder) {
    this.orderValue = neworder;
  }
  filterByUser(uid) {
    this.filterKey = 'user';
    this.filterValue = uid;
    this.showReset = true;
  }
  filterByCurrentUser() {
    this.filterKey = 'user';
    this.filterValue = this.userId;
    this.showReset = true;
    this.headline = 'My Stations';
  }
  filterByLocation(loc) {
    this.filterKey = 'location';
    this.filterValue = loc;
    this.showReset = true;
    this.headline = loc;
  }
  updatePlayer(url) {
    this.locationService.updatePlayerUrl(url);
  }
  showHideForm() {
    this.locationService.toggleForm();
  }
}