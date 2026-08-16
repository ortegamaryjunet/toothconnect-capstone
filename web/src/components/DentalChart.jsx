import { useState } from 'react';
import styles from '../styles/DentalChart';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const TOOTH_WIDTH = 28;
const TOOTH_HEIGHT = 36;

export default function DentalChart({
  treatmentsByTooth,
  conditions,
  selectedTooth,
  onSelectTooth,
}) {
  const [hoveredTooth, setHoveredTooth] = useState(null);

  function colorForTooth(toothNumber) {
    const list = treatmentsByTooth[toothNumber];

    if (!list || list.length === 0) {
      return '#fffdf8';
    }

    const latest = list[0];

    const cond = conditions.find(
      c => c.code === latest.condition_type
    );

    return cond ? cond.color : '#eee6d4';
  }

  function strokeForTooth(toothNumber) {
    const list = treatmentsByTooth[toothNumber];

    if (!list || list.length === 0) {
      return '#d7c9a5';
    }

    return '#b58a1c';
  }

  function renderTooth(num, isUpper) {
    const selected = selectedTooth === num;
    const hovered = hoveredTooth === num;

    return (
      <div
        key={num}
        style={{
          ...styles.tooth,
          ...(hovered ? styles.toothHover : {}),
        }}
        onClick={() => onSelectTooth(num)}
        onMouseEnter={() => setHoveredTooth(num)}
        onMouseLeave={() => setHoveredTooth(null)}
        title={`Tooth #${num}`}
      >
        {isUpper && (
          <div
            style={{
              ...styles.toothNumber,
              ...(selected ? styles.toothNumberSelected : {}),
            }}
          >
            {num}
          </div>
        )}

        <svg
          width={TOOTH_WIDTH}
          height={TOOTH_HEIGHT}
          viewBox={`0 0 ${TOOTH_WIDTH} ${TOOTH_HEIGHT}`}
          style={{
            ...styles.toothSvg,
            ...(selected ? styles.toothSelected : {}),
          }}
        >
          <rect
            x="2"
            y="2"
            width={TOOTH_WIDTH - 4}
            height={TOOTH_HEIGHT - 4}
            rx="6"
            fill={colorForTooth(num)}
            stroke={strokeForTooth(num)}
            strokeWidth={selected ? '2' : '1.5'}
          />

          {selected && (
            <circle
              cx={TOOTH_WIDTH - 6}
              cy="6"
              r="3"
              fill="#c49a22"
            />
          )}
        </svg>

        {!isUpper && (
          <div
            style={{
              ...styles.toothNumber,
              ...styles.toothNumberLower,
              ...(selected ? styles.toothNumberSelected : {}),
            }}
          >
            {num}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.chartContainer}>
      <div style={styles.chartHeader}>
        <div style={styles.chartTitle}>
          Tooth Chart
        </div>

        <div style={styles.chartHint}>
          Select a tooth to add or view treatment
        </div>
      </div>

      <div style={styles.chartCard}>
        <div style={styles.arch}>
          <div style={styles.archLabel}>R</div>

          {UPPER_RIGHT.map(n =>
            renderTooth(n, true)
          )}

          <div style={styles.midline} />

          {UPPER_LEFT.map(n =>
            renderTooth(n, true)
          )}

          <div
            style={{
              ...styles.archLabel,
              ...styles.archLabelRight,
            }}
          >
            L
          </div>
        </div>

        <div style={styles.archDivider} />

        <div style={styles.arch}>
          <div style={styles.archLabel}>R</div>

          {LOWER_RIGHT.map(n =>
            renderTooth(n, false)
          )}

          <div style={styles.midline} />

          {LOWER_LEFT.map(n =>
            renderTooth(n, false)
          )}

          <div
            style={{
              ...styles.archLabel,
              ...styles.archLabelRight,
            }}
          >
            L
          </div>
        </div>
      </div>

      {selectedTooth && (
        <div style={styles.selectedInfo}>
          <span style={styles.selectedDot} />

          <span>
            Tooth <strong>#{selectedTooth}</strong> selected
          </span>
        </div>
      )}
    </div>
  );
}