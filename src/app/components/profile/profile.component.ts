import { Component, OnInit } from '@angular/core';
import { FormControl, FormControlName, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentId: number;
  currentUser: any;
  usersChildren: any;
  changePhoto: boolean = false;
  showModify: boolean = false;
  connection: boolean = false;
  deleted: boolean = false;
  outConnections: any = [];
  connections: any = [];
  tags: any = [];


  modify: FormGroup;

  changeProfilePhoto(val:any){
    this.data.updatePhoto(this.currentId,val.target.files[0]);
  }

  constructor(private route: ActivatedRoute, private data: DataService) {
    
    this.modify = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      company: new FormControl(''),
      email: new FormControl(''),
      tag: new FormControl(''),
    })
   }

  async ngOnInit() {
    this.data.observable.subscribe(data => {
      if(data.data!==undefined){
        this.currentUser.photo = data.data.publicURL;
        this.data.observable.next([]);
      }
    })
    
    this.route.params.subscribe(async (params)=>{
      this.currentId = <number>(params['id']);
      this.currentUser = (await this.data.fidUserById(this.currentId))[0]
      this.usersChildren = await this.data.getChildren(this.currentId);
      this.modify = new FormGroup({
        first_name: new FormControl(this.currentUser.first_name),
        last_name: new FormControl(this.currentUser.last_name),
        company: new FormControl(this.currentUser.company),
        email: new FormControl(this.currentUser.email),
        notes: new FormControl(this.currentUser.notes),
        tag: new FormControl(""),
      })
      this.showModify = false;
      this.deleted = false;
    }); 
  }

  modifyView(){
    this.modify = new FormGroup({
      first_name: new FormControl(this.currentUser.first_name),
      last_name: new FormControl(this.currentUser.last_name),
      company: new FormControl(this.currentUser.company),
      email: new FormControl(this.currentUser.email),
      notes: new FormControl(this.currentUser.notes),
      tag: new FormControl(""),
    })
    this.tags = [];
    for(let i=0; i<this.currentUser.tag.length;i++){
      this.tags.push(this.currentUser.tag[i]);
    }
  }

  addTag(){
    if(!this.tags.includes(`#${this.modify.get('tag')?.value}`))
      this.tags.push(`#${this.modify.get('tag')?.value}`);
    this.modify.get('tag')?.setValue('');
  }

  deleteTag(el:any){
    this.tags = this.tags.filter((item:any) => item!==el);
  }

  async saveModification(){
    const data = {
      first_name: this.modify.get('first_name')?.value,
      last_name: this.modify.get('last_name')?.value,
      company: this.modify.get('company')?.value,
      email: this.modify.get('email')?.value,
      tag: this.tags,
      notes: this.modify.get('notes')?.value
    };
    await this.data.updateInfo(this.currentId,data);
    
    this.currentUser = {id: this.currentId, ...data, photo: this.currentUser.photo};
    this.showModify = false;
  }

  filterConnectionsChildren(connections:any){
    return connections.filter((el:any) => {
      for(let i=0;i<this.usersChildren.length;i++){
        if(el.id===this.usersChildren[i].user_table.id){
          return false;
        }
          
      }
      return true;
    });
  }

  async showNewConnections(){
    let connections = await this.data.getAllUsers();
    connections = connections.filter(el => JSON.stringify(el)!==JSON.stringify(this.currentUser));



    connections = this.filterConnectionsChildren(connections);
    this.connections = connections;
    this.outConnections = connections;
    this.connection = true;
  }

  async addConnection(id:number){
    this.data.insertConnection(this.currentId, id);
    this.usersChildren.push({user_table: (this.connections.filter((el:any)=>el.id===id))[0]});
    this.connection = false;
    let connections = this.searchConnection(this.connections);
    this.connections = connections;
    this.outConnections = connections;
  }

  async deleteConnection(id:number){
    this.data.deleteConnection(this.currentId, id);
    this.usersChildren = this.usersChildren.filter((el:any) => el.user_table.id!==id)
    let connections = this.searchConnection(this.connections);
    this.connections = connections;
    this.outConnections = connections;
  }

  async searchConnection(name:any){
    if(name.target!==undefined)
      this.outConnections = this.connections.filter((el:any)=>el.last_name?.toLowerCase().includes(name.target.value.toLowerCase()));
      if(this.outConnections.length===0)
        this.outConnections = this.connections.filter((el:any)=>el.first_name?.toLowerCase().includes(name.target.value.toLowerCase()));
      if(this.outConnections.length===0)
        this.outConnections = this.connections.filter((el:any)=>el.company?.toLowerCase().includes(name.target.value.toLowerCase()));
      if(this.outConnections.length===0)
        this.outConnections = this.connections.filter((el:any)=>el.email?.toLowerCase().includes(name.target.value.toLowerCase()));
      if(this.outConnections.length===0)
        this.outConnections = this.connections.filter((el:any)=>el.phone?.toLowerCase().includes(name.target.value.toLowerCase()));
      if(this.outConnections.length===0){
      const tmp:any = [];
      for(let i=0;i<this.connections.length;i++){
        this.connections[i].tag.map((el:any)=>{
          if(el.toLowerCase().includes(name.target.value.toLowerCase()))
            if(!tmp.includes(this.connections[i]))
            tmp.push(this.connections[i]);      
        })
      }

      this.outConnections = tmp;

      }
      if(this.outConnections.length===0)
        this.outConnections = [];   
    }
  
  async deleteUser(){
    await this.data.deleteUser(this.currentId);
    this.deleted = true;
  }



}
