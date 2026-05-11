import styles from '../styles/DentalChart';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const TOOTH_WIDTH = 28;
const TOOTH_HEIGHT = 36;

export default function DentalChart({ treatmentsByTooth, conditions, selectedTooth, onSelectTooth }) {
  function colorForTooth(toothNumber) {
    const list = treatmentsByTooth[toothNumber];
    if (!list || list.length === 0) return '#f7fafc';

    const latest = list[0];
    const cond = conditions.find(c => c.code === latest.condition_type);
    return cond ? cond.color : '#e2e8f0';
  }

  function strokeForTooth(toothNumber) {
    const list = treatmentsByTooth[toothNumber];
    if (!list || list.length === 0) return '#cbd5e0';
    return '#4a5568';
  }

  function renderTooth(num, isUpper) {
    const selected = selectedTooth === num;
    return (
      <div
        key={num}
        style={styles.tooth}
        onClick={() => onSelectTooth(num)}
      >
        {isUpper && <div style={styles.toothNumber}>{num}</div>}
        <svg
          width={TOOTH_WIDTH}
          height={TOOTH_HEIGHT}
          viewBox={`0 0 ${TOOTH_WIDTH} ${TOOTH_HEIGHT}`}
          style={{ ...styles.toothSvg, ...(selected ? styles.toothSelected : {}) }}
        >
          <rect
            x="2"
            y="2"
            width={TOOTH_WIDTH - 4}
            height={TOOTH_HEIGHT - 4}
            rx="4"
            fill={colorForTooth(num)}
            stroke={strokeForTooth(num)}
            strokeWidth="1.5"
          />
        </svg>
        {!isUpper && <div style={{ ...styles.toothNumber, ...styles.toothNumberLower }}>{num}</div>}
      </div>
    );
  }

  return (
    <div style={styles.chartContainer}>
      <div style={styles.arch}>
        <div style={styles.archLabel}>R</div>
        {UPPER_RIGHT.map(n => renderTooth(n, true))}
        <div style={styles.midline} />
        {UPPER_LEFT.map(n => renderTooth(n, true))}
        <div style={{ ...styles.archLabel, ...styles.archLabelRight }}>L</div>
      </div>

      <div style={styles.arch}>
        <div style={styles.archLabel}>R</div>
        {LOWER_RIGHT.map(n => renderTooth(n, false))}
        <div style={styles.midline} />
        {LOWER_LEFT.map(n => renderTooth(n, false))}
        <div style={{ ...styles.archLabel, ...styles.archLabelRight }}>L</div>
      </div>
    </div>
  );
}