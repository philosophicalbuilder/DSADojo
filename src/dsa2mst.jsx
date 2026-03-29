import { useState, useCallback, useMemo } from "react";

// ─── MST LAYOUTS ───
const MST_LAYOUTS = [
  { nodes: [{id:"A",x:270,y:80},{id:"B",x:500,y:80},{id:"C",x:140,y:270},{id:"D",x:370,y:270},{id:"E",x:600,y:270},{id:"F",x:270,y:450},{id:"G",x:500,y:450}], structure: [["A","B"],["A","C"],["A","D"],["B","D"],["B","E"],["C","D"],["C","F"],["D","E"],["D","F"],["D","G"],["E","G"],["F","G"]] },
  { nodes: [{id:"A",x:250,y:70},{id:"B",x:500,y:70},{id:"C",x:120,y:260},{id:"D",x:370,y:260},{id:"E",x:620,y:260},{id:"F",x:120,y:440},{id:"G",x:370,y:440},{id:"H",x:620,y:440}], structure: [["A","B"],["A","C"],["A","D"],["B","D"],["B","E"],["C","D"],["C","F"],["D","E"],["D","G"],["E","H"],["F","G"],["G","H"]] },
  { nodes: [{id:"A",x:140,y:90},{id:"B",x:370,y:90},{id:"C",x:600,y:90},{id:"D",x:140,y:275},{id:"E",x:370,y:275},{id:"F",x:600,y:275},{id:"G",x:140,y:450},{id:"H",x:370,y:450},{id:"I",x:600,y:450}], structure: [["A","B"],["B","C"],["A","D"],["B","E"],["C","F"],["D","E"],["E","F"],["D","G"],["E","H"],["F","I"],["G","H"],["H","I"]] },
  { nodes: [{id:"A",x:100,y:150},{id:"B",x:310,y:100},{id:"C",x:520,y:150},{id:"D",x:660,y:270},{id:"E",x:100,y:390},{id:"F",x:310,y:440},{id:"G",x:520,y:390}], structure: [["A","B"],["B","C"],["C","D"],["A","E"],["B","F"],["C","G"],["D","G"],["E","F"],["F","G"]] },
  { nodes: [{id:"A",x:370,y:70},{id:"B",x:180,y:200},{id:"C",x:560,y:200},{id:"D",x:370,y:270},{id:"E",x:180,y:420},{id:"F",x:560,y:420},{id:"G",x:370,y:470}], structure: [["A","B"],["A","C"],["A","D"],["B","D"],["C","D"],["B","E"],["C","F"],["D","E"],["D","F"],["D","G"],["E","G"],["F","G"]] },
  { nodes: [{id:"A",x:370,y:60},{id:"B",x:580,y:170},{id:"C",x:580,y:370},{id:"D",x:370,y:470},{id:"E",x:160,y:370},{id:"F",x:160,y:170},{id:"G",x:300,y:265},{id:"H",x:440,y:265}], structure: [["A","B"],["B","C"],["C","D"],["D","E"],["E","F"],["F","A"],["A","H"],["B","H"],["C","H"],["D","G"],["E","G"],["F","G"],["G","H"]] },
];
const DJ_LAYOUTS = [
  { nodes: [{id:"v0",x:110,y:80},{id:"v1",x:480,y:80},{id:"v2",x:60,y:270},{id:"v3",x:300,y:250},{id:"v4",x:530,y:250},{id:"v5",x:140,y:440},{id:"v6",x:430,y:440}], structure: [["v0","v1"],["v0","v2"],["v0","v3"],["v1","v3"],["v1","v4"],["v2","v3"],["v2","v5"],["v3","v4"],["v3","v5"],["v3","v6"],["v4","v6"],["v5","v6"]] },
  { nodes: [{id:"v0",x:300,y:60},{id:"v1",x:110,y:200},{id:"v2",x:490,y:200},{id:"v3",x:60,y:380},{id:"v4",x:300,y:340},{id:"v5",x:530,y:380},{id:"v6",x:300,y:470}], structure: [["v0","v1"],["v0","v2"],["v1","v3"],["v1","v4"],["v2","v4"],["v2","v5"],["v3","v4"],["v3","v6"],["v4","v5"],["v4","v6"],["v5","v6"],["v1","v2"]] },
  { nodes: [{id:"v0",x:70,y:160},{id:"v1",x:260,y:70},{id:"v2",x:470,y:70},{id:"v3",x:260,y:290},{id:"v4",x:470,y:290},{id:"v5",x:160,y:440},{id:"v6",x:550,y:440}], structure: [["v0","v1"],["v0","v3"],["v1","v2"],["v1","v3"],["v1","v4"],["v2","v4"],["v3","v4"],["v3","v5"],["v4","v6"],["v4","v5"],["v5","v6"],["v2","v6"]] },
];
const LECTURE_GRAPH = { nodes: [{id:"v0",x:240,y:60},{id:"v1",x:480,y:60},{id:"v2",x:100,y:260},{id:"v3",x:340,y:260},{id:"v4",x:540,y:260},{id:"v5",x:160,y:450},{id:"v6",x:440,y:450}], edges: [{from:"v0",to:"v1",w:2},{from:"v0",to:"v2",w:2},{from:"v0",to:"v3",w:1},{from:"v1",to:"v4",w:1},{from:"v2",to:"v3",w:1},{from:"v2",to:"v5",w:2},{from:"v3",to:"v1",w:5},{from:"v3",to:"v4",w:1},{from:"v3",to:"v5",w:6},{from:"v3",to:"v6",w:5},{from:"v4",to:"v6",w:3},{from:"v5",to:"v6",w:10}] };

