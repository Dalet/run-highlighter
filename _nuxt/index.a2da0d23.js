import{a as t,b as n,k as l,o as r,e as i,l as u,h as c,j as m}from"./entry.b2982cee.js";const a="IHamburgerMenu",d=t({name:a,props:{animation:{type:String,default:"close"},color:{type:String,default:n(a,"color")},modelValue:{type:Boolean,default:!1}},emits:["update:modelValue"],computed:{classes(){return{...l(this),"-active":this.modelValue,[`-${this.animation}`]:!0}}},methods:{onClick(){this.$emit("update:modelValue",!this.modelValue)}}}),p=c("span",{class:"hamburger-menu-bars"},null,-1),_=[p];function f(e,s,h,V,k,C){return r(),i("div",{class:u(["hamburger-menu",e.classes]),onClick:s[0]||(s[0]=(...o)=>e.onClick&&e.onClick(...o))},_,2)}const y=m(d,[["render",f]]);export{y as default};