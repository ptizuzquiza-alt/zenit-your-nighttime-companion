import { useState } from 'react';
import { MoonStar, MapPin, CheckCircle, X } from 'lucide-react';
import { reportDarkStreet } from '@/lib/lightPoints';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Props {
  /** Current map centre to pre-fill coordinates */
  latitude?: number;
  longitude?: number;
  /** Called after a successful report */
  onReported?: () => void;
}

export default function ReportDarkStreet({ latitude, longitude, onReported }: Props) {
  const [open, setOpen] = useState(false);
  const [streetName, setStreetName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!latitude || !longitude) return;
    setLoading(true);
    const { success } = await reportDarkStreet(
      latitude,
      longitude,
      streetName || undefined,
      description || undefined
    );
    setLoading(false);
    if (success) {
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
        setStreetName('');
        setDescription('');
        onReported?.();
      }, 1800);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-700 text-zinc-300 text-sm hover:border-orange-500 hover:text-orange-400 transition-all"
        title="Reportar calle oscura"
      >
        <MoonStar size={15} className="text-orange-500" />
        <span>Calle oscura</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MoonStar size={18} className="text-orange-500" />
          <span className="text-white font-semibold text-sm">Reportar calle oscura</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <CheckCircle size={32} className="text-green-400" />
          <span className="text-green-300 text-sm font-medium">¡Gracias por reportarlo!</span>
          <span className="text-zinc-500 text-xs text-center">
            Ayudas a que otras personas eviten esta calle de noche.
          </span>
        </div>
      ) : (
        <>
          {/* Location indicator */}
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-3">
            <MapPin size={12} />
            <span>
              {latitude && longitude
                ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                : 'Sin ubicación'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <Input
              placeholder="Nombre de la calle (opcional)"
              value={streetName}
              onChange={e => setStreetName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white text-sm placeholder:text-zinc-600"
            />
            <Textarea
              placeholder="Describe el problema: sin farolas, farola rota, zona sin iluminación... (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="bg-zinc-800 border-zinc-700 text-white text-sm placeholder:text-zinc-600 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1 border-zinc-700 text-zinc-400 bg-transparent hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={loading || !latitude || !longitude}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? 'Guardando...' : 'Reportar'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
