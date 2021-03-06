import { Component, Injectable, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { GlobalService } from '../services/global.service';
import '../../assets/markerclusterer.js';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  mapOptions: any;
  markerOptions: any;
  map: any;
  markers: any;
  coordinates: string;
  newlocation: string;
  locations: FirebaseListObservable<any[]>;
  showReset: boolean;
  googleMarkers: any;
  google: any;
  markerCount: number;
  markerCluster: any;

  constructor(public af: AngularFire, public globalService: GlobalService, public zone: NgZone) {
    const me = this;
    this.locations = af.database.list('/location-playlists');
    this.mapOptions = {
      zoom: 3,
      center: {lat: 40.730610, lng: -73.935242 },
      mapTypeControl: false,
      minZoom: 2,
      streetViewControl: false,
      styles: [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"administrative.province","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.locality","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"administrative.neighborhood","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"visibility":"off"},{"hue":"#ff0000"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#944242"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"},{"saturation":"-1"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#292929"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"color":"#494949"},{"saturation":"-85"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#888888"},{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.bus","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.rail","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dddddd"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]}]
    };

    globalService.coordinates.subscribe(coo => {
      this.coordinates = coo;
      if (this.coordinates) {
        let coordinateArray = this.coordinates.split(',');
        this.map.setCenter(new google.maps.LatLng(parseFloat(coordinateArray[0].trim()), parseFloat(coordinateArray[1].trim())));
        this.map.setZoom(6);
      }
    });


    this.markerCount = 0;
    this.locations.subscribe(locations => {
      this.markers = [];
      this.markerCount = locations.length;
      for (let i = 0; i < this.markerCount; ++i ){
        let coordinatesArray = locations[i][Object.keys(locations[i])[0]].coordinates.split(',');
        this.markers.push({ city: locations[i][Object.keys(locations[i])[0]].location, coordinates: {lat: parseFloat(coordinatesArray[0]), lng: parseFloat(coordinatesArray[1].trim())}});
      }
      if (!this.map) {
        this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
        this.globalService.updateMap(this.map);
      }
      this.initMarkers();
      this.markerCluster = new window['MarkerClusterer'](this.map, this.googleMarkers, { imagePath: '../../assets/cluster' } );
      this.initAutoComplete();

      // getLocation();

      function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log('Geolocation is not supported by this browser.');
        }
      }

      function showPosition(position) {
        me.map.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
        me.map.setZoom(6);
      }
    });
  }

  initAutoComplete() {
    let me = this;
    const input = <HTMLInputElement>document.getElementById('autocomplete');
    const autocompleteOptions = {
      types: ['(cities)']
    };
    const autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();
      this.globalService.playlistCoordinates.next(place.geometry.location.toString().replace('(', '').replace(')', ''));
      this.globalService.playlistLocation.next(place.formatted_address.replace(/[0-9]/g, '').replace(' ,', ','));

      if (!place.geometry) {
        console.log("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
        this.map.setZoom(6);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(6);
      }

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
    });
  }

  initMarkers(){
    let me = this;
    this.googleMarkers = [];
    for (let i = 0; i < this.markerCount; ++i ){
      let newMarker: any = new google.maps.Marker({
        position: this.markers[i].coordinates,
        title: this.markers[i].city,
        map: me.map,
        icon: '../../assets/green-dot.png'
      });
      this.googleMarkers.push(newMarker);
      newMarker.addListener('click', function() {
        me.zone.run(() => {
          me.showReset = true;
          me.map.setCenter({lat: newMarker.position.lat(), lng: newMarker.position.lng()});
          me.map.setZoom(6);
          me.globalService.filterBy.next('location');
          me.globalService.locationPlaylists.next(newMarker.title);
          me.globalService.showLocationPlaylists.next(true);
          me.globalService.updateReset();
        });
      });
    }
  }

  convertCoordinates(coordinate) {
    coordinate = coordinate.toString().match(/^-?\d+(?:\.\d{0,4})?/)[0];
    return coordinate;
  }
}
