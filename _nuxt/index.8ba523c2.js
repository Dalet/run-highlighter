import{a as s,o as i,c as r,x as a,r as h,T as d,j as u}from"./entry.b2982cee.js";function n(t,e){if(!t||!e||typeof window>"u")return;if(t.currentStyle)return t.currentStyle[e];const o=window.getComputedStyle(t,null);return o.getPropertyValue?o.getPropertyValue(e):o[e]}const y=s({name:"IExpandTransition",methods:{onEnter(t){const e=n(t,"width");t.style.width=e,t.style.position="absolute",t.style.visibility="hidden",t.style.height="auto";const o=n(t,"height");t.style.width=null,t.style.position=null,t.style.visibility=null,t.style.height=0,n(t,"height"),setTimeout(()=>{t.style.height=o})},onAfterEnter(t){t.style.height="auto"},onLeave(t){t.style.height=n(t,"height"),n(t,"height"),setTimeout(()=>{t.style.height=0})}}});function l(t,e,o,c,f,p){return i(),r(d,{name:"expand",onEnter:t.onEnter,onAfterEnter:t.onAfterEnter,onLeave:t.onLeave},{default:a(()=>[h(t.$slots,"default",{},void 0,!0)]),_:3},8,["onEnter","onAfterEnter","onLeave"])}const _=u(y,[["render",l],["__scopeId","data-v-1e395af5"]]);export{_ as I};
