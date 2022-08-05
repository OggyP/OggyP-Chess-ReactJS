/*!
 * Stockfish.js (c) Chess.com, LLC
 * https://github.com/nmrugg/stockfish.js
 * License: GPLv3
 *
 * Based on stockfish.wasm (c)
 * Niklas Fiekas <niklas.fiekas@backscattering.de>
 * Hiroshi Ogawa <hi.ogawa.zz@gmail.com>
 * https://github.com/niklasf/stockfish.wasm
 * https://github.com/hi-ogawa/Stockfish
 *
 * Based on Stockfish (c) T. Romstad, M. Costalba, J. Kiiski, G. Linscott and other contributors.
 * https://github.com/official-stockfish/Stockfish
 */
var Stockfish;
function INIT_ENGINE() {

var Stockfish = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(Stockfish) {
  Stockfish = Stockfish || {};


null;var d;d||(d=typeof Stockfish !== 'undefined' ? Stockfish : {});var aa,ba;d.ready=new Promise(function(a,b){aa=a;ba=b});"undefined"===typeof XMLHttpRequest&&(global.XMLHttpRequest=function(){var a,b={open:function(c,e){a=e},send:function(){require("fs").readFile(a,function(c,e){b.readyState=4;c?(console.error(c),b.status=404,b.onerror(c)):(b.status=200,b.response=e,b.onreadystatechange(),b.onload())})}};return b});
d.postCustomMessage=function(a){for(var b of m.ia)b.postMessage({cmd:"custom",userData:a})};d.queue=function(){var a=[],b;return{get:async function(){return 0<a.length?a.shift():await new Promise(function(c){return b=c})},put:function(c){b?(b(c),b=null):a.push(c)}}}();d.onCustomMessage=function(a){ca?da.push(a):d.queue.put(a)};var ca,da=[];d.pauseQueue=function(){ca=!0};d.unpauseQueue=function(){var a=da;da=[];ca=!1;a.forEach(function(b){d.queue.put(b)})};d.postMessage=d.postCustomMessage;
var ea=[];d.addMessageListener=function(a){ea.push(a)};d.removeMessageListener=function(a){a=ea.indexOf(a);0<=a&&ea.splice(a,1)};d.print=d.printErr=function(a){if(0===ea.length)return console.log(a);for(var b of ea)b(a)};d.terminate=function(){m.va()};
var fa=Object.assign({},d),ha=[],ia="./this.program",ka=(a,b)=>{throw b;},la="object"==typeof window,n="function"==typeof importScripts,u="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,y=d.ENVIRONMENT_IS_PTHREAD||!1,z="";function ma(a){return d.locateFile?d.locateFile(a,z):z+a}var na,oa,fs,pa,qa;
if(u){z=n?require("path").dirname(z)+"/":__dirname+"/";qa=()=>{pa||(fs=require("fs"),pa=require("path"))};na=function(b,c){qa();b=pa.normalize(b);return fs.readFileSync(b,c?void 0:"utf8")};oa=b=>{b=na(b,!0);b.buffer||(b=new Uint8Array(b));return b};1<process.argv.length&&(ia=process.argv[1].replace(/\\/g,"/"));ha=process.argv.slice(2);process.on("uncaughtException",function(b){if(!(b instanceof ra))throw b;});process.on("unhandledRejection",function(b){throw b;});ka=(b,c)=>{if(noExitRuntime)throw process.exitCode=
b,c;c instanceof ra||B("exiting due to exception: "+c);process.exit(b)};d.inspect=function(){return"[Emscripten Module object]"};let a;try{a=require("worker_threads")}catch(b){throw console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?'),b;}global.Worker=a.Worker}else if(la||n)n?z=self.location.href:"undefined"!=typeof document&&document.currentScript&&(z=document.currentScript.src),_scriptDir&&(z=_scriptDir),0!==z.indexOf("blob:")?
z=z.substr(0,z.replace(/[?#].*/,"").lastIndexOf("/")+1):z="",u||(na=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},n&&(oa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}));u&&"undefined"==typeof performance&&(global.performance=require("perf_hooks").performance);var sa=console.log.bind(console),ta=console.warn.bind(console);
u&&(qa(),sa=a=>fs.writeSync(1,a+"\n"),ta=a=>fs.writeSync(2,a+"\n"));var ua=d.print||sa,B=d.printErr||ta;Object.assign(d,fa);fa=null;d.arguments&&(ha=d.arguments);d.thisProgram&&(ia=d.thisProgram);d.quit&&(ka=d.quit);var va,wa;d.wasmBinary&&(wa=d.wasmBinary);var noExitRuntime=d.noExitRuntime||!0;"object"!=typeof WebAssembly&&D("no native wasm support detected");var E,xa,G=!1,ya="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;
function za(a,b){for(var c=b+NaN,e=b;a[e]&&!(e>=c);)++e;if(16<e-b&&a.buffer&&ya)return ya.decode(a.buffer instanceof SharedArrayBuffer?a.slice(b,e):a.subarray(b,e));for(c="";b<e;){var h=a[b++];if(h&128){var g=a[b++]&63;if(192==(h&224))c+=String.fromCharCode((h&31)<<6|g);else{var k=a[b++]&63;h=224==(h&240)?(h&15)<<12|g<<6|k:(h&7)<<18|g<<12|k<<6|a[b++]&63;65536>h?c+=String.fromCharCode(h):(h-=65536,c+=String.fromCharCode(55296|h>>10,56320|h&1023))}}else c+=String.fromCharCode(h)}return c}
function H(a){return a?za(I,a):""}function J(a,b,c,e){if(0<e){e=c+e-1;for(var h=0;h<a.length;++h){var g=a.charCodeAt(h);if(55296<=g&&57343>=g){var k=a.charCodeAt(++h);g=65536+((g&1023)<<10)|k&1023}if(127>=g){if(c>=e)break;b[c++]=g}else{if(2047>=g){if(c+1>=e)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=e)break;b[c++]=224|g>>12}else{if(c+3>=e)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0}}
function Aa(a){for(var b=0,c=0;c<a.length;++c){var e=a.charCodeAt(c);55296<=e&&57343>=e&&(e=65536+((e&1023)<<10)|a.charCodeAt(++c)&1023);127>=e?++b:b=2047>=e?b+2:65535>=e?b+3:b+4}return b}var N,Ba,I,O,P,Q,Ca;y&&(N=d.buffer);var Da=d.INITIAL_MEMORY||1073741824;
if(y)E=d.wasmMemory,N=d.buffer;else if(d.wasmMemory)E=d.wasmMemory;else if(E=new WebAssembly.Memory({initial:Da/65536,maximum:Da/65536,shared:!0}),!(E.buffer instanceof SharedArrayBuffer))throw B("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),u&&console.log("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)"),
Error("bad memory");E&&(N=E.buffer);Da=N.byteLength;var R=N;N=R;d.HEAP8=Ba=new Int8Array(R);d.HEAP16=new Int16Array(R);d.HEAP32=P=new Int32Array(R);d.HEAPU8=I=new Uint8Array(R);d.HEAPU16=O=new Uint16Array(R);d.HEAPU32=Q=new Uint32Array(R);d.HEAPF32=new Float32Array(R);d.HEAPF64=Ca=new Float64Array(R);var Ea=[],Fa=[],Ga=[],Ha=[];function Ia(){var a=d.preRun.shift();Ea.unshift(a)}var S=0,Ja=null,Ka=null;function La(){S++;d.monitorRunDependencies&&d.monitorRunDependencies(S)}
function Ma(){S--;d.monitorRunDependencies&&d.monitorRunDependencies(S);if(0==S&&(null!==Ja&&(clearInterval(Ja),Ja=null),Ka)){var a=Ka;Ka=null;a()}}function D(a){if(y)postMessage({cmd:"onAbort",arg:a});else if(d.onAbort)d.onAbort(a);a="Aborted("+a+")";B(a);G=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");ba(a);throw a;}function Na(){return T.startsWith("data:application/octet-stream;base64,")}var T;T="stockfish.wasm";Na()||(T=ma(T));
function Oa(){var a=T;try{if(a==T&&wa)return new Uint8Array(wa);if(oa)return oa(a);throw"both async and sync fetching of the wasm failed";}catch(b){D(b)}}function Pa(){return wa||!la&&!n||"function"!=typeof fetch?Promise.resolve().then(function(){return Oa()}):fetch(T,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+T+"'";return a.arrayBuffer()}).catch(function(){return Oa()})}var Qa={};function Ra(a){(a=m.S[a])||D();m.ta(a.worker)}
function Sa(a){var b=m.Aa();if(!b)return 6;m.ia.push(b);var c=m.S[a.qa]={worker:b,wa:a.qa};b.ka=c;var e={cmd:"run",start_routine:a.Fa,arg:a.ja,threadInfoStruct:a.qa};b.la=()=>{e.time=performance.now();b.postMessage(e,a.Ka)};b.loaded&&(b.la(),delete b.la);return 0}function Ta(a){a instanceof ra||"unwind"==a||ka(1,a)}
var m={fa:[],ia:[],ma:[],Ba:function(){y&&m.Ca()},Na:function(){},Ca:function(){m.receiveObjectTransfer=m.Ea;m.threadInitTLS=m.xa;m.setExitStatus=m.ua;noExitRuntime=!1},S:{},ua:function(){},va:function(){for(var a in m.S){var b=m.S[a];b&&b.worker&&m.ta(b.worker)}for(a=0;a<m.fa.length;++a)m.fa[a].terminate();m.fa=[]},ta:function(a){var b=a.ka.wa;delete m.S[b];m.fa.push(a);m.ia.splice(m.ia.indexOf(a),1);a.ka=void 0;Ua(b)},Ea:function(){},xa:function(){for(var a in m.ma)if(m.ma.hasOwnProperty(a))m.ma[a]()},
Da:function(a,b){a.onmessage=c=>{c=c.data;var e=c.cmd;a.ka&&(m.za=a.ka.wa);if(c.targetThread&&c.targetThread!=Va()){var h=m.S[c.Oa];h?h.worker.postMessage(c,c.transferList):B('Internal error! Worker sent a message "'+e+'" to target pthread '+c.targetThread+", but that thread no longer exists!")}else if("processProxyingQueue"===e)Wa(c.queue);else if("spawnThread"===e)Sa(c);else if("cleanupThread"===e)Ra(c.thread);else if("killThread"===e)c=c.thread,e=m.S[c],delete m.S[c],e.worker.terminate(),Ua(c),
m.ia.splice(m.ia.indexOf(e.worker),1),e.worker.ka=void 0;else if("cancelThread"===e)m.S[c.thread].worker.postMessage({cmd:"cancel"});else if("loaded"===e)a.loaded=!0,b&&b(a),a.la&&(a.la(),delete a.la);else if("print"===e)ua("Thread "+c.threadId+": "+c.text);else if("printErr"===e)B("Thread "+c.threadId+": "+c.text);else if("alert"===e)alert("Thread "+c.threadId+": "+c.text);else if("setimmediate"===c.target)a.postMessage(c);else if("onAbort"===e){if(d.onAbort)d.onAbort(c.arg)}else e&&B("worker sent an unknown command "+
e);m.za=void 0};a.onerror=c=>{B("worker sent an error! "+c.filename+":"+c.lineno+": "+c.message);throw c;};u&&(a.on("message",function(c){a.onmessage({data:c})}),a.on("error",function(c){a.onerror(c)}),a.on("detachedExit",function(){}));a.postMessage({cmd:"load",urlOrBlob:d.mainScriptUrlOrBlob||_scriptDir,wasmMemory:E,wasmModule:xa})},ya:function(){var a=ma("stockfish.worker.js");m.fa.push(new Worker(a))},Aa:function(){0==m.fa.length&&(m.ya(),m.Da(m.fa[0]));return m.fa.pop()}};d.PThread=m;
function Xa(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(d);else{var c=b.sa;"number"==typeof c?void 0===b.ja?dynCall_v.call(null,c):dynCall_vi.apply(null,[c,b.ja]):c(void 0===b.ja?null:b.ja)}}}function Ya(a){var b=Za();a=a();$a(b);return a}d.establishStackSpace=function(){var a=Va(),b=P[a+44>>2];ab(b,b-P[a+48>>2]);$a(b)};function bb(a){if(y)return U(1,0,a);try{cb(a)}catch(b){Ta(b)}}d.invokeEntryPoint=function(a,b){a=db.apply(null,[a,b]);noExitRuntime?m.ua(a):eb(a)};
function fb(a,b,c,e){return y?U(2,1,a,b,c,e):gb(a,b,c,e)}function gb(a,b,c,e){if("undefined"==typeof SharedArrayBuffer)return B("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var h=[];if(y&&0===h.length)return fb(a,b,c,e);a={Fa:c,qa:a,ja:e,Ka:h};return y?(a.Ma="spawnThread",postMessage(a,h),0):Sa(a)}function hb(a,b,c){return y?U(3,1,a,b,c):0}function ib(a,b,c){return y?U(4,1,a,b,c):0}function jb(a,b,c,e){if(y)return U(5,1,a,b,c,e)}
function Wa(a){Atomics.store(P,a>>2,1);Va()&&kb(a);Atomics.compareExchange(P,a>>2,1,0)}d.executeNotifiedProxyingQueue=Wa;function lb(a){if(y)return U(6,1,a);noExitRuntime=!1;cb(a)}var mb;mb=u?()=>{var a=process.hrtime();return 1E3*a[0]+a[1]/1E6}:y?()=>performance.now()-d.__performance_now_clock_drift:()=>performance.now();function U(a,b){var c=arguments.length-2,e=arguments;return Ya(function(){for(var h=nb(8*c),g=h>>3,k=0;k<c;k++)Ca[g+k]=e[2+k];return ob(a,c,h,b)})}var pb=[],qb=[];
function V(a,b){Q[a>>2]=b;Q[a+4>>2]=b/4294967296|0}function rb(a,b){try{var c=indexedDB.open("emscripten_filesystem",1)}catch(e){b(e);return}c.onupgradeneeded=e=>{e=e.target.result;e.objectStoreNames.contains("FILES")&&e.deleteObjectStore("FILES");e.createObjectStore("FILES")};c.onsuccess=e=>a(e.target.result);c.onerror=e=>b(e)}var sb;
function tb(a,b,c,e,h){function g(A){var F=0,v=0;A&&(v=l.response?l.response.byteLength:0,F=ub(v),I.set(new Uint8Array(l.response),F));Q[a+12>>2]=F;V(a+16,v)}var k=Q[a+8>>2];if(k){var p=H(k),r=a+112,w=H(r);w||(w="GET");var x=Q[r+52>>2],K=Q[r+56>>2],X=!!Q[r+60>>2],f=Q[r+68>>2],q=Q[r+72>>2];k=Q[r+76>>2];var t=Q[r+80>>2],C=Q[r+84>>2];r=Q[r+88>>2];var L=!!(x&1),M=!!(x&2);x=!!(x&64);f=f?H(f):void 0;q=q?H(q):void 0;var l=new XMLHttpRequest;l.withCredentials=X;l.open(w,p,!x,f,q);x||(l.timeout=K);l.La=p;
l.responseType="arraybuffer";t&&(p=H(t),l.overrideMimeType(p));if(k)for(;;){w=Q[k>>2];if(!w)break;p=Q[k+4>>2];if(!p)break;k+=8;w=H(w);p=H(p);l.setRequestHeader(w,p)}qb.push(l);Q[a+0>>2]=qb.length;k=C&&r?I.slice(C,C+r):null;l.onload=A=>{g(L&&!M);var F=l.response?l.response.byteLength:0;V(a+24,0);F&&V(a+32,F);O[a+40>>1]=l.readyState;O[a+42>>1]=l.status;l.statusText&&J(l.statusText,I,a+44,64);200<=l.status&&300>l.status?b&&b(a,l,A):c&&c(a,l,A)};l.onerror=A=>{g(L);var F=l.status;V(a+24,0);V(a+32,l.response?
l.response.byteLength:0);O[a+40>>1]=l.readyState;O[a+42>>1]=F;c&&c(a,l,A)};l.ontimeout=A=>{c&&c(a,l,A)};l.onprogress=A=>{var F=L&&M&&l.response?l.response.byteLength:0,v=0;L&&M&&(v=ub(F),I.set(new Uint8Array(l.response),v));Q[a+12>>2]=v;V(a+16,F);V(a+24,A.loaded-F);V(a+32,A.total);O[a+40>>1]=l.readyState;3<=l.readyState&&0===l.status&&0<A.loaded&&(l.status=200);O[a+42>>1]=l.status;l.statusText&&J(l.statusText,I,a+44,64);e&&e(a,l,A);v&&vb(v)};l.onreadystatechange=A=>{O[a+40>>1]=l.readyState;2<=l.readyState&&
(O[a+42>>1]=l.status);h&&h(a,l,A)};try{l.send(k)}catch(A){c&&c(a,l,A)}}else c(a,0,"no url specified!")}function W(a,b){if(!G)if(b)a();else try{a()}catch(c){Ta(c)}}
function wb(a,b,c,e){var h=sb;if(h){var g=Q[a+112+64>>2];g||(g=Q[a+8>>2]);var k=H(g);try{var p=h.transaction(["FILES"],"readwrite").objectStore("FILES").put(b,k);p.onsuccess=()=>{O[a+40>>1]=4;O[a+42>>1]=200;J("OK",I,a+44,64);c(a,0,k)};p.onerror=r=>{O[a+40>>1]=4;O[a+42>>1]=413;J("Payload Too Large",I,a+44,64);e(a,0,r)}}catch(r){e(a,0,r)}}else e(a,0,"IndexedDB not available!")}
function xb(a,b,c){var e=sb;if(e){var h=Q[a+112+64>>2];h||(h=Q[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readonly").objectStore("FILES").get(h);g.onsuccess=k=>{if(k.target.result){k=k.target.result;var p=k.byteLength||k.length,r=ub(p);I.set(new Uint8Array(k),r);Q[a+12>>2]=r;V(a+16,p);V(a+24,0);V(a+32,p);O[a+40>>1]=4;O[a+42>>1]=200;J("OK",I,a+44,64);b(a,0,k)}else O[a+40>>1]=4,O[a+42>>1]=404,J("Not Found",I,a+44,64),c(a,0,"no data")};g.onerror=k=>{O[a+40>>1]=4;O[a+42>>1]=404;J("Not Found",
I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}
function yb(a,b,c){var e=sb;if(e){var h=Q[a+112+64>>2];h||(h=Q[a+8>>2]);h=H(h);try{var g=e.transaction(["FILES"],"readwrite").objectStore("FILES").delete(h);g.onsuccess=k=>{k=k.target.result;Q[a+12>>2]=0;V(a+16,0);V(a+24,0);V(a+32,0);O[a+40>>1]=4;O[a+42>>1]=200;J("OK",I,a+44,64);b(a,0,k)};g.onerror=k=>{O[a+40>>1]=4;O[a+42>>1]=404;J("Not Found",I,a+44,64);c(a,0,k)}}catch(k){c(a,0,k)}}else c(a,0,"IndexedDB not available!")}var zb={};
function Ab(){if(!Bb){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:ia||"./this.program"},b;for(b in zb)void 0===zb[b]?delete a[b]:a[b]=zb[b];var c=[];for(b in a)c.push(b+"="+a[b]);Bb=c}return Bb}var Bb;
function Cb(a,b){if(y)return U(7,1,a,b);var c=0;Ab().forEach(function(e,h){var g=b+c;h=Q[a+4*h>>2]=g;for(g=0;g<e.length;++g)Ba[h++>>0]=e.charCodeAt(g);Ba[h>>0]=0;c+=e.length+1});return 0}function Db(a,b){if(y)return U(8,1,a,b);var c=Ab();Q[a>>2]=c.length;var e=0;c.forEach(function(h){e+=h.length+1});Q[b>>2]=e;return 0}function Eb(a){return y?U(9,1,a):52}function Fb(a,b,c,e){return y?U(10,1,a,b,c,e):52}function Gb(a,b,c,e,h){return y?U(11,1,a,b,c,e,h):70}var Hb=[null,[],[]];
function Ib(a,b,c,e){if(y)return U(12,1,a,b,c,e);for(var h=0,g=0;g<c;g++){var k=Q[b>>2],p=Q[b+4>>2];b+=8;for(var r=0;r<p;r++){var w=I[k+r],x=Hb[a];0===w||10===w?((1===a?ua:B)(za(x,0)),x.length=0):x.push(w)}h+=p}Q[e>>2]=h;return 0}function Jb(a){return 0===a%4&&(0!==a%100||0===a%400)}var Kb=[31,29,31,30,31,30,31,31,30,31,30,31],Lb=[31,28,31,30,31,30,31,31,30,31,30,31];
function Mb(a,b,c,e){function h(f,q,t){for(f="number"==typeof f?f.toString():f||"";f.length<q;)f=t[0]+f;return f}function g(f,q){return h(f,q,"0")}function k(f,q){function t(L){return 0>L?-1:0<L?1:0}var C;0===(C=t(f.getFullYear()-q.getFullYear()))&&0===(C=t(f.getMonth()-q.getMonth()))&&(C=t(f.getDate()-q.getDate()));return C}function p(f){switch(f.getDay()){case 0:return new Date(f.getFullYear()-1,11,29);case 1:return f;case 2:return new Date(f.getFullYear(),0,3);case 3:return new Date(f.getFullYear(),
0,2);case 4:return new Date(f.getFullYear(),0,1);case 5:return new Date(f.getFullYear()-1,11,31);case 6:return new Date(f.getFullYear()-1,11,30)}}function r(f){var q=f.ga;for(f=new Date((new Date(f.ha+1900,0,1)).getTime());0<q;){var t=f.getMonth(),C=(Jb(f.getFullYear())?Kb:Lb)[t];if(q>C-f.getDate())q-=C-f.getDate()+1,f.setDate(1),11>t?f.setMonth(t+1):(f.setMonth(0),f.setFullYear(f.getFullYear()+1));else{f.setDate(f.getDate()+q);break}}t=new Date(f.getFullYear()+1,0,4);q=p(new Date(f.getFullYear(),
0,4));t=p(t);return 0>=k(q,f)?0>=k(t,f)?f.getFullYear()+1:f.getFullYear():f.getFullYear()-1}var w=P[e+40>>2];e={Ia:P[e>>2],Ha:P[e+4>>2],na:P[e+8>>2],ra:P[e+12>>2],oa:P[e+16>>2],ha:P[e+20>>2],ea:P[e+24>>2],ga:P[e+28>>2],Pa:P[e+32>>2],Ga:P[e+36>>2],Ja:w?H(w):""};c=H(c);w={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d",
"%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var x in w)c=c.replace(new RegExp(x,"g"),w[x]);var K="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),X="January February March April May June July August September October November December".split(" ");w={"%a":function(f){return K[f.ea].substring(0,3)},"%A":function(f){return K[f.ea]},"%b":function(f){return X[f.oa].substring(0,3)},"%B":function(f){return X[f.oa]},
"%C":function(f){return g((f.ha+1900)/100|0,2)},"%d":function(f){return g(f.ra,2)},"%e":function(f){return h(f.ra,2," ")},"%g":function(f){return r(f).toString().substring(2)},"%G":function(f){return r(f)},"%H":function(f){return g(f.na,2)},"%I":function(f){f=f.na;0==f?f=12:12<f&&(f-=12);return g(f,2)},"%j":function(f){for(var q=0,t=0;t<=f.oa-1;q+=(Jb(f.ha+1900)?Kb:Lb)[t++]);return g(f.ra+q,3)},"%m":function(f){return g(f.oa+1,2)},"%M":function(f){return g(f.Ha,2)},"%n":function(){return"\n"},"%p":function(f){return 0<=
f.na&&12>f.na?"AM":"PM"},"%S":function(f){return g(f.Ia,2)},"%t":function(){return"\t"},"%u":function(f){return f.ea||7},"%U":function(f){return g(Math.floor((f.ga+7-f.ea)/7),2)},"%V":function(f){var q=Math.floor((f.ga+7-(f.ea+6)%7)/7);2>=(f.ea+371-f.ga-2)%7&&q++;if(q)53==q&&(t=(f.ea+371-f.ga)%7,4==t||3==t&&Jb(f.ha)||(q=1));else{q=52;var t=(f.ea+7-f.ga-1)%7;(4==t||5==t&&Jb(f.ha%400-1))&&q++}return g(q,2)},"%w":function(f){return f.ea},"%W":function(f){return g(Math.floor((f.ga+7-(f.ea+6)%7)/7),2)},
"%y":function(f){return(f.ha+1900).toString().substring(2)},"%Y":function(f){return f.ha+1900},"%z":function(f){f=f.Ga;var q=0<=f;f=Math.abs(f)/60;return(q?"+":"-")+String("0000"+(f/60*100+f%60)).slice(-4)},"%Z":function(f){return f.Ja},"%%":function(){return"%"}};c=c.replace(/%%/g,"\x00\x00");for(x in w)c.includes(x)&&(c=c.replace(new RegExp(x,"g"),w[x](e)));c=c.replace(/\0\0/g,"%");x=Nb(c);if(x.length>b)return 0;Ba.set(x,a);return x.length-1}function Ob(a){try{a()}catch(b){D(b)}}
var Y=0,Z=null,Pb=0,Qb=[],Rb={},Sb={},Tb=0,Ub=null,Vb=[];function Wb(a){var b={},c;for(c in a)(function(e){var h=a[e];b[e]="function"==typeof h?function(){Qb.push(e);try{return h.apply(null,arguments)}finally{G||(Qb.pop()===e||D(),Z&&1===Y&&0===Qb.length&&(Y=0,Ob(d._asyncify_stop_unwind),"undefined"!=typeof Fibers&&Fibers.Qa()))}}:h})(c);return b}function Xb(){var a=ub(4108),b=a+12;P[a>>2]=b;P[a+4>>2]=b+4096;b=Qb[0];var c=Rb[b];void 0===c&&(c=Tb++,Rb[b]=c,Sb[c]=b);P[a+8>>2]=c;return a}
function Yb(a){if(!G){if(0===Y){var b=!1,c=!1;a(e=>{if(!G&&(Pb=e||0,b=!0,c)){Y=2;Ob(()=>d._asyncify_start_rewind(Z));"undefined"!=typeof Browser&&Browser.pa.sa&&Browser.pa.resume();e=!1;try{var h=(0,d.asm[Sb[P[Z+8>>2]]])()}catch(p){h=p,e=!0}var g=!1;if(!Z){var k=Ub;k&&(Ub=null,(e?k.reject:k.resolve)(h),g=!0)}if(e&&!g)throw h;}});c=!0;b||(Y=1,Z=Xb(),"undefined"!=typeof Browser&&Browser.pa.sa&&Browser.pa.pause(),Ob(()=>d._asyncify_start_unwind(Z)))}else 2===Y?(Y=0,Ob(d._asyncify_stop_rewind),vb(Z),
Z=null,Vb.forEach(e=>W(e))):D("invalid state: "+Y);return Pb}}function Zb(a){return Yb(b=>{a().then(b)})}m.Ba();y||(rb(a=>{sb=a;Ma()},()=>{sb=!1;Ma()}),"undefined"!=typeof ENVIRONMENT_IS_FETCH_WORKER&&ENVIRONMENT_IS_FETCH_WORKER||La());var $b=[null,bb,fb,hb,ib,jb,lb,Cb,Db,Eb,Fb,Gb,Ib];function Nb(a){var b=Array(Aa(a)+1);J(a,b,0,b.length);return b}
var cc={p:function(a,b){noExitRuntime=!0;ac(a,b)},G:function(a){bc(a,!n,1,!la);m.xa()},i:function(a){y?postMessage({cmd:"cleanupThread",thread:a}):Ra(a)},z:gb,g:hb,v:ib,w:jb,A:function(){return 2097152},e:function(a){delete qb[a-1]},B:function(){return!0},D:function(a,b,c,e){if(a==b)setTimeout(()=>Wa(e));else if(y)postMessage({targetThread:a,cmd:"processProxyingQueue",queue:e});else{a=(a=m.S[a])&&a.worker;if(!a)return;a.postMessage({cmd:"processProxyingQueue",queue:e})}return 1},F:function(){return-1},
b:function(){D("")},j:function(){u||n||(va||(va={}),va["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]||(va["Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread"]=1,B("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread")))},m:lb,c:mb,C:function(a,
b,c){I.copyWithin(a,b,b+c)},E:function(a,b,c){pb.length=b;c>>=3;for(var e=0;e<b;e++)pb[e]=Ca[c+e];return(0>a?Qa[-a-1]:$b[a]).apply(null,pb)},y:function(){D("OOM")},l:function(a,b,c,e,h){var g=a+112,k=H(g),p=Q[g+36>>2],r=Q[g+40>>2],w=Q[g+44>>2],x=Q[g+48>>2],K=Q[g+52>>2],X=!!(K&4),f=!!(K&32),q=!!(K&16),t=!!(K&64),C=v=>{W(()=>{p?dynCall_vi.apply(null,[p,v]):b&&b(v)},t)},L=v=>{W(()=>{w?dynCall_vi.apply(null,[w,v]):e&&e(v)},t)},M=v=>{W(()=>{r?dynCall_vi.apply(null,[r,v]):c&&c(v)},t)},l=v=>{W(()=>{x?dynCall_vi.apply(null,
[x,v]):h&&h(v)},t)};K=v=>{tb(v,C,M,L,l)};var A=(v,fc)=>{wb(v,fc.response,ja=>{W(()=>{p?dynCall_vi.apply(null,[p,ja]):b&&b(ja)},t)},ja=>{W(()=>{p?dynCall_vi.apply(null,[p,ja]):b&&b(ja)},t)})},F=v=>{tb(v,A,M,L,l)};if("EM_IDB_STORE"===k)k=Q[g+84>>2],wb(a,I.slice(k,k+Q[g+88>>2]),C,M);else if("EM_IDB_DELETE"===k)yb(a,C,M);else if(q){if(f)return 0;tb(a,X?A:C,M,L,l)}else xb(a,C,f?M:X?F:K);return a},k:function(){throw"unwind";},n:function(){return Zb(async()=>{var a=await d.queue.get();const b=Aa(a)+1,c=
ub(b);J(a,I,c,b);return c})},s:Cb,t:Db,d:function(a){cb(a)},f:Eb,u:Fb,o:Gb,x:Ib,a:E||d.wasmMemory,q:function(){d.pauseQueue()},r:function(a,b,c,e){return Mb(a,b,c,e)},h:function(){d.unpauseQueue()}};
(function(){function a(g,k){g=g.exports;g=Wb(g);d.asm=g;m.ma.push(d.asm.K);Fa.unshift(d.asm.H);xa=k;y||Ma()}function b(g){a(g.instance,g.module)}function c(g){return Pa().then(function(k){return WebAssembly.instantiate(k,e)}).then(function(k){return k}).then(g,function(k){B("failed to asynchronously prepare wasm: "+k);D(k)})}var e={a:cc};y||La();if(d.instantiateWasm)try{var h=d.instantiateWasm(e,a);return h=Wb(h)}catch(g){return B("Module.instantiateWasm callback failed with error: "+g),!1}(function(){return wa||
"function"!=typeof WebAssembly.instantiateStreaming||Na()||u||"function"!=typeof fetch?c(b):fetch(T,{credentials:"same-origin"}).then(function(g){return WebAssembly.instantiateStreaming(g,e).then(b,function(k){B("wasm streaming compile failed: "+k);B("falling back to ArrayBuffer instantiation");return c(b)})})})().catch(ba);return{}})();d.___wasm_call_ctors=function(){return(d.___wasm_call_ctors=d.asm.H).apply(null,arguments)};
var ac=d._main=function(){return(ac=d._main=d.asm.I).apply(null,arguments)},vb=d._free=function(){return(vb=d._free=d.asm.J).apply(null,arguments)};d.__emscripten_tls_init=function(){return(d.__emscripten_tls_init=d.asm.K).apply(null,arguments)};var ub=d._malloc=function(){return(ub=d._malloc=d.asm.L).apply(null,arguments)};d._emscripten_proxy_main=function(){return(d._emscripten_proxy_main=d.asm.M).apply(null,arguments)};
var bc=d.__emscripten_thread_init=function(){return(bc=d.__emscripten_thread_init=d.asm.N).apply(null,arguments)};d.__emscripten_thread_crashed=function(){return(d.__emscripten_thread_crashed=d.asm.O).apply(null,arguments)};
var ob=d._emscripten_run_in_main_runtime_thread_js=function(){return(ob=d._emscripten_run_in_main_runtime_thread_js=d.asm.P).apply(null,arguments)},Va=d._pthread_self=function(){return(Va=d._pthread_self=d.asm.Q).apply(null,arguments)},kb=d.__emscripten_proxy_execute_task_queue=function(){return(kb=d.__emscripten_proxy_execute_task_queue=d.asm.R).apply(null,arguments)},Ua=d.__emscripten_thread_free_data=function(){return(Ua=d.__emscripten_thread_free_data=d.asm.T).apply(null,arguments)},eb=d.__emscripten_thread_exit=
function(){return(eb=d.__emscripten_thread_exit=d.asm.U).apply(null,arguments)},ab=d._emscripten_stack_set_limits=function(){return(ab=d._emscripten_stack_set_limits=d.asm.V).apply(null,arguments)},Za=d.stackSave=function(){return(Za=d.stackSave=d.asm.W).apply(null,arguments)},$a=d.stackRestore=function(){return($a=d.stackRestore=d.asm.X).apply(null,arguments)},nb=d.stackAlloc=function(){return(nb=d.stackAlloc=d.asm.Y).apply(null,arguments)},dynCall_vi=d.dynCall_vi=function(){return(dynCall_vi=d.dynCall_vi=
d.asm.Z).apply(null,arguments)},db=d.dynCall_ii=function(){return(db=d.dynCall_ii=d.asm._).apply(null,arguments)},dynCall_v=d.dynCall_v=function(){return(dynCall_v=d.dynCall_v=d.asm.$).apply(null,arguments)};d._asyncify_start_unwind=function(){return(d._asyncify_start_unwind=d.asm.aa).apply(null,arguments)};d._asyncify_stop_unwind=function(){return(d._asyncify_stop_unwind=d.asm.ba).apply(null,arguments)};d._asyncify_start_rewind=function(){return(d._asyncify_start_rewind=d.asm.ca).apply(null,arguments)};
d._asyncify_stop_rewind=function(){return(d._asyncify_stop_rewind=d.asm.da).apply(null,arguments)};d.keepRuntimeAlive=function(){return noExitRuntime};d.wasmMemory=E;d.ExitStatus=ra;d.PThread=m;var dc;function ra(a){this.name="ExitStatus";this.message="Program terminated with exit("+a+")";this.status=a}Ka=function ec(){dc||gc();dc||(Ka=ec)};
function hc(a){var b=d._emscripten_proxy_main;a=a||[];a.unshift(ia);var c=a.length,e=nb(4*(c+1)),h=e>>2;a.forEach(g=>{var k=h++,p=Aa(g)+1,r=nb(p);J(g,Ba,r,p);P[k]=r});P[h]=0;b(c,e)}
function gc(a){function b(){if(!dc&&(dc=!0,d.calledRun=!0,!G)){y||Xa(Fa);y||Xa(Ga);aa(d);if(d.onRuntimeInitialized)d.onRuntimeInitialized();ic&&hc(a);if(!y){if(d.postRun)for("function"==typeof d.postRun&&(d.postRun=[d.postRun]);d.postRun.length;){var c=d.postRun.shift();Ha.unshift(c)}Xa(Ha)}}}a=a||ha;if(!(0<S))if(y)aa(d),y||Xa(Fa),postMessage({cmd:"loaded"});else{if(d.preRun)for("function"==typeof d.preRun&&(d.preRun=[d.preRun]);d.preRun.length;)Ia();Xa(Ea);0<S||(d.setStatus?(d.setStatus("Running..."),
setTimeout(function(){setTimeout(function(){d.setStatus("")},1);b()},1)):b())}}d.run=gc;function cb(a){if(y)throw bb(a),"unwind";if(!noExitRuntime){m.va();if(d.onExit)d.onExit(a);G=!0}ka(a,new ra(a))}if(d.preInit)for("function"==typeof d.preInit&&(d.preInit=[d.preInit]);0<d.preInit.length;)d.preInit.pop()();var ic=!0;d.noInitialRun&&(ic=!1);gc();


  return Stockfish.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Stockfish;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Stockfish; });
else if (typeof exports === 'object')
  exports["Stockfish"] = Stockfish;
return Stockfish;
}

if (typeof self !== "undefined" && self.location.hash.split(",")[1] === "worker" || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]" && !require("worker_threads").isMainThread) {
    (function() {
        "use strict";var Module={};var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";if(ENVIRONMENT_IS_NODE){var nodeWorkerThreads=require("worker_threads");var parentPort=nodeWorkerThreads.parentPort;parentPort.on("message",function(data){onmessage({data:data})});var fs=require("fs");Object.assign(global,{self:global,require:require,Module:Module,location:{href:__filename},Worker:nodeWorkerThreads.Worker,importScripts:function(f){(0,eval)(fs.readFileSync(f,"utf8"))},postMessage:function(msg){parentPort.postMessage(msg)},performance:global.performance||{now:function(){return Date.now()}}})}var initializedJS=false;var pendingNotifiedProxyingQueues=[];function threadPrintErr(){var text=Array.prototype.slice.call(arguments).join(" ");if(ENVIRONMENT_IS_NODE){fs.writeSync(2,text+"\n");return}console.error(text)}function threadAlert(){var text=Array.prototype.slice.call(arguments).join(" ");postMessage({cmd:"alert",text:text,threadId:Module["_pthread_self"]()})}var err=threadPrintErr;self.alert=threadAlert;Module["instantiateWasm"]=(info,receiveInstance)=>{var instance=new WebAssembly.Instance(Module["wasmModule"],info);receiveInstance(instance);Module["wasmModule"]=null;return instance.exports};self.onmessage=e=>{try{if(e.data.cmd==="load"){Module["wasmModule"]=e.data.wasmModule;Module["wasmMemory"]=e.data.wasmMemory;Module["buffer"]=Module["wasmMemory"].buffer;Module["ENVIRONMENT_IS_PTHREAD"]=true;Stockfish=INIT_ENGINE();Stockfish(Module).then(function(instance){Module=instance})}else if(e.data.cmd==="run"){Module["__performance_now_clock_drift"]=performance.now()-e.data.time;Module["__emscripten_thread_init"](e.data.threadInfoStruct,/*isMainBrowserThread=*/0,/*isMainRuntimeThread=*/0,/*canBlock=*/1);Module["establishStackSpace"]();Module["PThread"].receiveObjectTransfer(e.data);Module["PThread"].threadInitTLS();if(!initializedJS){pendingNotifiedProxyingQueues.forEach(queue=>{Module["executeNotifiedProxyingQueue"](queue)});pendingNotifiedProxyingQueues=[];initializedJS=true}try{Module["invokeEntryPoint"](e.data.start_routine,e.data.arg)}catch(ex){if(ex!="unwind"){if(ex instanceof Module["ExitStatus"]){if(Module["keepRuntimeAlive"]()){}else{Module["__emscripten_thread_exit"](ex.status)}}else{throw ex}}}}else if(e.data.cmd==="cancel"){if(Module["_pthread_self"]()){Module["__emscripten_thread_exit"](-1)}}else if(e.data.target==="setimmediate"){}else if(e.data.cmd==="processProxyingQueue"){if(initializedJS){Module["executeNotifiedProxyingQueue"](e.data.queue)}else{pendingNotifiedProxyingQueues.push(e.data.queue)}}else{err("worker.js received unknown command "+e.data.cmd);err(e.data)}}catch(ex){err("worker.js onmessage() captured an uncaught exception: "+ex);if(ex&&ex.stack)err(ex.stack);if(Module["__emscripten_thread_crashed"]){Module["__emscripten_thread_crashed"]()}throw ex}};
//
// Patch `onmessage` to support custom message
//
const old_onmessage = self.onmessage;

const new_onmessage = (e) => {
  if (e.data.cmd === 'custom') {
    if (typeof Module['onCustomMessage'] === 'function') {
      Module['onCustomMessage'](e.data.userData);
    }
  } else {
    old_onmessage(e);
  }
}

onmessage = self.onmessage = new_onmessage;
    })();
/// Is it a web worker?
} else if (typeof onmessage !== "undefined" && (typeof window === "undefined" || typeof window.document === "undefined") || typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]") {
    (function ()
    {
        var isNode = typeof global !== "undefined" && Object.prototype.toString.call(global.process) === "[object process]";
        var mod;
        var myEngine;
        var queue = [];
        var args;
        var wasmPath;
        
        function completer(line)
        {
            var completions = [
                "compiler",
                "d",
                "eval",
                "exit",
                "flip",
                "go ",
                "isready ",
                "ponderhit ",
                "position fen ",
                "position startpos",
                "position startpos moves",
                "quit",
                "setoption name Clear Hash value true",
                "setoption name Contempt value ",
                "setoption name Hash value ",
                "setoption name Minimum Thinking Time value ",
                "setoption name Move Overhead value ",
                "setoption name MultiPV value ",
                "setoption name Ponder value ",
                //"setoption name Skill Level Maximum Error value ",
                //"setoption name Skill Level Probability value ",
                "setoption name Skill Level value ",
                "setoption name Slow Mover value ",
                "setoption name Threads value ",
                "setoption name UCI_Chess960 value false",
                "setoption name UCI_Chess960 value true",
                "setoption name UCI_AnalyseMode value true",
                "setoption name UCI_AnalyseMode value false",
                "setoption name UCI_LimitStrength value true",
                "setoption name UCI_LimitStrength value false",
                "setoption name UCI_Elo value ",
                "setoption name UCI_ShowWDL value true",
                "setoption name UCI_ShowWDL value false",
                "setoption name Use NNUE value true",
                "setoption name Use NNUE value false",
                "setoption name nodestime value ",
                "setoption name EvalFile value ",
                "stop",
                "uci",
                "ucinewgame"
            ];
            var completionsMid = [
                "binc ",
                "btime ",
                "confidence ",
                "depth ",
                "infinite ",
                "mate ",
                "maxdepth ",
                "maxtime ",
                "mindepth ",
                "mintime ",
                "moves ", /// for position fen ... moves
                "movestogo ",
                "movetime ",
                "ponder ",
                "searchmoves ",
                "shallow ",
                "winc ",
                "wtime "
            ];
            
            function filter(c)
            {
                return c.indexOf(line) === 0;
            }
            
            /// This looks for completions starting at the very beginning of the line.
            /// If the user has typed nothing, it will match everything.
            var hits = completions.filter(filter);
            
            if (!hits.length) {
                /// Just get the last word.
                line = line.replace(/^.*\s/, "");
                if (line) {
                    /// Find completion mid line too.
                    hits = completionsMid.filter(filter);
                } else {
                    /// If no word has been typed, show all options.
                    hits = completionsMid;
                }
            }
            
            return [hits, line];
        }
        
        if (isNode) {
            ///NOTE: Node.js v14+ needs --experimental-wasm-threads --experimental-wasm-simd
            /// Was it called directly?
            if (require.main === module) {
                wasmPath = require("path").join(__dirname, "stockfish.wasm");
                mod = {
                    locateFile: function (path)
                    {
                        if (path.indexOf(".wasm") > -1) {
                            /// Set the path to the wasm binary.
                            return wasmPath;
                        } else {
                            /// Set path to worker (self + the worker hash)
                            return __filename;
                        }
                    },
                };
                Stockfish = INIT_ENGINE();
                Stockfish(mod).then(function (sf)
                {
                    myEngine = sf;
                    sf.addMessageListener(function (line)
                    {
                        console.log(line);
                    });
                    
                    if (queue.length) {
                        queue.forEach(function (line)
                        {
                            sf.postMessage(line, true);
                        });
                    }
                    queue = null;
                });
                
                require("readline").createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    completer: completer,
                    historySize: 100,
                }).on("line", function online(line)
                {
                    if (line) {
                        if (line === "quit" || line === "exit") {
                            process.exit();
                        }
                        if (myEngine) {
                            myEngine.postMessage(line, true);
                        } else {
                            queue.push(line);
                        }
                    }
                }).on("close", function onend()
                {
                    process.exit();
                }).setPrompt("");
                
            /// Is this a node module?
            } else {
                module.exports = INIT_ENGINE;
            }
        } else {
            args = self.location.hash.substr(1).split(",");
            wasmPath = decodeURIComponent(args[0] || "stockfish.wasm");
            mod = {
                locateFile: function (path)
                {
                    if (path.indexOf(".wasm") > -1) {
                        /// Set the path to the wasm binary.
                        return wasmPath;
                    } else {
                        /// Set path to worker (self + the worker hash)
                        return self.location.origin + self.location.pathname + "#" + wasmPath + ",worker";
                    }
                }
            };
            Stockfish = INIT_ENGINE();
            Stockfish(mod).then(function onCreate(sf)
            {
                myEngine = sf;
                sf.addMessageListener(function onMessage(line)
                {
                    postMessage(line);
                });
                
                if (queue.length) {
                    queue.forEach(function (line)
                    {
                        sf.postMessage(line, true);
                    });
                }
                queue = null;
            }).catch(function (e)
            {
                /// Sadly, Web Workers will not trigger the error event when errors occur in promises, so we need to create a new context and throw an error there.
                setTimeout(function throwError()
                {
                    throw e;
                }, 1);
            });
            
            /// Make sure that this is only added once.
            if (!onmessage) {
                onmessage = function (event)
                {
                    if (myEngine) {
                        myEngine.postMessage(event.data, true);
                    } else {
                        queue.push(event.data);
                    }
                };
            }
        }
    }());
} else {
    ///NOTE: If it's a normal browser, the client can use the Stockfish() function directly.
    Stockfish = INIT_ENGINE();
}