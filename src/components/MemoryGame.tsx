import { useState, useEffect } from 'react';
import { alphabetData } from '../data/alphabetData';
import Confetti from './Confetti';
import { RotateCcw, Timer, Zap } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFF = {
  easy:   { pairs: 6,  label: 'Fácil',   emoji: '😊', color: 'bg-green-400  hover:bg-green-500',  cols: 'grid-cols-4' },
  medium: { pairs: 10, label: 'Medio',   emoji: '🤔', color: 'bg-yellow-400 hover:bg-yellow-500', cols: 'grid-cols-4 sm:grid-cols-5' },
  hard:   { pairs: 18, label: 'Difícil', emoji: '🌟', color: 'bg-red-400    hover:bg-red-500',    cols: 'grid-cols-5 sm:grid-cols-6' },
} as const;

const BACK_GRADIENTS = [
  'from-blue-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-yellow-400',
  'from-indigo-400 to-blue-500',
  'from-fuchsia-400 to-pink-500',
];

interface GameCard {
  id: number;
  letter: string;
  word: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const startGame = (diff: Difficulty) => {
    const { pairs } = DIFF[diff];
    const selected = [...alphabetData]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs);

    const deck: GameCard[] = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((card, i) => ({
        id: i,
        letter: card.letter,
        word: card.word,
        image: card.image,
        isFlipped: false,
        isMatched: false,
      }));

