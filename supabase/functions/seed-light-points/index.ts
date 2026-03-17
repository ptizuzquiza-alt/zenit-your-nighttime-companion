import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Barcelona street light data - representative points along major streets
// Based on Barcelona's actual street layout and lighting infrastructure
function generateBarcelonaLightPoints() {
  const points: {
    latitude: number;
    longitude: number;
    street_name: string;
    light_type: string;
    power_watts: number;
    district: string;
    neighborhood: string;
  }[] = [];

  // Helper: generate points along a line segment
  const addStreetLights = (
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    spacing: number, // meters between lights
    street: string,
    type: string,
    watts: number,
    district: string,
    neighborhood: string
  ) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const numLights = Math.max(2, Math.floor(dist / spacing));
    
    for (let i = 0; i <= numLights; i++) {
      const t = i / numLights;
      // Add slight random offset for both sides of the street
      const jitter = (Math.random() - 0.5) * 0.00005;
      points.push({
        latitude: lat1 + (lat2 - lat1) * t + jitter,
        longitude: lon1 + (lon2 - lon1) * t + jitter,
        street_name: street,
        light_type: type,
        power_watts: watts,
        district,
        neighborhood,
      });
      // Other side of street
      points.push({
        latitude: lat1 + (lat2 - lat1) * t - jitter + 0.00003,
        longitude: lon1 + (lon2 - lon1) * t - jitter + 0.00003,
        street_name: street,
        light_type: type,
        power_watts: watts,
        district,
        neighborhood,
      });
    }
  };

  // ═══ EIXAMPLE ═══
  // Passeig de Gràcia (high-end, well lit)
  addStreetLights(41.3870, 2.1650, 41.3955, 2.1620, 25, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l\'Eixample');
  
  // Rambla de Catalunya
  addStreetLights(41.3870, 2.1630, 41.3955, 2.1600, 25, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l\'Eixample');

  // Gran Via de les Corts Catalanes (main east-west artery)
  addStreetLights(41.3870, 2.1200, 41.3870, 2.1900, 20, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample');

  // Avinguda Diagonal (crosses the city diagonally)
  addStreetLights(41.3870, 2.1130, 41.4050, 2.1950, 20, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample');

  // Carrer d'Aragó
  addStreetLights(41.3908, 2.1400, 41.3908, 2.1800, 30, 'Carrer d\'Aragó', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer de València
  addStreetLights(41.3920, 2.1400, 41.3920, 2.1800, 30, 'Carrer de València', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer de Mallorca
  addStreetLights(41.3935, 2.1400, 41.3935, 2.1800, 30, 'Carrer de Mallorca', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer de Provença
  addStreetLights(41.3948, 2.1400, 41.3948, 2.1800, 30, 'Carrer de Provença', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer de Rosselló
  addStreetLights(41.3960, 2.1400, 41.3960, 2.1800, 30, 'Carrer de Rosselló', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer de Còrsega
  addStreetLights(41.3975, 2.1400, 41.3975, 2.1800, 30, 'Carrer de Còrsega', 'LED', 150, 'Eixample', 'Eixample');

  // Vertical streets in Eixample
  // Carrer de Balmes
  addStreetLights(41.3870, 2.1585, 41.4020, 2.1400, 30, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample');

  // Carrer d'Enric Granados
  addStreetLights(41.3870, 2.1570, 41.3970, 2.1540, 30, 'Carrer d\'Enric Granados', 'LED', 120, 'Eixample', 'Esquerra de l\'Eixample');

  // Carrer del Comte d'Urgell
  addStreetLights(41.3830, 2.1520, 41.3970, 2.1510, 30, 'Carrer del Comte d\'Urgell', 'LED', 150, 'Eixample', 'Esquerra de l\'Eixample');

  // Carrer de Muntaner
  addStreetLights(41.3870, 2.1540, 41.4050, 2.1370, 30, 'Carrer de Muntaner', 'LED', 150, 'Eixample', 'Esquerra de l\'Eixample');

  // Carrer d'Aribau
  addStreetLights(41.3870, 2.1560, 41.4020, 2.1425, 30, 'Carrer d\'Aribau', 'LED', 150, 'Eixample', 'Esquerra de l\'Eixample');

  // ═══ CIUTAT VELLA ═══
  // Las Ramblas
  addStreetLights(41.3747, 2.1700, 41.3830, 2.1730, 15, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'El Raval');

  // Via Laietana
  addStreetLights(41.3790, 2.1760, 41.3870, 2.1770, 25, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic');

  // Passeig de Colom
  addStreetLights(41.3748, 2.1730, 41.3760, 2.1850, 20, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta');

  // Portal de l'Àngel
  addStreetLights(41.3850, 2.1725, 41.3872, 2.1710, 15, 'Avinguda del Portal de l\'Àngel', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic');

  // Carrer de Ferran
  addStreetLights(41.3810, 2.1725, 41.3815, 2.1770, 15, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic');

  // Passeig del Born
  addStreetLights(41.3845, 2.1815, 41.3830, 2.1830, 15, 'Passeig del Born', 'LED', 150, 'Ciutat Vella', 'El Born');

  // Carrer de la Princesa
  addStreetLights(41.3840, 2.1790, 41.3855, 2.1810, 15, 'Carrer de la Princesa', 'LED', 120, 'Ciutat Vella', 'El Born');

  // Barceloneta (maritime area)
  addStreetLights(41.3750, 2.1880, 41.3810, 2.1910, 20, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta');
  addStreetLights(41.3810, 2.1910, 41.3830, 2.1990, 20, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta');

  // ═══ GRÀCIA ═══
  // Carrer Gran de Gràcia
  addStreetLights(41.3990, 2.1555, 41.4045, 2.1520, 25, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia');

  // Travessera de Gràcia
  addStreetLights(41.3998, 2.1450, 41.3998, 2.1650, 25, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia');

  // Plaça del Sol area
  addStreetLights(41.4015, 2.1565, 41.4020, 2.1580, 10, 'Plaça del Sol', 'LED', 120, 'Gràcia', 'Vila de Gràcia');

  // ═══ SANT MARTÍ ═══
  // Avinguda Meridiana
  addStreetLights(41.3870, 2.1810, 41.4200, 2.1870, 20, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot');

  // Rambla del Poblenou
  addStreetLights(41.3950, 2.1980, 41.4050, 2.2020, 20, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou');

  // Avinguda Diagonal (22@)
  addStreetLights(41.4030, 2.1900, 41.4060, 2.2100, 25, 'Avinguda Diagonal', 'LED', 250, 'Sant Martí', 'Poblenou');

  // Carrer de Pere IV
  addStreetLights(41.3990, 2.1900, 41.4020, 2.2100, 30, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou');

  // ═══ SANTS-MONTJUÏC ═══
  // Carrer de Sants
  addStreetLights(41.3750, 2.1320, 41.3760, 2.1490, 25, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants');

  // Gran Via (west section)
  addStreetLights(41.3760, 2.1200, 41.3790, 2.1400, 20, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs');

  // Avinguda del Paral·lel
  addStreetLights(41.3720, 2.1620, 41.3790, 2.1700, 20, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec');

  // Passeig de l'Exposició (Montjuïc)
  addStreetLights(41.3690, 2.1530, 41.3640, 2.1510, 30, 'Passeig de l\'Exposició', 'Sodio', 150, 'Sants-Montjuïc', 'Montjuïc');

  // ═══ SARRIÀ-SANT GERVASI ═══
  // Via Augusta
  addStreetLights(41.4000, 2.1480, 41.4100, 2.1350, 25, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi');

  // Carrer de Balmes (upper)
  addStreetLights(41.4020, 2.1400, 41.4120, 2.1280, 30, 'Carrer de Balmes', 'LED', 150, 'Sarrià-Sant Gervasi', 'Sant Gervasi');

  // Avinguda de Sarrià
  addStreetLights(41.3920, 2.1380, 41.3960, 2.1280, 25, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres');

  // Passeig de la Bonanova
  addStreetLights(41.4060, 2.1250, 41.4060, 2.1450, 25, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià');

  // ═══ LES CORTS ═══
  // Travessera de les Corts
  addStreetLights(41.3870, 2.1250, 41.3870, 2.1400, 25, 'Travessera de les Corts', 'LED', 150, 'Les Corts', 'Les Corts');

  // Avinguda de Madrid
  addStreetLights(41.3830, 2.1300, 41.3830, 2.1400, 25, 'Avinguda de Madrid', 'LED', 180, 'Les Corts', 'Les Corts');

  // ═══ HORTA-GUINARDÓ ═══
  // Ronda del Guinardó
  addStreetLights(41.4120, 2.1650, 41.4170, 2.1750, 25, 'Ronda del Guinardó', 'LED', 180, 'Horta-Guinardó', 'El Guinardó');

  // Carrer del Cardenal Sentmenat (near Hospital de Sant Pau)
  addStreetLights(41.4120, 2.1730, 41.4140, 2.1770, 20, 'Av. de Gaudí', 'LED', 200, 'Horta-Guinardó', 'El Guinardó');

  // ═══ NOU BARRIS ═══
  // Passeig de Fabra i Puig
  addStreetLights(41.4200, 2.1700, 41.4280, 2.1720, 25, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina');

  // Via Favència
  addStreetLights(41.4310, 2.1580, 41.4310, 2.1750, 25, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris');

  // ═══ SANT ANDREU ═══
  // Gran de Sant Andreu
  addStreetLights(41.4240, 2.1890, 41.4300, 2.1880, 25, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu');

  // ═══ WATERFRONT / PORT ═══
  // Passeig de Joan de Borbó
  addStreetLights(41.3780, 2.1810, 41.3740, 2.1870, 20, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta');

  // Moll de la Fusta
  addStreetLights(41.3760, 2.1770, 41.3740, 2.1830, 20, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell');

  // Port Olímpic
  addStreetLights(41.3890, 2.1990, 41.3840, 2.2010, 20, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica');

  // Passeig Marítim Nova Icària
  addStreetLights(41.3870, 2.1970, 41.3920, 2.2050, 20, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica');

  // ═══ PLAÇAS IMPORTANTES ═══
  // Plaça Catalunya (dense lighting)
  for (let i = 0; i < 30; i++) {
    points.push({
      latitude: 41.3870 + (Math.random() - 0.5) * 0.001,
      longitude: 2.1700 + (Math.random() - 0.5) * 0.001,
      street_name: 'Plaça de Catalunya',
      light_type: 'LED',
      power_watts: 250,
      district: 'Eixample',
      neighborhood: 'Dreta de l\'Eixample',
    });
  }

  // Plaça Espanya
  for (let i = 0; i < 20; i++) {
    points.push({
      latitude: 41.3750 + (Math.random() - 0.5) * 0.0008,
      longitude: 2.1488 + (Math.random() - 0.5) * 0.0008,
      street_name: 'Plaça d\'Espanya',
      light_type: 'LED',
      power_watts: 250,
      district: 'Sants-Montjuïc',
      neighborhood: 'Hostafrancs',
    });
  }

  // Plaça Universitat
  for (let i = 0; i < 15; i++) {
    points.push({
      latitude: 41.3868 + (Math.random() - 0.5) * 0.0005,
      longitude: 2.1645 + (Math.random() - 0.5) * 0.0005,
      street_name: 'Plaça Universitat',
      light_type: 'LED',
      power_watts: 200,
      district: 'Eixample',
      neighborhood: 'Esquerra de l\'Eixample',
    });
  }

  // Plaça Sagrada Família
  for (let i = 0; i < 20; i++) {
    points.push({
      latitude: 41.4036 + (Math.random() - 0.5) * 0.0008,
      longitude: 2.1744 + (Math.random() - 0.5) * 0.0008,
      street_name: 'Plaça de la Sagrada Família',
      light_type: 'LED',
      power_watts: 250,
      district: 'Eixample',
      neighborhood: 'Sagrada Família',
    });
  }

  // Plaça de les Glòries
  for (let i = 0; i < 25; i++) {
    points.push({
      latitude: 41.4035 + (Math.random() - 0.5) * 0.001,
      longitude: 2.1870 + (Math.random() - 0.5) * 0.001,
      street_name: 'Plaça de les Glòries Catalanes',
      light_type: 'LED',
      power_watts: 250,
      district: 'Sant Martí',
      neighborhood: 'El Clot',
    });
  }

  return points;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already seeded
    const { count } = await supabase
      .from('light_points')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ success: true, message: `Already seeded with ${count} light points` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const points = generateBarcelonaLightPoints();

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      const { error } = await supabase.from('light_points').insert(batch);
      if (error) {
        console.error('Insert error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      inserted += batch.length;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Seeded ${inserted} light points across Barcelona` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
