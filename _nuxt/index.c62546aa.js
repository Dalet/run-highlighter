import{u as r}from"./uid.2376e4bd.js";import{a as u,F as h,b as l,s as c,k as p,o as f,e as m,h as d,r as k,p as b,l as y,q as B,j as g}from"./entry.b2982cee.js";const o="ICheckbox",C=u({name:o,mixins:[h],props:{color:{type:String,default:l(o,"color")},disabled:{type:Boolean,default:!1},indeterminate:{type:Boolean,default:!1},value:{default:!1},modelValue:{default:!1},name:{type:[String,Number],default(){return r("checkbox")}},native:{type:Boolean,default:!1},readonly:{type:Boolean,default:!1},size:{type:String,default:l(o,"size"),validator:c},tabindex:{type:[Number,String],default:0}},emits:["update:modelValue"],computed:{classes(){return{...p(this),[`-${this.size}`]:Boolean(this.size),"-disabled":this.isDisabled,"-readonly":this.isReadonly,"-native":this.native}},checked(){return this.formGroup.checked?this.formGroup.checked.includes(this.value):this.schema?this.schema.value:this.modelValue},tabIndex(){return this.isDisabled?-1:this.tabindex}},methods:{clickInputRef(){this.isReadonly||this.$refs.input.click()},onChange(e){var a,i,n,t;(i=(a=this.parent).onInput)==null||i.call(a,this.name,e.target.checked),(t=(n=this.formGroup).onChange)==null||t.call(n,this.value),this.$emit("update:modelValue",e.target.checked)},onBlur(e){var a,i;(i=(a=this.parent).onBlur)==null||i.call(a,this.name,e)}}}),v=["aria-checked"],I=["checked","name","disabled","readonly",".indeterminate"],R=["aria-checked","aria-disabled","aria-readonly","tabindex"];function V(e,a,i,n,t,$){return f(),m("div",{class:y(["checkbox",e.classes]),"aria-checked":e.checked?"true":"false",role:"checkbox"},[d("input",{ref:"input",type:"checkbox",checked:e.checked,tabindex:"-1",name:e.name,disabled:e.isDisabled,readonly:e.isReadonly,".indeterminate":e.indeterminate,"aria-hidden":"true",onChange:a[0]||(a[0]=(...s)=>e.onChange&&e.onChange(...s))},null,40,I),d("label",{class:"checkbox-label","aria-checked":e.checked,"aria-disabled":e.isDisabled,"aria-readonly":e.isReadonly,tabindex:e.tabIndex,onBlur:a[1]||(a[1]=(...s)=>e.onBlur&&e.onBlur(...s)),onClick:a[2]||(a[2]=(...s)=>e.clickInputRef&&e.clickInputRef(...s)),onKeydown:a[3]||(a[3]=b(B((...s)=>e.clickInputRef&&e.clickInputRef(...s),["stop","prevent"]),["space"]))},[k(e.$slots,"default")],40,R)],10,v)}const D=g(C,[["render",V]]);export{D as default};