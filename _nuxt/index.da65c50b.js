import l from"./index.72817578.js";import i from"./index.f58ef7d1.js";import a from"./index.666f06f8.js";import r from"./index.a2da0d23.js";import{a as _,S as f,X as h,b as s,s as C,k,w as v,o as O,e as g,t as o,x as t,r as y,m as V,W as b,j as I}from"./entry.b2982cee.js";import"./capitalizeFirst.ac603a34.js";const n="INavbar",$=_({name:n,components:{IContainer:l,IRow:i,IColumn:a,IHamburgerMenu:r},directives:{ClickOutside:f},mixins:[h],provide(){return{navbar:this}},props:{collapseOnItemClick:{type:Boolean,default:!0},collapseOnClickOutside:{type:Boolean,default:!0},color:{type:String,default:s(n,"color")},fluid:{type:Boolean,default:!1},size:{type:String,default:s(n,"size"),validator:C},menuAnimation:{type:String,default:"close"}},emits:["update:modelValue"],computed:{classes(){return{...this.collapsibleClasses,...k(this),[`-${this.size}`]:Boolean(this.size)}}},methods:{onItemClick(){this.collapseOnItemClick&&this.open&&this.setOpen(!1)},onClickOutside(){this.collapseOnClickOutside&&this.open&&this.setOpen(!1)}}});function B(e,w,z,S,x,D){const c=r,u=a,p=i,m=l,d=b("click-outside");return v((O(),g("nav",V({class:["navbar",e.classes]},e.$attrs),[o(m,{fluid:e.fluid},{default:t(()=>[o(p,null,{default:t(()=>[o(u,null,{default:t(()=>[o(c,{class:"collapse-toggle",animation:e.menuAnimation,color:e.color,modelValue:e.open,"onUpdate:modelValue":e.toggleOpen},null,8,["animation","color","modelValue","onUpdate:modelValue"]),y(e.$slots,"default")]),_:3})]),_:3})]),_:3},8,["fluid"])],16)),[[d,e.onClickOutside]])}const E=I($,[["render",B]]);export{E as default};