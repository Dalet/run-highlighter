import{a as t,b as s,s as o,k as r,o as n,e as l,r as i,l as c,j as d}from"./entry.b2982cee.js";const a="INav",p=t({name:a,provide(){return{nav:this}},inject:{navbar:{default:()=>({onItemClick:()=>{}})},sidebar:{default:()=>({onItemClick:()=>{}})}},props:{color:{type:String,default:s(a,"color")},size:{type:String,default:s(a,"size"),validator:o},vertical:{type:Boolean,default:!1}},computed:{classes(){return{...r(this),[`-${this.size}`]:Boolean(this.size),"-vertical":this.vertical}}},methods:{onItemClick(){[this.navbar,this.sidebar].forEach(e=>{e.onItemClick()})}}});function u(e,m,f,_,v,h){return n(),l("nav",{class:c(["nav",e.classes]),role:"menubar"},[i(e.$slots,"default")],2)}const C=d(p,[["render",u]]);export{C as default};