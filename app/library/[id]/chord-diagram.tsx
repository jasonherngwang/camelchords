export interface ChordDiagramProps {
  chord: string;
  width?: number;
  height?: number;
}

const CHORD_FINGERINGS_UKE = {
  // Major chords
  A: { frets: [2, 1, 0, 0], fingers: ["2", "1", "", ""] },
  B: { frets: [4, 3, 2, 2], fingers: ["4", "3", "2", "1"] },
  C: { frets: [0, 0, 0, 3], fingers: ["", "", "", "3"] },
  D: { frets: [2, 2, 2, 0], fingers: ["1", "2", "3", ""] },
  E: { frets: [1, 4, 0, 2], fingers: ["1", "4", "", "2"] },
  F: { frets: [2, 0, 1, 0], fingers: ["2", "", "1", ""] },
  G: { frets: [0, 2, 3, 2], fingers: ["", "1", "3", "2"] },
  "A#": { frets: [3, 2, 1, 1], fingers: ["3", "2", "1", "1"] },
  Bb: { frets: [3, 2, 1, 1], fingers: ["3", "2", "1", "1"] },
  "C#": { frets: [1, 1, 1, 4], fingers: ["1", "1", "1", "4"] },
  Db: { frets: [1, 1, 1, 4], fingers: ["1", "1", "1", "4"] },
  "D#": { frets: [3, 3, 3, 1], fingers: ["3", "3", "3", "1"] },
  Eb: { frets: [3, 3, 3, 1], fingers: ["3", "3", "3", "1"] },
  "F#": { frets: [3, 1, 2, 1], fingers: ["3", "1", "2", "1"] },
  Gb: { frets: [3, 1, 2, 1], fingers: ["3", "1", "2", "1"] },
  "G#": { frets: [1, 3, 4, 3], fingers: ["1", "3", "4", "2"] },
  Ab: { frets: [1, 3, 4, 3], fingers: ["1", "3", "4", "2"] },

  // Minor chords
  Am: { frets: [2, 0, 0, 0], fingers: ["1", "", "", ""] },
  Bm: { frets: [4, 2, 2, 2], fingers: ["4", "1", "2", "3"] },
  Cm: { frets: [0, 3, 3, 3], fingers: ["", "1", "2", "3"] },
  Dm: { frets: [2, 2, 1, 0], fingers: ["2", "3", "1", ""] },
  Em: { frets: [0, 4, 3, 2], fingers: ["", "4", "3", "2"] },
  Fm: { frets: [1, 0, 1, 3], fingers: ["1", "", "2", "3"] },
  Gm: { frets: [0, 2, 3, 1], fingers: ["", "2", "3", "1"] },
  "A#m": { frets: [3, 1, 1, 1], fingers: ["3", "1", "1", "1"] },
  Bbm: { frets: [3, 1, 1, 1], fingers: ["3", "1", "1", "1"] },
  "C#m": { frets: [1, 2, 2, 4], fingers: ["1", "2", "2", "4"] },
  Dbm: { frets: [1, 2, 2, 4], fingers: ["1", "2", "2", "4"] },
  "D#m": { frets: [3, 3, 2, 1], fingers: ["3", "4", "2", "1"] },
  Ebm: { frets: [3, 3, 2, 1], fingers: ["3", "4", "2", "1"] },
  "F#m": { frets: [2, 1, 2, 0], fingers: ["2", "1", "3", ""] },
  Gbm: { frets: [2, 1, 2, 0], fingers: ["2", "1", "3", ""] },
  "G#m": { frets: [1, 3, 4, 2], fingers: ["1", "3", "4", "2"] },
  Abm: { frets: [1, 3, 4, 2], fingers: ["1", "3", "4", "2"] },

  // 7th chords
  A7: { frets: [0, 1, 0, 0], fingers: ["", "1", "", ""] },
  B7: { frets: [2, 3, 2, 2], fingers: ["1", "4", "2", "3"] },
  C7: { frets: [0, 0, 0, 1], fingers: ["", "", "", "1"] },
  D7: { frets: [2, 2, 2, 3], fingers: ["1", "2", "3", "4"] },
  E7: { frets: [1, 2, 0, 2], fingers: ["1", "3", "", "2"] },
  F7: { frets: [2, 3, 1, 0], fingers: ["2", "4", "1", ""] },
  G7: { frets: [0, 2, 1, 2], fingers: ["", "2", "1", "3"] },
  "A#7": { frets: [1, 2, 1, 1], fingers: ["1", "3", "2", "2"] },
  Bb7: { frets: [1, 2, 1, 1], fingers: ["1", "3", "2", "2"] },
  "C#7": { frets: [1, 1, 1, 2], fingers: ["1", "1", "1", "2"] },
  Db7: { frets: [1, 1, 1, 2], fingers: ["1", "1", "1", "2"] },
  "D#7": { frets: [1, 3, 1, 1], fingers: ["1", "3", "1", "1"] },
  Eb7: { frets: [1, 3, 1, 1], fingers: ["1", "3", "1", "1"] },
  "F#7": { frets: [1, 1, 2, 1], fingers: ["1", "1", "3", "1"] },
  Gb7: { frets: [1, 1, 2, 1], fingers: ["1", "1", "3", "1"] },
  "G#7": { frets: [1, 3, 2, 3], fingers: ["1", "3", "2", "4"] },
  Ab7: { frets: [1, 3, 2, 3], fingers: ["1", "3", "2", "4"] },

  // Minor 7th chords
  Am7: { frets: [0, 0, 0, 0], fingers: ["", "", "", ""] },
  Bm7: { frets: [2, 2, 2, 2], fingers: ["1", "1", "1", "1"] },
  Cm7: { frets: [0, 3, 3, 3], fingers: ["", "1", "1", "1"] },
  Dm7: { frets: [2, 2, 1, 3], fingers: ["2", "3", "1", "4"] },
  Em7: { frets: [0, 2, 0, 2], fingers: ["", "1", "", "3"] },
  Fm7: { frets: [1, 1, 1, 3], fingers: ["1", "1", "1", "3"] },
  Gm7: { frets: [0, 2, 1, 1], fingers: ["", "2", "1", "1"] },
};

