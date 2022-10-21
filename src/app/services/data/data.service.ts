import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { initSupabase } from 'src/app/utils/initSupabase';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  observable: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  supabase: SupabaseClient = createClient(initSupabase.supabaseUrl, initSupabase.supabaseKey);

  constructor() { }

  async updatePhoto(id: number, file: any){
    const imgs = (await this.supabase.storage.from('avatars').list()).data
    if(imgs){
      const img = (imgs.filter(el => el.name.includes(`id${id}`)))[0];
      if(img){
        const img_name = img.name;
        let res:any = await this.supabase.storage.from('avatars').remove([img_name]);
              if(res.error){
                return res;
              }
              const new_img_name = `id${id}_${Date.now()}.jpeg`;
              res = await this.supabase.storage.from('avatars').upload(new_img_name, file);
              if(res.error){
                return res;
              }
              const fUrl:any = await this.supabase.storage.from('avatars').getPublicUrl(new_img_name);
              this.observable.next(fUrl);
              res = await this.supabase
                .from('user_table')
                .update({photo: fUrl.data.publicURL})
                .eq('id', id)
              if(res.error){
                return res;
              }
      }else{
        const new_img_name = `id${id}_${Date.now()}.jpeg`;
        let res:any = await this.supabase.storage.from('avatars').upload(new_img_name, file);
        if(res.error){
          return res;
        }
        const fUrl:any = await this.supabase.storage.from('avatars').getPublicUrl(new_img_name);
        this.observable.next(fUrl);
        res = await this.supabase
          .from('user_table')
          .update({photo: fUrl.data.publicURL})
          .eq('id', id)
  
        if(res.error){
          return res;
        }
      }
    }
    
  }

  async deleteUser(id:number){

    let res = await this.supabase
      .from('collegato')
      .delete()
      .or(`u_1.eq.${id},u_2.eq.${id}`)

    if(res.error===null){
      res = await this.supabase
      .from('user_table')
      .delete()
      .eq('id',id);

      if(res.error!==null){
        return res;
      }
    }else{
      return res;
    }

    const imgs = (await this.supabase.storage.from('avatars').list()).data
    if(imgs){
      if((imgs.filter(el => el.name.includes(`id${id}`)))[0] !== undefined){
        const img_name = (imgs.filter(el => el.name.includes(`id${id}`)))[0].name;
        let res = await this.supabase.storage.from('avatars').remove([img_name]);
        return res;
      }
    }

    return;

  }

  async insertConnection(id_1:number, id_2: number){
    let res = await this.supabase
      .from('collegato')
      .insert({u_1: id_1, u_2: id_2})


    return res;
  }

  async deleteConnection(id_1:number, id_2: number){
    let res = await this.supabase
      .from('collegato')
      .delete()
      .eq('u_1',id_1)
      .eq('u_2',id_2);

    return res;
    
  }

  async updateInfo(id:number, data:any){
    let res = await this.supabase
      .from('user_table')
      .update(data)
      .eq('id',id)

    return res;

  }

  async getAllUsers(){
    let users = await this.supabase
      .from('user_table')
      .select('*')
    
    return users.data || [];
  }

  async getChildren(id: number){
  let users = await this.supabase
    .from('collegato')
    .select(`user_table!collegato_u_2_fkey(*)`)
    .eq('u_1', id)
  return users.data || [];
  }

  async fidUserById(id: number){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('id',id);
    return user.data || '';
  }

  async findUsersBySurname(name: string){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('last_name',name);
    
    return user.data || '';
  }

  async findUsersByName(name: string){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('first_name',name);
    
    return user.data || '';
  }

  async findUsersByCompany(name: string){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('company',name);
    
    return user.data || '';
  }

  async findUsersByEmail(name: string){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('email',name);
    
    return user.data || '';
  }

  async findUsersByTag(name: string){
    let user = await this.supabase
      .from('user_table')
      .select('*')
      .eq('tag',name);
    
    return user.data || '';
  }

  async autoSurname(name: string){
    if(name==="")
      return [];
    let user = await this.supabase
      .from('user_table')
      .select('id, last_name')
      .ilike('last_name', '%'+name+'%')
      .range(0,4)

    return user.data || '';
  }

  async autoName(name: string){
    if(name==="")
      return [];
    let user = await this.supabase
      .from('user_table')
      .select('id, first_name')
      .ilike('first_name', '%'+name+'%')
      .range(0,4)

    return user.data || '';
  }

  async autoCompany(name: string){
    if(name==="")
      return [];
    let user = await this.supabase
      .from('user_table')
      .select('id, company')
      .ilike('company', '%'+name+'%')
      .range(0,4)

    return user.data || '';
  }

  async autoEmail(name: string){
    if(name==="")
      return [];
    let user = await this.supabase
      .from('user_table')
      .select('id, email')
      .ilike('email', '%'+name+'%')
      .range(0,4)

    return user.data || '';
  }

  async autoPhone(name: string){
    if(name==="")
      return [];
    let user = await this.supabase
      .from('user_table')
      .select('id, phone')
      .ilike('phone', '%'+name+'%')
      .range(0,4)

    return user.data || '';
  } 
}
