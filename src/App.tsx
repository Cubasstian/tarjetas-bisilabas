import { useState } from 'react';
import Flashcard from './components/Flashcard';
import NavigationControls from './components/NavigationControls';
import AlphabetSelector from './components/AlphabetSelector';
import GridView from './components/GridView';
import ExportModal from './components/ExportModal';
import { alphabetData } from './data/alphabetData';
import { exportSingleFlashcard, CardSizeKey, LayoutKey } from './utils/pdfExporter';
import { Download, Grid3x3, Square } from 'lucide-react';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isExporting, setIsExporting]     = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const currentCard = alphabetData[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < alphabetData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSelectLetter = (index: number) => {
    setCurrentIndex(index);
    setViewMode('single');
  };

  const handleExportCurrent = async (sizeKey: CardSizeKey, _layoutKey: LayoutKey) => {
    setIsExporting(true);
    try {
      await exportSingleFlashcard(currentCard, `flashcard-${currentCard.letter}.pdf`, sizeKey);
      setShowExportModal(false);
    } catch (error) {
      alert('Error al exportar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-black text-gray-800 mb-2">
            Alfabeto Educativo
          </h1>
          <p className="text-xl text-gray-600">
            Aprende las letras de forma divertida
          </p>
        </header>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'single'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Square size={20} />
            Vista Individual
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Grid3x3 size={20} />
            Vista Cuadrícula
          </button>
        </div>

        {viewMode === 'single' ? (
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <Flashcard data={currentCard} isForExport />
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
            >
              <Download size={24} />
              Exportar a PDF
            </button>

            <NavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < alphabetData.length - 1}
            />

            <AlphabetSelector
              currentIndex={currentIndex}
              onSelectLetter={handleSelectLetter}
            />
          </div>
        ) : (
          <GridView onSelectCard={handleSelectLetter} />
        )}

        {showExportModal && (
          <ExportModal
            mode="single"
            currentCard={currentCard}
            isExporting={isExporting}
            onClose={() => setShowExportModal(false)}
            onExport={handleExportCurrent}
          />
        )}

        <footer className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            Sistema educativo de flashcards del alfabeto español
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
