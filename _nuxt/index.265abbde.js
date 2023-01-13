import H from"./index.4447cbea.js";import ee from"./index.9a1229a9.js";import z from"./index.24ff69b0.js";import{a as G,a7 as y,ab as A,o as g,c as R,u as t,ah as T,ai as N,N as F,x as n,t as o,i as a,e as C,C as q,D as te,h as r,z as M,f as $,Y,j as O,aj as ne,ak as B,q as le,a5 as oe,al as se,ag as ae,am as ie,an as ue}from"./entry.b2982cee.js";import re from"./index.e6602b48.js";import W from"./index.76baff6f.js";import _e from"./index.2b438ad7.js";import ce from"./index.1e067077.js";import de from"./index.e11dda80.js";import me from"./index.4aa9c3fd.js";import pe from"./index.91966db7.js";import fe from"./index.1f4b4c87.js";import ge from"./index.c4356d1a.js";import he from"./index.72817578.js";import"./uid.2376e4bd.js";import"./isFunction.ccc02bc7.js";import"./index.a90a9eb0.js";import"./index.312a465e.js";import"./index.274e3244.js";const ve=G({__name:"run-select",props:{modelValue:null,runs:null},emits:["update:modelValue"],setup(h,{emit:e}){const m=h;let c=y(m.modelValue);A(c,l=>{e("update:modelValue",l)});function v(l){var b,S;if(!l||typeof l=="string")return"";let _=N((S=(b=l.rta)==null?void 0:b.asSeconds())!=null?S:0,2)+" RTA";l.igt&&(_=N(l.igt.asSeconds(),2)+" IGT / "+_);const i=l.id?" #"+l.id:"";let p=`${_}, ${l.ended.fromNow()}`+i;return(l.isStartedSynced===!1||l.isEndedSynced===!1)&&(p+=" (unsynced)"),p}return(l,_)=>{const i=W;return g(),R(i,{modelValue:t(c),"onUpdate:modelValue":_[0]||(_[0]=p=>T(c)?c.value=p:c=p),options:m.runs,label:v,placeholder:"Choose something..."},null,8,["modelValue","options"])}}});function xe(h){throw new Error("Unexpected object: "+h)}const ye=G({__name:"run-selection",props:{selectedRun:null,runs:null,segments:null},emits:["update:selectedRun"],setup(h,{emit:e}){const m=h,c={FULL_GAME:"full-game",SEGMENT:"segment"},v=x=>x&&x.length>0,l=y(c.FULL_GAME),_=y(v(m.runs)?m.runs[0]:null),i=y(v(m.segments)?m.segments[0]:null),p=F(()=>{var x,f,k;return(k=(f=(x=i.value)==null?void 0:x.getHistory(20))==null?void 0:f.map(V=>V.ToRun()).filter(V=>V!==null))!=null?k:[]}),b=y(p.value.length>0?p.value[0]:null),S=F(()=>{switch(l.value){case c.FULL_GAME:return _.value;case c.SEGMENT:return b.value;default:return xe(l.value)}});return S.value!=m.selectedRun&&e("update:selectedRun",S.value),A(S,x=>{e("update:selectedRun",x)}),(x,f)=>{const k=re,V=H,L=ve,s=z,u=_e,U=W,w=ce;return g(),R(w,{modelValue:t(l),"onUpdate:modelValue":f[3]||(f[3]=d=>T(l)?l.value=d:null),model:"tab-1"},{header:n(()=>[o(k,{for:t(c).FULL_GAME},{default:n(()=>[a(" Runs ")]),_:1},8,["for"]),o(k,{for:t(c).SEGMENT},{default:n(()=>[a(" Segments ")]),_:1},8,["for"])]),default:n(()=>[o(u,{name:t(c).FULL_GAME},{default:n(()=>[o(s,null,{default:n(()=>[o(V,null,{default:n(()=>[a("Pick a run:")]),_:1}),o(L,{modelValue:t(_),"onUpdate:modelValue":f[0]||(f[0]=d=>T(_)?_.value=d:null),runs:m.runs},null,8,["modelValue","runs"])]),_:1})]),_:1},8,["name"]),o(u,{name:t(c).SEGMENT},{default:n(()=>[o(s,null,{default:n(()=>[o(V,null,{default:n(()=>[a("Segment:")]),_:1}),o(U,{modelValue:t(i),"onUpdate:modelValue":f[1]||(f[1]=d=>T(i)?i.value=d:null),options:m.segments,label:d=>d.name,placeholder:"Choose something..."},null,8,["modelValue","options","label"])]),_:1}),o(s,null,{default:n(()=>[o(V,null,{default:n(()=>[a("Which time?")]),_:1}),o(L,{modelValue:t(b),"onUpdate:modelValue":f[2]||(f[2]=d=>T(b)?b.value=d:null),runs:t(p)},null,8,["modelValue","runs"])]),_:1})]),_:1},8,["name"])]),_:1},8,["modelValue"])}}}),be={class:"component-container"},Ve=["src"],Se={class:"highlight-description _flex-grow:1 _display:flex _flex-direction:column _justify-content:space-between"},Re={class:"video-title"},ke={key:0,class:"_font-size:xs run-part"},we={class:"_display:flex _flex_direction:row _align-items:end"},Ee={class:"_flex-grow:1"},$e={class:"highlight-timestamp"},Ue={class:"highlight-timestamp"},Te={class:"_margin-left:auto"},Ce=G({__name:"highlighter-results",props:{highlights:null},setup(h){const e=h;return(m,c)=>{const v=Y,l=de,_=me;return g(),C("div",be,[o(_,null,{default:n(()=>[(g(!0),C(q,null,te(e.highlights,(i,p)=>(g(),R(l,{class:"_display:flex _flex-direction:row"},{default:n(()=>[r("img",{class:"highlight-thumbnail",src:i.getThumbnailUrl(void 0,200),alt:"Video thumbnail"},null,8,Ve),r("div",Se,[r("div",null,[r("p",Re,M(i.videoTitle),1),e.highlights.length>1?(g(),C("p",ke,"Part "+M(p+1),1)):$("",!0)]),r("div",we,[r("div",Ee,[r("p",null,[a("Start: "),r("span",$e,M(t(N)(i.start_time)),1)]),r("p",null,[a("End:\xA0 "),r("span",Ue,M(t(N)(i.end_time)),1)])]),r("div",Te,[o(v,{target:"_blank",color:"secondary",href:i.getPrefilledHighlighterLink()},{default:n(()=>[a("Open Highlighter")]),_:2},1032,["href"])])])])]),_:2},1024))),256))]),_:1})])}}});const Le=O(Ce,[["__scopeId","data-v-3fa21619"]]),I=h=>(ie("data-v-8e3a6717"),h=h(),ue(),h),Me=I(()=>r("a",{href:"https://livesplit.org/",target:"_blank"},"LiveSplit",-1)),Ae=["src"],Ne=I(()=>r("div",{class:"_margin:2/3"},null,-1)),Fe={class:"message-container"},Ge=I(()=>r("span",{class:"card-header"},"Not found",-1)),Ie=I(()=>r("p",null,[a("The run was not found in the archives of this channel."),r("br"),a(" The video archive may have expired. ")],-1)),De=G({__name:"index",setup(h){const e=ne(),m=y(!1),c=y(null),v=y(!1),l=y(null),_=y(null),i=y(!1);let p=new AbortController;function b(){var s;(s=c.value)==null||s.click()}function S(){e.selectedRun=null,e.game={}}const x=F(()=>e.game.runs&&e.game.segments);async function f(s){s.preventDefault(),s.target.blur(),e.enableDemoMode()}async function k(s){var w,d;const u=s.target,U=(d=(w=u==null?void 0:u.files)==null?void 0:w.length)!=null?d:0>0;e.file=U?u.files[0]:null}A(()=>e.file,async s=>{try{if(S(),!s)return;v.value=!0,await e.loadFile(s)}finally{v.value=!1}}),B();async function V(){if(e.selectedRun!=null){if(B().isDemoMode){i.value=!0;return}m.value=!0,p=new AbortController;try{l.value=await se(e.selectedRun,p.signal,e.channel)}catch(s){p.signal.aborted||(_.value=s)}finally{m.value=!1}}}const L=F(()=>{var u;if(!((u=e.file)!=null&&u.name))return"No file selected.";let s="";return e.game.name&&(s=` - ${e.game.name}`,e.game.category&&(s+=` (${e.game.category})`)),e.file.name+s});return A(()=>e.selectedRun,()=>{p.abort(),l.value=null,m.value=!1,_.value=null}),(s,u)=>{const U=H,w=ee,d=z,D=ae,j=Y,J=ye,K=Le,P=pe,Q=fe,X=ge,Z=he;return g(),R(Z,null,{default:n(()=>[o(Q,{onSubmit:V},{default:n(()=>[o(d,null,{default:n(()=>[o(U,null,{default:n(()=>[a("Channel:")]),_:1}),o(w,{modelValue:t(e).channel,"onUpdate:modelValue":u[0]||(u[0]=E=>t(e).channel=E),clearable:"",placeholder:"Twitch Username",required:""},null,8,["modelValue"])]),_:1}),o(d,null,{default:n(()=>[o(U,null,{default:n(()=>[a(" Splits file ("),Me,a(" only): ")]),_:1}),!t(v)&&!t(x)?(g(),C("a",{key:0,href:"#",class:"_float:right _font-size:sm _vertical-align:bottom",onClick:f},"Use demo splits")):$("",!0),r("input",{ref_key:"fileInput",ref:c,type:"file",onChange:k,style:{display:"none"},accept:".lss"},null,544),o(w,{placeholder:t(L),onClick:u[1]||(u[1]=le(E=>E.target.blur(),["prevent"])),plaintext:!0},oe({prepend:n(()=>[o(j,{type:"button",onClick:b,loading:t(v)},{loading:n(()=>[o(D,{class:"_margin-right:1/2"}),a(" Parsing... ")]),default:n(()=>[a(" Select file ")]),_:1},8,["loading"])]),_:2},[t(e).game.icon?{name:"suffix",fn:n(()=>[r("img",{src:t(e).game.icon,alt:"Game icon",style:{"max-height":"40px","object-fit":"contain"}},null,8,Ae)]),key:"0"}:void 0]),1032,["placeholder"]),Ne]),_:1}),t(x)?(g(),C(q,{key:0},[o(d,{class:"_margin-bottom:2"},{default:n(()=>[o(J,{selectedRun:t(e).selectedRun,"onUpdate:selectedRun":u[2]||(u[2]=E=>t(e).selectedRun=E),runs:t(e).game.runs,segments:t(e).game.segments},null,8,["selectedRun","runs","segments"])]),_:1}),!t(_)&&!t(l)?(g(),R(d,{key:0,class:"_display:flex _justify-content:center"},{default:n(()=>[o(j,{color:"primary",type:"submit",loading:t(m)},{loading:n(()=>[o(D,{class:"_margin-right:1/2"}),a(" Searching... ")]),default:n(()=>[a(" Search ")]),_:1},8,["loading"])]),_:1})):$("",!0)],64)):$("",!0),t(l)&&t(l).length>0?(g(),R(K,{key:1,highlights:t(l)},null,8,["highlights"])):$("",!0),r("div",Fe,[t(l)&&t(l).length==0?(g(),R(P,{key:0,class:"highlight-notfound",color:"warning"},{header:n(()=>[Ge]),default:n(()=>[Ie]),_:1})):$("",!0),t(_)?(g(),R(P,{key:1,color:"danger"},{default:n(()=>[a(" An unexpected error occured. ")]),_:1})):$("",!0)])]),_:1}),o(X,{modelValue:t(i),"onUpdate:modelValue":u[3]||(u[3]=E=>T(i)?i.value=E:null)},{header:n(()=>[a(" Demo mode ")]),default:n(()=>[a(" You cannot search in demo mode. ")]),_:1},8,["modelValue"])]),_:1})}}});const st=O(De,[["__scopeId","data-v-8e3a6717"]]);export{st as default};