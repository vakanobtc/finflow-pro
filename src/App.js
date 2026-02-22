import { useState, useMemo, useEffect } from "react";

const EMOJIS = ["🍔","🎮","🏠","🚗","💼","🛒","✈️","🎵","💊","📚","🍕","☕","🐶","👗","💇","🏋️","🎬","🍺","💻","📱","🎁","🔧","🏥","⚡","🌮","🍣","🎯","🚀","💰","🏦","🎪","🌿","🍷","🎸","🏄","🎨"];
const DEFAULT_CATS = [
  { id:"food", label:"Comida", emoji:"🍔", color:"#FF6B35" },
  { id:"fun", label:"Diversión", emoji:"🎮", color:"#A855F7" },
  { id:"home", label:"Casa", emoji:"🏠", color:"#3B82F6" },
  { id:"transport", label:"Transporte", emoji:"🚗", color:"#F59E0B" },
  { id:"business", label:"Negocio", emoji:"💼", color:"#10B981" },
  { id:"shopping", label:"Compras", emoji:"🛒", color:"#EC4899" },
];
const CURRENCIES = [
  { code:"COP", symbol:"$", name:"Peso Colombiano", locale:"es-CO" },
  { code:"USD", symbol:"$", name:"Dólar Americano", locale:"en-US" },
  { code:"EUR", symbol:"€", name:"Euro", locale:"de-DE" },
  { code:"VES", symbol:"Bs.", name:"Bolívar Venezolano", locale:"es-VE" },
  { code:"BTC", symbol:"₿", name:"Bitcoin", locale:"en-US" },
];
const THEMES = [
  { id:"dark", name:"Dark Pro", bg:"#1C1C1E", card:"#2C2C2E", accent:"#30D158" },
  { id:"midnight", name:"Midnight", bg:"#0a0f1e", card:"#111827", accent:"#3B82F6" },
  { id:"aurora", name:"Aurora", bg:"#0d1117", card:"#161b22", accent:"#A855F7" },
  { id:"sunset", name:"Sunset", bg:"#1a0a00", card:"#2d1500", accent:"#FF6B35" },
  { id:"forest", name:"Forest", bg:"#0a1a0a", card:"#0f2610", accent:"#10B981" },
  { id:"crypto", name:"Crypto Gold", bg:"#0f0c00", card:"#1a1500", accent:"#F59E0B" },
];
const CAT_COLORS = ["#FF6B35","#A855F7","#3B82F6","#F59E0B","#10B981","#EC4899","#FF453A","#30D158","#0EA5E9","#F97316","#8B5CF6","#06B6D4"];
const DEFAULT_GIVING = [
  { id:"diezmo", name:"Diezmo", pct:10, baseType:"gross", ref:"Malaquías 3:10", color:"#F59E0B", emoji:"🏛️", active:true },
  { id:"ofrenda", name:"Ofrenda", pct:5, baseType:"gross", ref:"2 Corintios 9:7", color:"#10B981", emoji:"🙏", active:true },
  { id:"primicia", name:"Primicia", pct:2, baseType:"gross", ref:"Proverbios 3:9", color:"#A855F7", emoji:"🌾", active:true },
];

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const monthLabel = (key) => { const [y,m] = key.split("-"); return new Date(y, m-1, 1).toLocaleDateString("es-CO",{month:"long",year:"numeric"}); };
const currentMonthKey = () => monthKey(new Date());

const fmt = (n, cur) => {
  if (!cur) return n;
  if (cur.code==="BTC") return `₿ ${Number(n).toFixed(8)}`;
  try { return new Intl.NumberFormat(cur.locale,{style:"currency",currency:cur.code,maximumFractionDigits:cur.code==="COP"||cur.code==="VES"?0:2}).format(n); }
  catch { return `${cur.symbol}${n}`; }
};
const fmtDate = (ts) => new Date(ts).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"})+" "+new Date(ts).toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
const fmtShort = (ts) => new Date(ts).toLocaleDateString("es-CO",{day:"2-digit",month:"2-digit",year:"numeric"});

