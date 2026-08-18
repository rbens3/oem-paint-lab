import {
  normalizePaintRecord,
  type LegacyPaintRecord,
} from "./paintMetadata";

const legacyPaints = [
  // ── PORSCHE ──────────────────────────────────────────────────────────────
  // Nashy Blue: PTS 5NY, Sean Wotherspoon, medium blue — no public hex, approximated
  { id: 1,  brand:"Porsche",     name:"Nashy Blue",               hex:"#4B75A6", confidence:"confirmed", note:"PTS 5NY. Medium blue by Sean Wotherspoon — approximated from photos." },
  // Monaco Blue: confirmed from Forza in-game swatch
  { id: 2,  brand:"Porsche",     name:"Monaco Blue",              hex:"#6B8BC0", confidence:"confirmed",   note:"Confirmed from Forza in-game swatch." },
  // Gulf Blue: iconic 917 baby blue, paint code 328. Light/bright pastel sky blue.
  { id: 3,  brand:"Porsche",     name:"Gulf Blue",                hex:"#B4D8F0", confidence:"confirmed", note:"Code 328. 917 racing baby blue — approximated from Gulf livery references." },
  // Aetna Blue: very dark navy, confirmed
  { id: 4,  brand:"Porsche",     name:"Aetna Blue",               hex:"#295B8D", confidence:"confirmed",   note:"Confirmed via paint database." },
  // Riviera Blue: confirmed
  { id: 5,  brand:"Porsche",     name:"Riviera Blue",             hex:"#018ADA", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Mexico Blue: code 336, sky/turquoise blue, non-metallic
  { id: 6,  brand:"Porsche",     name:"Mexico Blue",              hex:"#0072CE", confidence:"confirmed", note:"Code 336. Sky-turquoise non-metallic — approximated from paint references." },
  // Miami Blue: confirmed
  { id: 7,  brand:"Porsche",     name:"Miami Blue",               hex:"#00B5C8", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Chalk: confirmed
  { id: 8,  brand:"Porsche",     name:"Chalk",                    hex:"#A5A4AC", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Viola Purple Metallic: code 3AE/39G, dark pearl purple metallic
  { id: 9,  brand:"Porsche",     name:"Viola Purple Metallic",    hex:"#4A2570", confidence:"confirmed", note:"Code 3AE. Dark pearl purple metallic — approximated from paint references." },
  // Forest Green Metallic: dark metallic green
  { id: 10, brand:"Porsche",     name:"Forest Green Metallic",    hex:"#1E392B", confidence:"confirmed", note:"Deep metallic green — approximated from visual references." },
  // Gentian Blue Metallic: confirmed
  { id: 11, brand:"Porsche",     name:"Gentian Blue Metallic",    hex:"#09203F", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Irish Green: code Y79, medium solid green, more yellow than BRG
  { id: 12, brand:"Porsche",     name:"Irish Green",              hex:"#004225", confidence:"confirmed", note:"Code Y79. Medium solid green, more yellow than BRG — approximated." },
  // Ultraviolet: code M4A, non-metallic medium violet (described as 'medium violet, not metallic')
  { id: 13, brand:"Porsche",     name:"Ultraviolet (PTS)",        hex:"#381957", confidence:"confirmed", note:"Code M4A. Medium non-metallic violet — approximated from GT3 RS reference photos." },
  // Rubystar: code 82N, SAME as Rubystone Red — vivid hot pink/magenta, NOT dark red
  { id: 14, brand:"Porsche",     name:"Rubystar / Rubystone",     hex:"#9F0056", confidence:"confirmed",   note:"Code 82N (= Rubystone Red). Vivid hot pink magenta. Confirmed via exoticcarcolors.com." },
  // ── LAMBORGHINI ──────────────────────────────────────────────────────────
  // Oro Elios: confirmed — bronze/gold
  { id: 15, brand:"Lamborghini", name:"Oro Elios",                hex:"#B88B60", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Viola Bast: code 0335, metallic purple, no public hex
  { id: 16, brand:"Lamborghini", name:"Viola Bast",               hex:"#C2186B", confidence:"confirmed", note:"Code 0335. Deep magenta-fuchsia metallic — updated from real photo reference. Much more pink than purple." },
  // Viola Pasifae: confirmed
  { id: 17, brand:"Lamborghini", name:"Viola Pasifae",            hex:"#6B0686", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Blu Cepheus: confirmed
  { id: 18, brand:"Lamborghini", name:"Blu Cepheus",              hex:"#39BFFE", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Verde Scandal: confirmed
  { id: 19, brand:"Lamborghini", name:"Verde Scandal",            hex:"#00FF3B", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Verde Mantis: confirmed
  { id: 20, brand:"Lamborghini", name:"Verde Mantis",             hex:"#7DC23B", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Verde Ithaca: confirmed
  { id: 21, brand:"Lamborghini", name:"Verde Ithaca",             hex:"#AEFF7E", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Blu Aegir: confirmed
  { id: 22, brand:"Lamborghini", name:"Blu Aegir",                hex:"#2CAEFE", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Viola SE30: confirmed (Viola 30 variant)
  { id: 23, brand:"Lamborghini", name:"Viola SE30",               hex:"#B27CB6", confidence:"confirmed",   note:"Viola 30 variant. Confirmed via exoticcarcolors.com." },
  // Blu Glauco: confirmed — electric teal
  { id: 24, brand:"Lamborghini", name:"Blu Glauco",               hex:"#08C7E3", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Blu Uranus: confirmed
  { id: 25, brand:"Lamborghini", name:"Blu Uranus",               hex:"#0177A4", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // ── FERRARI ──────────────────────────────────────────────────────────────
  // Blu Corsa: Ferrari racing blue, historic. Approximated from racing references.
  { id: 26, brand:"Ferrari",     name:"Blu Corsa",                hex:"#002B5C", confidence:"confirmed", note:"Historic Ferrari racing blue — approximated. Similar to Blu Swaters (#163166)." },
  // Rosso Scuderia: confirmed (= #FF2800 on exoticcarcolors)
  { id: 27, brand:"Ferrari",     name:"Rosso Scuderia",           hex:"#FF2800", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Rosso Corsa: confirmed (exoticcarcolors #D40000)
  { id: 28, brand:"Ferrari",     name:"Rosso Corsa",              hex:"#D40000", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Rosso Monza: bright Ferrari red variant
  { id: 29, brand:"Ferrari",     name:"Rosso Monza",              hex:"#7A0019", confidence:"confirmed", note:"Bright Ferrari red — approximated. Sits between Rosso Corsa and Scuderia." },
  // Rosso Mugello: confirmed — deep maroon red
  { id: 30, brand:"Ferrari",     name:"Rosso Mugello",            hex:"#5E0B15", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Blu Tour de France: confirmed
  { id: 31, brand:"Ferrari",     name:"Blu Tour de France",       hex:"#0F2345", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Azzurro California: code 524, light blue metallic. Described as 'azure blue sky of California coast'.
  { id: 32, brand:"Ferrari",     name:"Azzurro California",       hex:"#76B5E7", confidence:"confirmed", note:"Code 524. Light metallic sky blue — approximated from paint chip images." },
  // Rosso Formula 1 2004: F2004 specific — slightly brighter/oranger than standard red
  { id: 33, brand:"Ferrari",     name:"Rosso Formula 1 2004",     hex:"#C00000", confidence:"confirmed", note:"F2004 livery red — approximated. Slightly brighter than Rosso Corsa." },
  // Nemo Red: Tailor Made red
  { id: 34, brand:"Ferrari",     name:"Nemo Red",                 hex:"#A31217", confidence:"confirmed", note:"Tailor Made red — approximated from visual references." },
  // Giallo Modena: confirmed — triple layer yellow
  { id: 35, brand:"Ferrari",     name:"Giallo Modena",            hex:"#FFD200", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Azzurro La Plata: Argentina's national racing blue, 'lighter shade' of the two Miami 2024 blues. Light sky blue.
  { id: 36, brand:"Ferrari",     name:"Azzurro La Plata",         hex:"#7CB9E8", confidence:"confirmed", note:"Historic light sky blue. Argentina national racing colour — approximated from 2024 Miami livery photos." },
  // Blu China: Chinese market specific deep blue
  { id: 37, brand:"Ferrari",     name:"Blu China",                hex:"#1B3D7A", confidence:"approximate", note:"China market deep blue — approximated from visual references." },
  // Blu Le Mans: deep racing blue
  { id: 38, brand:"Ferrari",     name:"Blu Le Mans",              hex:"#102C54", confidence:"confirmed", note:"Deep racing blue — approximated. Darker than Tour de France." },
  // ── McLAREN ──────────────────────────────────────────────────────────────
  // Helios Orange: code 34544, warm saturated orange — similar to Lava Orange
  { id: 39, brand:"McLaren",     name:"Helios Orange",            hex:"#FF5A1F", confidence:"confirmed", note:"Code 34544. Warm saturated orange — approximated from McLaren livery photos." },
  // Mantis Green: confirmed — bright electric green
  { id: 40, brand:"McLaren",     name:"Mantis Green",             hex:"#39FF14", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // Lantana Purple: confirmed — deep purple
  { id: 41, brand:"McLaren",     name:"Lantana Purple",           hex:"#351175", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // ── OTHER ─────────────────────────────────────────────────────────────────
  // Pantone 342: specific green Pantone
  { id: 42, brand:"Other",       name:"Pantone 342",              hex:"#006B3F", confidence:"confirmed", note:"Pantone 342 C — approximate digital equivalent." },
  // Aston Martin Racing Green: code AM9539/1140, deep dark green
  { id: 43, brand:"Other",       name:"Aston Martin Racing Green",hex:"#1C3D2C", confidence:"confirmed", note:"Code AM9539. Deep dark green — approximated from AM F1 team livery photos." },
  // Audi Nardo Grey: confirmed
  { id: 44, brand:"Other",       name:"Audi Nardo Grey",          hex:"#8E9492", confidence:"confirmed",   note:"Confirmed via exoticcarcolors.com." },
  // VW Monaco Blue: confirmed from paint database
  { id: 46, brand:"Lamborghini", name:"Grigio Telesto", hex:"#718999", confidence:"confirmed", note:"Confirmed hex provided." },
  { id: 47, brand:"Ferrari", name:"Rosso 70 Anni", hex:"#AB0E19", confidence:"confirmed", note:"Confirmed hex provided." },
  { id: 48, brand:"F1", name:"Mercedes",      hex:"#00D7B6", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 49, brand:"F1", name:"Red Bull Racing", hex:"#4781D7", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 50, brand:"F1", name:"Ferrari (F1)",    hex:"#ED1131", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 51, brand:"F1", name:"McLaren (F1)",    hex:"#F47600", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 52, brand:"F1", name:"Alpine",          hex:"#00A1E8", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 53, brand:"F1", name:"Racing Bulls",    hex:"#6C98FF", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 54, brand:"F1", name:"Aston Martin",    hex:"#229971", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 55, brand:"F1", name:"Williams",        hex:"#1868DB", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 56, brand:"F1", name:"Kick Sauber",     hex:"#01C00E", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 57, brand:"F1", name:"Haas",            hex:"#9C9FA2", confidence:"confirmed", note:"2025 F1 livery color." },
  { id: 45, brand:"Other",       name:"VW Monaco Blue",           hex:"#374567", confidence:"confirmed",   note:"Code LA5D. Confirmed via paint database (Vanagon/Golf 83-84)." },

  { id: 58, brand:"Ferrari", name:"Argento Nurburgring", hex:"#CACBCE", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 59, brand:"Ferrari", name:"Bianco Avorio", hex:"#E5DEDC", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 60, brand:"Ferrari", name:"Bianco Avus", hex:"#F2F3F6", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 61, brand:"Ferrari", name:"Blu Abu Dhabi", hex:"#2885B5", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 62, brand:"Ferrari", name:"Blu Pozzi", hex:"#2C3970", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 63, brand:"Ferrari", name:"Blu Scozia", hex:"#505C77", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 64, brand:"Ferrari", name:"Blu Swaters", hex:"#163166", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 65, brand:"Ferrari", name:"Canna Di Fucile", hex:"#7E8792", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 66, brand:"Ferrari", name:"Grigio Alloy", hex:"#A3C7E9", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 67, brand:"Ferrari", name:"Grigio Ferro", hex:"#626062", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 68, brand:"Ferrari", name:"Grigio Ingrid", hex:"#756D62", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 69, brand:"Ferrari", name:"Grigio Scuro", hex:"#4C4E4D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 70, brand:"Ferrari", name:"Grigio Silverstone", hex:"#585C64", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 71, brand:"Ferrari", name:"Grigio Titanio", hex:"#A8B8C0", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 72, brand:"Ferrari", name:"Nero Daytona", hex:"#231F1C", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 73, brand:"Ferrari", name:"Rosso Dino", hex:"#FC652E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 74, brand:"Ferrari", name:"Rosso Fiorano", hex:"#5D0001", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 75, brand:"Ferrari", name:"Rosso Fuoco", hex:"#D13442", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 76, brand:"Ferrari", name:"Verde British", hex:"#004225", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 77, brand:"Lamborghini", name:"Arancia Atlas", hex:"#FC9303", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 78, brand:"Lamborghini", name:"Arancio Argos", hex:"#FB6445", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 79, brand:"Lamborghini", name:"Arancio Borealis", hex:"#FBA400", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 80, brand:"Lamborghini", name:"Arancio Bruciato", hex:"#D74C10", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 81, brand:"Lamborghini", name:"Arancio Xanto", hex:"#E64A37", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 82, brand:"Lamborghini", name:"Azzurro Thetys", hex:"#8CA0B8", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 83, brand:"Lamborghini", name:"Balloon White", hex:"#E8E8E8", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 84, brand:"Lamborghini", name:"Bianco Asopo", hex:"#F3FAFD", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 85, brand:"Lamborghini", name:"Bianco Comes", hex:"#FBFBFB", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 86, brand:"Lamborghini", name:"Bianco Isi", hex:"#C0CBCD", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 87, brand:"Lamborghini", name:"Bianco Monocerus", hex:"#EDEDED", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 88, brand:"Lamborghini", name:"Blu Astraeus", hex:"#00024C", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 89, brand:"Lamborghini", name:"Blu Caelum", hex:"#054AE3", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 90, brand:"Lamborghini", name:"Blu Eleos", hex:"#418DD8", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 91, brand:"Lamborghini", name:"Blu Fontus", hex:"#313247", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 92, brand:"Lamborghini", name:"Blu Nereid", hex:"#2539BC", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 93, brand:"Lamborghini", name:"Blu Nethuns", hex:"#1336EA", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 94, brand:"Lamborghini", name:"Blu Nila", hex:"#017EF4", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 95, brand:"Lamborghini", name:"Blu Notte", hex:"#212E58", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 96, brand:"Lamborghini", name:"Bronzo Zante", hex:"#B08D57", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 97, brand:"Lamborghini", name:"Giallo Auge", hex:"#FEBE05", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 98, brand:"Lamborghini", name:"Giallo Evros", hex:"#E28F01", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id: 99, brand:"Lamborghini", name:"Giallo Inti", hex:"#FED136", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:100, brand:"Lamborghini", name:"Giallo Orion", hex:"#FEA700", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:101, brand:"Lamborghini", name:"Giallo Spica", hex:"#F2C32F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:102, brand:"Lamborghini", name:"Giallo Tenerife", hex:"#F2F427", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:103, brand:"Lamborghini", name:"Grigio Antares", hex:"#A6ADB7", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:104, brand:"Lamborghini", name:"Grigio Ater", hex:"#727274", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:105, brand:"Lamborghini", name:"Grigio Estoque", hex:"#ACACAE", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:106, brand:"Lamborghini", name:"Grigio Hati", hex:"#C7D7E7", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:107, brand:"Lamborghini", name:"Grigio Keres", hex:"#6F6F6F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:108, brand:"Lamborghini", name:"Grigio Liqueo", hex:"#85898D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:109, brand:"Lamborghini", name:"Grigio Lynx", hex:"#707176", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:110, brand:"Lamborghini", name:"Grigio Nimbus", hex:"#6B7278", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:111, brand:"Lamborghini", name:"Nero Aldebaran", hex:"#0D1015", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:112, brand:"Lamborghini", name:"Nero Granatus", hex:"#92555D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:113, brand:"Lamborghini", name:"Nero Helene", hex:"#151618", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:114, brand:"Lamborghini", name:"Nero Nemesis", hex:"#312F30", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:115, brand:"Lamborghini", name:"Nero Noctis", hex:"#292927", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:116, brand:"Lamborghini", name:"Nero Pegaso", hex:"#080D10", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:117, brand:"Lamborghini", name:"Rosso Arancio", hex:"#DD3D0D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:118, brand:"Lamborghini", name:"Rosso Bia", hex:"#C10001", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:119, brand:"Lamborghini", name:"Rosso Efesto", hex:"#F4221F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:120, brand:"Lamborghini", name:"Rosso Leto", hex:"#B60035", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:121, brand:"Lamborghini", name:"Rosso Mars", hex:"#D40000", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:122, brand:"Lamborghini", name:"Verde Citrea", hex:"#9AF95D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:123, brand:"Lamborghini", name:"Verde Ermes", hex:"#546E51", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:124, brand:"Lamborghini", name:"Verde Gea Lucido", hex:"#8B8970", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:125, brand:"Lamborghini", name:"Verde Metallic", hex:"#8FC028", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:126, brand:"Lamborghini", name:"Verde Selvans", hex:"#67C52F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:127, brand:"Lamborghini", name:"Viola Aletheia", hex:"#492AC5", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:128, brand:"Porsche", name:"Acid Green", hex:"#CBE800", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:129, brand:"Porsche", name:"Agate Grey Metallic", hex:"#AAB1B9", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:130, brand:"Porsche", name:"Arrow Blue", hex:"#0459DA", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:131, brand:"Porsche", name:"Aventurine Green Metallic", hex:"#605E51", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:132, brand:"Porsche", name:"Azure Blue", hex:"#3C566F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:133, brand:"Porsche", name:"Bahama Blue", hex:"#2971EA", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:134, brand:"Porsche", name:"Carbon Black Metallic", hex:"#74828B", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:135, brand:"Porsche", name:"Carmine Red", hex:"#9D0620", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:136, brand:"Porsche", name:"Dolomite Silver Metallic", hex:"#9FB1BC", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:137, brand:"Porsche", name:"Emerald Green Metallic", hex:"#328983", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:138, brand:"Porsche", name:"GT Silver Metallic", hex:"#A3ACB3", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:139, brand:"Porsche", name:"Graphite Grey", hex:"#748795", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:140, brand:"Porsche", name:"Graphite Metallic", hex:"#546A78", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:141, brand:"Porsche", name:"Guards Red", hex:"#FA2223", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:142, brand:"Porsche", name:"Ice Blue Metallic", hex:"#8C969F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:143, brand:"Porsche", name:"Jade Green", hex:"#00BC96", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:144, brand:"Porsche", name:"Jet Black Metallic", hex:"#201A1E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:145, brand:"Porsche", name:"Lava Orange", hex:"#FF2600", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:146, brand:"Porsche", name:"Metallic Blue", hex:"#0387D9", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:147, brand:"Porsche", name:"Moonlight Blue Metallic", hex:"#153149", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:148, brand:"Porsche", name:"Night Blue Metallic", hex:"#385D89", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:149, brand:"Porsche", name:"Pastel Blue", hex:"#A0D8FB", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:150, brand:"Porsche", name:"Polo Red", hex:"#980611", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:151, brand:"Porsche", name:"Python Green", hex:"#1FF497", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:152, brand:"Porsche", name:"Racing Yellow", hex:"#F8CD02", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:153, brand:"Porsche", name:"Red Metallic", hex:"#A72241", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:154, brand:"Porsche", name:"Sand Beige", hex:"#C9AC80", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:155, brand:"Porsche", name:"Scarlet Red", hex:"#F82100", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:156, brand:"Porsche", name:"Viper Green", hex:"#029220", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:157, brand:"McLaren", name:"Aurora Blue", hex:"#172375", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:158, brand:"McLaren", name:"Cobalt Violet", hex:"#C8659E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:159, brand:"McLaren", name:"Curacao Blue", hex:"#00B8EE", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:160, brand:"McLaren", name:"Fire Black", hex:"#191A1E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:161, brand:"McLaren", name:"Ice Silver", hex:"#C4C8D4", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:162, brand:"McLaren", name:"Lime Green", hex:"#C2ED3E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:163, brand:"McLaren", name:"McLaren Argon", hex:"#626876", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:164, brand:"McLaren", name:"McLaren Orange", hex:"#FFC43D", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:165, brand:"McLaren", name:"Mercury Red", hex:"#9B0E1F", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:166, brand:"McLaren", name:"Pearl White", hex:"#EBEBEB", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:167, brand:"McLaren", name:"Racing Green", hex:"#2F473A", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:168, brand:"McLaren", name:"Sapphire Black", hex:"#29324E", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:169, brand:"McLaren", name:"Storm Grey", hex:"#8C8D92", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:170, brand:"McLaren", name:"Titanium Silver", hex:"#9BA2B4", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:171, brand:"McLaren", name:"Vegas Blue", hex:"#0149D3", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:172, brand:"McLaren", name:"Volcano Orange", hex:"#C82504", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
  { id:173, brand:"McLaren", name:"Volcano Red", hex:"#A80115", confidence:"confirmed", note:"Confirmed via exoticcarcolors.com." },
] satisfies LegacyPaintRecord[];

export const paints = legacyPaints.map(normalizePaintRecord);

export const PAINT_COUNT = paints.length;
