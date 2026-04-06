import { useState } from 'react';
import Flashcard from './Flashcard';
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {alphabetData.map((card, index) => (
          <div
            key={card.letter}
            onClick={() => onSelectCard(index)}
            className="cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="scale-[0.4] origin-top-left">
              <div>
                <Flashcard data={card} isForExport />
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