const BarChart = ({ months, currency }) => {
  if (!months || months.length === 0) return <div style={{color:"#8E8E93",fontSize:13,textAlign:"center",padding:"30px 0"}}>Sin datos históricos aún</div>;
  const maxVal = Math.max(...months.flatMap(m => [m.totalIn, m.totalOut]), 1);
  const barW = Math.min(36, Math.floor(280 / (months.length * 2 + months.length)));
  const gap = barW * 0.4;
  const groupW = barW * 2 + gap * 3;
  const totalW = groupW * months.length;
  const chartH = 130;
  return (
    <div style={{overflowX:"auto",paddingBottom:4}}>
      <svg width={Math.max(totalW + 20, 320)} height={chartH + 50} style={{display:"block"}}>
        {[0,0.25,0.5,0.75,1].map(p => <line key={p} x1={0} y1={chartH - p*chartH + 2} x2={totalW+20} y2={chartH - p*chartH + 2} stroke="#3A3A3C" strokeWidth="1" strokeDasharray="4,4"/>)}
        {months.map((m, i) => {
          const x = i * groupW + gap;
          const inH = maxVal > 0 ? (m.totalIn / maxVal) * (chartH - 4) : 0;
          const outH = maxVal > 0 ? (m.totalOut / maxVal) * (chartH - 4) : 0;
          const lbl = m.key.split("-")[1] + "/" + m.key.split("-")[0].slice(2);
          return (
            <g key={m.key}>
              <rect x={x} y={chartH - inH + 2} width={barW} height={Math.max(inH,2)} rx={4} fill="#30D158" opacity="0.85"/>
              <rect x={x + barW + gap} y={chartH - outH + 2} width={barW} height={Math.max(outH,2)} rx={4} fill="#FF453A" opacity="0.85"/>
              <text x={x + barW + gap/2} y={chartH + 18} textAnchor="middle" fill="#8E8E93" fontSize="9">{lbl}</text>
            </g>
          );
        })}
        <rect x={0} y={chartH + 30} width={10} height={10} rx={2} fill="#30D158"/>
        <text x={14} y={chartH + 40} fill="#8E8E93" fontSize="10">Entradas</text>
        <rect x={70} y={chartH + 30} width={10} height={10} rx={2} fill="#FF453A"/>
        <text x={84} y={chartH + 40} fill="#8E8E93" fontSize="10">Salidas</text>
      </svg>
    </div>
  );
};

