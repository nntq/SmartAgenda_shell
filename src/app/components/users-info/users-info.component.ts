import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-info',
  templateUrl: './users-info.component.html',
  styleUrls: ['./users-info.component.css']
})
export class UsersInfoComponent implements OnInit, OnChanges {

  @Input() showInfo: boolean = false;
  @Input() initial: boolean = true;
  @Input() info: any;

  constructor(private router: Router) {
   }

  ngOnInit(): void {
  }

  ngOnChanges(){

  }

}
