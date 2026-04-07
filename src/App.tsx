import { useState, useRef, useCallback } from 'react';
import Flashcard from './components/Flashcard';
import NavigationControls from './components/NavigationControls';
import AlphabetSelector from './components/AlphabetSelector';
import GridView from './components/GridView';
import ExportModal from './components/ExportModal';
import Confetti from './components/Confetti';
import MemoryGame from './components/MemoryGame';
import { alphabetData } from './data/alphabetData';
import { exportSingleFlashcard, CardSizeKey, LayoutKey } from './utils/pdfExporter';
import { Download, Grid3x3, Square, Gamepad2 } from 'lucide-react';

type AnimDir = 'left' | 'right' | null;

function App() {
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [viewMode, setViewMode]               = useState<'single' | 'grid'>('single');
  const [isExporting, setIsExporting]         = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [animDir, setAnimDir]                 = useState<AnimDir>(null);
  const [animKey, setAnimKey]                 = useState(0);
  const [showConfetti, setShowConfetti]       = useState(false);

  // Touch/swipe
  const touchStartX = useRef<number | null>(null);

  const total = alphabetData.length;
  const currentCard = alphabetData[currentIndex];
  const isLast = currentIndex === total - 1;

  const goTo = useCallback((index: number, dir: AnimDir) => {
    setAnimDir(dir);
    setAnimKey(k => k + 1);
    setCurrentIndex(index);
    if (index === total - 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [total]);

  const handlePrevious = () => {
    if (currentIndex > 0) goTo(currentIndex - 1, 'left');
  };

  const handleNext = () => {
    if (currentIndex < total - 1) goTo(currentIndex + 1, 'right');
  };

  const handleSelectLetter = (index: number) => {
    goTo(index, index > currentIndex ? 'right' : 'left');
    setViewMode('single');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrevious();
    }
    touchStartX.current = null;
  };

  const handleExportCurrent = async (sizeKey: CardSizeKey, _layoutKey: LayoutKey) => {
    setIsExporting(true);
    try {
      await exportSingleFlashcard(currentCard, `flashcard-${currentCard.letter}.pdf`, sizeKey);
      setShowExportModal(false);
    } catch {
      alert('Error al exportar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Progress percentage
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-pink-50">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="text-center pt-6 pb-2 px-4">
        <h1 className="font-black text-gray-800 leading-tight tracking-tight"
          style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
          🔤 <span className="animate-rainbow">Alfabeto</span> Educativo ✏️
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.1rem)' }}>
          Aprende las letras de forma divertida
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-3 px-4 mt-4 mb-5">
        <button
          onClick={() => setViewMode('single')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-sm ${
            viewMode === 'single'
              ? 'bg-blue-500 text-white shadow-md scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Square size={18} /> Individual
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-sm ${
            viewMode === 'grid'
              ? 'bg-blue-500 text-white shadow-md scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Grid3x3 size={18} /> Todas
        </button>
        <button
          onClick={() => setViewMode('game')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-sm ${
            viewMode === 'game'
              ? 'bg-purple-500 text-white shadow-md scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Gamepad2 size={18} /> Juego
        </button>
      </div>

      {viewMode === 'single' ? (
        <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-6 px-4 pb-10 max-w-5xl mx-auto">

          {/* Columna izquierda: progreso + tarjeta */}
          <div className="flex flex-col items-center gap-4 w-full md:max-w-[300px]">

            {/* Progreso */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-gray-400">Letra {currentIndex + 1} de {total}</span>
                <span className={`text-xs font-black ${isLast ? 'text-green-500' : 'text-blue-500'}`}>
                  {isLast ? '🎉 ¡Completaste el alfabeto!' : `${Math.round(progress)}%`}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: isLast
                      ? 'linear-gradient(90deg,#22c55e,#84cc16)'
                      : 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
                  }}
                />
              </div>
            </div>

            {/* Tarjeta con swipe */}
            <div
              className="w-full"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Flashcard key={animKey} data={currentCard} animDir={animDir} />
            </div>
          </div>

          {/* Columna derecha: controles + selector */}
          <div className="flex flex-col items-center md:items-start gap-5 w-full md:max-w-sm md:pt-10">

            {/* Navegación */}
            <div className="flex items-center gap-4">
              <NavigationControls
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={currentIndex > 0}
                canGoNext={currentIndex < total - 1}
              />
            </div>

            {/* Exportar */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-2xl font-semibold text-sm hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm"
            >
              <Download size={16} />
              Exportar tarjeta
            </button>

            {/* Selector de letras */}
            <AlphabetSelector
              currentIndex={currentIndex}
              onSelectLetter={handleSelectLetter}
            />
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="px-4 pb-10">
          <GridView onSelectCard={handleSelectLetter} />
        </div>
      ) : (
        <div className="px-4 pb-10 max-w-3xl mx-auto">
          <MemoryGame />
        </div>
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
    </div>
  );
}

export default App;
