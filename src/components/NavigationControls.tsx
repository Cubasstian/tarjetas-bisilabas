import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const NavigationControls = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: NavigationControlsProps) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        <ChevronLeft size={24} />
        Anterior
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        Siguiente
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default NavigationControls;
