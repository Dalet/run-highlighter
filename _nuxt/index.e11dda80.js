import{a,L as t,o as s,c as i,x as r,r as l,m as n,Q as d,j as o}from"./entry.b2982cee.js";const u="IListGroupItem",p=a({name:u,mixins:[t],props:{active:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},tag:{type:String,default:"div"},tabindex:{type:[Number,String],default:0}},computed:{ariaDisabled(){return this.role==="link"?null:this.disabled?"true":"false"},classes(){return{"-active":this.active,"-disabled":this.disabled}},role(){return this.$attrs.to||this.$attrs.href?"link":"listitem"},tabIndex(){return this.disabled?-1:this.tabindex}}});function b(e,c,m,f,h,_){return s(),i(d(e.isTag),n(e.$attrs,{class:["list-group-item",e.classes],tag:e.tag,role:e.role,tabindex:e.tabIndex,disabled:e.disabled,"aria-disabled":e.ariaDisabled}),{default:r(()=>[l(e.$slots,"default")]),_:3},16,["tag","role","tabindex","class","disabled","aria-disabled"])}const y=o(p,[["render",b]]);export{y as default};
