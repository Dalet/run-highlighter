var b=Object.defineProperty,s=Object.defineProperties;var v=Object.getOwnPropertyDescriptors;var t=Object.getOwnPropertySymbols;var g=Object.prototype.hasOwnProperty,n=Object.prototype.propertyIsEnumerable;var e=(r,o,a)=>o in r?b(r,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):r[o]=a,l=(r,o)=>{for(var a in o||(o={}))g.call(o,a)&&e(r,a,o[a]);if(t)for(var a of t(o))n.call(o,a)&&e(r,a,o[a]);return r},i=(r,o)=>s(r,v(o));import{d as p,a as c,s as u,g as h,o as m,c as f,r as k,m as w,_ as z}from"./entry-72ed921d.mjs";const d="IBadge";var x=p({name:d,props:{color:{type:String,default:c(d,"color")},size:{type:String,default:c(d,"size"),validator:u}},computed:{classes(){return i(l({},h(this)),{[`-${this.size}`]:Boolean(this.size)})}}});function y(r,o,a,_,$,B){return m(),f("div",w({class:["badge",r.classes]},r.$attrs),[k(r.$slots,"default")],16)}var V=z(x,[["render",y]]);export{V as default};
