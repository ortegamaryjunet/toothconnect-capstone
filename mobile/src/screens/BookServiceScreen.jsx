import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import { getBranchCity } from '../utils/branch';
import styles from '../styles/BookServiceScreen';

export default function BookServiceScreen({ navigation }) {
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeta();
  }, []);

  async function loadMeta() {
    try {
      const res = await api.get('/appointments/_meta/services-and-branches');
      setBranches(res.data.branches);
      setServices(res.data.services);
      if (res.data.branches.length > 0) {
        setSelectedBranch(res.data.branches[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  function handleServiceTap(service) {
    if (!selectedBranch) {
      setError('Please pick a branch first');
      return;
    }
    const branch = branches.find(b => b.id === selectedBranch);

    navigation.navigate('BookSuggestions', {
      service,
      branchId: selectedBranch,
      branchName: getBranchCity(branch),
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Branch</Text>
            <View style={styles.branchPicker}>
              {branches.map(b => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBranch(b.id)}
                  style={[styles.branchChip, selectedBranch === b.id && styles.branchChipActive]}
                >
                  <Text
                    style={[styles.branchChipText, selectedBranch === b.id && styles.branchChipTextActive]}
                  >
                    {getBranchCity(b)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Choose a service</Text>
            {services
              .filter(s =>
                !selectedBranch ||
                !s.available_branch_ids ||
                s.available_branch_ids.includes(selectedBranch)
              )
              .map(s => (
              <TouchableOpacity
                key={s.id}
                onPress={() => handleServiceTap(s)}
                style={styles.serviceCard}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <Text style={styles.serviceMeta}>{s.duration_min} min</Text>
                </View>
                <Text style={styles.servicePrice}>₱{Number(s.price).toFixed(0)}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
