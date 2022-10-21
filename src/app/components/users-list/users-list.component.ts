import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  users:any;
  @Output() visualize = new EventEmitter<number>();

  constructor(private data: DataService) { 
    
  }

  select(id:number){
    this.visualize.emit(id);
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
});
  }

  async ngOnInit() {
    this.users = await this.data.getAllUsers();
  }

}
