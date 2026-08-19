import { useCallback, useState } from "react";
import { paints } from "../data/paints";
import { forzaHSBtoHex, hexToRGB, rgbToForzaHSB } from "../lib/color";
import { FLAKE_TYPES, getFlake } from "../lib/finishes";
import {
  PAINT_BRANDS,
  type FlakeType,
  type HsbColor,
  type PaintBrand,
  type PaintConfidence,
  type PaintRecord,
} from "../types";

interface CopyButtonProps {
  text: string;
}

interface HsbRowProps {
  label: string;
  value: number;
  accent: string;
}

interface FlakePanelProps {
  forza: HsbColor;
  accent: string;
}

interface ColorCardProps {
  color: EditablePaintRecord;
  onHexChange: (id: number, hex: EditablePaintRecord["hex"]) => void;
}

type EditablePaintRecord = Omit<PaintRecord, "hex"> & {
  hex: PaintRecord["hex"] | "";
};

interface BrandStyle {
  accent: string;
  label: string;
}

const BRAND_STYLES: Record<PaintBrand, BrandStyle> = {
  Porsche: { accent: "#C41E3A", label: "PORSCHE" },
  Lamborghini: { accent: "#D4A017", label: "LAMBORGHINI" },
  Ferrari: { accent: "#EF1A2D", label: "FERRARI" },
  McLaren: { accent: "#FF8000", label: "McLAREN" },
  Other: { accent: "#7C7C7C", label: "OTHER" },
  F1: { accent: "#E10600", label: "FORMULA 1" },
};

const CONFIDENCE_STYLES: Record<
  PaintConfidence,
  { color: string; label: string; bg: string }
> = {
  reference: { color: "#60a5fa", label: "REFERENCE", bg: "#60a5fa18" },
  estimated: { color: "#f59e0b", label: "~ ESTIMATED", bg: "#f59e0b18" },
};

function CopyBtn({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1200); }}
      style={{ background:copied?"#22c55e22":"#ffffff10", border:"1px solid "+(copied?"#22c55e":"#ffffff20"),
        borderRadius:4, color:copied?"#22c55e":"#aaa", fontSize:10, padding:"2px 6px",
        cursor:"pointer", transition:"all 0.2s", fontFamily:"monospace" }}>
      {copied?"✓":"copy"}
    </button>
  );
}

function HSBRow({ label, value, accent }: HsbRowProps) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:10, color:accent, fontFamily:"monospace", fontWeight:700, width:12 }}>{label}</span>
      <span style={{ fontSize:13, color:"#e8e8e8", fontFamily:"monospace", fontWeight:600, letterSpacing:"0.05em", flex:1 }}>{value.toFixed(3)}</span>
      <CopyBtn text={value.toFixed(3)} />
    </div>
  );
}

function FlakePanel({ forza, accent }: FlakePanelProps) {
  const [flakeType, setFlakeType] = useState<FlakeType>("silver");
  const flake = getFlake(forza.h, forza.s, forza.b, flakeType);
  const flakeHex = forzaHSBtoHex(flake.h, flake.s, flake.b);
  return (
    <div style={{ borderTop:"1px solid #ffffff0a", padding:"10px 14px", background:"#0a0a0a" }}>
      <div style={{ fontSize:10, color:accent, fontFamily:"monospace", fontWeight:700, letterSpacing:"0.15em", marginBottom:8 }}>FLAKE CALCULATOR</div>
      <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
        {FLAKE_TYPES.map(ft => (
          <button key={ft.id} onClick={() => setFlakeType(ft.id)} title={ft.desc}
            style={{ background:flakeType===ft.id?accent+"33":"#ffffff08", border:"1px solid "+(flakeType===ft.id?accent+"66":"#333"),
              borderRadius:4, color:flakeType===ft.id?accent:"#666", fontSize:10, padding:"3px 8px",
              cursor:"pointer", fontFamily:"monospace", transition:"all 0.15s" }}>
            {ft.label}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:4, background:forzaHSBtoHex(forza.h, forza.s, forza.b),
            border:"1px solid #ffffff20", position:"relative" }}>
            <div style={{ position:"absolute", bottom:0, right:0, width:16, height:16,
              borderRadius:"3px 0 4px 0", background:flakeHex, border:"1px solid #ffffff30" }} />
          </div>
          <div style={{ fontSize:9, color:"#444", fontFamily:"monospace", textAlign:"center" }}>B+F</div>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:2 }}>
          <div style={{ fontSize:10, color:"#555", fontFamily:"monospace", marginBottom:2 }}>FLAKE COLOR</div>
          <HSBRow label="H" value={flake.h} accent="#888" />
          <HSBRow label="S" value={flake.s} accent="#888" />
          <HSBRow label="B" value={flake.b} accent="#888" />
        </div>
      </div>
      <div style={{ fontSize:9, color:"#333", fontFamily:"monospace", marginTop:8, fontStyle:"italic" }}>
        {FLAKE_TYPES.find(f=>f.id===flakeType)?.desc} · adjust to taste in-game
      </div>
    </div>
  );
}

