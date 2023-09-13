import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import * as d3 from "d3";
import { DataService } from 'src/app/services/data/data.service';
import {BehaviorSubject, of} from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emitDistinctChangesOnlyDefaultValue } from '@angular/compiler';
import { IUser } from 'src/app/utils/user';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit, AfterViewInit {
  
  tree: any[] | undefined = [];
  currentRoot: any;
  rawTree: any = [];
  root: any;
  observable: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  clickObservable: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  treeData: any;
  usersDictionary: {[id: number]:any} = {};
  margin = {top: 10, right: 10, bottom: 10, left: 10};
  width: number;
  height: number;
  i = 0;
  svg: any;
  treemap: any;

  info: IUser = {
    userId: -1,
    userName: '',
    userSurname: '',
    userCompany: '',
    userEmail: '',
    userTag: ''
  }

  showInfo: boolean = false;
  initial: boolean = true;
  clickCount: number = 0;
  isSingleClick: boolean = false;

  // gte(this.asyncCall)

  visualize(id:number){
    this.visualizeTree(id)
  }

  async visualizeTree(usr:any){
    this.currentRoot = (await this.data.fidUserById(usr))[0];
    let children = await this.data.getChildren(usr);
    let tmp = [];
    tmp.push({id: this.currentRoot.id});
    this.usersDictionary[this.currentRoot.id] = this.currentRoot;
    this.createTree(this.currentRoot.id, children, tmp);
    this.observable.subscribe((data:any)=>{
      this.treeData = d3.stratify()(data);
      this.root = d3.hierarchy(this.treeData, (d:any) => {
        return d.children;
      });
    (this.root as any).x0 = 0;
    (this.root as any).y0 = 0;   
    
    this.initialize();
    this.update(this.root);
    this.initial = false;
    })
  }
  
  @HostListener("window:resize",['$event'])
  getResize(){
    this.width = window.innerWidth;
    this.height = window.innerHeight/2.5;
    this.treemap = d3.tree().size([this.height, this.width]);
  }


  ngAfterViewInit(){
    this.svg = d3
    .select(".tree__content")
    .append("div")
    .attr("class","tree__inner")
    .style("width", "50%")
    .append("div")
    .attr("class", "tree__graph")
    // .style("transform", "translate("+this.margin.left+","+this.margin.right+")");
  }

  update(source:any){

    const click = (inp:any) => {
      this.clickCount++;
      let d = inp.target.__data__;
      setTimeout(() => {
        if (this.clickCount === 1) { 
          if(d.children!==undefined&&d._children!==undefined){
            if(d.children!==null){  
              d._children = d.children;
              d.children = null;
            }else{    
              d.children = d._children;
              d._children = null;
            }
            this.update(d)
          }
          
          
        } else if (this.clickCount > 1) {
          let tmpI: IUser = {
            userId: d.data.id,
            userName: this.usersDictionary[d.data.id].first_name,
            userSurname: this.usersDictionary[d.data.id].last_name,
            userCompany: this.usersDictionary[d.data.id].company,
            userEmail: this.usersDictionary[d.data.id].email,
            userTag: this.usersDictionary[d.data.id].tag
          }
          this.info = tmpI;
          this.showInfo = true;
        }
        this.clickCount = 0;  
    }, 300)
    }

    let treeData = this.treemap(this.root)
    let nodes = treeData.descendants();

    nodes.forEach((d:any)=>{
      d.y = d.depth * 280;
    });

    let node = this.svg.selectAll('div.node').data(nodes, (d:any)=>{
      return d.data.data.id
    });

    let nodeEnter = node
      .enter()
      .append('div')
      .attr('class', 'node')
      .style('transform', (d:any)=>{
        return "translate("+source.y0+"px,"+source.x0+"px)";
      })
      .style("cursor","pointer")
      .style("background-image", (d:any) => {
        return "url('"+this.usersDictionary[d.data.data.id].photo+"')"
      })
      // .style("background-color", (d:any)=>{ 
      //   return d._children ? "rgb(75, 151, 223)" : "white";
      // })
      .on('click', click)

    nodeEnter
      .append('span')
      .attr('class', 'node__bg')
      .style('background-color', (d:any)=>{
        return d._children ? "rgb(75, 151, 223)" : "trasparent";
      })

    nodeEnter
      .append('p')
      .transition()
      .duration(750)
      .text((d:any)=>{
        let name = this.usersDictionary[d.data.id].first_name;
        let surname = this.usersDictionary[d.data.id].last_name;
        return `${name} ${surname}`;
      })
      .style('opacity',1);

    nodeEnter
      .append('span')
      .text((d:any)=>{
        return d._children!=null ? d._children.length : '';
      })
      .attr('class', 'child__num')
      .transition()
      .duration(750)

    
    

    let nodeUpdate = nodeEnter.merge(<any>node);

    nodeUpdate
      .transition()
      .duration(750)
      .style('transform', (d:any)=>{
        return "translate("+d.y+"px,"+d.x+"px)";
      })
      // .style("background-color", (d:any)=>{
      //   return d._children ? "rgb(75, 151, 223)" : "white";
      // })

    nodeUpdate
      .select('.node__bg')
      .style("background-color", (d:any)=>{
        return d._children ? "rgb(75, 151, 223)" : "white";
      })


    nodeUpdate
      .select('.child__num')
      .transition()
      .duration(1550)
      .style('opacity', (d:any)=>d._children!=null ? '1' : '0')

    let nodeExit = node
      .exit()
      .transition()
      .duration(750)
      .style('transform', (d:any)=>{
        return "translate("+source.y+"px,"+source.x+"px)"
      })
      .remove();

      nodeExit.select('.child__numb').transition().duration(200).style('opacity',0);


    nodes.forEach((d:any)=>{
      d.x0 = d.x;
      d.y0 = d.y;
    });

      
  }

  initialize(){
    let treeData = this.treemap(this.root)
    let nodes = treeData.descendants();
    nodes.forEach((d:any)=>{
      if(d.children){
        (d as any)._children = d.children;
        (d as any).children = null;
      }
    });
  }

  constructor(private data: DataService) { 
    this.getResize();
  }

  createTree(parent_name:any, children: any, tmp: any[]){
    if(parent_name===null){
      return;
    }
    children.forEach(async (node:any)=>{
      if(tmp.filter(el=>el.id===parent_name&&el.parentId===node.user_table.id).length>0){
        return;
      }
      tmp.push({id: node.user_table.id, parentId: parent_name});
      this.usersDictionary[node.user_table.id] = node.user_table;
      this.observable.next(tmp);
      let children = await this.data.getChildren(node.user_table.id);
      if(children.length === 0)
        this.createTree(null, children,tmp);
      else
        this.createTree(node.user_table.id, children,tmp);
    });

    if(children.length == 0){
      this.observable.next(tmp);
    }
  }

  async ngOnInit() {
  }

}
