"use client";

import { useId } from "react";
import { FONTS, FONT_SIZES, THEMES, stepFontSize, type ReaderPrefs } from "../domain/prefs";
import { FONT_LABELS, THEME_LABELS } from "./reader-theme";

interface ReaderSettingsProps {
  id: string;
  prefs: ReaderPrefs;
  onChange: (patch: Partial<ReaderPrefs>) => void;
}

const FONT_SIZE_LABELS: Record<ReaderPrefs["fontSize"], string> = {
  s: "Pequeño",
  m: "Normal",
  l: "Grande",
  xl: "Muy grande",
};

const controlBase =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-base " +
  "border-[var(--r-line)] has-[:checked]:border-[var(--r-accent)] has-[:checked]:font-semibold";

/** Panel de ajustes del lector. Todo son controles nativos: radio, checkbox y botones. */
export function ReaderSettings({ id, prefs, onChange }: ReaderSettingsProps) {
  const baseId = useId();
  const sizeIndex = FONT_SIZES.indexOf(prefs.fontSize);

  return (
    <div id={id} className="flex flex-col gap-5 border-t border-[var(--r-line)]/40 py-4 font-sans text-base">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Tema</legend>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <label key={theme} className={controlBase}>
              <input
                type="radio"
                name={`${baseId}-tema`}
                value={theme}
                checked={prefs.theme === theme}
                onChange={() => onChange({ theme })}
                className="size-4 accent-[var(--r-accent)]"
              />
              {THEME_LABELS[theme]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Tipografía</legend>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((font) => (
            <label key={font} className={controlBase}>
              <input
                type="radio"
                name={`${baseId}-fuente`}
                value={font}
                checked={prefs.font === font}
                onChange={() => onChange({ font })}
                className="size-4 accent-[var(--r-accent)]"
              />
              {FONT_LABELS[font]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2" role="group" aria-labelledby={`${baseId}-tamano`}>
        <span id={`${baseId}-tamano`} className="text-sm font-semibold">
          Tamaño del texto
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ fontSize: stepFontSize(prefs.fontSize, -1) })}
            disabled={sizeIndex === 0}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--r-line)] text-base font-semibold disabled:opacity-50"
            aria-label="Reducir tamaño del texto"
          >
            A−
          </button>
          <output className="min-w-28 text-center" aria-live="polite">
            {FONT_SIZE_LABELS[prefs.fontSize]}
          </output>
          <button
            type="button"
            onClick={() => onChange({ fontSize: stepFontSize(prefs.fontSize, 1) })}
            disabled={sizeIndex === FONT_SIZES.length - 1}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--r-line)] text-lg font-semibold disabled:opacity-50"
            aria-label="Aumentar tamaño del texto"
          >
            A+
          </button>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Ayudas opcionales</legend>
        <div className="flex flex-col gap-2">
          <Toggle
            checked={prefs.focusMode}
            onChange={(focusMode) => onChange({ focusMode })}
            label="Modo foco"
            hint="Atenúa los párrafos que no estás leyendo."
          />
          <Toggle
            checked={prefs.lineGuide}
            onChange={(lineGuide) => onChange({ lineGuide })}
            label="Guía de línea"
            hint="Una banda suave marca la línea de lectura; sigue al puntero si usas ratón."
          />
          <Toggle
            checked={prefs.showTimer}
            onChange={(showTimer) => onChange({ showTimer })}
            label="Cronómetro"
            hint="Muestra el tiempo que llevas leyendo. Nunca cuenta hacia atrás ni te mete prisa."
          />
        </div>
      </fieldset>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint: string;
}) {
  const hintId = useId();
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-1 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={hintId}
        className="mt-1 size-5 shrink-0 accent-[var(--r-accent)]"
      />
      <span className="flex flex-col">
        <span className="font-semibold">{label}</span>
        <span id={hintId} className="text-sm text-[var(--r-muted)]">
          {hint}
        </span>
      </span>
    </label>
  );
}
