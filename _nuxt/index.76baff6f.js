import{a as D,S as B,F,$ as N,b,a2 as P,a3 as M,s as O,k as z,R as a,a4 as K,B as E,w as y,o as l,e as d,t as g,a5 as R,x as p,r,h,f as c,C as w,D as A,l as k,v as H,T as j,p as q,W,i as S,c as $,z as U,j as G}from"./entry.b2982cee.js";import{i as J}from"./isFunction.ccc02bc7.js";import{u as Q}from"./uid.2376e4bd.js";import I from"./index.9a1229a9.js";import X from"./index.a90a9eb0.js";import C from"./index.312a465e.js";import v from"./index.274e3244.js";const m="ISelect",Y=D({name:m,directives:{ClickOutside:B},components:{IInput:I,IIcon:X,ISelectOption:v,IMark:C},mixins:[F,N],provide(){return{select:this}},props:{animationDuration:{type:Number,default:300},autocomplete:{type:Boolean,default:!1},arrow:{type:Boolean,default:!0},color:{type:String,default:b(m,"color")},clearable:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},idField:{type:String,default:"id"},keydownTrigger:{type:Array,default:()=>["up","down","enter","space","tab","esc"]},keydownItem:{type:Array,default:()=>["up","down","enter","space","tab","esc"]},label:{type:[String,Function],default:"label"},loading:{type:Boolean,default:!1},modelValue:{type:[Object,String,Number],default:null},minLength:{type:Number,default:0},name:{type:[String,Number],default:()=>Q("select")},options:{type:Array,default:()=>[]},placeholder:{type:String,default:""},offset:{type:Number,default:6},placement:{type:String,default:"bottom"},popperOptions:{type:Object,default:()=>({modifiers:[...P({offset:8}),M()]})},readonly:{type:Boolean,default:!1},scrollTolerance:{type:Number,default:160},selectFirstOptionOnEnter:{type:Boolean,default:!0},size:{type:String,default:b(m,"size"),validator:O},tabindex:{type:[Number,String],default:0},type:{type:String,default:"text"},total:{type:Number,default:void 0}},emits:["update:modelValue","search","pagination"],data(){return{animating:!1,visible:!1,inputValue:this.computeLabel(this.modelValue)||""}},computed:{wrapperClasses(){return{...z(this),[`-${this.size}`]:Boolean(this.size)}},popupClasses(){return{"-disabled":this.isDisabled,"-readonly":this.isReadonly}},tabIndex(){return this.isDisabled?-1:this.tabindex},isClearable(){return this.value&&this.clearable&&!this.isDisabled&&!this.isReadonly},value(){return this.schema?this.schema.value:this.modelValue},inputPlaceholder(){return this.value?this.computeLabel(this.value):this.placeholder}},watch:{value(e){this.inputValue=this.computeLabel(e)},inputValue(e){const t=this.inputMatchesLength(e),s=this.inputMatchesLabel(e);t&&!s&&!this.animating&&this.show(),this.$emit("search",this.inputValue)},options(){this.visible&&this.createPopper()}},methods:{onInput(e,t){var s,o;e.disabled||(this.hide(),t&&(this.inputValue=t),(o=(s=this.parent).onInput)==null||o.call(s,this.name,e),this.$emit("update:modelValue",e))},onClear(){this.animating=!0,this.$emit("update:modelValue",null),this.$nextTick(()=>{this.animating=!1})},onFocus(e){if(!this.value&&this.options.length===0)return;this.autocomplete&&(this.inputValue=""),(!e.relatedTarget||!this.$refs.wrapper.contains(e.relatedTarget))&&this.inputShouldShowSelect(this.inputValue)&&this.show()},onBlur(e){var s,o;(!e.relatedTarget||!this.$refs.wrapper.contains(e.relatedTarget))&&(this.hide(),this.inputValue=this.computeLabel(this.value)),(o=(s=this.parent).onBlur)==null||o.call(s,this.name,e)},onClick(){this.autocomplete&&(this.inputValue=""),this.inputShouldShowSelect(this.inputValue)&&this.show()},onClickOutside(){this.hide()},onClickCaret(e){this.visible?this.onBlur(e):(this.focus(),this.onFocus(e)),e.preventDefault(),e.stopPropagation()},onScroll(){if(isNaN(this.total))return;const e=this.$refs.body.scrollTop,t=parseInt(getComputedStyle(this.$refs.body).height,10),s=parseInt(getComputedStyle(this.$refs.options).height,10),o=e+t>s-this.scrollTolerance,n=this.options.length>=this.total;o&&!n&&this.options.length>0&&!this.loading&&this.$emit("pagination")},onWindowResize(){this.onScroll(),this.visible&&this.$nextTick().then(()=>this.createPopper())},onTriggerKeyDown(e){if(this.keydownTrigger.length===0)return;const t=this.getFocusableItems(),s=t.findIndex(u=>u.active),o=s>-1?s:0,n=t[o];switch(!0){case(a("up",e)&&this.keydownTrigger.includes("up")):case(a("down",e)&&this.keydownTrigger.includes("down")):this.show(),setTimeout(()=>{n.focus()},this.visible?0:this.animationDuration),e.preventDefault(),e.stopPropagation();break;case(a("enter",e)&&this.keydownTrigger.includes("enter")):if(this.selectFirstOptionOnEnter&&(!this.value||!this.inputMatchesLabel(this.inputValue))){const u=this.options.find(f=>!f.disabled);u&&(this.onInput(u),this.focus())}else this.onClick();this.visible||setTimeout(()=>{n.focus()},this.animationDuration),e.preventDefault();break;case(a("tab",e)&&this.keydownTrigger.includes("tab")):case(a("esc",e)&&this.keydownTrigger.includes("esc")):this.hide();break}},onItemKeyDown(e){if(this.keydownItem.length!==0)switch(!0){case(a("up",e)&&this.keydownItem.includes("up")):case(a("down",e)&&this.keydownItem.includes("down")):const t=this.getFocusableItems(),s=t.findIndex(u=>u===e.target),o=t.length-1;let n;a("up",e)?n=s>0?s-1:0:n=s<o?s+1:o,t[n].focus(),e.preventDefault(),e.stopPropagation();break;case(a("enter",e)&&this.keydownItem.includes("enter")):case(a("space",e)&&this.keydownItem.includes("space")):e.target.click(),this.focus(),e.preventDefault();break;case(a("tab",e)&&this.keydownItem.includes("tab")):case(a("esc",e)&&this.keydownItem.includes("esc")):this.hide(),this.focus(),e.preventDefault();break}},onEscape(){this.hide()},show(){this.isDisabled||this.isReadonly||this.visible||(this.visible=!0,this.createPopper())},hide(){!this.visible||(this.visible=!1,this.animating=!0,setTimeout(()=>{this.animating=!1},this.animationDuration))},focus(){this.$refs.trigger.focus()},getFocusableItems(){const e=[];for(const t of this.$refs.options.children)K(t)&&e.push(t);return e},getElementHeight(e){const t=getComputedStyle(e);return t.height?Math.ceil(parseFloat(t.height)):NaN},inputMatchesLabel(e){return this.value&&e===this.computeLabel(this.value)},inputMatchesLength(e){return this.minLength===0||e&&e.length>=this.minLength},inputShouldShowSelect(e){return this.autocomplete?this.inputMatchesLength(e)&&!this.inputMatchesLabel(e):!0},computeLabel(e){return typeof e!="object"?this.inputValue:J(this.label)?this.label(e):E(e,this.label)}}}),Z=["id","name","aria-owns","aria-expanded"],_=["id","aria-hidden"],x={key:0,"data-popper-arrow":""},ee={key:1,class:"select-header"},te={key:0,class:"select-no-results"},se={class:"select-options",ref:"options"},ie={key:2,class:"select-footer"};function oe(e,t,s,o,n,u){const f=I,V=C,T=v,L=W("click-outside");return y((l(),d("div",{class:k(["select-wrapper",e.wrapperClasses]),id:e.name,name:e.name,ref:"wrapper",role:"combobox","aria-haspopup":"listbox","aria-owns":`${e.name}-options`,"aria-expanded":e.visible?"true":"false",onKeyup:t[3]||(t[3]=q((...i)=>e.onEscape&&e.onEscape(...i),["esc"]))},[g(f,{modelValue:e.inputValue,"onUpdate:modelValue":t[1]||(t[1]=i=>e.inputValue=i),ref:"trigger",autocomplete:"off","aria-autocomplete":"both","aria-controls":`${e.name}-options`,disabled:e.isDisabled,readonly:e.isReadonly,tabindex:e.tabIndex,plaintext:!e.autocomplete,placeholder:e.inputPlaceholder,clearable:e.isClearable,color:e.color,size:e.size,name:`${e.name}-input`,onClick:e.onClick,onFocus:e.onFocus,onBlur:e.onBlur,onClear:e.onClear,onKeydown:e.onTriggerKeyDown},R({suffix:p(()=>[r(e.$slots,"suffix"),h("button",{class:"select-caret","aria-hidden":"true",role:"button",onClick:t[0]||(t[0]=(...i)=>e.onClickCaret&&e.onClickCaret(...i))})]),_:2},[e.$slots.prepend?{name:"prepend",fn:p(()=>[r(e.$slots,"prepend")]),key:"0"}:void 0,e.$slots.prefix?{name:"prefix",fn:p(()=>[r(e.$slots,"prefix")]),key:"1"}:void 0,e.$slots.append?{name:"append",fn:p(()=>[r(e.$slots,"append")]),key:"2"}:void 0]),1032,["modelValue","aria-controls","disabled","readonly","tabindex","plaintext","placeholder","clearable","color","size","name","onClick","onFocus","onBlur","onClear","onKeydown"]),g(j,{name:"zoom-in-top-transition",onAfterLeave:e.destroyPopper},{default:p(()=>[y(h("div",{class:k(["select",e.popupClasses]),id:`${e.name}-options`,role:"listbox",ref:"popup","aria-hidden":e.visible?"false":"true"},[e.arrow?(l(),d("span",x)):c("",!0),e.$slots.header?(l(),d("div",ee,[r(e.$slots,"header")])):c("",!0),h("div",{class:"select-body",ref:"body",onScroll:t[2]||(t[2]=(...i)=>e.onScroll&&e.onScroll(...i))},[!e.$slots.default&&e.options.length===0?(l(),d("div",te,[r(e.$slots,"no-results",{},()=>[S(" There are no results for your query. ")])])):c("",!0),h("div",se,[r(e.$slots,"default"),(l(!0),d(w,null,A(e.options,i=>(l(),$(T,{key:i[e.idField],active:e.value&&e.value[e.idField]===i[e.idField],disabled:i.disabled,value:i,onKeydown:e.onItemKeyDown},{default:p(()=>[r(e.$slots,"option",{option:i},()=>[e.autocomplete&&e.inputValue!==e.computeLabel(i)?(l(),$(V,{key:0,text:e.computeLabel(i),query:e.inputValue},null,8,["text","query"])):(l(),d(w,{key:1},[S(U(e.computeLabel(i)),1)],64))])]),_:2},1032,["active","disabled","value","onKeydown"]))),128))],512)],544),e.$slots.footer?(l(),d("div",ie,[r(e.$slots,"footer")])):c("",!0)],10,_),[[H,e.visible]])]),_:3},8,["onAfterLeave"])],42,Z)),[[L,e.onClickOutside]])}const he=G(Y,[["render",oe]]);export{he as default};
