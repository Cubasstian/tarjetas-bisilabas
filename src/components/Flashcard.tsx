import { forwardRef } from 'react';
import { FlashcardData } from '../data/alphabetData';

interface FlashcardProps {
  data: FlashcardData;
  isForExport?: boolean;
}

const Flashcard = forwardRef<HTMLDivElement, FlashcardProps>(({ data, isForExport = false }, ref) => {
  const containerStyle = isForExport
    ? {
        width: '80mm',
        height: '150mm',
      }
    : {};

  return (
    <div
      ref={ref}
      className={`bg-white rounded-3xl border-[6px] border-black overflow-hidden shadow-xl flex flex-col ${
        isForExport ? '' : 'w-[320px] h-[600px]'
      }`}
      style={containerStyle}
    >
      <div className="flex-[6] relative overflow-hidden bg-amber-50 flex items-center justify-center">
        <img
          src={data.image}
          alt={data.word}
          className="w-full h-full object-contain p-4"
        />
      </div>

      <div className="flex-[4] flex flex-col items-center justify-center p-6 bg-white">
        <div className="text-7xl font-black mb-4 text-gray-800">
          {data.letter}
        </div>

        <div className="flex flex-wrap justify-center gap-1 text-5xl font-bold">
          {data.syllables.map((syllable, index) => (
            <span key={index}>
              <span className={index === 0 ? 'text-red-600' : 'text-black'}>
                {syllable}
              </span>
              {index < data.syllables.length - 1 && (
                <span className="text-gray-400 mx-1">-</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

Flashcard.displayName = 'Flashcard';

export default Flashcard;
