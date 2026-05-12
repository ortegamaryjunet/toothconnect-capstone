import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/RiskResultScreen';

const CATEGORY_LABELS = {
  disease_indicators: 'Disease indicators',
  risk_factors: 'Risk factors',
  protective_factors: 'Protective factors',
};

export default function RiskResultScreen({ navigation, route }) {
  const { assessment } = route.params;
  const { score, risk_level, breakdown, recommendations } = assessment;

  const levelCardStyle = {
    low: styles.levelCardLow,
    moderate: styles.levelCardModerate,
    high: styles.levelCardHigh,
  }[risk_level];

  const levelLabelStyle = {
    low: styles.levelLabelLow,
    moderate: styles.levelLabelModerate,
    high: styles.levelLabelHigh,
  }[risk_level];

  const levelTextStyle = {
    low: styles.levelTextLow,
    moderate: styles.levelTextModerate,
    high: styles.levelTextHigh,
  }[risk_level];

  const scoreTextStyle = {
    low: styles.scoreTextLow,
    moderate: styles.scoreTextModerate,
    high: styles.scoreTextHigh,
  }[risk_level];

  function renderBreakdownCategory(category, items) {
    if (!items || items.length === 0) return null;
    return (
      <View key={category}>
        <Text style={styles.breakdownCategory}>{CATEGORY_LABELS[category]}</Text>
        {items.map(item => (
          <View key={item.code} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <Text
              style={[
                styles.breakdownWeight,
                item.weight < 0 ? styles.breakdownWeightProtective : styles.breakdownWeightRisk,
              ]}
            >
              {item.weight > 0 ? `+${item.weight}` : item.weight}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const totalSelected =
    (breakdown.disease_indicators?.length || 0) +
    (breakdown.risk_factors?.length || 0) +
    (breakdown.protective_factors?.length || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your risk assessment</Text>
      </View>

      <ScrollView style={styles.body}>
        <View style={[styles.levelCard, levelCardStyle]}>
          <Text style={[styles.levelLabel, levelLabelStyle]}>Your risk level</Text>
          <Text style={[styles.levelText, levelTextStyle]}>{risk_level}</Text>
          <Text style={[styles.scoreText, scoreTextStyle]}>Score: {score}</Text>
        </View>

        <Text style={styles.headline}>{recommendations.headline}</Text>

        <Text style={styles.sectionTitle}>How your score was calculated</Text>
        {totalSelected === 0 ? (
          <Text style={styles.emptyBreakdown}>No factors selected.</Text>
        ) : (
          <>
            {renderBreakdownCategory('disease_indicators', breakdown.disease_indicators)}
            {renderBreakdownCategory('risk_factors', breakdown.risk_factors)}
            {renderBreakdownCategory('protective_factors', breakdown.protective_factors)}
          </>
        )}

        <Text style={styles.sectionTitle}>Recommendations</Text>
        {recommendations.items.map((item, idx) => (
          <View key={idx} style={styles.recommendationItem}>
            <Text style={styles.recommendationBullet}>•</Text>
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}

        <Text style={styles.recallInfo}>
          Suggested check-up: every {recommendations.recall_months} months
        </Text>

        <TouchableOpacity
          onPress={() => navigation.popToTop()}
          style={styles.doneBtn}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}