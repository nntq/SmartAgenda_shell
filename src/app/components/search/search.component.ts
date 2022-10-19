import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  errMessage: string;
  errRequired: boolean = false;
  asyncCall: any = [];
  showPick: boolean = false;
  pickUser: any;

  search = new FormGroup({
    property: new FormControl('Cognome'),
    value: new FormControl('', [Validators.required])
  });

  @Output() visualize = new EventEmitter<number>();

  autocompleteSelect(id:number){
    this.visualize.emit(id);
    this.asyncCall = [];
  }

  async autocompleteSelectTag(ids:any){
    if(ids.length>1){
      let tmpUsrs:any = [];
      for(let i=0;i<ids.length;i++){
        tmpUsrs.push((await this.data.fidUserById(ids[i]))[0])
      }
      this.pickUser = tmpUsrs;
      this.showPick = true;
    }else if(ids.length === 1){
      this.visualize.emit(ids[0]);
      this.asyncCall = [];
    }
    
  }

  async searchChange(e:any){
    let tmp:any = [];
    switch((this.search.get('property'))?.value){
      case 'Cognome':
        // this.asyncCall = []; perche'?
        tmp = await this.data.autoSurname(e.target.value);
        this.asyncCall = [];
        for(let i=0;i<tmp.length;i++){
          this.asyncCall.push({id: tmp[i].id, value: tmp[i].last_name});
        }
        break;
      case 'Nome':
        tmp = await this.data.autoName(e.target.value);
        this.asyncCall = [];
        for(let i=0;i<tmp.length;i++){
          this.asyncCall.push({id: tmp[i].id, value: tmp[i].first_name});
        }
        break;
      case 'Email':
        tmp = await this.data.autoEmail(e.target.value);
        this.asyncCall = [];
        for(let i=0;i<tmp.length;i++){
          this.asyncCall.push({id: tmp[i].id, value: tmp[i].email});
        }
        break;
      case 'Company':
        tmp = await this.data.autoCompany(e.target.value);
        this.asyncCall = [];
        for(let i=0;i<tmp.length;i++){
          this.asyncCall.push({id: tmp[i].id, value: tmp[i].company});
        }
        break;
      case 'Phone':
        tmp = await this.data.autoPhone(e.target.value);
        this.asyncCall = [];
        for(let i=0;i<tmp.length;i++){
          this.asyncCall.push({id: tmp[i].id, value: tmp[i].phone});
        }
        break;
      case 'Tag':
        const tag = e.target.value
        const allTags:any = [];
        let outTags:any = [];
        tmp = await this.data.getAllUsers();

        //get all unique tags in one array
        for(let i=0;i<tmp.length;i++){
          for(let j=0;j<tmp[i].tag.length;j++){
            if(!allTags.includes(tmp[i].tag[j])){  
              allTags.push(tmp[i].tag[j])
            }     
          }
        }
        
        //get matched tags
        for(let i=0; i<allTags.length; i++){
          if(allTags[i].includes(tag))
            outTags.push(allTags[i]);
        }

        this.asyncCall = [];

        //include corresponded users
        for(let i=0; i<outTags.length && i<5; i++){
          let ids = [];
          for(let j=0; j<tmp.length; j++){
            if(tmp[j].tag.includes(outTags[i])){
              ids.push(tmp[j].id)
            }
          }

          this.asyncCall.push({id: ids, value: outTags[i]});
        }
        break;
    }
  }

  async submitSearch(){
    if(this.search.get('property')?.value == 'Cognome'){
      const usr = (await this.data.findUsersBySurname(<string>this.search.get('value')?.value));
      if(usr.length==0){
        this.errRequired = true;
        this.errMessage = `There is no user with '${this.search.get('value')?.value}' property`;
        const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
      }else if(usr.length>1){
        this.pickUser = usr;
        this.showPick = true;
      }else{
        this.visualize.emit(usr[0].id);
      }
      
    }else if(this.search.get('property')?.value == 'Nome'){
      const usr = (await this.data.findUsersByName(<string>this.search.get('value')?.value));
      if(usr.length==0){
        this.errRequired = true;
        this.errMessage = `There is no user with '${this.search.get('value')?.value}' property`;
        const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
      }else if(usr.length>1){
        this.pickUser = usr;
        this.showPick = true;
      }else{
        this.visualize.emit(usr[0].id);
      }
    }else if(this.search.get('property')?.value == 'Company'){
      const usr = (await this.data.findUsersByCompany(<string>this.search.get('value')?.value));
      if(usr.length==0){
        this.errRequired = true;
        this.errMessage = `There is no user with '${this.search.get('value')?.value}' property`;
        const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
      }else if(usr.length>1){
        this.pickUser = usr;
        this.showPick = true;
      }else{
        this.visualize.emit(usr[0].id);
      }
    }else if(this.search.get('property')?.value == 'Email'){
      const usr = (await this.data.findUsersByEmail(<string>this.search.get('value')?.value));
      if(usr.length==0){
        this.errRequired = true;
        this.errMessage = `There is no user with '${this.search.get('value')?.value}' property`;
        const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
      }else if(usr.length>1){
        this.pickUser = usr;
        this.showPick = true;
      }else{
        this.visualize.emit(usr[0].id);
      }
    }else if(this.search.get('property')?.value == 'Tag'){  
      const tags = await this.data.getAllUsers();
      const allTags: any = [];
      const outTags: any = [];

      //get all unique tags in one array
      for(let i=0;i<tags.length;i++){
        for(let j=0;j<tags[i].tag.length;j++){
          if(!allTags.includes(tags[i].tag[j])){  
            allTags.push(tags[i].tag[j])
          }     
        }
      }

       //get matched tags
       for(let i=0; i<allTags.length; i++){
        if(allTags[i].includes(<string>this.search.get('value')?.value))
          outTags.push(allTags[i]);
      }

      const usr = [];

      //include corresponded users
      for(let i=0; i<outTags.length; i++){
        let ids = [];
        for(let j=0; j<tags.length; j++){
          if(tags[j].tag.includes(outTags[i])){
            usr.push(tags[j])
          }
        }
      }

      if(usr.length==0){
        this.errRequired = true;
        this.errMessage = `There is no user with '${this.search.get('value')?.value}' property`;
        const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
      }else if(usr.length>1){
        this.pickUser = usr;
        this.showPick = true;
      }else{
        this.visualize.emit(usr[0].id);
      }

    }

    if(this.search.get('value')?.invalid){
      this.errRequired = true;
      this.errMessage = "Insert requested information for search"
      const notify = new Promise((resolve, reject)=>{
        setTimeout(() => {
          this.errRequired = false;
          resolve(this.errRequired);
        }, 2000);
      });
      notify.then();
    }
  }

  choosen(usr:any){
    this.visualize.emit(usr);
    this.pickUser = [];
    this.showPick = false;
  }

  @HostListener("window:click",["$event"])
  inputFocus(event:any){
    if(event.target.classList.value.includes("search__input") || event.target.classList.value.includes("search__item")){
      return;
    }else{
      this.asyncCall = [];
    }
  }

  constructor(private data: DataService) { }

  ngOnInit(): void {
  }

}
