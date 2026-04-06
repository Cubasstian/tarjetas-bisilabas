import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { FlashcardData, alphabetData } from '../data/alphabetData';
import { CARD_SIZES, LAYOUTS, CardSizeKey, LayoutKey } from '../utils/pdfExporter';

interface ExportModalProps {
  mode: 'single' | 'all';
  currentCard?: FlashcardData;
  isExporting: boolean;
  onClose: () => void;
  onExport: (sizeKey: CardSizeKey, layoutKey: LayoutKey) => void;
}

const CARD_COLORS = [
  '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe',
  '#ede9fe', '#fce7f3', '#ffedd5', '#e0f2fe', '#f0fdf4',
];

const PREVIEW_W = 260; // px ancho del contenedor de preview

export default function ExportModal({
  mode,
  currentCard,
  isExporting,
  onClose,
  onExport,
}: ExportModalProps) {
  const [sizeKey, setSizeKey]     = useState<CardSizeKey>('medium');
  const [layoutKey, setLayoutKey] = useState<LayoutKey>('2x2');

  const size   = CARD_SIZES[sizeKey];
  const layout = LAYOUTS[layoutKey];

  const cols = mode === 'single' ? 1 : layout.cols;
  const rows = mode === 'single' ? 1 : layout.rows;

  const MARGIN_MM = 5;
  const GAP_MM    = 5;

  const pageWMm = cols * size.width  + (cols - 1) * GAP_MM + 2 * MARGIN_MM;
  const pageHMm = rows * size.height + (rows - 1) * GAP_MM + 2 * MARGIN_MM;

  // Escalar para el preview manteniendo proporción
  const maxH      = 300;
  const scaleByW  = PREVIEW_W / pageWMm;
  const scaleByH  = maxH / pageHMm;
  const ps        = Math.min(scaleByW, scaleByH); // px per mm
  const previewW  = pageWMm  * ps;
  const previewH  = pageHMm  * ps;
  const cardW     = size.width  * ps;
  const cardH     = size.height * ps;
  const margin    = MARGIN_MM * ps;
  const gap       = GAP_MM    * ps;

  const perPage    = cols * rows;
  const totalPages = Math.ceil(27 / perPage);
  const sampleCards = alphabetData.slice(0, perPage);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-800">
            {mode === 'single' ? 'Exportar tarjeta' : 'Exportar todas las tarjetas'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Tamaño de tarjeta */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Tamaño de tarjeta
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CARD_SIZES) as [CardSizeKey, typeof CARD_SIZES[CardSizeKey]][]).map(
                ([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setSizeKey(key)}
                    className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                      sizeKey === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 bg-white'
                    }`}
                  >
                    {/* Mini card shape */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`rounded border-2 ${sizeKey === key ? 'border-blue-400 bg-blue-100' : 'border-gray-300 bg-gray-50'}`}
                        style={{
                          width:  18 * (s.width  / 100),
                          height: 18 * (s.height / 100),
                        }}
                      />
                    </div>
                    <div className={`font-bold text-sm ${sizeKey === key ? 'text-blue-700' : 'text-gray-700'}`}>
                      {s.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.subtitle}</div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Distribución — solo para modo "all" */}
          {mode === 'all' && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Distribución por página
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(LAYOUTS) as [LayoutKey, typeof LAYOUTS[LayoutKey]][]).map(
                  ([key, l]) => {
                    const [c, r] = key.split('x').map(Number);
                    return (
                      <button
                        key={key}
                        onClick={() => setLayoutKey(key)}
                        className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                          layoutKey === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200 bg-white'
                        }`}
                      >
                        {/* Mini grid icon */}
                        <div className="flex justify-center mb-2">
                          <div
                            className="grid gap-[2px]"
                            style={{ gridTemplateColumns: `repeat(${c}, 1fr)`, width: 28 }}
                          >
                            {Array.from({ length: c * r }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-sm ${layoutKey === key ? 'bg-blue-400' : 'bg-gray-300'}`}
                                style={{ height: 8 }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${layoutKey === key ? 'text-blue-700' : 'text-gray-700'}`}>
                          {key}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{l.name}</div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Vista previa
            </h3>
            <div className="flex flex-col items-center gap-3">

              {/* Página simulada */}
              <div
                className="bg-gray-100 rounded-xl flex items-center justify-center"
                style={{ padding: 16, minHeight: 120 }}
              >
                <div
                  className="bg-white shadow-md relative rounded-sm"
                  style={{ width: previewW, height: previewH, flexShrink: 0 }}
                >
                  {mode === 'single' && currentCard ? (
                    /* Tarjeta individual con emoji real */
                    <div
                      className="absolute overflow-hidden"
                      style={{
                        left: margin, top: margin,
                        width: cardW, height: cardH,
                        border: '2px solid #111',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#fff',
                      }}
                    >
                      <div style={{
                        flex: 3,
                        background: '#fffbeb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <img
                          src={currentCard.image}
                          alt={currentCard.word}
                          style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{
                        flex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTop: '1.5px solid #111',
                      }}>
                        <div style={{ fontWeight: 900, fontSize: cardH * 0.16, color: '#1f2937', lineHeight: 1 }}>
                          {currentCard.letter}
                        </div>
                        <div style={{ fontSize: cardH * 0.075, fontWeight: 700 }}>
                          {currentCard.syllables.map((s, i) => (
                            <span key={i}>
                              {i > 0 && <span style={{ color: '#9ca3af' }}> - </span>}
                              <span style={{ color: i === 0 ? '#dc2626' : '#000' }}>{s}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Grid de tarjetas placeholder */
                    sampleCards.map((card, i) => {
                      const col = i % cols;
                      const row = Math.floor(i / cols);
                      return (
                        <div
                          key={card.letter}
                          style={{
                            position: 'absolute',
                            left:   margin + col * (cardW + gap),
                            top:    margin + row * (cardH + gap),
                            width:  cardW,
                            height: cardH,
                            border: '1.5px solid #374151',
                            borderRadius: 3,
                            background: CARD_COLORS[i % CARD_COLORS.length],
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ fontWeight: 900, fontSize: cardW * 0.38, color: '#1f2937', lineHeight: 1 }}>
                            {card.letter}
                          </div>
                          <div style={{ fontSize: cardW * 0.15, fontWeight: 700, color: '#dc2626' }}>
                            {card.syllables[0]}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Info de la página */}
              <div className="text-center text-sm text-gray-500 space-y-0.5">
                {mode === 'all' ? (
                  <>
                    <p className="font-semibold text-gray-700">
                      {perPage} tarjetas/página · {totalPages} páginas
                    </p>
                    <p>Página: {pageWMm.toFixed(0)} × {pageHMm.toFixed(0)} mm · Tarjeta: {size.width/10} × {size.height/10} cm</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-700">1 página · 1 tarjeta</p>
                    <p>Tamaño: {size.width/10} × {size.height/10} cm</p>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onExport(sizeKey, layoutKey)}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Download size={18} />
            {isExporting ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>

      </div>
    </div>
  );
}
