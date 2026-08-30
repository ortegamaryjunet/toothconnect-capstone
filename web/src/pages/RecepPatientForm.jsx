import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createStaffPatient, updateStaffPatientProfile } from '../api/patients';
import createRecepPatientFormStyles from '../styles/RecepPatientForm';

const nationalityOptions = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan',
  'Argentine', 'Armenian', 'Australian', 'Austrian', 'Bangladeshi',
  'Belgian', 'Brazilian', 'British', 'Bulgarian', 'Cambodian', 'Canadian',
  'Chilean', 'Chinese', 'Colombian', 'Croatian', 'Czech', 'Danish',
  'Dutch', 'Egyptian', 'Emirati', 'Filipino', 'Finnish', 'French',
  'German', 'Greek', 'Hungarian', 'Icelandic', 'Indian', 'Indonesian',
  'Irish', 'Israeli', 'Italian', 'Japanese', 'Jordanian', 'Kenyan',
  'Korean', 'Kuwaiti', 'Malaysian', 'Mexican', 'Moroccan', 'Nepalese',
  'New Zealander', 'Nigerian', 'Norwegian', 'Pakistani', 'Peruvian',
  'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Saudi',
  'Singaporean', 'South African', 'Spanish', 'Swedish', 'Swiss', 'Thai',
  'Turkish', 'Ukrainian', 'Vietnamese',
];

const religionOptions = [
  'Catholic',
  'Christian',
  'Islam',
  'Iglesia ni Cristo',
  'Buddhism',
  'Hinduism',
];

const allergyOptions = [
  'Local Anesthetic',
  'Penicillin',
  'Antibiotics',
  'Sulfa drugs',
  'Latex',
];

const healthConditions = [
  'High Blood Pressure',
  'Low Blood Pressure',
  'Epilepsy/Convulsions',
  'AIDS/HIV',
  'STD',
  'Stomach Troubles/Ulcers',
  'Fainting/Seizures',
  'Rapid Weight Loss',
  'Radiation Therapy',
  'Joint Replacement/Implant',
  'Heart Surgery',
  'Heart Attack',
  'Thyroid Problem',
  'Heart Disease',
  'Heart Murmur',
  'Hepatitis/Liver Disease',
  'Rheumatic Fever',
  'Hay Fever/Allergies',
  'Respiratory Problems',
  'Hepatitis/Jaundice',
  'Tuberculosis',
  'Kidney Disease',
  'Diabetes',
  'Chest Pain',
  'Stroke',
  'Anemia',
  'Angina',
  'Asthma',
  'Emphysema',
  'Blood Diseases',
  'Head Injuries',
  'Arthritis/Rheumatism',
];

const initialFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  nickname: '',
  gender: '',
  suffix: '',
  noSuffix: false,
  birthday: '',
  age: '',
  contact: '',
  emailAddress: '',
  nationality: '',
  religion: '',
  occupation: '',
  dentalInsurance: '',
  effectiveDate: '',
  homeAddress: '',
  officeNo: '',
  faxNo: '',
  isMinor: false,
  guardianName: '',
  guardianOccupation: '',
  referral: '',
  consultationReason: '',
  noDentalHistory: false,
  previousDentist: '',
  lastDentalVisit: '',
  physicianName: '',
  physicianSpecialty: '',
  officeAddress: '',
  officeNumber: '',
  healthStatus1: '',
  healthStatus2: '',
  healthStatus3: '',
  seriousIllnessDetails: '',
  healthStatus4: '',
  hospitalizedDetails: '',
  healthStatus5: '',
  healthStatus6: '',
  tobaccoDetails: '',
  healthStatus7: '',
  allergies: [],
  otherAllergiesChecked: false,
  otherAllergies: '',
  pregnantStatus: '',
  nursingStatus: '',
  birthControlStatus: '',
  conditions: [],
  otherConditionsChecked: false,
  otherConditions: '',
};

