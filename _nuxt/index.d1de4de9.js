import{a as o,B as n,w as l,v as c,o as r,c as u,x as h,e as t,C as m,D as f,f as i,T as p,z as d,j as _}from"./entry.b2982cee.js";const y="IFormError",v=o({name:y,inject:{formGroup:{default:()=>({})},form:{default:()=>({})}},props:{for:{type:String,default:""},visible:{type:[Array,String],default:()=>["touched","dirty","invalid"]}},computed:{parent(){return this.formGroup.$?this.formGroup:this.form},schema(){return this.for!==""?n(this.parent.schema||{},`${this.for}`):this.parent.schema||{}},errors(){return this.schema.errors||[]},isVisible(){let e=!0;return this.schema&&this.visible&&[].concat(this.visible).forEach(s=>{e=e&&this.schema[s]}),e}}}),g={key:0,class:"form-error","aria-live":"polite"};function b(e,s,$,k,B,w){return e.schema?l((r(),u(p,{key:0,name:"fade-in-transition"},{default:h(()=>[e.errors.length>0?(r(),t("ul",g,[(r(!0),t(m,null,f(e.errors,a=>(r(),t("li",null,d(a.message),1))),256))])):i("",!0)]),_:1},512)),[[c,e.isVisible]]):i("",!0)}const S=_(v,[["render",b]]);export{S as default};
