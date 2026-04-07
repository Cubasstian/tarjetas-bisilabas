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
    <div className="flex gap-6">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full font-black text-white text-3xl shadow-lg flex items-center justify-center transition-all duration-150 active:scale-90 ${
          canGoPrevious
            ? 'bg-orange-400 hover:bg-orange-500 hover:scale-110 active:shadow-none'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Anterior"
      >
        <ChevronLeft size={36} strokeWidth={3} />
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full font-black text-white text-3xl shadow-lg flex items-center justify-center transition-all duration-150 active:scale-90 ${
          canGoNext
            ? 'bg-blue-500 hover:bg-blue-600 hover:scale-110 active:shadow-none'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Siguiente"
      >
        <ChevronRight size={36} strokeWidth={3} />
      </button>
    </div>
  );
};

export default NavigationControls;
