const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../nodes/0.CMGBlVav.js","../chunks/disclose-version._EqClw92.js","../chunks/runtime.BQ7YDZqh.js","../assets/0.CLIvLp_f.css","../nodes/1.BcYaLo49.js","../chunks/legacy.D8QC5nFp.js","../chunks/render.DKG_z64O.js","../chunks/svelte-head.DzR7EITG.js","../chunks/lifecycle.DqShYglL.js","../chunks/store.Bdt44sEc.js","../chunks/entry.DUVbuB8B.js","../chunks/paths.BHmcG_e3.js","../nodes/2.C7QzU55u.js","../chunks/attributes.CaPm3nup.js","../nodes/3.y89votXV.js","../chunks/marked.esm.VnByBsWN.js","../assets/3.CFIeL6CN.css","../nodes/4.D4yz2O3I.js","../chunks/index-client.B4qCQNwe.js","../assets/4.CSVny6kn.css"])))=>i.map(i=>d[i]);
var N=r=>{throw TypeError(r)};var U=(r,t,s)=>t.has(r)||N("Cannot "+s);var f=(r,t,s)=>(U(r,t,"read from private field"),s?s.call(r):t.get(r)),L=(r,t,s)=>t.has(r)?N("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(r):t.set(r,s),O=(r,t,s,i)=>(U(r,t,"write to private field"),i?i.call(r,s):t.set(r,s),s);import{k as w,O as K,j as M,W as Q,as as et,at as rt,o as st,s as W,ao as z,R as F,ar as Y,p as X,aB as at,aC as nt,b as ot,Y as it,aD as ct,E as x,D as lt,a6 as ut,g,aE as ft,F as dt,t as ht,u as mt,a as _t,aF as C,aG as vt,A as T,f as D,z as gt,w as yt,v as Et,y as Rt,x as Pt}from"../chunks/runtime.BQ7YDZqh.js";import{h as bt,m as kt,u as wt,s as At}from"../chunks/render.DKG_z64O.js";import{t as Z,d as I,a as P,e as Tt}from"../chunks/disclose-version._EqClw92.js";import{p as B,o as xt,a as St}from"../chunks/index-client.B4qCQNwe.js";function V(r,t,s,i=null,o=!1){w&&K();var n=r,a=null,e=null,l=null,u=o?Q:0;M(()=>{if(l===(l=!!t()))return;let h=!1;if(w){const b=n.data===et;l===b&&(n=rt(),st(n),W(!1),h=!0)}l?(a?z(a):a=F(()=>s(n)),e&&Y(e,()=>{e=null})):(e?z(e):i&&(e=F(()=>i(n))),a&&Y(a,()=>{a=null})),h&&W(!0)},u),w&&(n=X)}function j(r,t,s){w&&K();var i=r,o,n;M(()=>{o!==(o=t())&&(n&&(Y(n),n=null),o&&(n=F(()=>s(i,o))))},Q),w&&(i=X)}function H(r,t){return r===t||(r==null?void 0:r[it])===t}function q(r={},t,s,i){return at(()=>{var o,n;return nt(()=>{o=n,n=[],ot(()=>{r!==s(...n)&&(t(r,...n),o&&H(s(...o),r)&&t(null,...o))})}),()=>{ct(()=>{n&&H(s(...n),r)&&t(null,...n)})}}),r}function Lt(r){return class extends Ot{constructor(t){super({component:r,...t})}}}var y,d;class Ot{constructor(t){L(this,y);L(this,d);var n;var s=new Map,i=(a,e)=>{var l=lt(e);return s.set(a,l),l};const o=new Proxy({...t.props||{},$$events:{}},{get(a,e){return g(s.get(e)??i(e,Reflect.get(a,e)))},has(a,e){return e===ut?!0:(g(s.get(e)??i(e,Reflect.get(a,e))),Reflect.has(a,e))},set(a,e,l){return x(s.get(e)??i(e,l),l),Reflect.set(a,e,l)}});O(this,d,(t.hydrate?bt:kt)(t.component,{target:t.target,anchor:t.anchor,props:o,context:t.context,intro:t.intro??!1,recover:t.recover})),(!((n=t==null?void 0:t.props)!=null&&n.$$host)||t.sync===!1)&&ft(),O(this,y,o.$$events);for(const a of Object.keys(f(this,d)))a==="$set"||a==="$destroy"||a==="$on"||dt(this,a,{get(){return f(this,d)[a]},set(e){f(this,d)[a]=e},enumerable:!0});f(this,d).$set=a=>{Object.assign(o,a)},f(this,d).$destroy=()=>{wt(f(this,d))}}$set(t){f(this,d).$set(t)}$on(t,s){f(this,y)[t]=f(this,y)[t]||[];const i=(...o)=>s.call(this,...o);return f(this,y)[t].push(i),()=>{f(this,y)[t]=f(this,y)[t].filter(o=>o!==i)}}$destroy(){f(this,d).$destroy()}}y=new WeakMap,d=new WeakMap;const Ct="modulepreload",Dt=function(r,t){return new URL(r,t).href},J={},k=function(t,s,i){let o=Promise.resolve();if(s&&s.length>0){const a=document.getElementsByTagName("link"),e=document.querySelector("meta[property=csp-nonce]"),l=(e==null?void 0:e.nonce)||(e==null?void 0:e.getAttribute("nonce"));o=Promise.allSettled(s.map(u=>{if(u=Dt(u,i),u in J)return;J[u]=!0;const h=u.endsWith(".css"),b=h?'[rel="stylesheet"]':"";if(!!i)for(let m=a.length-1;m>=0;m--){const v=a[m];if(v.href===u&&(!h||v.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${b}`))return;const c=document.createElement("link");if(c.rel=h?"stylesheet":Ct,h||(c.as="script"),c.crossOrigin="",c.href=u,l&&c.setAttribute("nonce",l),document.head.appendChild(c),h)return new Promise((m,v)=>{c.addEventListener("load",m),c.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${u}`)))})}))}function n(a){const e=new Event("vite:preloadError",{cancelable:!0});if(e.payload=a,window.dispatchEvent(e),!e.defaultPrevented)throw a}return o.then(a=>{for(const e of a||[])e.status==="rejected"&&n(e.reason);return t().catch(n)})},Ut={};var It=Z('<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>'),Bt=Z("<!> <!>",1);function Vt(r,t){ht(t,!0);let s=B(t,"components",23,()=>[]),i=B(t,"data_0",3,null),o=B(t,"data_1",3,null);mt(()=>t.stores.page.set(t.page)),_t(()=>{t.stores,t.page,t.constructors,s(),t.form,i(),o(),t.stores.page.notify()});let n=C(!1),a=C(!1),e=C(null);xt(()=>{const E=t.stores.page.subscribe(()=>{g(n)&&(x(a,!0),vt().then(()=>{x(e,St(document.title||"untitled page"))}))});return x(n,!0),E});const l=D(()=>t.constructors[1]);var u=Bt(),h=T(u);V(h,()=>t.constructors[1],E=>{var c=I();const m=D(()=>t.constructors[0]);var v=T(c);j(v,()=>g(m),(R,S)=>{q(S(R,{get data(){return i()},get form(){return t.form},children:(_,jt)=>{var G=I(),p=T(G);j(p,()=>g(l),($,tt)=>{q(tt($,{get data(){return o()},get form(){return t.form}}),A=>s()[1]=A,()=>{var A;return(A=s())==null?void 0:A[1]})}),P(_,G)},$$slots:{default:!0}}),_=>s()[0]=_,()=>{var _;return(_=s())==null?void 0:_[0]})}),P(E,c)},E=>{var c=I();const m=D(()=>t.constructors[0]);var v=T(c);j(v,()=>g(m),(R,S)=>{q(S(R,{get data(){return i()},get form(){return t.form}}),_=>s()[0]=_,()=>{var _;return(_=s())==null?void 0:_[0]})}),P(E,c)});var b=gt(h,2);V(b,()=>g(n),E=>{var c=It(),m=yt(c);V(m,()=>g(a),v=>{var R=Tt();Et(()=>At(R,g(e))),P(v,R)}),Rt(c),P(E,c)}),P(r,u),Pt()}const Wt=Lt(Vt),zt=[()=>k(()=>import("../nodes/0.CMGBlVav.js"),__vite__mapDeps([0,1,2,3]),import.meta.url),()=>k(()=>import("../nodes/1.BcYaLo49.js"),__vite__mapDeps([4,1,2,5,6,7,8,9,10,11]),import.meta.url),()=>k(()=>import("../nodes/2.C7QzU55u.js"),__vite__mapDeps([12,1,2,5,7,13,11]),import.meta.url),()=>k(()=>import("../nodes/3.y89votXV.js"),__vite__mapDeps([14,1,2,6,7,15,13,11,16]),import.meta.url),()=>k(()=>import("../nodes/4.D4yz2O3I.js"),__vite__mapDeps([17,1,2,6,7,15,5,8,18,9,19]),import.meta.url)],Ht=[],Jt={"/":[2],"/not-yet-but-soon":[-4],"/not-yet-but-soon/cards":[-5]},Kt={handleError:({error:r})=>{console.error(r)},reroute:()=>{}};export{Jt as dictionary,Kt as hooks,Ut as matchers,zt as nodes,Wt as root,Ht as server_loads};
