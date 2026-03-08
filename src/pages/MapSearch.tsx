import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { SearchSuggestion } from '@/components/SearchSuggestion';

const suggestions = [
  { id: '1', name: 'BAU · College of Arts & Design Barcelona', address: 'Carrer de Pujades, 118, Sant Martí, Barcelona', distance: '2,3 km' },
  { id: '2', name: 'La Sagrada Familia, Eixample, Barcelona', address: 'Carrer de Mallorca, 401, Eixample, 80013, Barcelona', distance: '2,2 km' },
  { id: '3', name: 'Plaza de Catalunya', address: 'Plaza de Catalunya, Eixample, 08002 Barcelona', distance: '3,3 km' },
  { id: '4', name: 'Museo del Disseny de Barcelona - DHub', address: 'Plaça de les Glòries Catalanes, 38, c, Sant Martí, 08018 Barcelona', distance: '1,4 km' },
  { id: '5', name: 'La Pedrera - Casa Milà', address: 'Pg. de Gràcia, 92, Eixample, 08008 Barcelona', distance: '2,8 km' },
  { id: '6', name: 'Jardines del Baix Guinardó', address: 'Carrer de Lepant, 410, Horta-Guinardó, 08025', distance: '3,1 km' },
];

const MapSearch: FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Tu ubicación');
  const [destination, setDestination] = useState('');

  const handleSelectDestination = (suggestion: typeof suggestions[0]) => {
    setDestination(suggestion.name);
    navigate('/routes');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back and location input */}
      <div className="p-4 pt-12">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center mt-2"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <LocationInput
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwap={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
            />
          </div>
        </div>
      </div>

      {/* Suggestions list */}
      <div className="px-4 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Reciente</p>
        <div className="space-y-1">
          {suggestions.map(suggestion => (
            <SearchSuggestion
              key={suggestion.id}
              name={suggestion.name}
              address={suggestion.address}
              distance={suggestion.distance}
              onClick={() => handleSelectDestination(suggestion)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
