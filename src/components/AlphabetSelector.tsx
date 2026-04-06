import { alphabetData } from '../data/alphabetData';

interface AlphabetSelectorProps {
  currentIndex: number;
  onSelectLetter: (index: number) => void;
}

const AlphabetSelector = ({ currentIndex, onSelectLetter }: AlphabetSelectorProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Selecciona una letra
      </h3>
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
        {alphabetData.map((item, index) => (
          <button
            key={item.letter}
            onClick={() => onSelectLetter(index)}
            className={`w-12 h-12 rounded-lg font-bold text-xl transition-all ${
              currentIndex === index
                ? 'bg-blue-500 text-white scale-110 shadow-lg'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            {item.letter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetSelector;
