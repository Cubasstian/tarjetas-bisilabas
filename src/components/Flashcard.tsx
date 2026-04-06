import { forwardRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { FlashcardData } from '../data/alphabetData';

interface FlashcardProps {
  data: FlashcardData;
  isForExport?: boolean;
}

const Flashcard = forwardRef<HTMLDivElement, FlashcardProps>(({ data, isForExport = false }, ref) => {
  const [speaking, setSpeaking] = useState(false);

  const containerStyle = isForExport
    ? {
        width: '80mm',
        height: '150mm',
      }
    : {};

  const handleSpeak = () => {
    if (isForExport) return;
    setSpeaking(true);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(data.word);
    utter.lang = 'es-ES';
    utter.rate = 0.85;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-3xl border-[6px] border-black overflow-hidden shadow-xl flex flex-col ${
        isForExport ? '' : 'w-[320px] h-[600px]'
      }`}
      style={containerStyle}
    >
      <div
        onClick={handleSpeak}
        className={`flex-[6] relative overflow-hidden bg-amber-50 flex items-center justify-center group ${
          !isForExport ? 'cursor-pointer select-none' : ''
        }`}
      >
        <img
          src={data.image}
          alt={data.word}
          className={`w-full h-full object-contain p-4 transition-transform duration-200 ${
            !isForExport && speaking ? 'scale-95' : !isForExport ? 'group-hover:scale-105' : ''
          }`}
        />

        {/* Indicador de audio — solo en vista normal */}
        {!isForExport && (
          <div
            className={`absolute bottom-3 right-3 rounded-full p-2 transition-all duration-200 ${
              speaking
                ? 'bg-blue-500 text-white shadow-lg scale-110'
                : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 shadow'
            }`}
          >
            <Volume2 size={20} />
          </div>
        )}
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
