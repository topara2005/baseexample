import { Component } from '@angular/core';



@Component({
  selector: 'app-serial-list',
  templateUrl: './serial-list.component.html',
  styleUrls: ['./serial-list.component.css']
})
export class SerialListComponent {


  share() {
    window.alert('Seriales inicializados!');
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/