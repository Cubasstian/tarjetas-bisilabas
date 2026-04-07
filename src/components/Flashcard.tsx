import { forwardRef, useState } from 'react';
import { FlashcardData } from '../data/alphabetData';

interface FlashcardProps {
  data: FlashcardData;
  isForExport?: boolean;
  animDir?: 'left' | 'right' | null;
}

const Flashcard = forwardRef<HTMLDivElement, FlashcardProps>(
  ({ data, isForExport = false, animDir = null }, ref) => {
  const [speaking, setSpeaking] = useState(false);

  const containerStyle = isForExport
    ? { width: '80mm', height: '150mm' }
    : {};

  const handleSpeak = () => {
    if (isForExport) return;
    setSpeaking(true);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(data.word);
    utter.lang = 'es-ES';
    utter.rate = 0.82;
    utter.pitch = 1.1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const animClass = animDir === 'right'
    ? 'animate-slide-in-right'
    : animDir === 'left'
    ? 'animate-slide-in-left'
    : '';

  return (
    <div
      ref={ref}
      className={`bg-white rounded-3xl border-[6px] border-black overflow-hidden shadow-2xl flex flex-col ${
        isForExport ? '' : 'w-full'
      } ${animClass}`}
      style={
        isForExport
          ? containerStyle
          : { aspectRatio: '8/15', maxHeight: 'min(520px, 72vh)' }
      }
    >
      {/* Sección imagen */}
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
            !isForExport && speaking
              ? 'scale-90'
              : !isForExport
              ? 'group-hover:scale-105'
              : ''
          }`}
        />

        {/* Toque para escuchar — hint */}
        {!isForExport && !speaking && (
          <div className="absolute top-2 left-2 bg-white/70 rounded-full px-2 py-1 text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            👆 toca para escuchar
          </div>
        )}

        {/* Onda de sonido animada */}
        {!isForExport && (
          <div
            className={`absolute bottom-3 right-3 flex items-end gap-[3px] transition-all duration-200 ${
              speaking ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
            }`}
          >
            {[0.6, 1, 0.75, 1, 0.6].map((h, i) => (
              <span
                key={i}
                className={`block w-[4px] rounded-full ${speaking ? 'bg-blue-500' : 'bg-gray-400'}`}
                style={{
                  height: 20,
                  transformOrigin: 'bottom',
                  animation: speaking
                    ? `sound-bar 0.6s ease-in-out ${i * 0.1}s infinite`
                    : 'none',
                  transform: `scaleY(${h})`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sección texto */}
      <div className="flex-[4] flex flex-col items-center justify-center p-4 bg-white">
        <div
          className={`font-black mb-2 text-gray-800 leading-none ${
            isForExport ? 'text-7xl' : 'text-[clamp(3rem,12vw,5rem)]'
          }`}
          style={speaking && !isForExport
            ? { animation: 'bounce-letter 0.5s ease infinite' }
            : undefined}
        >
          {data.letter}
        </div>

        <div
          className={`flex flex-wrap justify-center gap-1 font-bold ${
            isForExport ? 'text-5xl' : 'text-[clamp(1.6rem,7vw,3.2rem)]'
          }`}
        >
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