const Sparkline = ({ data, color, width=300, height=70 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/range)*(height-10)-5}`).join(" ");
  const c = color.replace("#","");
  return (
    <svg width={width} height={height} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`g${c}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#g${c})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const exportCSV = (txs, giving, cur, budgetPct, budget) => {
  const tIn = txs.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
  const tOut = txs.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
  const bal = tIn - tOut;
  let csv = "\uFEFF";
  csv += `PA DONDE SE FUE LA PLATA - REPORTE\nGenerado:,${new Date().toLocaleDateString("es-CO",{dateStyle:"full"})}\nMoneda:,${cur.code}\n\n`;
  csv += `RESUMEN\nEntradas,${tIn.toFixed(2)}\nSalidas,${tOut.toFixed(2)}\nBalance,${bal.toFixed(2)}\nPresupuesto,${budget.toFixed(2)}\nUso,${budgetPct.toFixed(1)}%\n\n`;
  csv += `DIEZMOS Y OFRENDAS\nConcepto,Porcentaje,Base,Monto\n`;
  giving.filter(g=>g.active).forEach(g => {
    const base = g.baseType==="gross" ? tIn : Math.max(bal,0);
    csv += `"${g.name}",${g.pct}%,"${g.baseType==="gross"?"Brutos":"Neta"}",${((base*g.pct)/100).toFixed(2)}\n`;
  });
  csv += `\nMOVIMIENTOS\nFecha,Tipo,Monto,Categoría,Nota\n`;
  txs.forEach(t => { csv += `${fmtShort(t.timestamp)},${t.type==="in"?"Entrada":"Salida"},${t.amount.toFixed(2)},${t.category?.label||"Sin categoría"},"${(t.note||"").replace(/,/g,";")}"\n`; });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
  a.download = `PaDondeSeFueLaPlata_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

export default function App() {
  const [display, setDisplay] = useState("0");
  const [mode, setMode] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [note, setNote] = useState("");
  const [view, setView] = useState("main");
  const [navOpen, setNavOpen] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [budget, setBudget] = useState(5000000);
  const [budgetInput, setBudgetInput] = useState("5000000");
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [theme, setTheme] = useState(THEMES[0]);
  const [customBg, setCustomBg] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [editCatD, setEditCatD] = useState({});
  const [showEmoji, setShowEmoji] = useState(false);
  const [giving, setGiving] = useState(DEFAULT_GIVING);
  const [editGiv, setEditGiv] = useState(null);
  const [editGivD, setEditGivD] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [activeMk, setActiveMk] = useState(currentMonthKey());

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    const mk = currentMonthKey();
    if (mk !== activeMk) {
      const tIn = transactions.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
      const tOut = transactions.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
      setMonthlyData(prev => ({ ...prev, [activeMk]: { transactions, totalIn:tIn, totalOut:tOut, balance:tIn-tOut, budget } }));
      setTransactions([]);
      setActiveMk(mk);
    }
  }, []);

  const totalIn = useMemo(() => transactions.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0),[transactions]);
  const totalOut = useMemo(() => transactions.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0),[transactions]);
  const balance = totalIn - totalOut;
  const budgetPct = budget > 0 ? Math.min((totalOut/budget)*100, 100) : 0;
  const budgetColor = budgetPct < 50 ? "#30D158" : budgetPct < 80 ? "#F59E0B" : "#FF453A";
  const budgetMsg = budgetPct < 50 ? "¡Vas bien!" : budgetPct < 80 ? "Cuidado" : budgetPct >= 100 ? "¡Límite!" : "Alerta";
  const budgetEmoji = budgetPct < 50 ? "🟢" : budgetPct < 80 ? "🟡" : budgetPct >= 100 ? "🔴" : "🟠";

  const givingCalc = useMemo(() => giving.filter(g=>g.active).map(g => {
    const base = g.baseType==="gross" ? totalIn : Math.max(balance,0);
    return { ...g, base, amount: (base*g.pct)/100 };
  }), [giving, totalIn, balance]);
  const totalGiving = givingCalc.reduce((s,g)=>s+g.amount,0);

  const allMonths = useMemo(() => {
    const current = { key: activeMk, totalIn, totalOut, balance, transactions };
    const archived = Object.entries(monthlyData).map(([k,v]) => ({ key:k, ...v }));
    return [...archived, current].sort((a,b) => a.key.localeCompare(b.key));
  }, [monthlyData, activeMk, totalIn, totalOut, balance, transactions]);

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a,b)=>a.timestamp-b.timestamp);
    let r = 0; const days = {};
    sorted.forEach(t => { const d = new Date(t.timestamp).toLocaleDateString(); r += t.type==="in"?t.amount:-t.amount; days[d]=r; });
    const v = Object.values(days); return v.length===0?[0,0]:v;
  }, [transactions]);

  const outByDay = useMemo(() => {
    const days = {};
    transactions.filter(t=>t.type==="out").forEach(t => { const d = new Date(t.timestamp).toLocaleDateString(); days[d]=(days[d]||0)+t.amount; });
    const v = Object.values(days); return v.length===0?[0,0]:v;
  }, [transactions]);

  const handleKey = k => {
    if (k==="C") { setDisplay("0"); return; }
    if (k==="⌫") { setDisplay(p=>p.length>1?p.slice(0,-1):"0"); return; }
    if (k===".") { if (!display.includes(".")) setDisplay(p=>p+"."); return; }
    setDisplay(p=>p==="0"?String(k):p+k);
  };

  const handleConfirm = () => {
    const amount = parseFloat(display);
    if (!amount||amount<=0||!mode) return;
    const cat = cats.find(c=>c.id===selCat);
    setTransactions(p=>[{id:Date.now(),type:mode,amount,category:cat||null,note:note.trim(),timestamp:Date.now()},...p]);
    setDisplay("0"); setNote(""); setMode(null); setSelCat(null);
  };

  const closeMonth = () => {
    const tIn = transactions.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
    const tOut = transactions.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
    setMonthlyData(prev => ({ ...prev, [activeMk]: { transactions, totalIn:tIn, totalOut:tOut, balance:tIn-tOut, budget } }));
    const [y,m] = activeMk.split("-").map(Number);
    const next = m===12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,"0")}`;
    setTransactions([]); setActiveMk(next);
  };

  const T = theme;
  const bgStyle = customBg ? {backgroundImage:`url(${customBg})`,backgroundSize:"cover",backgroundPosition:"center"} : {background:T.bg};
  const keys = ["7","8","9","4","5","6","1","2","3","C","0","⌫"];
  const balColor = balance>=0?"#30D158":"#FF453A";

  return (
    <div style={{minHeight:"100vh",background:"#111",display:"flex",justifyContent:"center",alignItems:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif"}}>
      <div style={{width:390,minHeight:844,borderRadius:55,overflow:"hidden",boxShadow:"0 0 0 1px #3A3A3C,0 40px 80px rgba(0,0,0,0.9)",display:"flex",flexDirection:"column",position:"relative",...bgStyle,transition:"background 0.4s"}}>
        {customBg && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",zIndex:0}}/>}
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",flex:1}}>

          {/* Status bar */}
          <div style={{height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 30px",paddingTop:14}}>
            <span style={{color:"#fff",fontSize:15,fontWeight:600}}>9:41</span>
            <div style={{width:120,height:30,background:"#000",borderRadius:20,position:"absolute",left:"50%",transform:"translateX(-50%)",top:10}}/>
            <span style={{color:"#fff",fontSize:12}}>●●● 📶 🔋</span>
          </div>

          {/* App title */}
          <div style={{textAlign:"center",padding:"6px 20px 0"}}>
            <div style={{color:"#fff",fontSize:15,fontWeight:800,letterSpacing:-0.5}}>💸 Pa' Donde Se Fue La Plata</div>
            <div style={{color:T.accent,fontSize:9,fontWeight:600,letterSpacing:1}}>FINANZAS PARA MENTES ACTIVAS</div>
          </div>

          {/* Mes + Presupuesto — siempre visible debajo del título */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 16px 0"}}>
            <div style={{background:T.card,borderRadius:10,padding:"4px 10px"}}>
              <div style={{color:"#8E8E93",fontSize:9}}>MES ACTUAL</div>
              <div style={{color:"#fff",fontSize:11,fontWeight:700}}>{monthLabel(activeMk)}</div>
            </div>
            <div style={{background:budgetColor+"22",border:`1px solid ${budgetColor}44`,borderRadius:10,padding:"4px 12px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{budgetEmoji}</span>
              <div>
                <div style={{color:budgetColor,fontSize:11,fontWeight:700}}>{budgetMsg}</div>
                <div style={{color:budgetColor,fontSize:9}}>{budgetPct.toFixed(0)}% del presupuesto</div>
              </div>
            </div>
          </div>

          {/* Nav colapsable */}
          <div style={{padding:"8px 16px 0",position:"relative",zIndex:20}}>
            <button onClick={()=>setNavOpen(p=>!p)} style={{width:"100%",padding:"8px 16px",borderRadius:14,border:"none",cursor:"pointer",background:T.card,backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{color:"#fff",fontSize:13,fontWeight:600}}>
                {view==="main"?"⚡ Registrar":view==="history"?"📋 Historial":view==="chart"?"📈 Gráfico":view==="giving"?"🙏 Diezmos":"⚙️ Config"}
              </span>
              <span style={{color:"#8E8E93",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10}}>menú</span>
                <span style={{display:"inline-block",transform:navOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.25s"}}>▼</span>
              </span>
            </button>
            {navOpen && (
              <div style={{position:"absolute",top:"100%",left:16,right:16,background:T.card,borderRadius:16,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.7)",backdropFilter:"blur(20px)",marginTop:4}}>
                {[["main","⚡","Registrar"],["history","📋","Historial"],["chart","📈","Gráfico"],["giving","🙏","Diezmos"],["settings","⚙️","Config"]].map(([v,icon,lbl])=>(
                  <button key={v} onClick={()=>{setView(v);setNavOpen(false);}} style={{width:"100%",padding:"14px 18px",border:"none",cursor:"pointer",background:view===v?T.accent+"22":"transparent",color:view===v?T.accent:"#fff",fontSize:14,fontWeight:view===v?700:400,textAlign:"left",display:"flex",alignItems:"center",gap:10,borderLeft:view===v?`3px solid ${T.accent}`:"3px solid transparent",transition:"all 0.15s",boxSizing:"border-box"}}>
                    <span style={{fontSize:18}}>{icon}</span>{lbl}
                    {view===v&&<span style={{marginLeft:"auto"}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── MAIN ── */}
          {view==="main" && (<>
            <div style={{textAlign:"center",padding:"12px 20px 8px"}}>
              <div style={{color:"#8E8E93",fontSize:12,marginBottom:2}}>Balance • {currency.code}</div>
              <div style={{color:balColor,fontSize:40,fontWeight:700,letterSpacing:-1}}>{fmt(balance,currency)}</div>
              <div style={{margin:"8px 0 0",background:T.card,borderRadius:10,overflow:"hidden",height:6}}>
                <div style={{width:`${budgetPct}%`,height:"100%",background:budgetColor,borderRadius:10,transition:"width 0.5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{color:"#8E8E93",fontSize:10}}>Gasto: {fmt(totalOut,currency)}</span>
                <span style={{color:"#8E8E93",fontSize:10}}>Límite: {fmt(budget,currency)}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:12,padding:"0 20px 10px"}}>
              {[{type:"in",label:"ENTRADA",color:"#30D158"},{type:"out",label:"SALIDA",color:"#FF453A"}].map(({type,label,color})=>(
                <button key={type} onClick={()=>setMode(mode===type?null:type)} style={{flex:1,padding:"14px 0",borderRadius:18,border:"none",cursor:"pointer",background:mode===type?color:T.card,color:mode===type?"#fff":color,fontSize:16,fontWeight:700,boxShadow:mode===type?`0 4px 20px ${color}55`:"none",transition:"all 0.2s"}}>
                  {type==="in"?"↑":"↓"} {label}
                </button>
              ))}
            </div>
            <div style={{margin:"0 20px 10px",background:T.card,borderRadius:18,padding:"12px 20px",textAlign:"right"}}>
              <div style={{color:"#8E8E93",fontSize:11,textAlign:"left"}}>{mode?(mode==="in"?"💚 Entrada":"🔴 Salida"):"Selecciona modo"}</div>
              <div style={{color:"#fff",fontSize:36,fontWeight:300}}>$ {display}</div>
            </div>
            <div style={{padding:"0 20px 10px"}}>
              <div style={{color:"#8E8E93",fontSize:11,marginBottom:6}}>CATEGORÍA</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {cats.map(cat=>(
                  <button key={cat.id} onClick={()=>setSelCat(selCat===cat.id?null:cat.id)} style={{padding:"10px 6px",borderRadius:14,border:selCat===cat.id?`2px solid ${cat.color}`:"2px solid transparent",background:selCat===cat.id?cat.color+"22":T.card,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
                    <span style={{fontSize:20}}>{cat.emoji}</span>
                    <span style={{color:selCat===cat.id?cat.color:"#8E8E93",fontSize:10,fontWeight:600}}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{padding:"0 20px 10px"}}>
              <input placeholder="📝 Nota rápida..." value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:14,border:"none",background:T.card,color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"0 20px 10px"}}>
              {keys.map(k=>(
                <button key={k} onClick={()=>handleKey(k)} style={{padding:"14px 0",borderRadius:16,border:"none",cursor:"pointer",background:k==="C"?"#FF453A33":T.card,color:k==="C"?"#FF453A":"#fff",fontSize:k==="⌫"?20:22,fontWeight:500}}>
                  {k}
                </button>
              ))}
            </div>
            <div style={{padding:"0 20px 30px"}}>
              <button onClick={handleConfirm} disabled={!mode||display==="0"} style={{width:"100%",padding:"16px 0",borderRadius:18,border:"none",cursor:"pointer",background:!mode||display==="0"?"#3A3A3C":mode==="in"?"#30D158":"#FF453A",color:"#fff",fontSize:17,fontWeight:700,transition:"all 0.2s"}}>
                ✓ CONFIRMAR
              </button>
            </div>
          </>)}

          {/* ── HISTORY ── */}
          {view==="history" && (
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:20,fontWeight:700}}>Historial</div>
                <button onClick={()=>exportCSV(transactions,giving,currency,budgetPct,budget)} style={{padding:"8px 14px",borderRadius:12,border:"none",background:T.accent,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>⬇️ CSV</button>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{color:"#8E8E93",fontSize:11,marginBottom:8}}>SELECCIONAR MES</div>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                  <button onClick={()=>setSelectedMonth(null)} style={{padding:"8px 14px",borderRadius:12,border:"none",cursor:"pointer",background:selectedMonth===null?T.accent:T.card,color:selectedMonth===null?"#fff":"#8E8E93",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>Actual</button>
                  {Object.keys(monthlyData).sort((a,b)=>b.localeCompare(a)).map(mk=>(
                    <button key={mk} onClick={()=>setSelectedMonth(mk)} style={{padding:"8px 14px",borderRadius:12,border:"none",cursor:"pointer",background:selectedMonth===mk?T.accent:T.card,color:selectedMonth===mk?"#fff":"#8E8E93",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>
                      {monthLabel(mk).split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
              {(() => {
                const txs = selectedMonth ? (monthlyData[selectedMonth]?.transactions||[]) : transactions;
                const tIn = selectedMonth ? (monthlyData[selectedMonth]?.totalIn||0) : totalIn;
                const tOut = selectedMonth ? (monthlyData[selectedMonth]?.totalOut||0) : totalOut;
                const bal = tIn - tOut;
                return (<>
                  <div style={{display:"flex",gap:10,marginBottom:12}}>
                    {[{label:"Entradas",color:"#30D158",val:tIn},{label:"Salidas",color:"#FF453A",val:tOut}].map(({label,color,val})=>(
                      <div key={label} style={{flex:1,background:T.card,borderRadius:14,padding:"12px 14px"}}>
                        <div style={{color:"#8E8E93",fontSize:11}}>{label}</div>
                        <div style={{color,fontSize:16,fontWeight:700}}>{fmt(val,currency)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#8E8E93",fontSize:13}}>Balance del mes</span>
                    <span style={{color:bal>=0?"#30D158":"#FF453A",fontSize:18,fontWeight:700}}>{fmt(bal,currency)}</span>
                  </div>
                  {txs.length===0 ? (
                    <div style={{textAlign:"center",color:"#8E8E93",marginTop:40}}><div style={{fontSize:48,marginBottom:10}}>💸</div>Sin movimientos</div>
                  ) : txs.map(tx => (
                    <div key={tx.id} style={{background:T.card,borderRadius:16,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:14,background:tx.category?tx.category.color+"33":"#3A3A3C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                        {tx.category?tx.category.emoji:tx.type==="in"?"↑":"↓"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{tx.category?.label||(tx.type==="in"?"Entrada":"Salida")}</div>
                        {tx.note&&<div style={{color:"#8E8E93",fontSize:11}}>{tx.note}</div>}
                        <div style={{color:"#636366",fontSize:10}}>{fmtDate(tx.timestamp)}</div>
                      </div>
                      <div style={{color:tx.type==="in"?"#30D158":"#FF453A",fontSize:15,fontWeight:700}}>{tx.type==="in"?"+":"-"}{fmt(tx.amount,currency)}</div>
                    </div>
                  ))}
                </>);
              })()}
            </div>
          )}

          {/* ── CHART ── */}
          {view==="chart" && (
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px 30px"}}>
              <div style={{color:"#fff",fontSize:20,fontWeight:700,marginBottom:14}}>📈 Gráficos</div>
              <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:4}}>Comparación mensual</div>
                <div style={{color:"#8E8E93",fontSize:11,marginBottom:12}}>Entradas vs Salidas por mes</div>
                <BarChart months={allMonths} currency={currency}/>
                <div style={{marginTop:12,borderTop:"1px solid #3A3A3C",paddingTop:10}}>
                  {allMonths.map(m=>(
                    <div key={m.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{color:"#8E8E93",fontSize:11,textTransform:"capitalize"}}>{monthLabel(m.key)}</span>
                      <div style={{display:"flex",gap:12}}>
                        <span style={{color:"#30D158",fontSize:11,fontWeight:600}}>+{fmt(m.totalIn,currency)}</span>
                        <span style={{color:"#FF453A",fontSize:11,fontWeight:600}}>-{fmt(m.totalOut,currency)}</span>
                        <span style={{color:m.balance>=0?"#30D158":"#FF453A",fontSize:11,fontWeight:700}}>{fmt(m.balance,currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:14}}>
                <div style={{color:"#8E8E93",fontSize:12,marginBottom:4}}>Balance este mes</div>
                <div style={{color:balColor,fontSize:22,fontWeight:700,marginBottom:8}}>{fmt(balance,currency)}</div>
                <Sparkline data={chartData} color={balColor} width={310} height={70}/>
              </div>
              <div style={{background:T.card,borderRadius:20,padding:"16px",marginBottom:14}}>
                <div style={{color:"#8E8E93",fontSize:12,marginBottom:4}}>Gastos diarios este mes</div>
                <div style={{color:"#FF453A",fontSize:22,fontWeight:700,marginBottom:8}}>{fmt(totalOut,currency)}</div>
                <Sparkline data={outByDay} color="#FF453A" width={310} height={70}/>
              </div>
              <div style={{background:T.card,borderRadius:20,padding:"16px"}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:12}}>Por categoría</div>
                {cats.map(cat=>{
                  const total = transactions.filter(t=>t.type==="out"&&t.category?.id===cat.id).reduce((s,t)=>s+t.amount,0);
                  const pct = totalOut>0?(total/totalOut)*100:0;
                  if (total===0) return null;
                  return (
                    <div key={cat.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{color:"#fff",fontSize:12}}>{cat.emoji} {cat.label}</span>
                        <span style={{color:cat.color,fontSize:12,fontWeight:600}}>{fmt(total,currency)}</span>
                      </div>
                      <div style={{background:"#3A3A3C",borderRadius:6,overflow:"hidden",height:6}}>
                        <div style={{width:`${pct}%`,height:"100%",background:cat.color,borderRadius:6}}/>
                      </div>
                    </div>
                  );
                })}
                {transactions.filter(t=>t.type==="out").length===0&&<div style={{color:"#8E8E93",fontSize:13,textAlign:"center",padding:"20px 0"}}>Sin gastos registrados</div>}
              </div>
            </div>
          )}

          {/* ── GIVING ── */}
          {view==="giving" && (
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px 30px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:"#fff",fontSize:20,fontWeight:700}}>🙏 Diezmos</div>
                <button onClick={()=>exportCSV(transactions,giving,currency,budgetPct,budget)} style={{padding:"7px 12px",borderRadius:12,border:"none",background:T.accent,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>⬇️ CSV</button>
              </div>
              <div style={{color:"#8E8E93",fontSize:12,marginBottom:14}}>Principios bíblicos • Personalizable</div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                <div style={{flex:1,background:T.card,borderRadius:14,padding:"12px"}}>
                  <div style={{color:"#8E8E93",fontSize:10}}>Ing. Brutos</div>
                  <div style={{color:"#30D158",fontSize:15,fontWeight:700}}>{fmt(totalIn,currency)}</div>
                </div>
                <div style={{flex:1,background:T.card,borderRadius:14,padding:"12px"}}>
                  <div style={{color:"#8E8E93",fontSize:10}}>Ganancia Neta</div>
                  <div style={{color:"#3B82F6",fontSize:15,fontWeight:700}}>{fmt(Math.max(balance,0),currency)}</div>
                </div>
              </div>
              <div style={{background:"linear-gradient(135deg,#F59E0B22,#A855F722)",border:"1px solid #F59E0B44",borderRadius:20,padding:"16px",marginBottom:14}}>
                <div style={{color:"#F59E0B",fontSize:12,marginBottom:4}}>TOTAL SUGERIDO A DAR</div>
                <div style={{color:"#fff",fontSize:30,fontWeight:700}}>{fmt(totalGiving,currency)}</div>
              </div>
              {giving.map(g=>{
                const base = g.baseType==="gross"?totalIn:Math.max(balance,0);
                const amount = (base*g.pct)/100;
                return (
                  <div key={g.id} style={{background:T.card,borderRadius:18,padding:"14px 16px",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <div style={{width:42,height:42,borderRadius:14,background:g.color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{g.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:"#fff",fontSize:15,fontWeight:700}}>{g.name}</span>
                          <span style={{color:g.color,fontSize:12,background:g.color+"22",padding:"2px 8px",borderRadius:8}}>{g.pct}%</span>
                          <button onClick={()=>setGiving(p=>p.map(x=>x.id===g.id?{...x,active:!x.active}:x))} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:10,border:"none",background:g.active?"#30D15822":"#3A3A3C",color:g.active?"#30D158":"#8E8E93",fontSize:11,cursor:"pointer",fontWeight:600}}>
                            {g.active?"ON":"OFF"}
                          </button>
                        </div>
                        <div style={{color:g.color,fontSize:18,fontWeight:700}}>{fmt(g.active?amount:0,currency)}</div>
                      </div>
                    </div>
                    <div style={{color:"#636366",fontSize:11,fontStyle:"italic",marginBottom:6}}>📖 {g.ref}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setEditGiv(g.id);setEditGivD({...g});}} style={{flex:1,padding:"7px",borderRadius:10,border:"none",background:"#3A3A3C",color:T.accent,fontSize:12,cursor:"pointer"}}>✏️ Editar</button>
                      {!["diezmo","ofrenda","primicia"].includes(g.id)&&<button onClick={()=>setGiving(p=>p.filter(x=>x.id!==g.id))} style={{padding:"7px 12px",borderRadius:10,border:"none",background:"#FF453A22",color:"#FF453A",fontSize:12,cursor:"pointer"}}>🗑</button>}
                    </div>
                    {editGiv===g.id&&(
                      <div style={{background:"#3A3A3C",borderRadius:14,padding:"12px",marginTop:10}}>
                        <input value={editGivD.name||""} onChange={e=>setEditGivD(p=>({...p,name:e.target.value}))} placeholder="Nombre" style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:14,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:8,marginBottom:8}}>
                          <input type="number" value={editGivD.pct||""} onChange={e=>setEditGivD(p=>({...p,pct:e.target.value}))} placeholder="%" style={{flex:1,padding:"8px 12px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:14,outline:"none"}}/>
                          <select value={editGivD.baseType||"gross"} onChange={e=>setEditGivD(p=>({...p,baseType:e.target.value}))} style={{flex:2,padding:"8px 10px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:13,outline:"none"}}>
                            <option value="gross">Ingresos Brutos</option>
                            <option value="net">Ganancia Neta</option>
                          </select>
                        </div>
                        <input value={editGivD.ref||""} onChange={e=>setEditGivD(p=>({...p,ref:e.target.value}))} placeholder="Referencia bíblica..." style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:13,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setGiving(p=>p.map(x=>x.id===editGiv?{...editGivD,pct:parseFloat(editGivD.pct)||0}:x));setEditGiv(null);}} style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:T.accent,color:"#fff",fontWeight:700,cursor:"pointer"}}>Guardar</button>
                          <button onClick={()=>setEditGiv(null)} style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#8E8E93",cursor:"pointer"}}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={()=>setGiving(p=>[...p,{id:"c_"+Date.now(),name:"Ofrenda Especial",pct:1,baseType:"gross",ref:"Personalizado",color:"#06B6D4",emoji:"✨",active:true}])} style={{width:"100%",padding:"14px",borderRadius:16,border:`2px dashed ${T.accent}44`,background:"transparent",color:T.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                + Agregar ofrenda personalizada
              </button>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {view==="settings" && (
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px 30px"}}>
              <div style={{color:"#fff",fontSize:20,fontWeight:700,marginBottom:16}}>⚙️ Configuración</div>
              <div style={{background:T.card,borderRadius:18,padding:"16px",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:4}}>📅 Gestión de Meses</div>
                <div style={{background:"#3A3A3C",borderRadius:12,padding:"10px 14px",marginBottom:10}}>
                  <div style={{color:"#8E8E93",fontSize:11}}>Mes activo</div>
                  <div style={{color:"#fff",fontSize:14,fontWeight:600}}>{monthLabel(activeMk)}</div>
                  <div style={{color:"#8E8E93",fontSize:11,marginTop:2}}>{transactions.length} movimientos</div>
                </div>
                <button onClick={closeMonth} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"#FF453A22",color:"#FF453A",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  🔄 Cerrar mes y comenzar nuevo
                </button>
                {Object.keys(monthlyData).length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{color:"#8E8E93",fontSize:11,marginBottom:8}}>MESES ARCHIVADOS</div>
                    {Object.entries(monthlyData).sort((a,b)=>b[0].localeCompare(a[0])).map(([mk,d])=>(
                      <div key={mk} style={{background:"#3A3A3C",borderRadius:10,padding:"8px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:"#fff",fontSize:12}}>{monthLabel(mk)}</span>
                        <span style={{color:d.balance>=0?"#30D158":"#FF453A",fontSize:12,fontWeight:600}}>{fmt(d.balance,currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{background:T.card,borderRadius:18,padding:"16px",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>💱 Moneda</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {CURRENCIES.map(c=>(
                    <button key={c.code} onClick={()=>setCurrency(c)} style={{padding:"8px 14px",borderRadius:12,border:`2px solid ${currency.code===c.code?T.accent:"transparent"}`,background:currency.code===c.code?T.accent+"22":"#3A3A3C",color:currency.code===c.code?T.accent:"#8E8E93",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:T.card,borderRadius:18,padding:"16px",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>🎯 Presupuesto Mensual</div>
                <div style={{display:"flex",gap:8}}>
                  <input value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} style={{flex:1,padding:"10px 14px",borderRadius:12,border:"none",background:"#3A3A3C",color:"#fff",fontSize:14,outline:"none"}}/>
                  <button onClick={()=>{const v=parseFloat(budgetInput);if(v>0)setBudget(v);}} style={{padding:"10px 16px",borderRadius:12,border:"none",background:T.accent,color:"#fff",fontWeight:700,cursor:"pointer"}}>OK</button>
                </div>
              </div>
              <div style={{background:T.card,borderRadius:18,padding:"16px",marginBottom:14}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>🎨 Tema</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  {THEMES.map(t=>(
                    <button key={t.id} onClick={()=>{setTheme(t);setCustomBg(null);}} style={{padding:"10px 6px",borderRadius:14,border:`2px solid ${theme.id===t.id&&!customBg?t.accent:"transparent"}`,background:t.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{width:24,height:24,borderRadius:8,background:t.accent}}/>
                      <span style={{color:"#fff",fontSize:10,fontWeight:600}}>{t.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{color:"#8E8E93",fontSize:12,marginBottom:6}}>🖼 Imagen de fondo (URL)</div>
                <div style={{display:"flex",gap:8}}>
                  <input placeholder="https://..." id="bgurl" style={{flex:1,padding:"9px 12px",borderRadius:12,border:"none",background:"#3A3A3C",color:"#fff",fontSize:13,outline:"none"}}/>
                  <button onClick={()=>{const v=document.getElementById("bgurl").value.trim();if(v)setCustomBg(v);}} style={{padding:"9px 14px",borderRadius:12,border:"none",background:T.accent,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Set</button>
                </div>
                {customBg&&<button onClick={()=>setCustomBg(null)} style={{marginTop:8,padding:"7px 14px",borderRadius:10,border:"none",background:"#FF453A33",color:"#FF453A",fontSize:13,cursor:"pointer"}}>✕ Quitar</button>}
              </div>
              <div style={{background:T.card,borderRadius:18,padding:"16px"}}>
                <div style={{color:"#fff",fontSize:14,fontWeight:600,marginBottom:10}}>🏷 Categorías</div>
                {cats.map(cat=>(
                  <div key={cat.id}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <span style={{fontSize:22}}>{cat.emoji}</span>
                      <span style={{color:"#fff",fontSize:14,flex:1}}>{cat.label}</span>
                      <button onClick={()=>{setEditCat(cat.id);setEditCatD({...cat});setShowEmoji(false);}} style={{padding:"6px 12px",borderRadius:10,border:"none",background:"#3A3A3C",color:T.accent,fontSize:12,cursor:"pointer"}}>Editar</button>
                    </div>
                    {editCat===cat.id&&(
                      <div style={{background:"#3A3A3C",borderRadius:14,padding:"12px",marginBottom:10}}>
                        <input value={editCatD.label||""} onChange={e=>setEditCatD(p=>({...p,label:e.target.value}))} style={{width:"100%",padding:"8px 12px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:14,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
                        <button onClick={()=>setShowEmoji(p=>!p)} style={{padding:"6px 12px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#fff",fontSize:12,cursor:"pointer",marginBottom:8}}>
                          Emoji: {editCatD.emoji}
                        </button>
                        {showEmoji&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,maxHeight:110,overflowY:"auto",marginBottom:8}}>
                            {EMOJIS.map(em=>(
                              <button key={em} onClick={()=>{setEditCatD(p=>({...p,emoji:em}));setShowEmoji(false);}} style={{fontSize:20,background:"none",border:"none",cursor:"pointer",padding:"2px"}}>{em}</button>
                            ))}
                          </div>
                        )}
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                          {CAT_COLORS.map(c=>(
                            <button key={c} onClick={()=>setEditCatD(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:8,background:c,border:editCatD.color===c?"2px solid #fff":"2px solid transparent",cursor:"pointer"}}/>
                          ))}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setCats(p=>p.map(c=>c.id===editCat?{...editCatD}:c));setEditCat(null);}} style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:T.accent,color:"#fff",fontWeight:700,cursor:"pointer"}}>Guardar</button>
                          <button onClick={()=>setEditCat(null)} style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:"#2C2C2E",color:"#8E8E93",cursor:"pointer"}}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}