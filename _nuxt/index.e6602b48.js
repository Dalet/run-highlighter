import{u as s}from"./uid.2376e4bd.js";import{a as n,o,e as r,r as i,l as c,j as l}from"./entry.b2982cee.js";const d="ITabTitle",p=n({name:d,inject:{tabs:{default:()=>({})}},props:{for:{type:String,default(){return s("tab")}}},computed:{active(){return this.tabs.active===this.for},classes(){return{"-active":this.active}},name(){return this.for}},methods:{onClick(){this.tabs.setActive(this.for)}}}),m=["for","active","aria-expanded","aria-controls","aria-describedby"];function u(e,t,f,b,v,_){return o(),r("div",{class:c(["tab-title",e.classes]),role:"tab",for:e.name,active:e.active,"aria-expanded":e.active,"aria-controls":`tab-content-${e.name}`,"aria-describedby":`tab-content-${e.name}`,tabindex:"0",onClick:t[0]||(t[0]=(...a)=>e.onClick&&e.onClick(...a))},[i(e.$slots,"default")],10,m)}const k=l(p,[["render",u]]);export{k as default};