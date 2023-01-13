import{a as u,S as c,$ as f,a0 as m,b as t,s as v,k as y,w as i,o,e as r,h as l,r as d,t as h,x as b,f as g,v as k,T as $,l as C,p as w,W as V,j as _}from"./entry.b2982cee.js";import{u as B}from"./uid.2376e4bd.js";const a="ITooltip",S=u({name:a,directives:{ClickOutside:c},mixins:[f,m],props:{color:{type:String,default:t(a,"color")},disabled:{type:Boolean,default:!1},modelValue:{type:Boolean,default:!1},name:{type:String,default(){return B("tooltip")}},arrow:{type:Boolean,default:!0},placement:{type:String,default:"top"},trigger:{type:[String,Array],default:()=>["hover","focus"]},offset:{type:Number,default:6},interactable:{type:Boolean,default:!1},popperOptions:{type:Object,default:()=>({})},size:{type:String,default:t(a,"size"),validator:v}},emits:["click-outside","update:modelValue"],computed:{classes(){return{...y(this),[`-${this.size}`]:Boolean(this.size)}}},methods:{onEscape(){this.visible=!1,this.$emit("update:modelValue",!1)},handleClickOutside(){this.visible=!1,this.$emit("update:modelValue",!1),this.onClickOutside()}}}),z=["id"],O=["aria-describedby","aria-disabled","aria-expanded"],N=["id","aria-hidden"],P={key:0,"data-popper-arrow":""};function E(e,s,A,D,T,j){const p=V("click-outside");return i((o(),r("div",{class:C(["tooltip-wrapper",e.classes]),ref:"wrapper",id:e.name,onKeyup:s[0]||(s[0]=w((...n)=>e.onEscape&&e.onEscape(...n),["esc"]))},[l("div",{class:"tooltip-trigger",ref:"trigger","aria-describedby":`${e.name}-popup`,"aria-disabled":e.disabled?"true":"false","aria-expanded":e.visible?"true":"false"},[d(e.$slots,"default")],8,O),h($,{name:"zoom-in-top-transition",onAfterLeave:e.destroyPopper},{default:b(()=>[i(l("div",{class:"tooltip",ref:"popup",role:"tooltip","aria-live":"polite",id:`${e.name}-popup`,"aria-hidden":e.visible?"false":"true"},[e.arrow?(o(),r("span",P)):g("",!0),d(e.$slots,"body")],8,N),[[k,e.visible]])]),_:3},8,["onAfterLeave"])],42,z)),[[p,e.onClickOutside]])}const M=_(S,[["render",E]]);export{M as default};