// ─── GENERATORS ───
function genW(c){const p=new Set(),m=c*4;while(p.size<c)p.add(2+Math.floor(Math.random()*(m-1)));const a=[...p];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function genDW(c){const a=[];for(let i=0;i<c;i++)a.push(1+Math.floor(Math.random()*9));return a}
function genMST(){const l=MST_LAYOUTS[Math.floor(Math.random()*MST_LAYOUTS.length)];const w=genW(l.structure.length);return{nodes:l.nodes.map(n=>({...n})),edges:l.structure.map(([a,b],i)=>({from:a<b?a:b,to:a<b?b:a,w:w[i]}))}}
function genDJ(){const l=DJ_LAYOUTS[Math.floor(Math.random()*DJ_LAYOUTS.length)];const w=genDW(l.structure.length);return{nodes:l.nodes.map(n=>({...n})),edges:l.structure.map(([a,b],i)=>({from:a,to:b,w:w[i]}))}}

// ─── MST ALGOS ───
function kMST(N,E){const s=[...E].sort((a,b)=>a.w-b.w),p={},r={};N.forEach(n=>{p[n.id]=n.id;r[n.id]=0});function f(x){if(p[x]!==x)p[x]=f(p[x]);return p[x]}function u(a,b){const ra=f(a),rb=f(b);if(ra===rb)return false;if(r[ra]<r[rb])p[ra]=rb;else if(r[ra]>r[rb])p[rb]=ra;else{p[rb]=ra;r[ra]++}return true}let t=0;const st=[];for(const e of s){if(u(e.from,e.to)){t+=e.w;st.push({w:e.w,action:"add",reason:`w=${e.w}: ${e.from}–${e.to} ✓`})}else st.push({w:e.w,action:"skip",reason:`w=${e.w}: ${e.from}–${e.to} — cycle`})}return{total:t,steps:st}}
function kOrd(E){const s=E.map((e,i)=>({...e,i})).sort((a,b)=>a.w-b.w),p={},r={};const A=new Set();E.forEach(e=>{A.add(e.from);A.add(e.to)});A.forEach(id=>{p[id]=id;r[id]=0});function f(x){if(p[x]!==x)p[x]=f(p[x]);return p[x]}function u(a,b){const ra=f(a),rb=f(b);if(ra===rb)return false;if(r[ra]<r[rb])p[ra]=rb;else if(r[ra]>r[rb])p[rb]=ra;else{p[rb]=ra;r[ra]++}return true}const o=[];for(const e of s){if(u(e.from,e.to))o.push(e.i)}return o}
function kNext(E,ch){const o=kOrd(E);return ch.length<o.length?o[ch.length]:-1}
function pMST(N,E,st){const adj={};N.forEach(n=>{adj[n.id]=[]});E.forEach((e,i)=>{adj[e.from].push({to:e.to,w:e.w,i});adj[e.to].push({to:e.from,w:e.w,i})});const inT=new Set([st]),o=[],steps=[];while(inT.size<N.length){let bw=Infinity,bi=-1,bt="",bf="";for(const u of inT){for(const{to,w,i}of adj[u]){if(!inT.has(to)&&w<bw){bw=w;bi=i;bt=to;bf=u}}}if(bi===-1)break;inT.add(bt);o.push(bi);steps.push({w:E[bi].w,action:"add",reason:`Cut: ${bf}→${bt} (w=${E[bi].w})`})}return{order:o,steps,total:o.reduce((s,i)=>s+E[i].w,0)}}
function pNext(N,E,st,ch){const{order}=pMST(N,E,st);return ch.length<order.length?order[ch.length]:-1}

// ─── DIJKSTRA ───
function solveDJ(N,E,src){const dist={},prev={},known={};N.forEach(n=>{dist[n.id]=Infinity;prev[n.id]=null;known[n.id]=false});dist[src]=0;const adj={};N.forEach(n=>{adj[n.id]=[]});E.forEach(e=>{adj[e.from].push({to:e.to,w:e.w})});const order=[],snaps=[];snaps.push(N.map(n=>({id:n.id,known:false,dist:n.id===src?0:Infinity,path:null})));for(let s=0;s<N.length;s++){let md=Infinity,mn=null;for(const n of N){if(!known[n.id]&&dist[n.id]<md){md=dist[n.id];mn=n.id}}if(mn===null)break;known[mn]=true;order.push(mn);snaps.push(N.map(n=>({id:n.id,known:known[n.id],dist:dist[n.id],path:prev[n.id]})));for(const{to,w}of adj[mn]){if(!known[to]&&dist[mn]+w<dist[to]){dist[to]=dist[mn]+w;prev[to]=mn}}snaps.push(N.map(n=>({id:n.id,known:known[n.id],dist:dist[n.id],path:prev[n.id]})))}return{order,snapshots:snaps}}

// ─── KNAPSACK ───
function genKnapsack(){let items,C,attempts=0;do{items=[];for(let i=0;i<3;i++)items.push({id:i+1,v:8+Math.floor(Math.random()*40),w:5+Math.floor(Math.random()*20)});const tw=items.reduce((s,it)=>s+it.w,0);C=5+Math.floor(Math.random()*(tw-8));attempts++;if(attempts>200)break}while(Math.abs(ksSlv(items,C,"value").profit-ksSlv(items,C,"ratio").profit)<0.5||Math.abs(ksSlv(items,C,"weight").profit-ksSlv(items,C,"ratio").profit)<0.5);return{items,C}}
function ksSlv(items,C,strategy){let sorted;if(strategy==="value")sorted=[...items].sort((a,b)=>b.v-a.v);else if(strategy==="weight")sorted=[...items].sort((a,b)=>a.w-b.w);else sorted=[...items].map(it=>({...it,ratio:it.v/it.w})).sort((a,b)=>b.ratio-a.ratio);let cap=C,profit=0;const steps=[];for(const it of sorted){if(cap<=0)break;if(it.w<=cap){profit+=it.v;steps.push({id:it.id,fraction:1,gained:it.v,totalProfit:profit,capLeft:cap-it.w});cap-=it.w}else{const frac=cap/it.w,gained=frac*it.v;profit+=gained;steps.push({id:it.id,fraction:frac,gained,totalProfit:profit,capLeft:0});cap=0}}return{profit,steps,order:sorted.map(s=>s.id)}}

const R=(n,d=2)=>Math.round(n*Math.pow(10,d))/Math.pow(10,d);

function Arrow({ax,ay,bx,by,col,sw}){const dx=bx-ax,dy=by-ay,len=Math.sqrt(dx*dx+dy*dy),ux=dx/len,uy=dy/len,sx=ax+ux*20,sy=ay+uy*20,ex=bx-ux*24,ey=by-uy*24,aL=10,aA=0.4;const pts=`${ex},${ey} ${ex-aL*(ux*Math.cos(aA)-uy*Math.sin(aA))},${ey-aL*(uy*Math.cos(aA)+ux*Math.sin(aA))} ${ex-aL*(ux*Math.cos(-aA)-uy*Math.sin(-aA))},${ey-aL*(uy*Math.cos(-aA)+ux*Math.sin(-aA))}`;return(<g><line x1={sx}y1={sy}x2={ex}y2={ey}stroke={col}strokeWidth={sw}strokeLinecap="round"/><polygon points={pts}fill={col}/></g>)}

function CalcWidget(){const[expr,setExpr]=useState("");const[res,setRes]=useState(null);const calc=useCallback(()=>{try{const c=expr.replace(/[^0-9+\-*/().% ]/g,"");if(!c.trim()){setRes(null);return}const v=Function('"use strict"; return ('+c+')')();setRes(typeof v==="number"?R(v,4):"Error")}catch{setRes("Error")}},[expr]);return(<div style={{background:"#f2f2f5",border:"1px solid #3a4570",borderRadius:6,padding:"8px"}}><input value={expr}onChange={e=>{setExpr(e.target.value);setRes(null)}}onKeyDown={e=>{if(e.key==="Enter")calc()}}style={{width:"100%",background:"#f5f5f8",border:"1px solid #d8d8e0",borderRadius:4,color:"#E57200",fontFamily:"monospace",fontSize:"0.85rem",fontWeight:700,padding:"6px 8px",outline:"none",marginBottom:6,boxSizing:"border-box"}}placeholder="37+(4/16)*45"/><button onClick={calc}style={{width:"100%",background:"#d0d8e8",border:"1px solid #2a2a3a44",borderRadius:4,color:"#2a2a3a",fontFamily:"monospace",fontSize:"0.78rem",fontWeight:700,padding:"5px",cursor:"pointer",marginBottom:4}}>=</button>{res!==null&&<div style={{fontFamily:"monospace",fontSize:"0.9rem",fontWeight:700,color:res==="Error"?"#ff6b6b":"#E57200",textAlign:"center",marginBottom:4}}>{res}</div>}<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>{["7","8","9","/","4","5","6","*","1","2","3","-","0",".","(",")"].map(k=>(<button key={k}onClick={()=>setExpr(p=>p+k)}style={{background:"+-*/".includes(k)?"#d0d8e8":"#eeeef2",border:"1px solid #d8d8e0",borderRadius:4,color:"+-*/".includes(k)?"#2a2a3a":"#667",fontFamily:"monospace",fontSize:"0.78rem",fontWeight:700,padding:"5px 0",cursor:"pointer"}}>{k}</button>))}<button onClick={()=>setExpr(p=>p+"+")}style={{background:"#d0d8e8",border:"1px solid #d8d8e0",borderRadius:4,color:"#2a2a3a",fontFamily:"monospace",fontSize:"0.78rem",fontWeight:700,padding:"5px 0",cursor:"pointer"}}>+</button><button onClick={()=>{setExpr("");setRes(null)}}style={{background:"#ffe8e8",border:"1px solid #d8d8e0",borderRadius:4,color:"#ff6b6b",fontFamily:"monospace",fontSize:"0.78rem",fontWeight:700,padding:"5px 0",cursor:"pointer"}}>C</button></div></div>)}

function initTable(nds,src){const t={};nds.forEach(n=>{t[n.id]={known:false,dist:n.id===src?"0":"∞",path:""}});return t}

function TutorialDemo(){
  // Looping animated SVG showing how to click edges
  return (
    <div style={{textAlign:"center",margin:"4px auto 10px"}}>
      <svg viewBox="0 0 260 100" style={{width:220,height:85,display:"block",margin:"0 auto"}}>
        <defs>
          <style>{`
            @keyframes cursor1{0%,15%{transform:translate(80px,40px)}20%,30%{transform:translate(80px,40px)}35%{transform:translate(80px,40px);opacity:1}36%{opacity:0.5}37%{opacity:1}50%,60%{transform:translate(170px,55px)}65%{transform:translate(170px,55px);opacity:1}66%{opacity:0.5}67%{opacity:1}80%,95%{transform:translate(170px,55px)}100%{transform:translate(80px,40px)}}
            @keyframes e1col{0%,35%{stroke:#b0b4c0}36%{stroke:#2e8b57}100%{stroke:#2e8b57}}
            @keyframes e1w{0%,35%{fill:#333}36%{fill:#2e8b57}100%{fill:#2e8b57}}
            @keyframes e2col{0%,65%{stroke:#b0b4c0}66%{stroke:#2e8b57}100%{stroke:#2e8b57}}
            @keyframes e2w{0%,65%{fill:#333}66%{fill:#2e8b57}100%{fill:#2e8b57}}
            @keyframes badge1{0%,35%{opacity:0}36%{opacity:1}100%{opacity:1}}
            @keyframes badge2{0%,65%{opacity:0}66%{opacity:1}100%{opacity:1}}
            @keyframes flash1{0%,34%{opacity:0}35%,45%{opacity:1}46%{opacity:0}100%{opacity:0}}
            @keyframes flash2{0%,64%{opacity:0}65%,75%{opacity:1}76%{opacity:0}100%{opacity:0}}
          `}</style>
        </defs>
        {/* Three nodes: A(40,30) B(130,70) C(220,30) */}
        {/* Edge A-B weight 2 */}
        <line x1="40" y1="30" x2="130" y2="70" strokeWidth="2.5" strokeLinecap="round" style={{animation:"e1col 6s infinite"}}/>
        <rect x="73" y="38" width="22" height="18" rx="4" fill="#f5f5f8" stroke="#b0b4c0" strokeWidth="1"/>
        <text x="84" y="48" textAnchor="middle" dominantBaseline="central" fontFamily="monospace" fontSize="10" fontWeight="700" style={{animation:"e1w 6s infinite"}}>2</text>
        {/* Badge 1 */}
        <g style={{animation:"badge1 6s infinite"}}><circle cx="96" cy="36" r="7" fill="#2e8b57"/><text x="96" y="36" textAnchor="middle" dominantBaseline="central" fill="white" fontFamily="monospace" fontSize="7" fontWeight="800">1</text></g>
        {/* Edge B-C weight 5 */}
        <line x1="130" y1="70" x2="220" y2="30" strokeWidth="2.5" strokeLinecap="round" style={{animation:"e2col 6s infinite"}}/>
        <rect x="163" y="38" width="22" height="18" rx="4" fill="#f5f5f8" stroke="#b0b4c0" strokeWidth="1"/>
        <text x="174" y="48" textAnchor="middle" dominantBaseline="central" fontFamily="monospace" fontSize="10" fontWeight="700" style={{animation:"e2w 6s infinite"}}>5</text>
        {/* Badge 2 */}
        <g style={{animation:"badge2 6s infinite"}}><circle cx="186" cy="36" r="7" fill="#2e8b57"/><text x="186" y="36" textAnchor="middle" dominantBaseline="central" fill="white" fontFamily="monospace" fontSize="7" fontWeight="800">2</text></g>
        {/* Edge A-C weight 9 (not selected) */}
        <line x1="40" y1="30" x2="220" y2="30" stroke="#e0e0e6" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="118" y="17" width="22" height="18" rx="4" fill="#f5f5f8" stroke="#e0e0e6" strokeWidth="1"/>
        <text x="129" y="27" textAnchor="middle" dominantBaseline="central" fill="#aaa" fontFamily="monospace" fontSize="10" fontWeight="700">9</text>
        {/* Nodes */}
        <circle cx="40" cy="30" r="14" fill="#f0f0f2" stroke="#9098b0" strokeWidth="2"/><text x="40" y="30" textAnchor="middle" dominantBaseline="central" fill="#333" fontSize="11" fontWeight="700">A</text>
        <circle cx="130" cy="70" r="14" fill="#f0f0f2" stroke="#9098b0" strokeWidth="2"/><text x="130" y="70" textAnchor="middle" dominantBaseline="central" fill="#333" fontSize="11" fontWeight="700">B</text>
        <circle cx="220" cy="30" r="14" fill="#f0f0f2" stroke="#9098b0" strokeWidth="2"/><text x="220" y="30" textAnchor="middle" dominantBaseline="central" fill="#333" fontSize="11" fontWeight="700">C</text>
        {/* Cursor */}
        <g style={{animation:"cursor1 6s infinite"}}>
          <path d="M0,0 L0,14 L4,10 L8,16 L10,15 L6,9 L12,9 Z" fill="#333" stroke="white" strokeWidth="0.8"/>
        </g>
        {/* Correct flash */}
        <g style={{animation:"flash1 6s infinite"}}>
          <text x="84" y="82" textAnchor="middle" fill="#2e8b57" fontFamily="monospace" fontSize="8" fontWeight="700">✓ Correct!</text>
        </g>
        <g style={{animation:"flash2 6s infinite"}}>
          <text x="174" y="92" textAnchor="middle" fill="#2e8b57" fontFamily="monospace" fontSize="8" fontWeight="700">✓ Correct!</text>
        </g>
      </svg>
      <div style={{fontFamily:"monospace",fontSize:"0.58rem",color:"#999",marginTop:2}}>Click edges in order — lightest first</div>
    </div>
  );
}

// ─── COMPLEXITY QUIZ ───
const CX_QUESTIONS = [
  // Dijkstra's
  {q:"Dijkstra's algorithm (binary heap)",a:"Θ(E log V)",cat:"Dijkstra's",hint:"E edges, each with a log V heap operation"},
  {q:"Dijkstra's — decrease-key with binary heap",a:"Θ(log V)",cat:"Dijkstra's",hint:"Bubble up in the heap"},
  {q:"Dijkstra's — extract-min with binary heap",a:"Θ(log V)",cat:"Dijkstra's",hint:"Remove root, percolate down"},
  {q:"Dijkstra's — total extract-mins",a:"Θ(V log V)",cat:"Dijkstra's",hint:"V nodes, each extracted once"},
  // Prim's
  {q:"Prim's algorithm (binary heap)",a:"Θ(E log V)",cat:"Prim's",hint:"Same structure as Dijkstra's"},
  {q:"Prim's — what changes vs Dijkstra's?",a:"edge weight instead of total distance",cat:"Prim's",hint:"Priority key is the edge weight, not accumulated distance"},
  // Kruskal's
  {q:"Kruskal's algorithm",a:"Θ(E log E)",cat:"Kruskal's",hint:"Dominated by sorting edges"},
  {q:"Kruskal's — sorting edges",a:"Θ(E log E)",cat:"Kruskal's",hint:"Standard comparison sort"},
  {q:"Kruskal's — Find operation (with path compression & union by rank)",a:"Θ(α(n))",cat:"Kruskal's",hint:"Inverse Ackermann — essentially constant"},
  {q:"Kruskal's — Union operation (union by rank)",a:"Θ(1)",cat:"Kruskal's",hint:"Just update one pointer + maybe rank"},
  {q:"Kruskal's — all Find-Union operations total",a:"Θ(E α(V))",cat:"Kruskal's",hint:"E operations, each nearly constant"},
  // Knapsack
  {q:"Fractional Knapsack (greedy)",a:"Θ(n log n)",cat:"Knapsack",hint:"Dominated by sorting items by ratio"},
  {q:"Fractional Knapsack — the greedy loop after sorting",a:"Θ(n)",cat:"Knapsack",hint:"Single pass through sorted items"},
  {q:"0/1 Knapsack — can greedy solve it?",a:"No",cat:"Knapsack",hint:"Greedy fails — needs dynamic programming"},
  // Graph basics
  {q:"BFS / DFS traversal",a:"Θ(V + E)",cat:"Graph Basics",hint:"Visit every vertex and edge once"},
  {q:"Adjacency list — check if edge (u,v) exists",a:"O(deg(u))",cat:"Graph Basics",hint:"Scan u's neighbor list"},
  {q:"Adjacency matrix — check if edge (u,v) exists",a:"Θ(1)",cat:"Graph Basics",hint:"Direct array lookup"},
  {q:"Adjacency list — space complexity",a:"Θ(V + E)",cat:"Graph Basics",hint:"List per vertex + edge entries"},
  {q:"Adjacency matrix — space complexity",a:"Θ(V²)",cat:"Graph Basics",hint:"V × V matrix"},
  // Heaps
  {q:"Binary heap — insert",a:"Θ(log n)",cat:"Heaps",hint:"Percolate up"},
  {q:"Binary heap — deleteMin / extractMin",a:"Θ(log n)",cat:"Heaps",hint:"Swap root with last, percolate down"},
  {q:"Binary heap — findMin",a:"Θ(1)",cat:"Heaps",hint:"It's the root"},
  {q:"Binary heap — buildHeap (Floyd's)",a:"Θ(n)",cat:"Heaps",hint:"Bottom-up heapify is linear, not n log n"},
  // Sorting
  {q:"Mergesort",a:"Θ(n log n)",cat:"Sorting",hint:"Divide in half, merge linearly"},
  {q:"Quicksort — average case",a:"Θ(n log n)",cat:"Sorting",hint:"Expected with random pivots"},
  {q:"Quicksort — worst case",a:"Θ(n²)",cat:"Sorting",hint:"Already sorted + bad pivot"},
  {q:"Heapsort",a:"Θ(n log n)",cat:"Sorting",hint:"BuildHeap + n extractMins"},
  // Hash tables
  {q:"Hash table — insert / find / delete (average)",a:"Θ(1)",cat:"Hash Tables",hint:"With good hash function and load factor"},
  {q:"Hash table — worst case lookup",a:"Θ(n)",cat:"Hash Tables",hint:"All keys collide into one bucket"},
  // Trees
  {q:"BST — search / insert / delete (average, balanced)",a:"Θ(log n)",cat:"Trees",hint:"Height of balanced tree"},
  {q:"BST — search / insert / delete (worst case, unbalanced)",a:"Θ(n)",cat:"Trees",hint:"Degenerate chain"},
  {q:"AVL tree — search / insert / delete",a:"Θ(log n)",cat:"Trees",hint:"Always balanced"},
];

function genQuiz(count){
  const shuffled=[...CX_QUESTIONS];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
  return shuffled.slice(0,Math.min(count,shuffled.length)).map((q,i)=>({...q,idx:i}));
}

function normalizeAnswer(s){return s.toLowerCase().replace(/\s+/g,"").replace(/θ|theta/gi,"θ").replace(/Θ/g,"θ").replace(/omega/gi,"ω").replace(/Ω/g,"ω").replace(/alpha/gi,"α").replace(/α/g,"α").replace(/bigo/gi,"o").replace(/log2/g,"log").replace(/lgn/g,"logn").replace(/lg/g,"log").replace(/nlogn/g,"n log n".replace(/\s/g,"")).replace(/\*/g,"");}

function checkComplexity(user,correct){const u=normalizeAnswer(user),c=normalizeAnswer(correct);if(u===c)return true;
  // Allow common variants
  const variants=[correct.toLowerCase(),correct.replace("Θ","O"),correct.replace("Θ","θ"),correct.replace("log","lg"),"o("+correct.replace(/[Θθ()\s]/g,"")+")","θ("+correct.replace(/[Θθ()\s]/g,"")+")"];
  return variants.some(v=>normalizeAnswer(v)===u);
}

const KS_STRATS=[{key:"ratio",label:"Value/Weight Ratio",color:"#00897B",desc:"Highest p/w first"},{key:"value",label:"Highest Value",color:"#E57200",desc:"Most valuable first"},{key:"weight",label:"Lowest Weight",color:"#2962FF",desc:"Lightest first"}];

// ─── MAIN ───
export default function App(){
  const[algo,setAlgo]=useState("kruskal");
  const[graph,setGraph]=useState(()=>genMST());
  const[selOrder,setSelOrder]=useState([]);
  const[hovered,setHovered]=useState(null);
  const[result,setResult]=useState(null);
  const[startNode,setStartNode]=useState("A");
  const[showSteps,setShowSteps]=useState(false);
  const[errors,setErrors]=useState(new Set());
  const[errorMsg,setErrorMsg]=useState(null);
  const[successMsg,setSuccessMsg]=useState(null);
  const[djSource,setDjSource]=useState("v0");
  const[userTable,setUserTable]=useState({});
  const[djStep,setDjStep]=useState(0);
  const[djFb,setDjFb]=useState(null);
  const[examMode,setExamMode]=useState(false);
  const[examSubmitted,setExamSubmitted]=useState(false);

  const{nodes,edges}=graph;
  const nMap=useMemo(()=>Object.fromEntries(nodes.map(n=>[n.id,n])),[nodes]);
  const selSet=useMemo(()=>new Set(selOrder),[selOrder]);
  const isD=algo==="dijkstra";

  const djSol=useMemo(()=>{if(!isD)return null;try{return solveDJ(nodes,edges,djSource)}catch{return null}},[isD,nodes,edges,djSource]);

  const resetCommon=useCallback(()=>{setResult(null);setShowSteps(false);setErrors(new Set());setErrorMsg(null);setSuccessMsg(null);setSelOrder([]);setDjStep(0);setDjFb(null)},[]);

  const switchAlgo=useCallback(a=>{
    setAlgo(a);resetCommon();
    if(a==="dijkstra"){const g={nodes:LECTURE_GRAPH.nodes.map(n=>({...n})),edges:[...LECTURE_GRAPH.edges]};setGraph(g);setDjSource("v0");setUserTable(initTable(g.nodes,"v0"))}
    else{setGraph(genMST());setStartNode("A")}
  },[resetCommon]);

  const loadLecture=useCallback(()=>{resetCommon();const g={nodes:LECTURE_GRAPH.nodes.map(n=>({...n})),edges:[...LECTURE_GRAPH.edges]};setGraph(g);setDjSource("v0");setUserTable(initTable(g.nodes,"v0"))},[resetCommon]);

  const fresh=useCallback(()=>{
    resetCommon();setExamSubmitted(false);
    if(isD){const g=genDJ();setGraph(g);setUserTable(initTable(g.nodes,djSource))}
    else setGraph(genMST());
  },[isD,djSource,resetCommon]);

  const clear=useCallback(()=>{
    setSelOrder([]);setResult(null);setShowSteps(false);setErrors(new Set());setErrorMsg(null);setDjStep(0);setDjFb(null);
    if(isD)setUserTable(initTable(nodes,djSource));
    
  },[isD,nodes,djSource]);

  // ─── Dijkstra handlers ───
  const updateCell=useCallback((nid,field,val)=>{setUserTable(p=>({...p,[nid]:{...p[nid],[field]:val}}));setDjFb(null)},[]);
  const toggleKnown=useCallback(nid=>{setUserTable(p=>({...p,[nid]:{...p[nid],known:!p[nid].known}}));setDjFb(null)},[]);

  const checkDj=useCallback(()=>{if(!djSol)return;const knownN=nodes.filter(n=>userTable[n.id]?.known).length;if(knownN===0){setDjFb({ok:false,msg:"Mark at least one node as known."});return}let bestErrs=null,bestIdx=-1;for(let si=0;si<djSol.snapshots.length;si++){const snap=djSol.snapshots[si];if(snap.filter(r=>r.known).length!==knownN)continue;const errs=[];for(const row of snap){const u=userTable[row.id];if(!u)continue;if(row.known!==u.known)errs.push(`${row.id}: should ${row.known?"":"NOT "}be known.`);const uD=u.dist.trim(),cD=row.dist===Infinity?"∞":String(row.dist);if(uD!==cD&&!(uD===""&&cD==="∞"))errs.push(`${row.id}: dist should be ${cD}, you have ${uD||"(empty)"}.`);const uP=u.path.trim(),cP=row.path||"";if(uP!==cP&&!(uP==="—"&&cP==="")&&!((uP===""||uP==="—")&&cP===""))errs.push(`${row.id}: path should be ${cP||"empty"}, you have ${uP||"(empty)"}.`)}if(bestErrs===null||errs.length<bestErrs.length){bestErrs=errs;bestIdx=si}if(errs.length===0)break}if(!bestErrs){setDjFb({ok:false,msg:"Could not match."});return}if(bestErrs.length===0){setDjStep(bestIdx);if(bestIdx===djSol.snapshots.length-1){setResult({valid:true,reason:"Dijkstra's complete!"});setDjFb({ok:true,msg:"All done!"})}else{const isA=bestIdx%2===1;setDjFb({ok:true,msg:isA?"Correct! Now update neighbors' distances.":"Step complete! Find next smallest-dist unknown node."})}}else setDjFb({ok:false,msg:bestErrs[0]})},[djSol,userTable,nodes]);

  const revealDj=useCallback(()=>{if(!djSol)return;const ns=djStep+1;if(ns>=djSol.snapshots.length)return;const snap=djSol.snapshots[ns];const t={};snap.forEach(r=>{t[r.id]={known:r.known,dist:r.dist===Infinity?"∞":String(r.dist),path:r.path||""}});setUserTable(t);setDjStep(ns);if(ns===djSol.snapshots.length-1){setResult({valid:true,reason:"Revealed! Done."});setDjFb({ok:true,msg:"All revealed."})}else{const isA=ns%2===1,ni=Math.floor((ns-1)/2);setDjFb({ok:true,msg:isA?`Revealed: ${djSol.order[ni]} marked known.`:`Distances updated.`})}},[djSol,djStep]);

  // ─── MST edge toggle ───
  const toggleEdge=useCallback(i=>{if(isD)return;if(examSubmitted)return;
    // In exam mode: just toggle edges freely, no validation
    if(examMode){
      if(selOrder.includes(i)){setSelOrder(p=>p.filter(x=>x!==i))}
      else{setSelOrder(p=>[...p,i])}
      setResult(null);return;
    }
    // Normal mode with validation
    if(selOrder.includes(i)){if(selOrder[selOrder.length-1]===i){setSelOrder(p=>p.slice(0,-1));setErrors(p=>{const s=new Set(p);s.delete(i);return s});setErrorMsg(null)}setResult(null);setShowSteps(false);return}const cn=algo==="kruskal"?kNext(edges,selOrder):pNext(nodes,edges,startNode,selOrder);if(i===cn){setSelOrder(p=>[...p,i]);setErrors(p=>{const s=new Set(p);s.delete(i);return s});setErrorMsg(null);setSuccessMsg("Correct!");setTimeout(()=>setSuccessMsg(null),1200);if(selOrder.length+1===nodes.length-1){const tw=[...selOrder,i].reduce((s,x)=>s+edges[x].w,0);setResult({valid:true,reason:`Perfect! Weight = ${tw}.`});setSuccessMsg(null)}}else{setErrors(p=>new Set([...p,i]));const e=edges[i];if(algo==="kruskal"){const ce=edges[cn];if(e.w>ce.w)setErrorMsg(`w=${e.w} isn't next — lighter (w=${ce.w}) exists.`);else setErrorMsg(`${e.from}–${e.to} creates a cycle.`)}else{const ce=edges[cn];const inT=new Set([startNode]);for(const x of selOrder){inT.add(edges[x].from);inT.add(edges[x].to)}const fi=inT.has(e.from),ti=inT.has(e.to);if(fi&&ti)setErrorMsg("Both in tree — cycle.");else if(!fi&&!ti)setErrorMsg("Neither in tree.");else setErrorMsg(`Valid cut, but ${ce.from}–${ce.to} (w=${ce.w}) is cheaper.`)}setTimeout(()=>{setErrors(p=>{const s=new Set(p);s.delete(i);return s});setErrorMsg(null)},2200)}if(!(i===cn&&selOrder.length+1===nodes.length-1)){setResult(null);setShowSteps(false)}},[selOrder,edges,nodes,algo,startNode,isD,examMode,examSubmitted]);

  const submitExam=useCallback(()=>{
    if(!examMode)return;
    const correct=algo==="kruskal"?kOrd(edges):pMST(nodes,edges,startNode).order;
    const userSet=new Set(selOrder);
    const correctSet=new Set(correct);
    const isCorrect=userSet.size===correctSet.size&&[...userSet].every(x=>correctSet.has(x));
    const userW=selOrder.reduce((s,x)=>s+edges[x].w,0);
    const correctW=correct.reduce((s,x)=>s+edges[x].w,0);
    if(isCorrect){setResult({valid:true,reason:`Correct! Your MST weight = ${userW}.`})}
    else{setResult({valid:false,reason:`Not quite. Your weight: ${userW}, optimal: ${correctW}. You selected ${selOrder.length}/${nodes.length-1} edges.`})}
    setExamSubmitted(true);
  },[examMode,algo,edges,nodes,startNode,selOrder]);

  const reveal=useCallback(()=>{setErrors(new Set());setErrorMsg(null);if(isD){revealDj();return}if(algo==="kruskal"){setSelOrder(kOrd(edges));setResult({valid:true,reason:`Revealed! Weight=${kMST(nodes,edges).total}.`})}else{const{order,total}=pMST(nodes,edges,startNode);setSelOrder(order);setResult({valid:true,reason:`Revealed! Weight=${total}.`})}setShowSteps(true)},[isD,revealDj,algo,edges,nodes,startNode]);

  // ─── Knapsack handlers ───
  const weight=useMemo(()=>selOrder.reduce((s,i)=>s+edges[i].w,0),[edges,selOrder]);
  const sorted=useMemo(()=>edges.map((e,i)=>({...e,i})).sort((a,b)=>a.w-b.w),[edges]);
  const cSteps=useMemo(()=>{if(isD)return[];return algo==="kruskal"?kMST(nodes,edges).steps:pMST(nodes,edges,startNode).steps},[nodes,edges,algo,startNode,isD]);

  const B={border:"none",borderRadius:8,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",padding:"8px 20px"};
  const G={...B,background:"#eeeef2",border:"1px solid #3a4570",color:"#667"};
  const iS={background:"#f2f2f5",border:"1px solid #3a4570",borderRadius:5,color:"#E57200",fontFamily:"monospace",fontSize:"0.8rem",fontWeight:700,padding:"4px 6px",width:48,textAlign:"center",outline:"none"};
  const ksIS={...iS,width:90,fontSize:"0.95rem",padding:"7px 10px"};

  const TABS=[["kruskal","Kruskal's","#2962FF"],["prim","Prim's","#00897B"],["dijkstra","Dijkstra's","#E57200"]];

  return (
    <div style={{background:"#ffffff",minHeight:"100vh",padding:"16px 12px",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#1a1a2a"}}>
      <h1 style={{textAlign:"center",fontSize:"1.2rem",fontWeight:800,margin:0,letterSpacing:"0.05em",background:"linear-gradient(135deg,#E57200,#D32F2F)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{isD?"Dijkstra's Trainer":examMode?"MST Builder — Exam Mode":"MST Builder"}</h1>

      {/* Tabs */}
      <div style={{display:"flex",justifyContent:"center",gap:3,margin:"10px 0 6px",flexWrap:"wrap"}}>
        {TABS.map(([m,l,c])=>(
          <button key={m}onClick={()=>switchAlgo(m)}style={{...B,padding:"6px 14px",fontSize:"0.72rem",background:algo===m?c+"1a":"#eeeef2",border:`1.5px solid ${algo===m?c:"#d8d8e0"}`,color:algo===m?c:"#556"}}>{l}</button>
        ))}
      </div>

      {/* Exam mode toggle */}
      {!isD && (
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,margin:"6px 0 2px"}}>
          <span style={{fontFamily:"monospace",fontSize:"0.7rem",color:"#888898"}}>Mode:</span>
          <button onClick={()=>{setExamMode(false);setExamSubmitted(false);resetCommon()}} style={{...B,padding:"4px 12px",fontSize:"0.68rem",background:!examMode?"#2e8b5715":"#eeeef2",border:"1.5px solid "+(examMode?"#d8d8e0":"#2e8b57"),color:!examMode?"#2e8b57":"#999"}}>Practice</button>
          <button onClick={()=>{setExamMode(true);setExamSubmitted(false);resetCommon()}} style={{...B,padding:"4px 12px",fontSize:"0.68rem",background:examMode?"#E5720015":"#eeeef2",border:"1.5px solid "+(examMode?"#E57200":"#d8d8e0"),color:examMode?"#E57200":"#999"}}>Exam</button>
        </div>
      )}

      {/* Instructions */}
      <p style={{textAlign:"center",color:"#888898",fontSize:"0.68rem",margin:"2px 0 8px",fontFamily:"monospace",maxWidth:500,marginLeft:"auto",marginRight:"auto"}}>
        {examMode
          ? "Select the edges that form the MST. No feedback — click Submit when done."
          : isD
            ? "Fill in the Known/Dist/Path table step by step. Check after marking a node known or updating distances."
            : algo==="kruskal"
              ? "Click edges in Kruskal's order (lightest first, skip if cycle). Click last edge to undo."
              : "Click edges in Prim's order (cheapest cut edge from tree). Pick a start node above."}
      </p>

      {!isD && !examMode && <TutorialDemo />}

      {/* ═══ GRAPH-BASED UI (Kruskal/Prim/Dijkstra) ═══ */}
      {(
        <div>
          {algo==="prim"&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:6,fontFamily:"monospace",fontSize:"0.74rem",color:"#445"}}>Start:<div style={{display:"flex",gap:3}}>{nodes.map(n=>(<button key={n.id}onClick={()=>{setStartNode(n.id);clear()}}style={{width:28,height:26,borderRadius:5,border:"none",cursor:"pointer",fontFamily:"monospace",fontWeight:700,fontSize:"0.72rem",background:startNode===n.id?"#1a3a2a":"#eeeef2",color:startNode===n.id?"#E57200":"#556",outline:startNode===n.id?"1.5px solid #E57200":"1px solid #d8d8e0"}}>{n.id}</button>))}</div></div>}

          {isD&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginBottom:6,fontFamily:"monospace",fontSize:"0.74rem",color:"#445"}}>Source:<div style={{display:"flex",gap:3}}>{nodes.map(n=>(<button key={n.id}onClick={()=>{setDjSource(n.id);setDjStep(0);setDjFb(null);setResult(null);setUserTable(initTable(nodes,n.id))}}style={{padding:"3px 8px",borderRadius:5,border:"none",cursor:"pointer",fontFamily:"monospace",fontWeight:700,fontSize:"0.7rem",background:djSource===n.id?"#2a2a1a":"#eeeef2",color:djSource===n.id?"#fff4e8":"#556",outline:djSource===n.id?"1.5px solid #fff4e8":"1px solid #d8d8e0"}}>{n.id}</button>))}</div></div>}

          {!isD&&<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:8,fontFamily:"monospace",fontSize:"0.73rem"}}><span style={{color:"#445"}}>Step: <span style={{color:"#2a2a3a",fontWeight:700}}>{selOrder.length}</span><span style={{color:"#888898"}}> / {nodes.length-1}</span></span><span style={{color:"#445"}}>Weight: <span style={{color:"#E57200",fontWeight:700}}>{weight}</span></span></div>}

          {!examMode&&successMsg&&<div style={{maxWidth:500,margin:"0 auto 8px",padding:"8px 14px",borderRadius:8,background:"rgba(46,139,87,0.08)",border:"1px solid rgba(46,139,87,0.3)",color:"#2e8b57",fontFamily:"monospace",fontSize:"0.75rem",textAlign:"center",fontWeight:700}}>✓ {successMsg}</div>}

          {!examMode&&errorMsg&&<div style={{maxWidth:500,margin:"0 auto 8px",padding:"8px 14px",borderRadius:8,background:"rgba(255,70,70,0.08)",border:"1px solid rgba(255,70,70,0.25)",color:"#ff6b6b",fontFamily:"monospace",fontSize:"0.75rem",textAlign:"center",fontWeight:600}}>✗ {errorMsg}</div>}

          {examMode&&!examSubmitted&&<div style={{textAlign:"center",marginBottom:8,fontFamily:"monospace",fontSize:"0.75rem",color:"#888898"}}>Selected: {selOrder.length} edge{selOrder.length!==1?"s":""}</div>}

          <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap",alignItems:"flex-start",maxWidth:isD?900:820,margin:"0 auto",padding:"16px",borderRadius:12,border:"1px solid #d0d0d8",background:"#fafafa",flexDirection:isD?"column":"row"}}>
            <svg viewBox={isD?"0 0 620 520":"0 0 740 520"}style={{width:"100%",maxWidth:isD?620:740,minWidth:280,display:"block",margin:"0 auto"}}>
              <defs><style>{`@keyframes pulseRed{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}`}</style></defs>
              <rect width={isD?"620":"740"}height="520"rx="14"fill="#f8f8fb"/>
              {edges.map((e,i)=>{const a=nMap[e.from],b=nMap[e.to];if(!a||!b)return null;const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;if(isD){const isUsed=nodes.some(n=>{const u=userTable[n.id];return u&&u.known&&u.path===e.from&&n.id===e.to});const col=isUsed?"#E57200":"#d8d8e0";return(<g key={i}><Arrow ax={a.x}ay={a.y}bx={b.x}by={b.y}col={col}sw={isUsed?2.5:1.5}/><rect x={mx-12}y={my-10}width={24}height={20}rx={5}fill="#f8f8fb"stroke={col}strokeWidth={1}/><text x={mx}y={my}textAnchor="middle"dominantBaseline="central"fill="#333"fontFamily="monospace"fontSize="11"fontWeight="700"style={{pointerEvents:"none"}}>{e.w}</text></g>)}const sel=selSet.has(i),hov=hovered===i,err=errors.has(i),col=err?"#ff4545":sel?"#2e8b57":hov?"#555":"#b0b4c0",sn=selOrder.indexOf(i);return(<g key={i}onClick={()=>toggleEdge(i)}onMouseEnter={()=>setHovered(i)}onMouseLeave={()=>setHovered(null)}style={{cursor:"pointer"}}><line x1={a.x}y1={a.y}x2={b.x}y2={b.y}stroke="transparent"strokeWidth={20}/>{sel&&<line x1={a.x}y1={a.y}x2={b.x}y2={b.y}stroke="rgba(46,139,87,0.15)"strokeWidth={10}strokeLinecap="round"/>}{err&&<line x1={a.x}y1={a.y}x2={b.x}y2={b.y}stroke="rgba(255,69,69,0.2)"strokeWidth={10}strokeLinecap="round"style={{animation:"pulseRed 0.5s"}}/>}<line x1={a.x}y1={a.y}x2={b.x}y2={b.y}stroke={col}strokeWidth={err?3.5:sel?3.5:hov?2.8:1.8}strokeLinecap="round"/><rect x={mx-13}y={my-11}width={26}height={22}rx={6}fill={err?"#ffe8e8":sel?"#e8f5ee":"#f5f5f8"}stroke={col}strokeWidth={1}/><text x={mx}y={my}textAnchor="middle"dominantBaseline="central"fill={err?"#ff4545":sel?"#2e8b57":"#333"}fontFamily="monospace"fontSize="12.5"fontWeight="700"style={{pointerEvents:"none"}}>{e.w}</text>{sel&&sn>=0&&(<g><circle cx={mx+16}cy={my-14}r={9}fill="#2e8b57"/><text x={mx+16}y={my-14}textAnchor="middle"dominantBaseline="central"fill="#111"fontFamily="monospace"fontSize="9"fontWeight="800"style={{pointerEvents:"none"}}>{sn+1}</text></g>)}</g>)})}
              {nodes.map(n=>{if(isD){const uk=userTable[n.id]?.known,isSrc=n.id===djSource;return(<g key={n.id}><circle cx={n.x}cy={n.y}r={21}fill="none"stroke={uk?"rgba(249,220,190,0.15)":isSrc?"rgba(249,220,190,0.12)":"rgba(201,203,210,0.08)"}strokeWidth={7}/><circle cx={n.x}cy={n.y}r={17}fill={uk?"#f5e8d0":"#eeeef2"}stroke={uk?"#fff4e8":isSrc?"#fff4e8":"#888898"}strokeWidth={uk||isSrc?3:2.2}/><text x={n.x}y={n.y}textAnchor="middle"dominantBaseline="central"fill="#111"fontSize="12"fontWeight="700"style={{pointerEvents:"none"}}>{n.id}</text>{uk&&(<g><circle cx={n.x+16}cy={n.y-16}r={8}fill="#E57200"/><text x={n.x+16}y={n.y-16}textAnchor="middle"dominantBaseline="central"fill="#111"fontFamily="monospace"fontSize="8"fontWeight="800"style={{pointerEvents:"none"}}>✓</text></g>)}</g>)}const on=edges.some((e,x)=>selSet.has(x)&&(e.from===n.id||e.to===n.id)),isS=algo==="prim"&&n.id===startNode;return(<g key={n.id}><circle cx={n.x}cy={n.y}r={21}fill="none"stroke={isS?"rgba(229,114,0,0.2)":on?"rgba(46,139,87,0.15)":"rgba(201,203,210,0.08)"}strokeWidth={7}/><circle cx={n.x}cy={n.y}r={17}fill={isS?"#f5e8d0":on?"#e4e4ea":"#eeeef2"}stroke={isS?"#fff4e8":on?"#2e8b57":"#888898"}strokeWidth={isS?3:2.2}/><text x={n.x}y={n.y}textAnchor="middle"dominantBaseline="central"fill="#111"fontSize="15"fontWeight="700"style={{pointerEvents:"none"}}>{n.id}</text></g>)})}
            </svg>

            {isD&&<div style={{fontFamily:"monospace",minWidth:320,maxWidth:400}}>
              <table style={{borderCollapse:"collapse",width:"100%"}}>
                <thead><tr>
                  <th style={{padding:"10px 14px",borderBottom:"2px solid #c0c0c8",color:"#555",fontWeight:700,textAlign:"center",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>V</th>
                  <th style={{padding:"10px 14px",borderBottom:"2px solid #c0c0c8",color:"#555",fontWeight:700,textAlign:"center",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Known</th>
                  <th style={{padding:"10px 14px",borderBottom:"2px solid #c0c0c8",color:"#555",fontWeight:700,textAlign:"center",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Dist</th>
                  <th style={{padding:"10px 14px",borderBottom:"2px solid #c0c0c8",color:"#555",fontWeight:700,textAlign:"center",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Path</th>
                </tr></thead>
                <tbody>{nodes.map(n=>{const u=userTable[n.id]||{known:false,dist:"∞",path:""};return(
                  <tr key={n.id} style={{background:u.known?"rgba(46,139,87,0.06)":"transparent"}}>
                    <td style={{padding:"8px 14px",borderBottom:"1px solid #e0e0e6",color:"#222",fontWeight:700,textAlign:"center",fontSize:"0.95rem"}}>{n.id}</td>
                    <td style={{padding:"8px 14px",borderBottom:"1px solid #e0e0e6",textAlign:"center"}}>
                      <div onClick={()=>toggleKnown(n.id)} style={{width:28,height:28,borderRadius:5,border:"2px solid "+(u.known?"#2e8b57":"#b0b4c0"),background:u.known?"rgba(46,139,87,0.15)":"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2e8b57",fontSize:"0.85rem",fontWeight:800}}>{u.known?"✓":""}</div>
                    </td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #e0e0e6",textAlign:"center"}}>
                      <input value={u.dist} onChange={e=>updateCell(n.id,"dist",e.target.value)} style={{background:"#fff",border:"1.5px solid #c0c0c8",borderRadius:6,color:"#E57200",fontFamily:"monospace",fontSize:"1rem",fontWeight:700,padding:"6px 8px",width:60,textAlign:"center",outline:"none"}}/>
                    </td>
                    <td style={{padding:"6px 10px",borderBottom:"1px solid #e0e0e6",textAlign:"center"}}>
                      <input value={u.path} onChange={e=>updateCell(n.id,"path",e.target.value)} style={{background:"#fff",border:"1.5px solid #c0c0c8",borderRadius:6,color:"#555",fontFamily:"monospace",fontSize:"1rem",fontWeight:700,padding:"6px 8px",width:60,textAlign:"center",outline:"none"}} placeholder="—"/>
                    </td>
                  </tr>
                )})}</tbody>
              </table>
              <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center"}}>
                <button onClick={checkDj} style={{...B,padding:"9px 20px",fontSize:"0.82rem",background:"linear-gradient(135deg,#E57200,#cc6500)",color:"#fff",borderRadius:8}}>Check Step</button>
                <button onClick={revealDj} style={{...G,padding:"9px 18px",fontSize:"0.82rem"}}>Reveal Next</button>
              </div>
              {djFb&&<div style={{marginTop:10,padding:"10px 14px",borderRadius:8,background:djFb.ok?"rgba(46,139,87,0.08)":"rgba(255,70,70,0.07)",border:"1px solid "+(djFb.ok?"rgba(46,139,87,0.3)":"rgba(255,70,70,0.25)"),color:djFb.ok?"#2e8b57":"#ff6b6b",fontSize:"0.8rem",fontWeight:600,textAlign:"center"}}>{djFb.ok?"✓ ":"✗ "}{djFb.msg}</div>}
            </div>}
          </div>

          {!isD&&<div style={{display:"flex",justifyContent:"center",gap:20,marginTop:12,flexWrap:"wrap"}}>{selOrder.length>0&&<div style={{fontFamily:"monospace",fontSize:"0.7rem",minWidth:160}}><div style={{color:"#2a2a3a",fontSize:"0.62rem",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,textAlign:"center"}}>Your order</div>{selOrder.map((x,i)=>{const e=edges[x];return(<div key={i}style={{display:"flex",gap:8,padding:"2px 8px",color:"#667"}}><span style={{color:"#2a2a3a",fontWeight:700,width:18}}>{i+1}.</span><span>{e.from}–{e.to}</span><span style={{color:"#2e8b57",fontWeight:700,marginLeft:"auto"}}>w={e.w}</span></div>)})}</div>}{showSteps&&<div style={{fontFamily:"monospace",fontSize:"0.7rem",minWidth:240,maxWidth:340}}><div style={{color:"#E57200",fontSize:"0.62rem",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,textAlign:"center"}}>{algo==="kruskal"?"Kruskal's":`Prim's (from ${startNode})`} — correct</div>{cSteps.map((s,i)=>(<div key={i}style={{display:"flex",gap:6,padding:"2px 6px",color:s.action==="add"?"#334":"#888898",fontSize:"0.66rem"}}><span style={{color:s.action==="add"?"#E57200":"#3a4568",fontWeight:700,flexShrink:0}}>{s.action==="add"?"✓":"✗"}</span><span>{s.reason}</span></div>))}</div>}</div>}

          {!isD&&<div style={{maxWidth:500,margin:"14px auto 0",fontFamily:"monospace",fontSize:"0.68rem"}}><div style={{color:"#888898",textAlign:"center",fontSize:"0.58rem",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5}}>Edges sorted by weight</div><div style={{display:"flex",flexWrap:"wrap",gap:"3px 5px",justifyContent:"center"}}>{sorted.map(e=>{const sel=selSet.has(e.i),err=errors.has(e.i);return(<span key={e.i}onClick={()=>toggleEdge(e.i)}style={{padding:"2px 6px",borderRadius:4,cursor:"pointer",userSelect:"none",background:err?"rgba(255,69,69,0.1)":sel?"rgba(46,139,87,0.15)":"#f5f5f8",border:`1px solid ${err?"rgba(255,69,69,0.3)":sel?"rgba(46,139,87,0.4)":"#253060"}`,color:err?"#ff4545":sel?"#2e8b57":"#445",transition:"all 0.12s"}}>{e.from}–{e.to}:<span style={{color:err?"#ff4545":sel?"#2e8b57":"#333",fontWeight:700}}>{e.w}</span></span>)})}</div></div>}
        </div>
      )}

      {/* Buttons */}
      <div style={{display:"flex",justifyContent:"center",gap:7,marginTop:14,flexWrap:"wrap"}}>
        <button onClick={clear} style={G}>Clear</button>
        {!examMode&&<button onClick={reveal} style={G}>Reveal</button>}
        {!isD&&!examMode&&<button onClick={()=>setShowSteps(s=>!s)} style={G}>{showSteps?"Hide Steps":"Show Steps"}</button>}
        {examMode&&!examSubmitted&&!isD&&<button onClick={submitExam} style={{...B,background:"linear-gradient(135deg,#D32F2F,#b71c1c)",color:"#fff",boxShadow:"0 2px 10px rgba(211,47,47,0.25)"}}>Submit Answer</button>}
        <button onClick={fresh} style={{...B,background:"linear-gradient(135deg,#E57200,#cc6500)",color:"#222",boxShadow:"0 2px 10px rgba(229,114,0,0.25)"}}>New Graph</button>
        {isD&&<button onClick={loadLecture} style={{...G,borderColor:"#E57200",color:"#E57200"}}>Lecture Graph</button>}
      </div>

      {result&&<div style={{maxWidth:520,margin:"10px auto 0",padding:"10px 16px",borderRadius:9,background:result.valid?"rgba(46,139,87,0.1)":"rgba(255,70,70,0.08)",border:"1px solid "+(result.valid?"rgba(46,139,87,0.35)":"rgba(255,70,70,0.3)"),color:result.valid?"#2e8b57":"#ff6b6b",fontFamily:"monospace",fontSize:"0.78rem",textAlign:"center",fontWeight:600}}>{result.valid?"✓ ":"✗ "}{result.reason}</div>}

      <div style={{textAlign:"center",marginTop:40,paddingBottom:16,fontFamily:"monospace",fontSize:"0.65rem",color:"#b0b0b8"}}>DSA Dojo™ — Built by Ramkrishna Sharma, University of Virginia</div>
    </div>
  );
}
