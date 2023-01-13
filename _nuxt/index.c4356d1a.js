import{R as y,a as v,S as w,b as n,s as b,k,U as C,V as $,o as a,c as O,x as r,w as u,v as c,h as f,t as _,e as i,r as t,f as o,T as m,l as g,W as V,j as z}from"./entry.b2982cee.js";import{u as B}from"./uid.2376e4bd.js";const s={instances:{},stack:[],zIndex:1050,register(e){e&&e.name&&(s.instances[e.name]=e)},unregister(e){e&&e.name&&(s.instances[e.name]=null,delete s.instances[e.name])},open(e){typeof window>"u"||(s.stack.push(e),s.instances[e].$el.style.zIndex=s.zIndex++)},close(e){typeof window>"u"||s.stack.splice(s.stack.indexOf(e),1)},getTopOverlay(){const e=s.stack.slice(-1)[0]||"";return s.instances[e]},onPressEscape(){const e=s.getTopOverlay();e&&e.closeOnPressEscape&&e.hide()}};typeof window<"u"&&window.addEventListener("keydown",e=>{y("esc",e)&&s.onPressEscape()});const l="IModal",S=v({name:l,directives:{ClickOutside:w},props:{closeOnPressEscape:{type:Boolean,default:!0},closeAriaLabel:{type:String,default:"Close"},color:{type:String,default:n(l,"color")},disabled:{type:Boolean,default:!1},hideOnClickOutside:{type:Boolean,default:!0},name:{type:String,default(){return B("modal")}},showClose:{type:Boolean,default:!0},size:{type:String,default:n(l,"size"),validator:b},modelValue:{type:Boolean,default:!1},transition:{type:String,default:"zoom-in-center-transition"}},emits:["update:modelValue"],data(){return{visible:this.modelValue}},computed:{classes(){return{"-disabled":this.disabled,...k(this),[`-${this.size}`]:Boolean(this.size)}}},watch:{modelValue(e){e?this.show():this.hide()}},mounted(){s.register(this)},unmounted(){s.unregister(this)},methods:{show(){this.disabled||(this.visible=!0,this.$emit("update:modelValue",!0),s.open(this.name),typeof window<"u"&&C(window.document.body,"-modal"))},hide(){this.disabled||(this.visible=!1,this.$emit("update:modelValue",!1),s.close(this.name),typeof window<"u"&&$(window.document.body,"-modal"))},onClickOutside(){!this.hideOnClickOutside||this.hide()}}}),E=["aria-hidden","id","name","aria-labelledby"],P={class:"modal"},N=["id"],I=["aria-label"],T=f("i",{class:"icon"},null,-1),D={key:1,class:"modal-body"},L={key:2,class:"modal-footer"};function A(e,d,j,K,M,R){const h=V("click-outside");return a(),O(m,{name:"fade-in-transition"},{default:r(()=>[u(f("div",{class:g(["modal-wrapper",e.classes]),role:"dialog","aria-modal":"true","aria-hidden":e.visible?"false":"true",id:e.name,name:e.name,"aria-labelledby":`${e.name}-header`},[_(m,{name:e.transition},{default:r(()=>[u((a(),i("div",P,[e.$slots.header?(a(),i("div",{key:0,class:"modal-header",id:`${e.name}-header`},[t(e.$slots,"header"),e.showClose?(a(),i("button",{key:0,class:"close","aria-hidden":"true","aria-label":e.closeAriaLabel,onClick:d[0]||(d[0]=(...p)=>e.hide&&e.hide(...p))},[t(e.$slots,"close",{},()=>[T])],8,I)):o("",!0)],8,N)):o("",!0),e.$slots.default?(a(),i("div",D,[t(e.$slots,"default")])):o("",!0),e.$slots.footer?(a(),i("div",L,[t(e.$slots,"footer")])):o("",!0)])),[[h,e.onClickOutside],[c,e.visible]])]),_:3},8,["name"])],10,E),[[c,e.visible]])]),_:3})}const q=z(S,[["render",A]]);export{q as default};