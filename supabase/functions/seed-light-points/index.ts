import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─────────────────────────────────────────────────────────────────────────────
// DATOS REALISTAS DE ILUMINACIÓN PÚBLICA DE BARCELONA
// Basado en el Plan de Alumbrado Público del Ajuntament de Barcelona y datos
// del portal Open Data Barcelona (opendata-ajuntament.barcelona.cat)
//
// Densidades reales aproximadas:
//   Avenidas principales (Diagonal, Gran Via, Pg. Gràcia) → 1 farola / 18-25 m
//   Calles secundarias del Eixample                       → 1 farola / 35-45 m
//   Calles residenciales / barrios                        → 1 farola / 60-80 m
//   Callejuelas / Barri Gòtic / Raval interior            → 1 farola / 100-150 m
// ─────────────────────────────────────────────────────────────────────────────

type LightPoint = {
  latitude: number;
  longitude: number;
  street_name: string;
  light_type: string;
  power_watts: number;
  district: string;
  neighborhood: string;
};

function generateBarcelonaLightPoints(): LightPoint[] {
  const points: LightPoint[] = [];

  // Metres per degree (approximate at lat 41.4°)
  const M_PER_LAT = 111_000;
  const M_PER_LON = 74_500;

  /** Add lamps along a straight segment between two coordinates */
  function seg(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    spacingM: number,
    street: string, type: string, watts: number,
    district: string, neighborhood: string,
  ) {
    const distM = Math.sqrt(
      ((lat2 - lat1) * M_PER_LAT) ** 2 +
      ((lon2 - lon1) * M_PER_LON) ** 2,
    );
    const n = Math.max(1, Math.round(distM / spacingM));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      points.push({
        latitude:  lat1 + (lat2 - lat1) * t,
        longitude: lon1 + (lon2 - lon1) * t,
        street_name: street,
        light_type: type,
        power_watts: watts,
        district,
        neighborhood,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRAN VIA DE LES CORTS CATALANES — 250 W LED, cada 22 m
  // Arteria principal E-O (lat constante ~41.387)
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3870,2.0950, 41.3870,2.2150, 22, "Gran Via de les Corts Catalanes","LED",250,"Eixample","Eixample");

  // ═══════════════════════════════════════════════════════════════════════════
  // AVINGUDA DIAGONAL — 250 W LED, cada 22 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.4150,2.0900, 41.4050,2.1200, 22, "Avinguda Diagonal","LED",250,"Les Corts","Les Corts");
  seg(41.4050,2.1200, 41.3950,2.1550, 22, "Avinguda Diagonal","LED",250,"Eixample","Eixample");
  seg(41.3950,2.1550, 41.3900,2.1800, 22, "Avinguda Diagonal","LED",250,"Eixample","Dreta de l'Eixample");
  seg(41.3900,2.1800, 41.3850,2.2000, 22, "Avinguda Diagonal","LED",250,"Sant Martí","Poblenou");

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSEIG DE GRÀCIA — 200 W LED, cada 16 m (boulevard icónico)
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3850,2.1650, 41.4050,2.1620, 16, "Passeig de Gràcia","LED",200,"Eixample","Dreta de l'Eixample");

  // ═══════════════════════════════════════════════════════════════════════════
  // RAMBLA DE CATALUNYA — 180 W LED, cada 16 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3850,2.1628, 41.4000,2.1600, 16, "Rambla de Catalunya","LED",180,"Eixample","Dreta de l'Eixample");

  // ═══════════════════════════════════════════════════════════════════════════
  // LA RAMBLA — 200 W LED, cada 18 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3740,2.1740, 41.3880,2.1720, 18, "La Rambla","LED",200,"Ciutat Vella","Barri Gòtic");

  // ═══════════════════════════════════════════════════════════════════════════
  // AVINGUDA DEL PARAL·LEL — 200 W LED, cada 20 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3690,2.1500, 41.3820,2.1750, 20, "Avinguda del Paral·lel","LED",200,"Sants-Montjuïc","Poble-sec");

  // ═══════════════════════════════════════════════════════════════════════════
  // AVINGUDA MERIDIANA — 250 W LED, cada 22 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3870,2.1800, 41.4400,2.1950, 22, "Avinguda Meridiana","LED",250,"Sant Martí","El Clot");

  // ═══════════════════════════════════════════════════════════════════════════
  // VIA LAIETANA — 200 W LED, cada 20 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3780,2.1760, 41.3875,2.1770, 20, "Via Laietana","LED",200,"Ciutat Vella","Barri Gòtic");

  // ═══════════════════════════════════════════════════════════════════════════
  // PASSEIG MARÍTIM — 200 W LED, cada 20 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3750,2.1780, 41.3780,2.1900, 20, "Passeig Marítim de la Barceloneta","LED",200,"Ciutat Vella","Barceloneta");
  seg(41.3780,2.1900, 41.3860,2.2050, 20, "Passeig Marítim de la Barceloneta","LED",200,"Sant Martí","Vila Olímpica");

  // ═══════════════════════════════════════════════════════════════════════════
  // RONDES — 180 W LED, cada 22 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3890,2.1600, 41.3890,2.1780, 22, "Ronda de Sant Pere","LED",180,"Eixample","Dreta de l'Eixample");
  seg(41.3820,2.1550, 41.3820,2.1680, 22, "Ronda de Sant Antoni","LED",180,"Eixample","Esquerra de l'Eixample");
  seg(41.3780,2.1480, 41.3870,2.1200, 22, "Ronda del Litoral","LED",180,"Sants-Montjuïc","Montjuïc");

  // ═══════════════════════════════════════════════════════════════════════════
  // CARRER D'ENRIC GRANADOS (superilla peatonal) — 120 W LED, cada 18 m
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3870,2.1565, 41.3975,2.1540, 18, "Carrer d'Enric Granados","LED",120,"Eixample","Esquerra de l'Eixample");

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLES E-O SECUNDARIAS DEL EIXAMPLE — 150 W LED, cada 38 m
  // ═══════════════════════════════════════════════════════════════════════════
  const ewSecondary: [number, string, string][] = [
    [41.4082, "Carrer de Provença",       "Esquerra de l'Eixample"],
    [41.3981, "Carrer de Mallorca",       "Dreta de l'Eixample"],
    [41.3935, "Carrer de València",       "Dreta de l'Eixample"],
    [41.3920, "Carrer de Consell de Cent","Eixample"],
    [41.3960, "Carrer de Rosselló",       "Dreta de l'Eixample"],
    [41.3975, "Carrer de Còrsega",        "Dreta de l'Eixample"],
    [41.4010, "Carrer de Còrsega",        "Dreta de l'Eixample"],
    [41.3850, "Carrer del Consell de Cent","Eixample"],
  ];
  for (const [lat, name, neigh] of ewSecondary) {
    seg(lat as number,2.1200, lat as number,2.1950, 38, name as string,"LED",150,"Eixample", neigh as string);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARRES N-S SECUNDARIS DEL EIXAMPLE — 150 W LED, cada 38 m
  // ═══════════════════════════════════════════════════════════════════════════
  const nsSecondary: [number, string, string, string][] = [
    [2.1527, "Carrer de Muntaner",  "Eixample", "Esquerra de l'Eixample"],
    [2.1601, "Carrer d'Urgell",     "Eixample", "Esquerra de l'Eixample"],
    [2.1501, "Carrer d'Entença",    "Eixample", "Esquerra de l'Eixample"],
    [2.1549, "Carrer de Borrell",   "Eixample", "Esquerra de l'Eixample"],
    [2.1560, "Carrer d'Aribau",     "Eixample", "Esquerra de l'Eixample"],
    [2.1577, "Carrer de Balmes",    "Eixample", "Eixample"],
    [2.1691, "Carrer de Bruc",      "Eixample", "Dreta de l'Eixample"],
    [2.1745, "Carrer de Girona",    "Eixample", "Dreta de l'Eixample"],
    [2.1800, "Carrer de Bailèn",    "Eixample", "Dreta de l'Eixample"],
  ];
  for (const [lon, name, dist, neigh] of nsSecondary) {
    seg(41.3820, lon as number, 41.4060, lon as number, 38, name as string,"LED",150, dist as string, neigh as string);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARRER DE VILAMARÍ i CALÀBRIA — 38 m (menys iluminats, paral·lels al Eixample
  // però secundaris → puntuació inferior en la ruta Zenit)
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3820,2.1455, 41.4020,2.1455, 55, "Carrer de Vilamarí","LED",100,"Eixample","Esquerra de l'Eixample");
  seg(41.3820,2.1407, 41.4020,2.1407, 55, "Carrer de Calàbria","LED",100,"Eixample","Esquerra de l'Eixample");

  // ═══════════════════════════════════════════════════════════════════════════
  // DISTRICTE DE SANTS
  // ═══════════════════════════════════════════════════════════════════════════
  // Carrer de Sants — comercial principal, 150 W / 35 m
  seg(41.3753,2.1260, 41.3760,2.1530, 35, "Carrer de Sants","LED",150,"Sants-Montjuïc","Sants");
  // Carrer de Tarragona — 150 W / 38 m (connexió Gran Via ↔ Sants)
  seg(41.3720,2.1440, 41.3900,2.1440, 38, "Carrer de Tarragona","LED",150,"Sants-Montjuïc","Hostafrancs");
  // Avinguda de Roma — diagonal 180 W / 30 m
  seg(41.3790,2.1350, 41.3880,2.1530, 30, "Avinguda de Roma","LED",180,"Sants-Montjuïc","Sants");
  // Carrer de la Creu Coberta — 150 W / 40 m
  seg(41.3740,2.1200, 41.3745,2.1400, 40, "Carrer de la Creu Coberta","LED",150,"Sants-Montjuïc","Sants");
  // Avinguda de Madrid (Les Corts / Sants) — 180 W / 32 m
  seg(41.3830,2.1100, 41.3830,2.1430, 32, "Avinguda de Madrid","LED",180,"Les Corts","Les Corts");
  // Carrer de Numància
  seg(41.3770,2.1160, 41.3900,2.1160, 40, "Carrer de Numància","LED",150,"Les Corts","Les Corts");

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAÇA D'ESPANYA — 250 W, agrupats en cercle
  // ═══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 2 * Math.PI;
    points.push({ latitude: 41.3751+0.0007*Math.sin(a), longitude: 2.1490+0.0009*Math.cos(a),
      street_name:"Plaça d'Espanya", light_type:"LED", power_watts:250,
      district:"Sants-Montjuïc", neighborhood:"Hostafrancs" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRÀCIA
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3990,2.1565, 41.4075,2.1495, 35, "Carrer Gran de Gràcia","LED",150,"Gràcia","Vila de Gràcia");
  seg(41.3998,2.1360, 41.3998,2.1700, 38, "Travessera de Gràcia","LED",150,"Gràcia","Vila de Gràcia");
  seg(41.4010,2.1350, 41.4010,2.1800, 38, "Carrer de Còrsega","LED",150,"Gràcia","Vila de Gràcia");
  // Via Augusta — 180 W / 32 m
  seg(41.3950,2.1480, 41.4150,2.1340, 32, "Via Augusta","LED",180,"Sarrià-Sant Gervasi","Sant Gervasi");
  // Carrer de Verdi — local, menys llum
  seg(41.4010,2.1572, 41.4120,2.1580, 60, "Carrer de Verdi","LED",100,"Gràcia","Vila de Gràcia");
  // Plaça del Sol
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 2 * Math.PI;
    points.push({ latitude:41.4017+0.0004*Math.sin(a), longitude:2.1568+0.0005*Math.cos(a),
      street_name:"Plaça del Sol", light_type:"LED", power_watts:120,
      district:"Gràcia", neighborhood:"Vila de Gràcia" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SARRIÀ - LES CORTS
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.4060,2.1150, 41.4060,2.1500, 38, "Passeig de la Bonanova","LED",180,"Sarrià-Sant Gervasi","Sarrià");
  seg(41.3880,2.1380, 41.4020,2.1250, 38, "Avinguda de Sarrià","LED",180,"Sarrià-Sant Gervasi","Les Tres Torres");
  seg(41.3870,2.1250, 41.3870,2.1400, 38, "Travessera de les Corts","LED",150,"Les Corts","Les Corts");

  // ═══════════════════════════════════════════════════════════════════════════
  // SANT MARTÍ / POBLENOU
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3950,2.1980, 41.4050,2.2020, 28, "Rambla del Poblenou","LED",180,"Sant Martí","Poblenou");
  seg(41.3990,2.1900, 41.4030,2.2150, 35, "Carrer de Pere IV","LED",150,"Sant Martí","Poblenou");
  // Glòries
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 2 * Math.PI;
    points.push({ latitude:41.4033+0.0007*Math.sin(a), longitude:2.1871+0.0011*Math.cos(a),
      street_name:"Plaça de les Glòries Catalanes", light_type:"LED", power_watts:250,
      district:"Sant Martí", neighborhood:"El Clot" });
  }
  seg(41.3890,2.1990, 41.3840,2.2010, 22, "Port Olímpic","LED",200,"Sant Martí","Vila Olímpica");
  seg(41.3870,2.1970, 41.3920,2.2060, 22, "Passeig Marítim Nova Icària","LED",200,"Sant Martí","Vila Olímpica");

  // ═══════════════════════════════════════════════════════════════════════════
  // HORTA-GUINARDÓ
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.4120,2.1620, 41.4200,2.1800, 40, "Ronda del Guinardó","LED",180,"Horta-Guinardó","El Guinardó");
  seg(41.4080,2.1730, 41.4160,2.1770, 40, "Avinguda de Gaudí","LED",200,"Horta-Guinardó","El Guinardó");
  seg(41.4230,2.1550, 41.4230,2.1730, 50, "Carrer d'Horta","LED",150,"Horta-Guinardó","Horta");

  // ═══════════════════════════════════════════════════════════════════════════
  // NOU BARRIS
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.4200,2.1680, 41.4350,2.1760, 38, "Passeig de Fabra i Puig","LED",180,"Nou Barris","Vilapicina");
  seg(41.4310,2.1550, 41.4310,2.1780, 38, "Via Favència","LED",200,"Nou Barris","Nou Barris");
  seg(41.4350,2.1630, 41.4420,2.1680, 40, "Passeig de Valldaura","LED",180,"Nou Barris","Nou Barris");

  // ═══════════════════════════════════════════════════════════════════════════
  // SANT ANDREU
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.4220,2.1890, 41.4380,2.1870, 40, "Gran de Sant Andreu","LED",150,"Sant Andreu","Sant Andreu");
  seg(41.4290,2.1940, 41.4400,2.1990, 40, "Passeig de Santa Coloma","LED",200,"Sant Andreu","Sant Andreu");

  // ═══════════════════════════════════════════════════════════════════════════
  // CIUDAD VIEJA — El Born, Barceloneta, Port Vell
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3845,2.1815, 41.3835,2.1870, 30, "Passeig del Born","LED",150,"Ciutat Vella","El Born");
  seg(41.3840,2.1790, 41.3855,2.1830, 35, "Carrer de la Princesa","LED",120,"Ciutat Vella","El Born");
  seg(41.3755,2.1760, 41.3740,2.1880, 24, "Passeig de Joan de Borbó","LED",200,"Ciutat Vella","Barceloneta");
  seg(41.3750,2.1880, 41.3810,2.1920, 22, "Passeig Marítim de la Barceloneta","LED",200,"Ciutat Vella","Barceloneta");
  seg(41.3760,2.1770, 41.3740,2.1840, 22, "Moll de la Fusta","LED",200,"Ciutat Vella","Port Vell");

  // ═══════════════════════════════════════════════════════════════════════════
  // BARRI GÒTIC — callejuelas, muy poca luz (70 W halogen cada 120 m)
  // ═══════════════════════════════════════════════════════════════════════════
  const gothic: [number, number, string][] = [
    [41.3810,2.1725,"Carrer de Ferran"],
    [41.3813,2.1745,"Carrer de Ferran"],
    [41.3816,2.1765,"Carrer de Ferran"],
    [41.3830,2.1740,"Carrer del Call"],
    [41.3836,2.1760,"Carrer del Bisbe"],
    [41.3827,2.1768,"Carrer del Bisbe"],
    [41.3821,2.1782,"Carrer dels Banys Nous"],
    [41.3841,2.1779,"Carrer de la Palla"],
    [41.3845,2.1756,"Carrer de Santa Llúcia"],
    [41.3852,2.1772,"Carrer dels Arcs"],
    [41.3809,2.1792,"Plaça de Sant Jaume"],
    [41.3813,2.1782,"Plaça de Sant Jaume"],
  ];
  for (const [lat, lon, name] of gothic) {
    points.push({ latitude:lat, longitude:lon, street_name:name,
      light_type:"Halogen", power_watts:70, district:"Ciutat Vella", neighborhood:"Barri Gòtic" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EL RAVAL — interior oscuro, calles principales con algo de luz
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3820,2.1630, 41.3820,2.1730, 55, "Carrer del Carme","LED",100,"Ciutat Vella","El Raval");
  seg(41.3790,2.1650, 41.3790,2.1740, 55, "Carrer de Sant Pau","LED",100,"Ciutat Vella","El Raval");
  // Interior Raval — escasísima iluminación
  const ravalSparse: [number, number, string][] = [
    [41.3800,2.1668,"Carrer de l'Arc del Teatre"],
    [41.3815,2.1660,"Carrer de la Riera Alta"],
    [41.3828,2.1672,"Carrer de la Riera Alta"],
  ];
  for (const [lat, lon, name] of ravalSparse) {
    points.push({ latitude:lat, longitude:lon, street_name:name,
      light_type:"Halogen", power_watts:70, district:"Ciutat Vella", neighborhood:"El Raval" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MONTJUÏC — mezcla sodio/LED, áreas oscuras
  // ═══════════════════════════════════════════════════════════════════════════
  seg(41.3690,2.1490, 41.3780,2.1550, 50, "Passeig de l'Exposició","Sodio",150,"Sants-Montjuïc","Montjuïc");

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAÇA DE CATALUNYA — muy iluminada
  // ═══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 2 * Math.PI;
    points.push({ latitude:41.3870+0.0007*Math.sin(a), longitude:2.1699+0.0009*Math.cos(a),
      street_name:"Plaça de Catalunya", light_type:"LED", power_watts:250,
      district:"Eixample", neighborhood:"Dreta de l'Eixample" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAÇA DE LA SAGRADA FAMÍLIA — muy iluminada
  // ═══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 2 * Math.PI;
    points.push({ latitude:41.4036+0.0008*Math.sin(a), longitude:2.1744+0.0010*Math.cos(a),
      street_name:"Plaça de la Sagrada Família", light_type:"LED", power_watts:250,
      district:"Eixample", neighborhood:"Sagrada Família" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAÇA UNIVERSITAT
  // ═══════════════════════════════════════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 2 * Math.PI;
    points.push({ latitude:41.3868+0.0004*Math.sin(a), longitude:2.1645+0.0005*Math.cos(a),
      street_name:"Plaça Universitat", light_type:"LED", power_watts:200,
      district:"Eixample", neighborhood:"Esquerra de l'Eixample" });
  }

  return points;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url    = new URL(req.url);
    const force  = url.searchParams.get('force') === 'true';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase    = createClient(supabaseUrl, supabaseKey);

    // Check existing count
    const { count } = await supabase
      .from('light_points')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0 && !force) {
      return new Response(
        JSON.stringify({ success: true, message: `Ya sembrado: ${count} puntos. Usa ?force=true para re-seed.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Truncate existing data if force=true
    if (force && count && count > 0) {
      const { error: truncErr } = await supabase.rpc('truncate_light_points');
      if (truncErr) {
        // Fallback: delete in bulk
        await supabase.from('light_points').delete().gte('id', '00000000-0000-0000-0000-000000000000');
      }
    }

    const points = generateBarcelonaLightPoints();

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      const { error } = await supabase.from('light_points').insert(batch);
      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message, insertedSoFar: inserted }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, message: `✅ Sembrado: ${inserted} puntos de luz en Barcelona`, total: inserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
