import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Pressable,
  PanResponder,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { getMyPatientProfile, saveMyPatientProfile } from "../api/patients";
import { getUnreadCount } from "../api/notifications";
import styles from "../styles/ProfileScreen";

const NATIONALITIES = [
  "Filipino",
  "American",
  "Australian",
  "British",
  "Canadian",
  "Chinese",
  "French",
  "German",
  "Indian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Malaysian",
  "Singaporean",
  "Spanish",
  "Thai",
  "Vietnamese",
  "Other",
];

function formatDisplayDate(value) {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[2]}/${match[3]}/${match[1]}`;
}

function toApiDate(value) {
  const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[1]}-${match[2]}`;
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [nationalityModalVisible, setNationalityModalVisible] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const sidebarWidth = screenWidth * 0.9;

  const sidebarTranslateX = useRef(new Animated.Value(-sidebarWidth)).current;

  const [form, setForm] = useState({
    fullName: "",
    birthday: "",
    age: "",
    nationality: "",
    homeAddress: "",
    occupation: "",
    sex: "",
    contact: "",
    email: "",
    civilStatus: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
    dentalHistory: "",
  });

  const originalFormRef = useRef(null);

  const [errors, setErrors] = useState({});

  const profileToForm = (profile = {}) => {
    const birthday = formatDisplayDate(profile.birthday);

    return {
      fullName: profile.full_name || user?.name || "",
      birthday,
      age: profile.age ? String(profile.age) : calculateAge(birthday),
      nationality: profile.nationality || "",
      homeAddress: profile.address || "",
      occupation: profile.occupation || "",
      sex: profile.sex || "",
      contact: profile.contact_number || "",
      email: profile.email || user?.email || "",
      civilStatus: profile.civil_status || "",
      emergencyContactName: profile.emergency_contact_name || "",
      emergencyContactNumber: profile.emergency_contact_number || "",
      medicalConditions: profile.medical_conditions || "",
      allergies: profile.allergies || "",
      medications: profile.medications || "",
      dentalHistory: profile.dental_history || "",
    };
  };

  const formToProfile = () => ({
    full_name: form.fullName.trim(),
    birthday: toApiDate(form.birthday),
    age: form.age ? Number(form.age) : null,
    nationality: form.nationality.trim() || null,
    address: form.homeAddress.trim(),
    occupation: form.occupation.trim() || null,
    sex: form.sex.trim() || null,
    contact_number: form.contact.trim(),
    email: form.email.trim().toLowerCase(),
    civil_status: form.civilStatus.trim() || null,
    emergency_contact_name: form.emergencyContactName.trim() || null,
    emergency_contact_number: form.emergencyContactNumber.trim() || null,
    medical_conditions: form.medicalConditions.trim() || null,
    allergies: form.allergies.trim() || null,
    medications: form.medications.trim() || null,
    dental_history: form.dentalHistory.trim() || null,
  });

  function openSidebar() {
    Keyboard.dismiss();
    setSidebarOpen(true);
    sidebarTranslateX.setValue(-sidebarWidth);

    Animated.timing(sidebarTranslateX, {
      toValue: 0,
      duration: 230,
      useNativeDriver: true,
    }).start();

    getUnreadCount().then(setUnreadCount).catch(() => {});
  }

  function closeSidebar() {
    Animated.timing(sidebarTranslateX, {
      toValue: -sidebarWidth,
      duration: 230,
      useNativeDriver: true,
    }).start(() => {
      setSidebarOpen(false);
    });
  }

  function confirmLogout() {
    Alert.alert(
      "Logout?",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            closeSidebar();
            await logout();
          },
        },
      ]
    );
  }

  function goToHome() {
    closeSidebar();

    setTimeout(() => {
      navigation.navigate("Home");
    }, 240);
  }

  function goToAppointments() {
    closeSidebar();

    setTimeout(() => {
      navigation.navigate("Appointments");
    }, 240);
  }

  const sidebarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dx < -10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          sidebarTranslateX.setValue(Math.max(-sidebarWidth, gestureState.dx));
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          closeSidebar();
        } else {
          Animated.timing(sidebarTranslateX, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const initials = useMemo(() => {
    const parts = form.fullName.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    if (form.fullName.trim().length > 0) {
      return form.fullName.trim()[0].toUpperCase();
    }

    return "U";
  }, [form.fullName]);

  const displayName = form.fullName?.trim() || "Patient Name";

  const patientSince = useMemo(() => {
    if (!user?.created_at) return '';
    const d = new Date(user.created_at);
    return 'Patient since ' + d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [user?.created_at]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const calculateAge = (birthdayValue) => {
    const cleaned = birthdayValue.trim();

    const dateRegex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

    if (!dateRegex.test(cleaned)) {
      return "";
    }

    const [month, day, year] = cleaned.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);

    const isInvalidDate =
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day;

    if (isInvalidDate) {
      return "";
    }

    const today = new Date();

    if (birthDate > today) {
      return "";
    }

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasNotHadBirthdayThisYear =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (hasNotHadBirthdayThisYear) {
      age -= 1;
    }

    return String(age);
  };

  const formatBirthdayInput = (value) => {
    const numbersOnly = value.replace(/\D/g, "");
    const limited = numbersOnly.slice(0, 8);

    if (limited.length <= 2) {
      return limited;
    }

    if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }

    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  };

  const handleBirthdayChange = (value) => {
    const formattedBirthday = formatBirthdayInput(value);
    const calculatedAge = calculateAge(formattedBirthday);

    setForm((prev) => ({
      ...prev,
      birthday: formattedBirthday,
      age: calculatedAge,
    }));

    setErrors((prev) => ({
      ...prev,
      birthday: "",
    }));
  };

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const profile = await getMyPatientProfile();
        if (!mounted) return;
        const nextForm = profileToForm(profile);
        setForm(nextForm);
        originalFormRef.current = nextForm;
      } catch (err) {
        if (!mounted) return;
        const fallback = profileToForm({});
        setForm(fallback);
        originalFormRef.current = fallback;
        Alert.alert(
          "Profile",
          err.response?.data?.message || "Unable to load your profile right now."
        );
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const fullNameTrimmed = form.fullName.trim();
    const nameParts = fullNameTrimmed.split(/\s+/).filter(Boolean);

    if (!fullNameTrimmed) {
      newErrors.fullName = "Full name is required.";
    } else if (fullNameTrimmed.length === 1 || nameParts.length < 2) {
      newErrors.fullName = "Please enter both first name and last name.";
    }

    if (form.birthday.trim() && !calculateAge(form.birthday)) {
      newErrors.birthday = "Please use a valid birthday format: MM/DD/YYYY.";
    }

    if (!form.homeAddress.trim()) {
      newErrors.homeAddress = "Home address is required.";
    }

    const phoneRegex = /^[0-9+\-\s()]{7,30}$/;

    if (!form.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    } else if (!phoneRegex.test(form.contact.trim())) {
      newErrors.contact = "Please enter a valid contact number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (
      form.emergencyContactNumber.trim() &&
      !phoneRegex.test(form.emergencyContactNumber.trim())
    ) {
      newErrors.emergencyContactNumber =
        "Please enter a valid emergency contact number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleEditProfile = () => {
    if (isEditing) {
      if (originalFormRef.current) {
        setForm(originalFormRef.current);
      }

      setErrors({});
      setNationalityModalVisible(false);
      setIsEditing(false);
      Keyboard.dismiss();
      return;
    }

    originalFormRef.current = { ...form };
    setErrors({});
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setSavingProfile(true);

    try {
      const savedProfile = await saveMyPatientProfile(formToProfile());
      const nextForm = profileToForm(savedProfile);
      setForm(nextForm);
      originalFormRef.current = nextForm;
      setIsEditing(false);
      Keyboard.dismiss();
      Alert.alert("Profile Updated", "Your profile information has been saved.");
    } catch (err) {
      if (err.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        setErrors((prev) => ({
          ...prev,
          fullName: apiErrors.full_name || prev.fullName,
          email: apiErrors.email || prev.email,
          contact: apiErrors.contact_number || prev.contact,
          homeAddress: apiErrors.address || prev.homeAddress,
          age: apiErrors.age || prev.age,
        }));
      }

      Alert.alert(
        "Unable to Save",
        err.response?.data?.message || "Please check your information and try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return <Text style={styles.errorText}>{errors[field]}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.mainWrapper}>
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerCard}>
                <View style={styles.topRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={openSidebar}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={styles.menuIcon}>☰</Text>
                  </TouchableOpacity>

                  <Text style={styles.headerTitle}>Profile</Text>

                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      (loadingProfile || savingProfile) && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.8}
                    onPress={handleEditProfile}
                    disabled={loadingProfile || savingProfile}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.editButtonText}>
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                <Text style={styles.nameText}>{displayName}</Text>
                {patientSince ? <Text style={styles.patientSince}>{patientSince}</Text> : null}
              </View>

              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>
                  Personal Information Record
                </Text>
                <View style={styles.titleLine} />

                {loadingProfile ? (
                  <View style={styles.loadingProfile}>
                    <ActivityIndicator color="#B77A00" />
                    <Text style={styles.loadingProfileText}>
                      Loading profile...
                    </Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.fullName && styles.inputError,
                    ]}
                    value={form.fullName}
                    onChangeText={(value) => updateField("fullName", value)}
                    placeholder="Enter first name and last name"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                  />
                  {renderError("fullName")}
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInputGroup}>
                    <Text style={styles.label}>Birthday</Text>
                    <TextInput
                      style={[
                        styles.input,
                        !isEditing && styles.disabledInput,
                        errors.birthday && styles.inputError,
                      ]}
                      value={form.birthday}
                      onChangeText={handleBirthdayChange}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor="#A8A8A8"
                      editable={isEditing}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                    {renderError("birthday")}
                  </View>

                  <View style={styles.halfInputGroup}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={form.age}
                      placeholder="Auto"
                      placeholderTextColor="#A8A8A8"
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nationality</Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!isEditing}
                    style={[
                      styles.input,
                      styles.dropdownInput,
                      !isEditing && styles.disabledInput,
                      errors.nationality && styles.inputError,
                    ]}
                    onPress={() => setNationalityModalVisible(true)}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !form.nationality && styles.placeholderText,
                      ]}
                    >
                      {form.nationality || "Select nationality"}
                    </Text>

                    <Text style={styles.dropdownArrow}>⌄</Text>
                  </TouchableOpacity>

                  {renderError("nationality")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Home Address</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      !isEditing && styles.disabledInput,
                      errors.homeAddress && styles.inputError,
                    ]}
                    value={form.homeAddress}
                    onChangeText={(value) => updateField("homeAddress", value)}
                    placeholder="Enter complete home address"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    multiline
                    textAlignVertical="top"
                  />
                  {renderError("homeAddress")}
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInputGroup}>
                    <Text style={styles.label}>Occupation</Text>
                    <TextInput
                      style={[
                        styles.input,
                        !isEditing && styles.disabledInput,
                        errors.occupation && styles.inputError,
                      ]}
                      value={form.occupation}
                      onChangeText={(value) => updateField("occupation", value)}
                      placeholder="Occupation"
                      placeholderTextColor="#A8A8A8"
                      editable={isEditing}
                    />
                    {renderError("occupation")}
                  </View>

                  <View style={styles.halfInputGroup}>
                    <Text style={styles.label}>Sex</Text>

                    <View style={styles.sexChoiceRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={!isEditing}
                        style={[
                          styles.sexButton,
                          form.sex === "Male" && styles.sexButtonActive,
                          !isEditing && styles.disabledChoice,
                        ]}
                        onPress={() => updateField("sex", "Male")}
                      >
                        <Text
                          style={[
                            styles.sexButtonText,
                            form.sex === "Male" && styles.sexButtonTextActive,
                          ]}
                        >
                          Male
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={!isEditing}
                        style={[
                          styles.sexButton,
                          form.sex === "Female" && styles.sexButtonActive,
                          !isEditing && styles.disabledChoice,
                        ]}
                        onPress={() => updateField("sex", "Female")}
                      >
                        <Text
                          style={[
                            styles.sexButtonText,
                            form.sex === "Female" && styles.sexButtonTextActive,
                          ]}
                        >
                          Female
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {renderError("sex")}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contact</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.contact && styles.inputError,
                    ]}
                    value={form.contact}
                    onChangeText={(value) => updateField("contact", value)}
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                  {renderError("contact")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.email && styles.inputError,
                    ]}
                    value={form.email}
                    onChangeText={(value) => updateField("email", value)}
                    placeholder="Enter email address"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {renderError("email")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Civil Status</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.civilStatus && styles.inputError,
                    ]}
                    value={form.civilStatus}
                    onChangeText={(value) => updateField("civilStatus", value)}
                    placeholder="Single, Married, etc."
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                  />
                  {renderError("civilStatus")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency Contact Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.emergencyContactName && styles.inputError,
                    ]}
                    value={form.emergencyContactName}
                    onChangeText={(value) =>
                      updateField("emergencyContactName", value)
                    }
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                  />
                  {renderError("emergencyContactName")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency Contact Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      errors.emergencyContactNumber && styles.inputError,
                    ]}
                    value={form.emergencyContactNumber}
                    onChangeText={(value) =>
                      updateField("emergencyContactNumber", value)
                    }
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    keyboardType="phone-pad"
                    maxLength={30}
                  />
                  {renderError("emergencyContactNumber")}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Medical Conditions</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      !isEditing && styles.disabledInput,
                    ]}
                    value={form.medicalConditions}
                    onChangeText={(value) =>
                      updateField("medicalConditions", value)
                    }
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Allergies</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      !isEditing && styles.disabledInput,
                    ]}
                    value={form.allergies}
                    onChangeText={(value) => updateField("allergies", value)}
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Medications</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      !isEditing && styles.disabledInput,
                    ]}
                    value={form.medications}
                    onChangeText={(value) => updateField("medications", value)}
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dental History</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.addressInput,
                      !isEditing && styles.disabledInput,
                    ]}
                    value={form.dentalHistory}
                    onChangeText={(value) => updateField("dentalHistory", value)}
                    placeholder="Optional"
                    placeholderTextColor="#A8A8A8"
                    editable={isEditing}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                {isEditing ? (
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      savingProfile && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    <Text style={styles.saveButtonText}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </ScrollView>

            {sidebarOpen ? (
              <View style={styles.sidebarOverlay} pointerEvents="box-none">
                <Pressable style={styles.darkBackdrop} onPress={closeSidebar} />

                <Animated.View
                  style={[
                    styles.sidebar,
                    {
                      width: sidebarWidth,
                      transform: [{ translateX: sidebarTranslateX }],
                    },
                  ]}
                  {...sidebarPanResponder.panHandlers}
                >
                  <View style={styles.profileSection}>
                    <View style={styles.sidebarAvatarBox}>
                      <Text style={styles.sidebarAvatarText}>{initials}</Text>
                    </View>

                    <View style={styles.profileTextArea}>
                      <Text style={styles.profileName}>{displayName}</Text>
                      <Text style={styles.profileBranch}>{user?.home_branch_city ?? 'Dental Clinic'}</Text>
                    </View>
                  </View>

                  <View style={styles.sidebarLine} />

                  <View style={styles.menuList}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Home"), 240); }}
                    >
                      <Image source={require("../../assets/images/home.png")} style={styles.sidebarIcon} resizeMode="contain" />
                      <Text style={styles.menuText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.menuItem, styles.activeMenuItem]}
                      onPress={closeSidebar}
                    >
                      <Image source={require("../../assets/images/profile.png")} style={styles.sidebarIcon} resizeMode="contain" />
                      <Text style={[styles.menuText, styles.activeMenuText]}>Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("MessagesList"), 240); }}
                    >
                      <Image source={require("../../assets/images/message.png")} style={styles.sidebarIcon} resizeMode="contain" />
                      <Text style={styles.menuText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Appointments"), 240); }}
                    >
                      <Image source={require("../../assets/images/appointment.png")} style={styles.sidebarIcon} resizeMode="contain" />
                      <Text style={styles.menuText}>Appointments</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Records"), 240); }}
                    >
                      <Image source={require("../../assets/images/records.png")} style={styles.sidebarIcon} resizeMode="contain" />
                      <Text style={styles.menuText}>History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => { closeSidebar(); setTimeout(() => navigation.navigate("Notifications"), 240); }}
                    >
                      <View style={{ position: 'relative', marginRight: 16 }}>
                        <Image source={require("../../assets/images/notification-bell.png")} style={[styles.sidebarIcon, { marginRight: 0 }]} resizeMode="contain" />
                        {unreadCount > 0 && (
                          <View style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            backgroundColor: '#e53e3e',
                            borderRadius: 999,
                            paddingHorizontal: 4,
                            paddingVertical: 1,
                            minWidth: 16,
                            alignItems: 'center',
                          }}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.menuText}>Notifications</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.signOutSection}>
                    <View style={styles.sidebarLine} />

                    <TouchableOpacity style={styles.signOutButton} onPress={confirmLogout}>
                      <Image
                        source={require("../../assets/images/logout.png")}
                        style={styles.sidebarIcon}
                        resizeMode="contain"
                      />

                      <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            ) : null}
          </View>
        </TouchableWithoutFeedback>

        <Modal
          visible={nationalityModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNationalityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select Nationality</Text>

              <FlatList
                data={NATIONALITIES}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.nationalityOption}
                    activeOpacity={0.7}
                    onPress={() => {
                      updateField("nationality", item);
                      setNationalityModalVisible(false);
                    }}
                  >
                    <Text style={styles.nationalityOptionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.modalCloseButton}
                activeOpacity={0.8}
                onPress={() => setNationalityModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