    setDifficulty(diff);
    setCards(deck);
    setFlippedIds([]);
    setMatchedPairs(0);
    setMoves(0);
    setSeconds(0);
    setShowConfetti(false);
    setTimerActive(true);
  };

  const handleCardClick = (clickedId: number) => {
    if (isChecking || difficulty === null) return;
    const clickedCard = cards[clickedId];
    if (clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedIds.length === 1 && flippedIds[0] === clickedId) return;

    const newCards = cards.map(c =>
      c.id === clickedId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedIds, clickedId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [id1, id2] = newFlipped;
      const c1 = newCards.find(c => c.id === id1)!;
      const c2 = newCards.find(c => c.id === id2)!;
      const capturedDiff = difficulty;

      setTimeout(() => {
        if (c1.letter === c2.letter) {
          setCards(prev =>
            prev.map(c =>
              c.id === id1 || c.id === id2 ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs(prev => {
            const next = prev + 1;
            if (next === DIFF[capturedDiff].pairs) {
              setTimerActive(false);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 5000);
            }
            return next;
          });
        } else {
          setCards(prev =>
            prev.map(c =>
              c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
            )
          );
        }
        setFlippedIds([]);
        setIsChecking(false);
      }, 900);
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const isWon = difficulty !== null && matchedPairs === DIFF[difficulty].pairs;

  // ── PANTALLA DE SELECCIÓN ──────────────────────────────────────────────
  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center gap-8 py-8 px-4">
        <div className="text-center">
          <div className="text-6xl mb-3">🃏</div>
          <h2 className="text-3xl font-black text-gray-800">¡Juego de Memoria!</h2>
          <p className="text-gray-500 mt-2 text-base">
            Voltea las tarjetas y encuentra los pares iguales
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {(Object.entries(DIFF) as [Difficulty, typeof DIFF[Difficulty]][]).map(([key, d]) => (
            <button
              key={key}
              onClick={() => startGame(key)}
              className={`flex flex-col items-center gap-2 px-10 py-7 rounded-3xl text-white font-black shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 ${d.color}`}
            >
              <span className="text-5xl">{d.emoji}</span>
              <span className="text-2xl">{d.label}</span>
              <span className="text-sm font-semibold opacity-90">
                {d.pairs} pares · {d.pairs * 2} tarjetas
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white/70 rounded-2xl px-6 py-4 text-center text-sm text-gray-500 shadow-sm max-w-xs">
          💡 Toca dos tarjetas para voltearlas. Si son iguales, ¡se quedan!
        </div>
      </div>
    );
  }

  // ── PANTALLA DE VICTORIA ───────────────────────────────────────────────
  if (isWon) {
    const stars = moves <= DIFF[difficulty].pairs + 2 ? 3
      : moves <= DIFF[difficulty].pairs * 2 ? 2 : 1;

    return (
      <>
        {showConfetti && <Confetti />}
        <div className="flex flex-col items-center gap-6 py-12 text-center px-4">
          <div className="text-7xl" style={{ animation: 'bounce-letter 0.8s ease infinite' }}>
            🏆
          </div>
          <h2 className="text-4xl font-black text-gray-800">¡Ganaste!</h2>

          <div className="flex gap-2 text-4xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i}>{i < stars ? '⭐' : '☆'}</span>
            ))}
          </div>

          <div className="flex gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-md text-center">
              <div className="text-3xl font-black text-blue-500">{moves}</div>
              <div className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wide">jugadas</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md text-center">
              <div className="text-3xl font-black text-purple-500">{fmt(seconds)}</div>
              <div className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wide">tiempo</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md text-center">
              <div className="text-3xl font-black text-green-500">{DIFF[difficulty].pairs}</div>
              <div className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wide">pares</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => startGame(difficulty)}
              className="flex items-center justify-center gap-2 px-7 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-md"
            >
              <RotateCcw size={18} /> Jugar de nuevo
            </button>
            <button
              onClick={() => setDifficulty(null)}
              className="px-7 py-3 bg-white text-gray-600 border-2 border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cambiar dificultad
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── TABLERO ────────────────────────────────────────────────────────────
  const { pairs, cols } = DIFF[difficulty];

  return (
    <div className="flex flex-col items-center gap-4 pb-10 px-2">

      {/* Barra de estadísticas */}
      <div className="flex items-center gap-3 sm:gap-5 bg-white rounded-2xl px-4 sm:px-6 py-3 shadow-md flex-wrap justify-center">
        <div className="flex items-center gap-1.5 text-blue-500 font-black text-sm sm:text-base">
          <Zap size={16} />
          <span>{moves} jugadas</span>
        </div>
        <div className="w-px h-5 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-purple-500 font-black text-sm sm:text-base">
          <Timer size={16} />
          <span>{fmt(seconds)}</span>
        </div>
        <div className="w-px h-5 bg-gray-200 hidden sm:block" />
        <div className="font-black text-sm sm:text-base">
          <span className="text-green-500">{matchedPairs}</span>
          <span className="text-gray-400">/{pairs}</span>
          <span className="text-gray-500 font-semibold"> pares</span>
        </div>
        <button
          onClick={() => startGame(difficulty)}
          title="Reiniciar"
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setDifficulty(null)}
          className="text-xs text-gray-400 hover:text-gray-600 font-semibold underline underline-offset-2"
        >
          cambiar dificultad
        </button>
      </div>

      {/* Cuadrícula de tarjetas */}
      <div className={`grid ${cols} gap-2 sm:gap-3 w-full max-w-2xl`}>
        {cards.map(card => {
          const isVisible = card.isFlipped || card.isMatched;
          const gradient = BACK_GRADIENTS[card.id % BACK_GRADIENTS.length];

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              style={{ aspectRatio: '3/4' }}
              className={`rounded-2xl overflow-hidden border-[3px] transition-all duration-200 select-none ${
                card.isMatched
                  ? 'border-green-400 shadow-lg shadow-green-100 cursor-default'
                  : isVisible
                  ? 'border-blue-400 shadow-md shadow-blue-100 cursor-default'
                  : 'border-gray-300 cursor-pointer hover:border-blue-300 hover:scale-105 active:scale-95 hover:shadow-md'
              }`}
            >
              {isVisible ? (
                /* Cara de la tarjeta */
                <div className="w-full h-full flex flex-col bg-white animate-pop-in">
                  <div className={`flex-[3] flex items-center justify-center p-1 ${card.isMatched ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <img
                      src={card.image}
                      alt={card.word}
                      className="w-full h-full object-contain"
                    />
                    {card.isMatched && (
                      <div className="absolute top-1 right-1 text-base">✅</div>
                    )}
                  </div>
                  <div className="flex-[2] flex flex-col items-center justify-center bg-white py-1 relative">
                    <span
                      className={`font-black leading-none ${card.isMatched ? 'text-green-600' : 'text-gray-800'}`}
                      style={{ fontSize: 'clamp(1rem, 4vw, 1.8rem)' }}
                    >
                      {card.letter}
                    </span>
                    <span
                      className="text-gray-400 font-semibold mt-0.5"
                      style={{ fontSize: 'clamp(0.5rem, 1.8vw, 0.75rem)' }}
                    >
                      {card.word}
                    </span>
                  </div>
                </div>
              ) : (
                /* Dorso de la tarjeta */
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-1`}>
                  <span style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)' }}>❓</span>
                  <div className="flex gap-[3px]">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white/50" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
