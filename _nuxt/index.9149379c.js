import{u as r}from"./uid.2376e4bd.js";import{a as u,F as p,b as l,s as f,k as m,o as h,e as c,h as d,r as y,p as b,l as k,q as B,j as g}from"./entry.b2982cee.js";const o="IRadio",C=u({name:o,mixins:[p],props:{color:{type:String,default:l(o,"color")},disabled:{type:Boolean,default:!1},indeterminate:{type:Boolean,default:!1},value:{default:""},modelValue:{default:!1},name:{type:[String,Number],default(){return r("radio")}},native:{type:Boolean,default:!1},readonly:{type:Boolean,default:!1},size:{type:String,default:l(o,"size"),validator:f},tabindex:{type:[Number,String],default:0}},emits:["update:modelValue"],computed:{classes(){return{...m(this),[`-${this.size}`]:Boolean(this.size),"-disabled":this.isDisabled,"-readonly":this.isReadonly,"-native":this.native}},checked(){return this.formGroup.checked===this.value},tabIndex(){return this.isDisabled?-1:this.tabindex}},methods:{clickInputRef(){this.isReadonly||this.$refs.input.click()},onChange(e){var a,n,s,t;(n=(a=this.parent).onInput)==null||n.call(a,this.name,e.target.checked),(t=(s=this.formGroup).onChange)==null||t.call(s,this.value),this.$emit("update:modelValue",e.target.checked)},onBlur(e){var a,n;(n=(a=this.parent).onBlur)==null||n.call(a,this.name,e)}}}),R=["checked","name","disabled","readonly",".indeterminate"],v=["aria-checked","aria-disabled","aria-readonly","tabindex"];function I(e,a,n,s,t,$){return h(),c("div",{class:k(["radio",e.classes]),role:"radio"},[d("input",{checked:e.checked,ref:"input",type:"radio",tabindex:"-1",name:e.name,disabled:e.isDisabled,readonly:e.isReadonly,".indeterminate":e.indeterminate,onChange:a[0]||(a[0]=(...i)=>e.onChange&&e.onChange(...i))},null,40,R),d("label",{class:"radio-label","aria-checked":e.checked,"aria-disabled":e.isDisabled,"aria-readonly":e.isReadonly,tabindex:e.tabIndex,onBlur:a[1]||(a[1]=(...i)=>e.onBlur&&e.onBlur(...i)),onClick:a[2]||(a[2]=(...i)=>e.clickInputRef&&e.clickInputRef(...i)),onKeydown:a[3]||(a[3]=b(B((...i)=>e.clickInputRef&&e.clickInputRef(...i),["stop","prevent"]),["space"]))},[y(e.$slots,"default")],40,v)],2)}const S=g(C,[["render",I]]);export{S as default};