function ColorCard({ color, onHexChange }: ColorCardProps) {
  const [editing, setEditing] = useState(false);
  const [showFlake, setShowFlake] = useState(false);
  const rgb = color.hex ? hexToRGB(color.hex) : null;
  const forza = rgb ? rgbToForzaHSB(rgb.r, rgb.g, rgb.b) : null;
  const filled = !!color.hex && !!forza;
  const brand = BRAND_STYLES[color.brand];
  const conf = CONFIDENCE_STYLES[color.confidence] || CONFIDENCE_STYLES.estimated;

  return (
    <div style={{ background:"#161616", borderRadius:10, overflow:"hidden", border:"1px solid #ffffff15", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"stretch", minHeight:76 }}>
        <div style={{ width:52, flexShrink:0, background:filled?color.hex:"#1f1f1f", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {!filled && <span style={{color:"#333",fontSize:18}}>?</span>}
        </div>
        <div style={{ flex:1, padding:"9px 12px", minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#f0f0f0", fontFamily:"'Georgia',serif" }}>{color.name}</span>
            <span style={{ fontSize:9, background:conf.bg, color:conf.color, borderRadius:3, padding:"1px 5px", fontFamily:"monospace", flexShrink:0 }}>{conf.label}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#444", fontSize:12, fontFamily:"monospace" }}>#</span>
            {editing ? (
              <input autoFocus type="text" defaultValue={color.hex.replace("#","")}
                onBlur={(event) => {
                  const value = event.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                  const hex: EditablePaintRecord["hex"] = value ? `#${value}` : "";
                  onHexChange(color.id, hex);
                  setEditing(false);
                }}
                onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape") e.currentTarget.blur();}}
                style={{ background:"#0a0a0a", border:"1px solid "+brand.accent, borderRadius:4, color:"#e0e0e0", fontSize:12, fontFamily:"monospace", outline:"none", width:120, padding:"2px 6px" }} />
            ) : (
              <button onClick={()=>setEditing(true)}
                style={{ background:"transparent", border:"none", borderBottom:"1px solid #333", color:color.hex?"#ccc":"#444", fontSize:12, fontFamily:"monospace", padding:"2px 0", cursor:"pointer", width:120, textAlign:"left" }}>
                {color.hex ? color.hex.replace("#","") : "click to edit"}
              </button>
            )}
            {color.hex && <CopyBtn text={color.hex} />}
          </div>
          <div style={{ fontSize:10, color:"#444", marginTop:3, fontStyle:"italic" }}>{color.note}</div>
        </div>
        {filled && forza && (
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"center", gap:2, padding:"10px 10px 10px 14px", borderLeft:"1px solid #ffffff0a", minWidth:155, background:"#0d0d0d" }}>
            <HSBRow label="H" value={forza.h} accent={brand.accent} />
            <HSBRow label="S" value={forza.s} accent={brand.accent} />
            <HSBRow label="B" value={forza.b} accent={brand.accent} />
            <button onClick={()=>setShowFlake(p=>!p)}
              style={{ marginTop:6, background:showFlake?brand.accent+"22":"#ffffff08", border:"1px solid "+(showFlake?brand.accent+"55":"#333"),
                borderRadius:4, color:showFlake?brand.accent:"#555", fontSize:9, padding:"3px 6px",
                cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.1em", transition:"all 0.2s" }}>
              {showFlake ? "▲ FLAKE" : "▼ FLAKE"}
            </button>
          </div>
        )}
      </div>
      {filled && forza && showFlake && <FlakePanel forza={forza} accent={brand.accent} />}
    </div>
  );
}

export default function ForzaConverter() {
  const [colors, setColors] = useState<EditablePaintRecord[]>(paints);
  const [activeBrand, setActiveBrand] = useState<PaintBrand | "All">("All");
  const [search, setSearch] = useState("");
  const [customHex, setCustomHex] = useState("");
  const [customForza, setCustomForza] = useState<HsbColor | null>(null);
  const [showCustomFlake, setShowCustomFlake] = useState(false);
  const [customFlakeType, setCustomFlakeType] = useState<FlakeType>("silver");

  const handleHexChange = useCallback((id: number, hex: EditablePaintRecord["hex"]) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, hex } : c));
  }, []);

  const handleCustomCalc = () => {
    const clean = customHex.replace(/[^0-9a-fA-F]/g,"");
    if (clean.length === 6) {
      const rgb = hexToRGB("#"+clean);
      if (rgb) setCustomForza(rgbToForzaHSB(rgb.r, rgb.g, rgb.b));
    }
  };

  const filtered = colors.filter(c => {
    const matchBrand = activeBrand === "All" || c.brand === activeBrand;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchSearch;
  });

  const reference = colors.filter(c=>c.confidence==="reference").length;
  const estimated = colors.filter(c=>c.confidence==="estimated").length;

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", fontFamily:"'Georgia',serif", color:"#e0e0e0" }}>
      <div style={{ padding:"24px 24px 0", borderBottom:"1px solid #1a1a1a" }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", color:"#555", fontFamily:"monospace", marginBottom:4 }}>FORZA HORIZON 6</div>
        <h1 style={{ margin:"0 0 8px", fontSize:24, fontWeight:700, color:"#f8f8f8", letterSpacing:"-0.02em" }}>Paint Color Converter</h1>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:14 }}>
          <div style={{ background:"#60a5fa18", border:"1px solid #60a5fa33", borderRadius:6, padding:"4px 12px", fontSize:11, color:"#60a5fa", fontFamily:"monospace" }}>{reference} REFERENCE</div>
          <div style={{ background:"#f59e0b18", border:"1px solid #f59e0b33", borderRadius:6, padding:"4px 12px", fontSize:11, color:"#f59e0b", fontFamily:"monospace" }}>~ {estimated} ESTIMATED</div>
          <div style={{ fontSize:11, color:"#444", fontFamily:"monospace", alignSelf:"center" }}>H=hue°÷360 · S=sat%÷100 · B=val%÷100 · ▼ FLAKE for metallic layers</div>
        </div>

        {/* Quick converter */}
        <div style={{ background:"#111", border:"1px solid #222", borderRadius:8, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#555", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:8 }}>QUICK CONVERTER — any hex code</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ color:"#444", fontFamily:"monospace" }}>#</span>
            <input type="text" placeholder="e.g. 6B8BC0" value={customHex}
              onChange={e=>{ setCustomHex(e.target.value.replace(/[^0-9a-fA-F]/g,"").slice(0,6)); setCustomForza(null); }}
              onKeyDown={e=>{ if(e.key==="Enter") handleCustomCalc(); }}
              style={{ background:"#0a0a0a", border:"1px solid #333", borderRadius:6, color:"#e0e0e0", fontSize:13, fontFamily:"monospace", outline:"none", width:120, padding:"4px 8px" }} />
            <button onClick={handleCustomCalc}
              style={{ background:"#ffffff15", border:"1px solid #333", borderRadius:6, color:"#ccc", fontSize:11, padding:"4px 14px", cursor:"pointer", fontFamily:"monospace" }}>
              Convert
            </button>
            {customHex.length===6 && <div style={{ width:28, height:28, borderRadius:4, background:"#"+customHex, border:"1px solid #ffffff20", flexShrink:0 }} />}
          </div>
          {customForza && (
            <div style={{ marginTop:10 }}>
              <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                {[{l:"H",v:customForza.h},{l:"S",v:customForza.s},{l:"B",v:customForza.b}].map(({l,v})=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:"#888", fontFamily:"monospace", fontWeight:700 }}>{l}</span>
                    <span style={{ fontSize:15, color:"#f0f0f0", fontFamily:"monospace", fontWeight:600 }}>{v.toFixed(3)}</span>
                    <CopyBtn text={v.toFixed(3)} />
                  </div>
                ))}
                <button onClick={()=>setShowCustomFlake(p=>!p)}
                  style={{ background:showCustomFlake?"#ffffff22":"#ffffff08", border:"1px solid "+(showCustomFlake?"#ffffff55":"#333"),
                    borderRadius:4, color:showCustomFlake?"#ddd":"#555", fontSize:10, padding:"3px 10px", cursor:"pointer", fontFamily:"monospace" }}>
                  {showCustomFlake?"▲ FLAKE":"▼ FLAKE"}
                </button>
              </div>
              {showCustomFlake && (
                <div style={{ marginTop:10, borderTop:"1px solid #222", paddingTop:10 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:8, flexWrap:"wrap" }}>
                    {FLAKE_TYPES.map(ft=>(
                      <button key={ft.id} onClick={()=>setCustomFlakeType(ft.id)} title={ft.desc}
                        style={{ background:customFlakeType===ft.id?"#ffffff22":"#ffffff08", border:"1px solid "+(customFlakeType===ft.id?"#ffffff55":"#333"),
                          borderRadius:4, color:customFlakeType===ft.id?"#ddd":"#555", fontSize:10, padding:"3px 8px", cursor:"pointer", fontFamily:"monospace" }}>
                        {ft.label}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const fl = getFlake(customForza.h, customForza.s, customForza.b, customFlakeType);
                    return (
                      <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <div style={{ width:24, height:24, borderRadius:3, background:"#"+customHex, border:"1px solid #333" }}/>
                          <span style={{ color:"#333", fontSize:12 }}>+</span>
                          <div style={{ width:24, height:24, borderRadius:3, background:forzaHSBtoHex(fl.h,fl.s,fl.b), border:"1px solid #333" }}/>
                        </div>
                        {[{l:"H",v:fl.h},{l:"S",v:fl.s},{l:"B",v:fl.b}].map(({l,v})=>(
                          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontSize:10, color:"#666", fontFamily:"monospace", fontWeight:700 }}>{l}</span>
                            <span style={{ fontSize:13, color:"#ccc", fontFamily:"monospace" }}>{v.toFixed(3)}</span>
                            <CopyBtn text={v.toFixed(3)} />
                          </div>
                        ))}
                        <span style={{ fontSize:10, color:"#444", fontFamily:"monospace", fontStyle:"italic" }}>{FLAKE_TYPES.find(f=>f.id===customFlakeType)?.desc}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0 0", flexWrap:"wrap" }}>
          {(["All", ...PAINT_BRANDS] as const).map(brand=>(
            <button key={brand} onClick={()=>setActiveBrand(brand)}
              style={{ background:activeBrand===brand?(brand==="All"?"#ffffff15":BRAND_STYLES[brand]?.accent+"22"):"transparent",
                border:"1px solid "+(activeBrand===brand?(brand==="All"?"#ffffff30":BRAND_STYLES[brand]?.accent+"66"):"#222"),
                borderRadius:6, color:activeBrand===brand?(brand==="All"?"#ddd":BRAND_STYLES[brand]?.accent):"#555",
                fontSize:11, padding:"4px 12px", cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.05em", transition:"all 0.2s" }}>
              {brand==="All"?`ALL (${colors.length})`:brand.toUpperCase()}
            </button>
          ))}
          <input type="text" placeholder="search..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ marginLeft:"auto", background:"#111", border:"1px solid #222", borderRadius:6, color:"#888", fontSize:12, padding:"4px 12px", outline:"none", fontFamily:"monospace", width:140 }} />
        </div>
      </div>

      <div style={{ padding:"18px 24px 40px" }}>
        {(activeBrand==="All"?PAINT_BRANDS:[activeBrand]).map(brand=>{
          const brandColors = filtered.filter(c=>c.brand===brand);
          if(!brandColors.length) return null;
          const bs = BRAND_STYLES[brand];
          return (
            <div key={brand} style={{ marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:3, height:16, background:bs.accent, borderRadius:2 }} />
                <span style={{ fontSize:11, letterSpacing:"0.2em", color:bs.accent, fontFamily:"monospace", fontWeight:700 }}>{bs.label}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(360px,1fr))", gap:8 }}>
                {brandColors.map(color=>(
                  <ColorCard key={color.id} color={color} onHexChange={handleHexChange} />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <div style={{ textAlign:"center", color:"#333", fontSize:14, padding:40 }}>No colors match.</div>}
      </div>

      <div style={{ borderTop:"1px solid #111", padding:"14px 24px", fontSize:11, color:"#333", fontFamily:"monospace", display:"flex", gap:28, flexWrap:"wrap" }}>
        <span>💡 Metallic = base color + flake. Hit ▼ FLAKE for suggestions</span>
        <span>💡 Rubystar is HOT PINK/MAGENTA — not red. Use solid finish, no flake.</span>
        <span>💡 Check all colors at midday in-game. Forza lighting shifts apparent tone.</span>
        <span>💡 Click any hex to override with your own value</span>
      </div>
    </div>
  );
}