export default function RecepPatientForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [openSections, setOpenSections] = useState({
    personalInfo: false,
    medAssessment: false,
    healthCondition: false,
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const isMobile = screenWidth <= 850;
  const isVerySmall = screenWidth <= 560;

  const styles = createRecepPatientFormStyles({
    isMobile,
    isVerySmall,
  });

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyMinHeight = document.body.style.minHeight;

    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.minHeight = originalBodyMinHeight;
    };
  }, []);

  useEffect(() => {
    const hasOpenModal = showSubmitModal || showBackModal;
    document.body.style.overflow = hasOpenModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showSubmitModal, showBackModal]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowSubmitModal(false);
        setShowBackModal(false);
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function toggleSection(sectionName) {
    setOpenSections((current) => ({
      ...current,
      [sectionName]: !current[sectionName],
    }));
  }

  function handleInputChange(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    const validationMap = {
      firstName: ['First Name', 'name'],
      lastName: ['Last Name', 'name'],
      contact: ['Contact Number', 'phone'],
      emailAddress: ['Email Address', 'email'],
      homeAddress: ['Home Address', 'text'],
      effectiveDate: ['Effective Date', 'text'],
    };

    const config = validationMap[field];

    if (config) {
      const [label, type] = config;
      const error = validateRequiredField(field, value, label, type);

      setFieldErrors((current) => {
        const next = { ...current };

        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }

        return next;
      });

      return;
    }

    if (field === 'gender') {
      setFieldErrors((current) => {
        const next = { ...current };

        if (value) {
          delete next.gender;
        } else {
          next.gender = 'Gender is required.';
        }

        return next;
      });
    }
  }

  function handleBirthdayChange(value) {
    setFormData((current) => ({
      ...current,
      birthday: value,
      age: calculateAge(value),
    }));

    setFieldErrors((current) => {
      const next = { ...current };

      if (value) {
        delete next.birthday;
      } else {
        next.birthday = 'Birthday is required.';
      }

      return next;
    });
  }

  function handleNoSuffixChange(checked) {
    setFormData((current) => ({
      ...current,
      noSuffix: checked,
      suffix: checked ? '' : current.suffix,
    }));
  }

  function handleMinorChange(checked) {
    setFormData((current) => ({
      ...current,
      isMinor: checked,
      occupation: checked ? '' : current.occupation,
      officeNo: checked ? '' : current.officeNo,
      faxNo: checked ? '' : current.faxNo,
      guardianName: checked ? current.guardianName : '',
      guardianOccupation: checked ? current.guardianOccupation : '',
      referral: checked ? current.referral : '',
      consultationReason: checked ? current.consultationReason : '',
    }));
  }

  function handleNoDentalHistoryChange(checked) {
    setFormData((current) => ({
      ...current,
      noDentalHistory: checked,
      previousDentist: checked ? '' : current.previousDentist,
      lastDentalVisit: checked ? '' : current.lastDentalVisit,
    }));
  }

  function handleArrayCheckbox(field, value, checked) {
    setFormData((current) => {
      const currentValues = current[field];

      return {
        ...current,
        [field]: checked
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value),
      };
    });
  }

  function validateRequiredField(field, value, label, type = 'text') {
    const trimmedValue = String(value ?? '').trim();

    if (!trimmedValue) {
      return `${label} is required.`;
    }

    if (type === 'name' && !/^[A-Za-zÀ-ÿ\s.'-]+$/.test(trimmedValue)) {
      return `${label} contains invalid characters.`;
    }

    if (type === 'text' && !/^[A-Za-z0-9À-ÿ\s.,'()/#&-]+$/.test(trimmedValue)) {
      return `${label} contains invalid characters.`;
    }

    if (type === 'phone' && !/^[0-9+\-\s()]+$/.test(trimmedValue)) {
      return `${label} contains invalid characters.`;
    }

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return 'Please enter a valid email address.';
    }

    return '';
  }

  function handleSubmitCheck(event) {
    event.preventDefault();

    const errors = {};

    const firstNameError = validateRequiredField(
      'firstName',
      formData.firstName,
      'First Name',
      'name'
    );
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateRequiredField(
      'lastName',
      formData.lastName,
      'Last Name',
      'name'
    );
    if (lastNameError) errors.lastName = lastNameError;

    if (!formData.gender) {
      errors.gender = 'Gender is required.';
    }

    if (!formData.birthday) {
      errors.birthday = 'Birthday is required.';
    }

    const contactError = validateRequiredField(
      'contact',
      formData.contact,
      'Contact Number',
      'phone'
    );
    if (contactError) errors.contact = contactError;

    const emailError = validateRequiredField(
      'emailAddress',
      formData.emailAddress,
      'Email Address',
      'email'
    );
    if (emailError) errors.emailAddress = emailError;

    if (!formData.nationality) {
      errors.nationality = 'Nationality is required.';
    }

    if (!formData.religion) {
      errors.religion = 'Religion is required.';
    }

    const effectiveDateError = validateRequiredField(
      'effectiveDate',
      formData.effectiveDate,
      'Effective Date'
    );
    if (effectiveDateError) errors.effectiveDate = effectiveDateError;

    const addressError = validateRequiredField(
      'homeAddress',
      formData.homeAddress,
      'Home Address',
      'text'
    );
    if (addressError) errors.homeAddress = addressError;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setOpenSections((current) => ({
        ...current,
        personalInfo: true,
      }));
      setShowSubmitModal(false);
      return;
    }

    setShowSubmitModal(true);
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setFormError('');

    try {
      const account = await createStaffPatient({
        full_name: buildFullName(formData),
        contact_number: formData.contact,
        email: formData.emailAddress,
      });

      await updateStaffPatientProfile(account.id, buildPatientProfilePayload(formData));

      setShowSubmitModal(false);
      navigate('/receptionistRecords');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit patient record.');
      setShowSubmitModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackClick() {
    setShowBackModal(true);
  }

  function handleBackConfirm() {
    navigate('/receptionistRecords');
  }

  function handleModalOverlayClick(event, closeHandler) {
    if (event.target === event.currentTarget) {
      closeHandler();
    }
  }

  return (
    <main style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button type="button" style={styles.backBtn} onClick={handleBackClick} aria-label="Go back">
            Back
          </button>

          <div>
            <h2 style={styles.headerTitle}>Patient Information Record</h2>
            <p style={styles.headerText}>
              Complete the required details for the patient records.
            </p>
          </div>
        </div>

        {formError && (
          <div style={{ color: '#b42318', marginBottom: 16, fontWeight: 600 }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmitCheck}>
          <FormSection
            styles={styles}
            title="Section 1 - Personal Information"
            isOpen={openSections.personalInfo}
            onToggle={() => toggleSection('personalInfo')}
          >
            <div style={styles.formGridThree}>
              <InputField
                styles={styles}
                label="First Name:"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                required
                error={fieldErrors.firstName}
              />

              <InputField
                styles={styles}
                label="Middle Name:"
                value={formData.middleName}
                onChange={(value) => handleInputChange('middleName', value)}
              />

              <InputField
                styles={styles}
                label="Last Name:"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                required
                error={fieldErrors.lastName}
              />
            </div>

            <div style={styles.formGridThree}>
              <InputField
                styles={styles}
                label="Nickname:"
                value={formData.nickname}
                onChange={(value) => handleInputChange('nickname', value)}
              />

              <div style={styles.formGroup}>
                <label style={styles.label}>Gender:</label>
                <div style={styles.radioGroup}>
                  <RadioOption
                    styles={styles}
                    name="gender"
                    label="Female"
                    checked={formData.gender === 'Female'}
                    onChange={() => handleInputChange('gender', 'Female')}
                    required
                  />

                  <RadioOption
                    styles={styles}
                    name="gender"
                    label="Male"
                    checked={formData.gender === 'Male'}
                    onChange={() => handleInputChange('gender', 'Male')}
                    required
                  />
                </div>
                {fieldErrors.gender && (
                  <div style={{ marginTop: 5, color: '#d92d20', fontSize: 12, fontWeight: 500 }}>{fieldErrors.gender}</div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Suffix:</label>
                <select
                  value={formData.suffix}
                  onChange={(event) =>
                    handleInputChange('suffix', event.target.value)
                  }
                  disabled={formData.noSuffix}
                  style={styles.input}
                >
                  <option value="">Suffix</option>
                  <option value="Jr">Jr</option>
                  <option value="Sr">Sr</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>

                <label style={styles.checkLine}>
                  <input
                    type="checkbox"
                    checked={formData.noSuffix}
                    onChange={(event) =>
                      handleNoSuffixChange(event.target.checked)
                    }
                  />
                  None
                </label>
              </div>
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                type="date"
                label="Birthday:"
                value={formData.birthday}
                onChange={handleBirthdayChange}
                required
                error={fieldErrors.birthday}
              />

              <InputField
                styles={styles}
                type="number"
                label="Age:"
                value={formData.age}
                readOnly
              />
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                type="tel"
                label="Contact Number:"
                value={formData.contact}
                onChange={(value) => handleInputChange('contact', value)}
                placeholder="+63"
                required
                error={fieldErrors.contact}
              />

              <InputField
                styles={styles}
                type="email"
                label="Email Address:"
                value={formData.emailAddress}
                onChange={(value) => handleInputChange('emailAddress', value)}
                required
                error={fieldErrors.emailAddress}
              />
            </div>

            <div style={styles.formGridTwo}>
              <SelectField
                styles={styles}
                label="Nationality:"
                value={formData.nationality}
                onChange={(value) => handleInputChange('nationality', value)}
                placeholder="Select Nationality"
                options={nationalityOptions}
                required
                error={fieldErrors.nationality}
              />

              <SelectField
                styles={styles}
                label="Religion:"
                value={formData.religion}
                onChange={(value) => handleInputChange('religion', value)}
                placeholder="Select Religion"
                options={religionOptions}
                required
                error={fieldErrors.religion}
              />
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                label="Occupation:"
                value={formData.occupation}
                onChange={(value) => handleInputChange('occupation', value)}
                disabled={formData.isMinor}
              />

              <InputField
                styles={styles}
                label="Dental Insurance:"
                value={formData.dentalInsurance}
                onChange={(value) => handleInputChange('dentalInsurance', value)}
              />
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                type="date"
                label="Effective Date:"
                value={formData.effectiveDate}
                onChange={(value) => handleInputChange('effectiveDate', value)}
                required
                error={fieldErrors.effectiveDate}
              />

              <TextAreaField
                styles={styles}
                label="Home Address:"
                value={formData.homeAddress}
                onChange={(value) => handleInputChange('homeAddress', value)}
                rows={2}
                required
                error={fieldErrors.homeAddress}
              />
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                label="Office No:"
                value={formData.officeNo}
                onChange={(value) => handleInputChange('officeNo', value)}
                disabled={formData.isMinor}
              />

              <InputField
                styles={styles}
                label="Fax No:"
                value={formData.faxNo}
                onChange={(value) => handleInputChange('faxNo', value)}
                disabled={formData.isMinor}
              />
            </div>

            <label style={styles.minorBox}>
              <input
                type="checkbox"
                checked={formData.isMinor}
                onChange={(event) => handleMinorChange(event.target.checked)}
              />
              Minor
            </label>

            {formData.isMinor && (
              <div style={styles.minorFields}>
                <h3 style={styles.subTitle}>For Minors</h3>

                <div style={styles.formGridTwo}>
                  <InputField
                    styles={styles}
                    label="Parent/Guardian's Name:"
                    value={formData.guardianName}
                    onChange={(value) =>
                      handleInputChange('guardianName', value)
                    }
                  />

                  <InputField
                    styles={styles}
                    label="Parent/Guardian's Occupation:"
                    value={formData.guardianOccupation}
                    onChange={(value) =>
                      handleInputChange('guardianOccupation', value)
                    }
                  />
                </div>

                <div style={styles.formGridTwo}>
                  <InputField
                    styles={styles}
                    label="Referral:"
                    value={formData.referral}
                    onChange={(value) => handleInputChange('referral', value)}
                  />

                  <TextAreaField
                    styles={styles}
                    label="Reason for Consultation:"
                    value={formData.consultationReason}
                    onChange={(value) =>
                      handleInputChange('consultationReason', value)
                    }
                    rows={2}
                  />
                </div>
              </div>
            )}
          </FormSection>

          <FormSection
            styles={styles}
            title="Section 2 - Medical Assessment"
            isOpen={openSections.medAssessment}
            onToggle={() => toggleSection('medAssessment')}
          >
            <h3 style={styles.subTitle}>Dental History</h3>

            <div style={styles.noneLine}>
              <label style={styles.checkLine}>
                <input
                  type="checkbox"
                  checked={formData.noDentalHistory}
                  onChange={(event) =>
                    handleNoDentalHistoryChange(event.target.checked)
                  }
                />
                None
              </label>
            </div>

            <div
              style={{
                ...styles.formGridTwo,
                ...(formData.noDentalHistory ? styles.disabledFields : {}),
              }}
            >
              <InputField
                styles={styles}
                label="Previous Dentist Dr."
                value={formData.previousDentist}
                onChange={(value) =>
                  handleInputChange('previousDentist', value)
                }
                disabled={formData.noDentalHistory}
              />

              <InputField
                styles={styles}
                label="Last Dental Visit:"
                value={formData.lastDentalVisit}
                onChange={(value) =>
                  handleInputChange('lastDentalVisit', value)
                }
                disabled={formData.noDentalHistory}
              />
            </div>

            <h3 style={styles.subTitle}>Medical History</h3>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                label="Name of Physician Dr."
                value={formData.physicianName}
                onChange={(value) => handleInputChange('physicianName', value)}
              />

              <InputField
                styles={styles}
                label="Specialty:"
                value={formData.physicianSpecialty}
                onChange={(value) =>
                  handleInputChange('physicianSpecialty', value)
                }
              />
            </div>

            <div style={styles.formGridTwo}>
              <InputField
                styles={styles}
                label="Office Address:"
                value={formData.officeAddress}
                onChange={(value) => handleInputChange('officeAddress', value)}
              />

              <InputField
                styles={styles}
                type="tel"
                label="Office Number:"
                value={formData.officeNumber}
                onChange={(value) => handleInputChange('officeNumber', value)}
              />
            </div>

            <div style={styles.questionList}>
              <QuestionItem
                styles={styles}
                number="1"
                text="Are you in good health?"
                name="healthStatus1"
                value={formData.healthStatus1}
                onChange={(value) => handleInputChange('healthStatus1', value)}
              />

              <QuestionItem
                styles={styles}
                number="2"
                text="Are you under medical treatment now?"
                name="healthStatus2"
                value={formData.healthStatus2}
                onChange={(value) => handleInputChange('healthStatus2', value)}
              />

              <QuestionItem
                styles={styles}
                number="3"
                text="Have you ever had serious illness or surgical operation?"
                name="healthStatus3"
                value={formData.healthStatus3}
                onChange={(value) => handleInputChange('healthStatus3', value)}
              />

              <TextAreaField
                styles={styles}
                label="If so, what illness or operation?"
                value={formData.seriousIllnessDetails}
                onChange={(value) =>
                  handleInputChange('seriousIllnessDetails', value)
                }
                rows={1}
              />

              <QuestionItem
                styles={styles}
                number="4"
                text="Have you ever been hospitalized?"
                name="healthStatus4"
                value={formData.healthStatus4}
                onChange={(value) => handleInputChange('healthStatus4', value)}
              />

              <TextAreaField
                styles={styles}
                label="If so, when and why?"
                value={formData.hospitalizedDetails}
                onChange={(value) =>
                  handleInputChange('hospitalizedDetails', value)
                }
                rows={1}
              />

              <QuestionItem
                styles={styles}
                number="5"
                text="Are you taking any prescription/non-prescription medication?"
                name="healthStatus5"
                value={formData.healthStatus5}
                onChange={(value) => handleInputChange('healthStatus5', value)}
              />

              <QuestionItem
                styles={styles}
                number="6"
                text="Do you use tobacco products?"
                name="healthStatus6"
                value={formData.healthStatus6}
                onChange={(value) => handleInputChange('healthStatus6', value)}
              />

              <TextAreaField
                styles={styles}
                label="If so, please specify:"
                value={formData.tobaccoDetails}
                onChange={(value) => handleInputChange('tobaccoDetails', value)}
                rows={1}
              />

              <QuestionItem
                styles={styles}
                number="7"
                text="Do you use alcohol, cocaine or other dangerous drugs?"
                name="healthStatus7"
                value={formData.healthStatus7}
                onChange={(value) => handleInputChange('healthStatus7', value)}
              />
            </div>

            <div style={styles.choiceBox}>
              <h3 style={styles.choiceTitle}>
                8. Are you allergic to any of the following:
              </h3>

              <div style={styles.checkboxGrid}>
                {allergyOptions.map((allergy) => (
                  <CheckboxOption
                    key={allergy}
                    styles={styles}
                    label={allergy}
                    checked={formData.allergies.includes(allergy)}
                    onChange={(checked) =>
                      handleArrayCheckbox('allergies', allergy, checked)
                    }
                  />
                ))}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkLine}>
                  <input
                    type="checkbox"
                    checked={formData.otherAllergiesChecked}
                    onChange={(event) =>
                      handleInputChange(
                        'otherAllergiesChecked',
                        event.target.checked
                      )
                    }
                  />
                  Others:
                </label>

                <textarea
                  value={formData.otherAllergies}
                  onChange={(event) =>
                    handleInputChange('otherAllergies', event.target.value)
                  }
                  rows={1}
                  disabled={!formData.otherAllergiesChecked}
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.choiceBox}>
              <h3 style={styles.choiceTitle}>10. For women only:</h3>

              <div style={styles.womenGrid}>
                <QuestionItem
                  styles={styles}
                  text="Pregnant?"
                  name="pregnantStatus"
                  value={formData.pregnantStatus}
                  onChange={(value) =>
                    handleInputChange('pregnantStatus', value)
                  }
                  hideNumber
                />

                <QuestionItem
                  styles={styles}
                  text="Nursing?"
                  name="nursingStatus"
                  value={formData.nursingStatus}
                  onChange={(value) =>
                    handleInputChange('nursingStatus', value)
                  }
                  hideNumber
                />

                <QuestionItem
                  styles={styles}
                  text="Taking birth control pills?"
                  name="birthControlStatus"
                  value={formData.birthControlStatus}
                  onChange={(value) =>
                    handleInputChange('birthControlStatus', value)
                  }
                  hideNumber
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            styles={styles}
            title="Section 3 - Health Condition"
            isOpen={openSections.healthCondition}
            onToggle={() => toggleSection('healthCondition')}
          >
            <div style={styles.conditionGrid}>
              {healthConditions.map((condition) => (
                <CheckboxOption
                  key={condition}
                  styles={styles}
                  label={condition}
                  checked={formData.conditions.includes(condition)}
                  onChange={(checked) =>
                    handleArrayCheckbox('conditions', condition, checked)
                  }
                />
              ))}
            </div>

            <div style={{ ...styles.formGroup, ...styles.otherCondition }}>
              <label style={styles.checkLine}>
                <input
                  type="checkbox"
                  checked={formData.otherConditionsChecked}
                  onChange={(event) =>
                    handleInputChange(
                      'otherConditionsChecked',
                      event.target.checked
                    )
                  }
                />
                Others:
              </label>

              <textarea
                value={formData.otherConditions}
                onChange={(event) =>
                  handleInputChange('otherConditions', event.target.value)
                }
                rows={1}
                disabled={!formData.otherConditionsChecked}
                style={styles.textarea}
              />
            </div>
          </FormSection>

          <button type="submit" style={styles.submitButton}>
            Submit
          </button>
        </form>
      </div>

      {showSubmitModal && (
        <div
          style={styles.modal}
          onClick={(event) =>
            handleModalOverlayClick(event, () => setShowSubmitModal(false))
          }
        >
          <div style={styles.modalContent}>
            <div style={styles.recordIcon}>
              <i className="fi fi-rr-document-signed"></i>
            </div>

            <h2 style={styles.recordTitle}>Patient Record Submission</h2>
            <p style={styles.modalText}>
              Are you sure you want to submit this patient record?
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{
                  ...styles.submitModalBtn,
                  ...(submitting ? { opacity: 0.7, pointerEvents: 'none' } : {}),
                }}
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>

              <button
                type="button"
                style={styles.cancelModalBtn}
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackModal && (
        <div
          style={styles.modal}
          onClick={(event) =>
            handleModalOverlayClick(event, () => setShowBackModal(false))
          }
        >
          <div style={styles.modalContent}>
            <div style={styles.backIcon}>
              <i className="fi fi-rr-exclamation"></i>
            </div>

            <h2 style={styles.backTitle}>Leave Patient Form?</h2>
            <p style={styles.modalText}>
              Are you sure you want to go back? Any unsaved changes will be lost.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.confirmNo}
                onClick={() => setShowBackModal(false)}
              >
                No
              </button>

              <button
                type="button"
                style={styles.confirmYes}
                onClick={handleBackConfirm}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FormSection({ styles, title, isOpen, onToggle, children }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <button type="button" style={styles.circleBtn} onClick={onToggle}>
          {isOpen ? '−' : '+'}
        </button>

        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      {isOpen && <div style={styles.content}>{children}</div>}
    </section>
  );
}

function InputField({
  styles,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  readOnly = false,
  disabled = false,
  placeholder = '',
  error = '',
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          ...styles.input,
          ...(error ? { border: '1px solid #d92d20', background: '#fffafa' } : {}),
        }}
      />
      {error && <div style={{ marginTop: 5, color: '#d92d20', fontSize: 12, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

function TextAreaField({
  styles,
  label,
  value,
  onChange,
  rows = 2,
  required = false,
  error = '',
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={rows}
        required={required}
        style={{
          ...styles.textarea,
          ...(error ? { border: '1px solid #d92d20', background: '#fffafa' } : {}),
        }}
      />
      {error && <div style={{ marginTop: 5, color: '#d92d20', fontSize: 12, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

function SelectField({
  styles,
  label,
  value,
  onChange,
  placeholder,
  options,
  required = false,
  error = '',
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        style={{
          ...styles.input,
          ...(error ? { border: '1px solid #d92d20', background: '#fffafa' } : {}),
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <div style={{ marginTop: 5, color: '#d92d20', fontSize: 12, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

function RadioOption({ styles, name, label, checked, onChange, required }) {
  return (
    <label style={styles.inlineOption}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
      />
      {label}
    </label>
  );
}

function CheckboxOption({ styles, label, checked, onChange }) {
  return (
    <label style={styles.inlineOption}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function QuestionItem({
  styles,
  number,
  text,
  name,
  value,
  onChange,
  hideNumber = false,
}) {
  return (
    <div style={styles.questionItem}>
      <span style={styles.questionText}>
        {hideNumber ? text : `${number}. ${text}`}
      </span>

      <div style={styles.radioGroup}>
        <RadioOption
          styles={styles}
          name={name}
          label="Yes"
          checked={value === 'Yes'}
          onChange={() => onChange('Yes')}
        />

        <RadioOption
          styles={styles}
          name={name}
          label="No"
          checked={value === 'No'}
          onChange={() => onChange('No')}
        />
      </div>
    </div>
  );
}

function calculateAge(dateValue) {
  if (!dateValue) {
    return '';
  }

  const birthday = new Date(dateValue);

  if (Number.isNaN(birthday.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  const dayDiff = today.getDate() - birthday.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? String(age) : '';
}

function buildFullName(data) {
  return [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function buildPatientProfilePayload(data) {
  const allergies = [
    ...data.allergies,
    data.otherAllergiesChecked ? data.otherAllergies : '',
  ].filter(Boolean);

  const conditions = [
    ...data.conditions,
    data.otherConditionsChecked ? data.otherConditions : '',
  ].filter(Boolean);

  const medicalDetails = [
    conditions.length ? `Conditions: ${conditions.join(', ')}` : '',
    data.healthStatus1 ? `In good health: ${data.healthStatus1}` : '',
    data.healthStatus2 ? `Under medical treatment: ${data.healthStatus2}` : '',
    data.healthStatus3 ? `Serious illness/surgery: ${data.healthStatus3}` : '',
    data.seriousIllnessDetails ? `Details: ${data.seriousIllnessDetails}` : '',
    data.healthStatus4 ? `Hospitalized: ${data.healthStatus4}` : '',
    data.hospitalizedDetails ? `Hospitalization details: ${data.hospitalizedDetails}` : '',
    data.healthStatus6 ? `Uses tobacco: ${data.healthStatus6}` : '',
    data.tobaccoDetails ? `Tobacco details: ${data.tobaccoDetails}` : '',
    data.healthStatus7 ? `Alcohol/drug use: ${data.healthStatus7}` : '',
    data.pregnantStatus ? `Pregnant: ${data.pregnantStatus}` : '',
    data.nursingStatus ? `Nursing: ${data.nursingStatus}` : '',
    data.birthControlStatus ? `Birth control pills: ${data.birthControlStatus}` : '',
  ].filter(Boolean);

  return {
    full_name: buildFullName(data),
    email: data.emailAddress,
    contact_number: data.contact,
    address: data.homeAddress || null,
    birthday: data.birthday || null,
    age: calculateAge(data.birthday) || data.age || null,
    sex: data.gender || null,
    nationality: data.nationality || null,
    occupation: data.occupation || null,
    nickname: data.nickname || null,
    suffix: data.noSuffix ? null : (data.suffix || null),
    religion: data.religion || null,
    dental_insurance: data.dentalInsurance || null,
    effective_date: data.effectiveDate || null,
    office_number: data.officeNo || null,
    fax_number: data.faxNo || null,
    is_minor: data.isMinor || false,
    guardian_name: data.guardianName || null,
    guardian_occupation: data.guardianOccupation || null,
    referral: data.referral || null,
    consultation_reason: data.consultationReason || null,
    previous_dentist: data.noDentalHistory ? null : (data.previousDentist || null),
    last_dental_visit: data.noDentalHistory ? null : (data.lastDentalVisit || null),
    physician_name: data.physicianName || null,
    physician_specialty: data.physicianSpecialty || null,
    physician_office_address: data.officeAddress || null,
    physician_office_number: data.officeNumber || null,
    allergies: allergies.length ? allergies.join(', ') : null,
    medications: data.healthStatus5 === 'Yes' ? 'Patient reported current medication use.' : null,
    medical_conditions: medicalDetails.length ? medicalDetails.join('\n') : null,
    dental_history: null,
  };
}
