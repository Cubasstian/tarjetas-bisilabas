import { useState } from 'react';
import ExportModal from './ExportModal';
import { alphabetData } from '../data/alphabetData';
import { exportAllFlashcards, CardSizeKey, LayoutKey } from '../utils/pdfExporter';
import { Download } from 'lucide-react';

interface GridViewProps {
  onSelectCard: (index: number) => void;
}

const GridView = ({ onSelectCard }: GridViewProps) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting]         = useState(false);

  const handleExportAll = async (sizeKey: CardSizeKey, layoutKey: LayoutKey) => {
    setIsExporting(true);
    try {
      await exportAllFlashcards(alphabetData, sizeKey, layoutKey);
      setShowExportModal(false);
    } catch (error) {
      alert('Error al exportar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Todas las Tarjetas
        </h2>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
        >
          <Download size={20} />
          Exportar Todo a PDF
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {alphabetData.map((card, index) => (
          <div
            key={card.letter}
            onClick={() => onSelectCard(index)}
            className="cursor-pointer group"
          >
            <div className="bg-white rounded-2xl border-[3px] border-black overflow-hidden shadow-md flex flex-col transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
              {/* Imagen */}
              <div className="bg-amber-50 flex items-center justify-center p-2" style={{ aspectRatio: '1/1' }}>
                <img
                  src={card.image}
                  alt={card.word}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Texto */}
              <div className="flex flex-col items-center justify-center py-2 px-1 bg-white">
                <span className="font-black text-gray-800 leading-none" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)' }}>
                  {card.letter}
                </span>
                <div className="flex flex-wrap justify-center gap-[2px] mt-0.5" style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.85rem)', fontWeight: 700 }}>
                  {card.syllables.map((s, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-gray-400">-</span>}
                      <span className={i === 0 ? 'text-red-600' : 'text-black'}>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showExportModal && (
        <ExportModal
          mode="all"
          isExporting={isExporting}
          onClose={() => setShowExportModal(false)}
          onExport={handleExportAll}
        />
      )}
    </div>
  );
};

export default GridView;
