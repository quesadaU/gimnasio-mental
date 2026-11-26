"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/components/ui";
import { PIECE_NAME, fileOf, rankOf, squareName, type Color, type Piece, type Position } from "./domain/chess.ts";

/* Se usan siempre los glifos rellenos y el color se da con CSS: así blancas y negras tienen la misma
   forma y el contraste no depende de la fuente. U+FE0E fuerza la presentación como texto (no emoji). */
const GLYPH: Record<Piece["type"], string> = {
  k: "♚︎",
  q: "♛︎",
  r: "♜︎",
  b: "♝︎",
  n: "♞︎",
  p: "♟︎",
};

export interface ChessBoardProps {
  position: Position;
  orientation: Color;
  selected: number | null;
  targets: ReadonlySet<number>;
  lastMove: { from: number; to: number } | null;
  hint: { from: number; to: number } | null;
  disabled?: boolean;
  describedBy?: string;
  onSquare(square: number): void;
}

function pieceLabel(piece: Piece): string {
  return `${PIECE_NAME[piece.type]} ${piece.color === "w" ? "blanco" : "negro"}`;
}

/**
 * Tablero como rejilla ARIA con foco itinerante: Tab entra en el tablero, las flechas mueven
 * el foco por casillas (Inicio/Fin: extremos de la fila) e Intro o Espacio selecciona.
 * Cada casilla anuncia coordenada, pieza y estado; las marcas visuales usan forma además de color.
 */
export function ChessBoard({
  position,
  orientation,
  selected,
  targets,
  lastMove,
  hint,
  disabled = false,
  describedBy,
  onSquare,
}: ChessBoardProps) {
  const [focused, setFocused] = useState<number>(() => (orientation === "w" ? 12 : 52)); // e2 / e7
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fila visual 0 = arriba. Con orientación blanca arriba está la fila 8.
  const ranks = orientation === "w" ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = orientation === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const moveFocus = (square: number) => {
    setFocused(square);
    refs.current[square]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, square: number) => {
    const row = ranks.indexOf(rankOf(square));
    const col = files.indexOf(fileOf(square));
    let next: [number, number] | null = null;
    switch (event.key) {
      case "ArrowUp":
        next = [row - 1, col];
        break;
      case "ArrowDown":
        next = [row + 1, col];
        break;
      case "ArrowLeft":
        next = [row, col - 1];
        break;
      case "ArrowRight":
        next = [row, col + 1];
        break;
      case "Home":
        next = [row, 0];
        break;
      case "End":
        next = [row, 7];
        break;
      default:
        return;
    }
    event.preventDefault();
    const [r, c] = next;
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    moveFocus(ranks[r] * 8 + files[c]);
  };

  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-1 self-center">
      <div
        role="grid"
        aria-label="Tablero de ajedrez"
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        className="grid grid-rows-8 overflow-hidden rounded-md border-2 border-line-strong shadow-card"
      >
        {ranks.map((rank, rowIndex) => (
          <div role="row" key={rank} className="grid grid-cols-8">
            {files.map((file, colIndex) => {
              const square = rank * 8 + file;
              const piece = position.board[square];
              const dark = (rank + file) % 2 === 0;
              const isSelected = selected === square;
              const isTarget = targets.has(square);
              const isLast = lastMove !== null && (lastMove.from === square || lastMove.to === square);
              const isHint = hint !== null && (hint.from === square || hint.to === square);

              const parts = [squareName(square), piece ? pieceLabel(piece) : "vacía"];
              if (isSelected) parts.push("seleccionada");
              if (isTarget) parts.push(piece ? "captura posible" : "destino posible");
              if (isLast) parts.push("última jugada");
              if (isHint) parts.push("pista");

              return (
                <div role="gridcell" key={file} aria-selected={isSelected} className="relative">
                  <button
                    ref={(node) => {
                      refs.current[square] = node;
                    }}
                    type="button"
                    tabIndex={square === focused ? 0 : -1}
                    aria-label={parts.join(", ")}
                    aria-disabled={disabled || undefined}
                    onFocus={() => setFocused(square)}
                    onKeyDown={(event) => onKeyDown(event, square)}
                    onClick={() => !disabled && onSquare(square)}
                    className={cx(
                      "relative flex aspect-square w-full items-center justify-center",
                      "focus-visible:z-10 focus-visible:outline-offset-[-4px]",
                      dark ? "bg-[#7f9c8c]" : "bg-[#ece6d6]",
                      isLast && (dark ? "bg-[#b9a25a]" : "bg-[#efdc95]"),
                    )}
                  >
                    {/* Coordenadas en el borde del tablero */}
                    {colIndex === 0 ? (
                      <span aria-hidden="true" className="absolute left-0.5 top-0 text-[0.6rem] font-bold text-[#1c2320]/80 sm:text-xs">
                        {rank + 1}
                      </span>
                    ) : null}
                    {rowIndex === 7 ? (
                      <span aria-hidden="true" className="absolute bottom-0 right-1 text-[0.6rem] font-bold text-[#1c2320]/80 sm:text-xs">
                        {"abcdefgh"[file]}
                      </span>
                    ) : null}

                    {isSelected ? (
                      <span aria-hidden="true" className="absolute inset-0 border-[5px] border-[#1f5c8a]" />
                    ) : null}
                    {isHint ? (
                      <span aria-hidden="true" className="absolute inset-1 rounded-sm border-[3px] border-dashed border-[#a4481f]" />
                    ) : null}

                    {piece ? (
                      <span
                        aria-hidden="true"
                        className={cx(
                          "relative select-none text-[min(9vw,2.7rem)] leading-none",
                          piece.color === "w" ? "text-white [paint-order:stroke_fill] [-webkit-text-stroke:1.5px_#1c2320]" : "text-[#1c2320]",
                        )}
                      >
                        {GLYPH[piece.type]}
                      </span>
                    ) : null}

                    {isTarget ? (
                      piece ? (
                        <span aria-hidden="true" className="absolute inset-0.5 rounded-full border-4 border-[#1c2320]/60" />
                      ) : (
                        <span aria-hidden="true" className="absolute size-[28%] rounded-full bg-[#1c2320]/55" />
                      )
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
