import jsPDF from 'jspdf';
import { FlashcardData } from '../data/alphabetData';

export const CARD_SIZES = {
  small:  { width: 60,  height: 100, name: 'Pequeño',  subtitle: '6×10 cm' },
  medium: { width: 80,  height: 150, name: 'Mediano',  subtitle: '8×15 cm' },
  large:  { width: 100, height: 180, name: 'Grande',   subtitle: '10×18 cm' },
} as const;

export const LAYOUTS = {
  '2x2': { cols: 2, rows: 2, name: '4 por página' },
  '2x3': { cols: 2, rows: 3, name: '6 por página' },
  '3x3': { cols: 3, rows: 3, name: '9 por página' },
} as const;

export type CardSizeKey = keyof typeof CARD_SIZES;
export type LayoutKey   = keyof typeof LAYOUTS;

const RENDER_W = 960; // fixed render width in px (height computed from ratio)

async function fetchAsDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function flashcardToCanvas(
  data: FlashcardData,
  cardWidthMm: number,
  cardHeightMm: number,
): Promise<HTMLCanvasElement> {
  const W     = RENDER_W;
  const H     = Math.round(W * cardHeightMm / cardWidthMm);
  const TOP_H = Math.round(H * 0.6);
  const BOT_H = H - TOP_H;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Amber image section
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(0, 0, W, TOP_H);

  // Draw emoji SVG
  try {
    const dataUrl = await fetchAsDataUrl(data.image);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const pad = 80;
        const size = TOP_H - pad * 2;
        ctx.drawImage(img, (W - size) / 2, pad, size, size);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
  } catch {
    // continue without image
  }

  // Outer black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, W - 18, H - 18);

  // Divider line between sections
  ctx.beginPath();
  ctx.moveTo(0, TOP_H);
  ctx.lineTo(W, TOP_H);
  ctx.stroke();

  // Letter (large, bold, gray-800)
  const letterSize = Math.round(W * 0.22);
  ctx.font = `900 ${letterSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.letter, W / 2, TOP_H + BOT_H * 0.38);

  // Syllables: first=red, rest=black, dash=gray
  const sylSize = Math.round(W * 0.125);
  ctx.font = `bold ${sylSize}px Arial, Helvetica, sans-serif`;
  const sylY = TOP_H + BOT_H * 0.75;
  const dash = ' - ';
  const dashW = ctx.measureText(dash).width;
  const sylWidths = data.syllables.map(s => ctx.measureText(s).width);
  const totalW = sylWidths.reduce((a, b) => a + b, 0) + dashW * (data.syllables.length - 1);

  let curX = (W - totalW) / 2;
  data.syllables.forEach((syl, i) => {
    ctx.fillStyle = i === 0 ? '#dc2626' : '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(syl, curX, sylY);
    curX += sylWidths[i];
    if (i < data.syllables.length - 1) {
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(dash, curX, sylY);
      curX += dashW;
    }
  });

  return canvas;
}

export const exportSingleFlashcard = async (
  data: FlashcardData,
  filename: string,
  sizeKey: CardSizeKey = 'medium',
): Promise<void> => {
  try {
    const { width, height } = CARD_SIZES[sizeKey];
    const canvas = await flashcardToCanvas(data, width, height);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height],
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const exportAllFlashcards = async (
  flashcardsData: FlashcardData[],
  sizeKey: CardSizeKey = 'medium',
  layoutKey: LayoutKey = '2x2',
): Promise<void> => {
  try {
    const { width: CARD_W_MM, height: CARD_H_MM } = CARD_SIZES[sizeKey];
    const { cols: COLS, rows: ROWS } = LAYOUTS[layoutKey];
    const PER_PAGE = COLS * ROWS;

    const SCALE     = RENDER_W / CARD_W_MM; // px per mm
    const MARGIN_MM = 5;
    const GAP_MM    = 5;
    const MARGIN    = MARGIN_MM * SCALE;
    const GAP       = GAP_MM * SCALE;

    const CARD_W_PX = RENDER_W;
    const CARD_H_PX = Math.round(RENDER_W * CARD_H_MM / CARD_W_MM);

    const PAGE_W_MM = COLS * CARD_W_MM + (COLS - 1) * GAP_MM + 2 * MARGIN_MM;
    const PAGE_H_MM = ROWS * CARD_H_MM + (ROWS - 1) * GAP_MM + 2 * MARGIN_MM;
    const PAGE_W_PX = PAGE_W_MM * SCALE;
    const PAGE_H_PX = PAGE_H_MM * SCALE;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [PAGE_W_MM, PAGE_H_MM],
    });

    const totalPages = Math.ceil(flashcardsData.length / PER_PAGE);

    for (let p = 0; p < totalPages; p++) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width  = PAGE_W_PX;
      pageCanvas.height = PAGE_H_PX;
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, PAGE_W_PX, PAGE_H_PX);

      const cardsOnPage   = flashcardsData.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
      const cardCanvases  = await Promise.all(
        cardsOnPage.map(card => flashcardToCanvas(card, CARD_W_MM, CARD_H_MM))
      );

      cardCanvases.forEach((cardCanvas, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = MARGIN + col * (CARD_W_PX + GAP);
        const y = MARGIN + row * (CARD_H_PX + GAP);
        ctx.drawImage(cardCanvas, x, y, CARD_W_PX, CARD_H_PX);
      });

      if (p > 0) {
        pdf.addPage([PAGE_W_MM, PAGE_H_MM], 'portrait');
      }
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W_MM, PAGE_H_MM);
    }

    pdf.save('alfabeto-completo.pdf');
  } catch (error) {
    console.error('Error exporting all flashcards:', error);
    throw error;
  }
};
