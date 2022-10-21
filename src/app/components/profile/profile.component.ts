import { Component, OnInit } from '@angular/core';
import { FormControl, FormControlName, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  failed: boolean = false;
  outConnections: any = [];
  connections: any = [];
  tags: any = [];


  modify: FormGroup;

  changeProfilePhoto(val:any){
    let res:any = this.data.updatePhoto(this.currentId,val.target.files[0]);
    if(res?.error){
      this.failed = true;
      setTimeout(() => {
        this.failed = false;
      }, 2000);
    }
  }

  constructor(private route: ActivatedRoute, private data: DataService, private router: Router) {
    
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
      if(!this.currentUser){
        this.router.navigate(['users']);
        return;
      }
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
    let res = await this.data.updateInfo(this.currentId,data);

    if(res?.error){
      this.failed = true;
      setTimeout(() => {
        this.failed = false;
      }, 2000);
    }else{
      this.currentUser = {id: this.currentId, ...data, photo: this.currentUser.photo};
      this.showModify = false;
    }
    
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
    if(connections.length!==0){
      connections = connections.filter(el => JSON.stringify(el)!==JSON.stringify(this.currentUser));
      connections = this.filterConnectionsChildren(connections);
      this.connections = connections;
      this.outConnections = connections;
      this.connection = true;
    }
  }

  async addConnection(id:number){
    let res = await this.data.insertConnection(this.currentId, id);

    if(res?.error){
      this.failed = true;
      setTimeout(() => {
        this.failed = false;
      }, 2000);
    }else{
      this.usersChildren.push({user_table: (this.connections.filter((el:any)=>el.id===id))[0]});
      this.connection = false;
      let connections = this.searchConnection(this.connections);
      this.connections = connections;
      this.outConnections = connections;
    }

  }

  async deleteConnection(id:number){
    let res = await this.data.deleteConnection(this.currentId, id);
    if(res?.error){
      this.failed = true;
      setTimeout(() => {
        this.failed = false;
      }, 2000);
    }else{
      this.usersChildren = this.usersChildren.filter((el:any) => el.user_table.id!==id)
      let connections = this.searchConnection(this.connections);
      this.connections = connections;
      this.outConnections = connections;
    }
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
    let res = await this.data.deleteUser(this.currentId);
    console.log(res?.error)
    if(res?.error){
      this.failed = true;
      setTimeout(() => {
        this.failed = false;
      }, 2000);
    }else{
      this.deleted = true;
    }
  }
}
