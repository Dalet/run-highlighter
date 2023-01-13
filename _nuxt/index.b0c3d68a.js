import{u as p}from"./uid.2376e4bd.js";import{a as u,b as d,s as f,o as l,e as n,r as o,f as r,h as t,m,l as b,w as y,v as $,j as v}from"./entry.b2982cee.js";import C from"./index.9a1229a9.js";const i="ITextarea",B=u({name:i,extends:C,props:{color:{type:String,default:d(i,"color")},clearable:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},id:{type:String,default:""},modelValue:{type:String,default:""},name:{type:[String,Number],default(){return p("textarea")}},readonly:{type:Boolean,default:!1},size:{type:String,default:d(i,"size"),validator:f},tabindex:{type:[Number,String],default:0}},emits:["update:modelValue"]}),S={key:0,class:"input-prepend"},g={class:"input"},k={key:0,class:"input-prefix"},V=["value","name","id","tabindex","disabled","aria-disabled","readonly","aria-readonly"],I={key:1,class:"input-suffix"},N={key:1,class:"input-append"};function h(e,a,w,z,D,P){return l(),n("div",{class:b(["input-wrapper",e.classes])},[e.$slots.prepend?(l(),n("div",S,[o(e.$slots,"prepend")])):r("",!0),t("div",g,[e.$slots.prefix?(l(),n("span",k,[o(e.$slots,"prefix")])):r("",!0),t("textarea",m(e.$attrs,{value:e.value,ref:"input",role:"textbox",name:e.name,id:e.id,tabindex:e.tabIndex,disabled:e.isDisabled,"aria-disabled":e.isDisabled?"true":!1,readonly:e.isReadonly,"aria-readonly":e.isReadonly?"true":!1,"aria-multiline":"true",onInput:a[0]||(a[0]=(...s)=>e.onInput&&e.onInput(...s)),onBlur:a[1]||(a[1]=(...s)=>e.onBlur&&e.onBlur(...s))}),null,16,V),e.$slots.suffix||e.clearable&&e.isClearable?(l(),n("span",I,[o(e.$slots,"clearable",{clear:e.onClear},()=>[y(t("i",{class:"input-clear","aria-label":"Clear",onClick:a[2]||(a[2]=(...s)=>e.onClear&&e.onClear(...s))},null,512),[[$,e.isClearable]])]),o(e.$slots,"suffix")])):r("",!0)]),e.$slots.append?(l(),n("div",N,[o(e.$slots,"append")])):r("",!0)],2)}const T=v(B,[["render",h]]);export{T as default};