import{a as r,F as d,b as i,s as u,k as c,o as p,e as m,r as f,l as h,j as _}from"./entry.b2982cee.js";import{u as y}from"./uid.2376e4bd.js";const n="ICheckboxGroup",b=r({name:n,mixins:[d],provide(){return{formGroup:this}},props:{color:{type:String,default:i(n,"color")},disabled:{type:Boolean,default:!1},inline:{type:Boolean,default:!1},indeterminate:{type:Boolean,default:!1},modelValue:{default:()=>[]},name:{type:[String,Number],default(){return y("checkbox-group")}},readonly:{type:Boolean,default:!1},size:{type:String,default:i(n,"size"),validator:u}},emits:["update:modelValue"],computed:{classes(){return{...c(this),[`-${this.size}`]:Boolean(this.size),"-disabled":this.isDisabled,"-readonly":this.isReadonly,"-inline":this.inline}},checked(){return this.schema?this.schema.value:this.modelValue}},methods:{onChange(e){var a,t;const s=[...this.modelValue],o=s.findIndex(l=>l===e);o!==-1?s.splice(o,1):s.push(e),(t=(a=this.parent).onInput)==null||t.call(a,this.name,s),this.$emit("update:modelValue",s)}}}),x=["name"];function g(e,s,o,a,t,l){return p(),m("div",{class:h(["form-group checkbox-group",e.classes]),name:e.name,role:"checkboxgroup"},[f(e.$slots,"default",{},void 0,!0)],10,x)}const B=_(b,[["render",g],["__scopeId","data-v-4043b2ce"]]);export{B as default};
