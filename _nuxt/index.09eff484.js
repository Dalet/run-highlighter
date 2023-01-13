import{u as r}from"./uid.2376e4bd.js";import{I as d}from"./index.8ba523c2.js";import{a as c,o as p,e as m,h as s,r as t,p as n,t as b,x as u,w as h,v,l as f,y,i as C,z as k,q as l,j as $}from"./entry.b2982cee.js";const w="ICollapsibleItem",I=c({name:w,components:{IExpandTransition:d},inject:{collapsible:{default:()=>({activeItems:[]})}},props:{name:{type:String,default(){return r("collapsible-item")}},title:{type:String,default:""}},computed:{active(){return this.collapsible.activeItems.indexOf(this.name)>-1},classes(){return{"-active":this.active}}},methods:{onClick(){this.collapsible.onItemClick(this)}}}),g=["name"],S=["id","aria-expanded","aria-controls","aria-describedby"],_=s("i",{class:"icon"},null,-1),N=["id","aria-hidden","aria-labelledby"],B={class:"content"};function V(e,a,j,z,D,E){const o=y("i-expand-transition");return p(),m("div",{class:f(["collapsible-item",e.classes]),name:e.name},[s("a",{class:"collapsible-header",role:"tab",id:`collapsible-item-heading-${e.name}`,"aria-expanded":e.active?"true":"false","aria-controls":`collapsible-item-content-${e.name}`,"aria-describedby":`collapsible-item-content-${e.name}`,tabindex:"0",onClick:a[0]||(a[0]=(...i)=>e.onClick&&e.onClick(...i)),onKeydown:[a[1]||(a[1]=n(l((...i)=>e.onClick&&e.onClick(...i),["prevent"]),["space"])),a[2]||(a[2]=n(l((...i)=>e.onClick&&e.onClick(...i),["prevent"]),["enter"]))]},[t(e.$slots,"header",{},()=>[C(k(e.title),1)]),_],40,S),b(o,null,{default:u(()=>[h(s("div",{class:"collapsible-body",role:"tabpanel",id:`collapsible-item-content-${e.name}`,"aria-hidden":e.active?"false":"true","aria-labelledby":`collapsible-item-heading-${e.name}`},[s("div",B,[t(e.$slots,"default")])],8,N),[[v,e.active]])]),_:3})],10,g)}const M=$(I,[["render",V]]);export{M as default};