export function UkuleleChordDiagram({
  chord,
  width = 100,
  height = 120,
}: ChordDiagramProps) {
  if (!(chord in CHORD_FINGERINGS_UKE)) {
    return null;
  }
  const currentChord = CHORD_FINGERINGS_UKE[
    chord as keyof typeof CHORD_FINGERINGS_UKE
  ] || {
    frets: [0, 0, 0, 0],
    fingers: ["", "", "", ""],
  };

  return (
    <svg width={width} height={height} viewBox="0 0 100 120">
      {/* Strings */}
      {[20, 40, 60, 80].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1="10"
          x2={x}
          y2="90"
          stroke="var(--color-text)"
          strokeWidth={i === 0 ? 2 : 1}
          strokeOpacity="0.7"
        />
      ))}

      {/* Frets */}
      {[10, 30, 50, 70, 90].map((y, i) => (
        <line
          key={i}
          x1="20"
          y1={y}
          x2="80"
          y2={y}
          stroke="var(--color-text)"
          strokeWidth={i === 0 ? 2 : 1}
          strokeOpacity="0.7"
        />
      ))}

      {/* Fingers */}
      {currentChord.frets.map((fret, i) => {
        if (fret === 0) return null;
        const x = 20 + i * 20;
        const y = 10 + (fret - 1) * 20 + 10;
        return <circle key={i} cx={x} cy={y} r="8" fill="var(--color-pine)" />;
      })}

      {/* Finger numbers */}
      {currentChord.fingers.map((finger, i) => {
        if (!finger) return null;
        const x = 20 + i * 20;
        const y = 10 + (currentChord.frets[i] - 1) * 20 + 15;
        return (
          <text
            key={i}
            x={x}
            y={y}
            fill="var(--color-surface)"
            textAnchor="middle"
            fontSize="12"
          >
            {finger}
          </text>
        );
      })}

      {/* Chord name */}
      <text
        x="50"
        y="110"
        textAnchor="middle"
        fontSize="14"
        fill="var(--color-text)"
      >
        {chord}
      </text>
    </svg>
  );
}
