import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/axios';
import createAdminEmployeeFormStyles from '../styles/AdminEmployeeForm';

export default function AdminEmployeeForm() {
  const navigate = useNavigate();

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [employeeType, setEmployeeType] = useState('');
  const [openSections, setOpenSections] = useState({});
  const [showBackModal, setShowBackModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [dentists, setDentists] = useState([]);

  const [ageValues, setAgeValues] = useState({
    dentist: '',
    dentalAssistant: '',
    receptionist: '',
  });

  const [noSuffix, setNoSuffix] = useState({
    dentist: false,
    dentalAssistant: false,
    receptionist: false,
  });

  const [doctorWorkItems, setDoctorWorkItems] = useState([1]);
  const [assistantWorkItems, setAssistantWorkItems] = useState([1]);
  const [receptionistWorkItems, setReceptionistWorkItems] = useState([1]);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1100;
  const isSmallScreen = screenWidth <= 1100;

  const styles = createAdminEmployeeFormStyles({
    isMobile,
    isTablet,
    isSmallScreen,
  });

  const nationalityOptions = [
    'Afghan',
    'Albanian',
    'Algerian',
    'American',
    'Andorran',
    'Angolan',
    'Argentine',
    'Armenian',
    'Australian',
    'Austrian',
    'Bangladeshi',
    'Belgian',
    'Brazilian',
    'British',
    'Bulgarian',
    'Cambodian',
    'Canadian',
    'Chilean',
    'Chinese',
    'Colombian',
    'Croatian',
    'Czech',
    'Danish',
    'Dutch',
    'Egyptian',
    'Emirati',
    'Filipino',
    'Finnish',
    'French',
    'German',
    'Greek',
    'Hungarian',
    'Icelandic',
    'Indian',
    'Indonesian',
    'Irish',
    'Israeli',
    'Italian',
    'Japanese',
    'Jordanian',
    'Kenyan',
    'Korean',
    'Kuwaiti',
    'Malaysian',
    'Mexican',
    'Moroccan',
    'Nepalese',
    'New Zealander',
    'Nigerian',
    'Norwegian',
    'Pakistani',
    'Peruvian',
    'Polish',
    'Portuguese',
    'Qatari',
    'Romanian',
    'Russian',
    'Saudi',
    'Singaporean',
    'South African',
    'Spanish',
    'Swedish',
    'Swiss',
    'Thai',
    'Turkish',
    'Ukrainian',
    'Vietnamese',
  ];

  const religionOptions = [
    'Catholic',
    'Christian',
    'Islam',
    'Iglesia ni Cristo',
    'Buddhism',
    'Hinduism',
  ];

  const civilStatusOptions = [
    'Single',
    'Married',
    'Widowed',
    'Separated',
    'Divorced',
  ];

  const suffixOptions = ['Jr', 'Sr', 'II', 'III', 'IV'];

  const dayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'];

  const dentistSpecializations = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Surgery',
    'Cosmetic Dentistry',
    'Implant Dentistry',
    'Radiology',
  ];

  const branchOptions = branches.map((branch) => ({
    value: String(branch.id),
    label: branch.address ? `${branch.name} - ${branch.address}` : branch.name,
  }));

  const dentistOptions = dentists.length > 0 ? dentists : [];

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
    async function loadBranches() {
      try {
        const res = await api.get('/auth/branches');
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error('Failed to load branches', err);
        setBranches([]);
      }
    }

    async function loadDentists() {
      try {
        const res = await api.get('/auth/staff-profiles');
        const employees = res.data.employees || [];
        setDentists(
          employees
            .filter((e) => e.role === 'Dentist')
            .map((e) => ({
              value: String(e.userId || e.id),
              label: `Dr. ${e.firstName || ''} ${e.lastName || ''}`.trim(),
            }))
        );
      } catch (err) {
        console.error('Failed to load dentists', err);
        setDentists([]);
      }
    }

    loadBranches();
    loadDentists();
  }, []);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;

    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
    };
  }, []);

  useEffect(() => {
    if (showBackModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showBackModal]);

  function calculateAge(value) {
    if (!value) return '';

    const birthDate = new Date(value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age >= 0 ? String(age) : '';
  }

  function handleBirthdayChange(type, event) {
    const calculatedAge = calculateAge(event.target.value);

    setAgeValues((prev) => ({
      ...prev,
      [type]: calculatedAge,
    }));
  }

  function handleEmployeeTypeChange(event) {
    const value = event.target.value;

    setEmployeeType(value);
    setOpenSections({});
  }

  function toggleSection(sectionName) {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  }

  function isSectionOpen(sectionName) {
    return Boolean(openSections[sectionName]);
  }

  function handleBackClick() {
    setShowBackModal(true);
  }

  function closeBackModal() {
    setShowBackModal(false);
  }

  function confirmBack() {
    navigate('/adminEmployees');
  }

  function handleModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeBackModal();
    }
  }

  function addDoctorWorkExperience() {
    setDoctorWorkItems((prev) => [...prev, prev.length + 1]);
  }

  function addAssistantWorkExperience() {
    setAssistantWorkItems((prev) => [...prev, prev.length + 1]);
  }

  function addReceptionistWorkExperience() {
    setReceptionistWorkItems((prev) => [...prev, prev.length + 1]);
  }

  function handleNoSuffixChange(type, event) {
    setNoSuffix((prev) => ({
      ...prev,
      [type]: event.target.checked,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    payload.employeeType = employeeType;

    try {
      if (!payload.branchId) {
        alert('Please select an assigned branch.');
        return;
      }

      if (employeeType !== 'dentalAssistant' && payload.accessPassword !== payload.confirmPassword) {
        alert('Password and confirm password do not match.');
        return;
      }

      const isDentist = employeeType === 'dentist';
      const isDentalAssistant = employeeType === 'dentalAssistant';
      const prefix = isDentist ? 'doctor' : isDentalAssistant ? 'da' : 'recep';
      const role = isDentist ? 'dentist' : 'receptionist';
      const firstName = payload[`${prefix}FirstName`] || '';
      const middleName = payload[`${prefix}MiddleName`] || '';
      const lastName = payload[`${prefix}LastName`] || '';
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      const branchId = Number(payload.branchId);
      const workDays = formData.getAll('schedule[]');
      const commonStaffProfile = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        nickname: payload[`${prefix}Nickname`],
        suffix: payload[`${prefix}Suffix`],
        birthday: payload[`${prefix}Birthday`],
        age: payload[`${prefix}Age`],
        gender: payload[isDentist ? 'doctorGender' : isDentalAssistant ? 'daGender' : 'recepGender'],
        civil_status: payload[`${prefix}CivilStatus`],
        religion: payload[`${prefix}Religion`],
        nationality: payload[`${prefix}Nationality`],
        home_address: payload[`${prefix}Address`],
        contact_number: payload[`${prefix}Contact`],
        email: payload[`${prefix}Email`],
        position: isDentist ? 'Dentist' : isDentalAssistant ? 'Dental Assistant' : 'Receptionist',
        specialization: isDentist ? payload.specialization || payload.department : null,
        medical_degree: isDentist ? payload.medicalDegree : null,
        license_number: isDentist ? payload.licenseNumber : null,
        years_experience: isDentist
          ? payload.experienceYears
          : isDentalAssistant
            ? payload.daExperienceYears
            : payload.recepExperienceYears,
        skills: isDentalAssistant ? payload.daSkills : isDentist ? null : payload.recepSkills,
        start_date: isDentalAssistant ? payload.daStartDate : payload.startDate,
        employment_type: isDentalAssistant ? payload.daEmploymentType : payload.employmentType || null,
        shift_type: isDentalAssistant ? payload.daShiftType : payload.shiftType || payload.recepShiftType || null,
        work_days: workDays,
        work_start_time: isDentist ? payload.docWorkStart : isDentalAssistant ? payload.daWorkStart : payload.recepWorkStart,
        work_end_time: isDentist ? payload.docWorkEnd : isDentalAssistant ? payload.daWorkEnd : payload.recepWorkEnd,
      };

      if (isDentalAssistant) {
        await api.post('/auth/staff-profiles', {
          branch_id: branchId,
          staffProfile: {
            ...commonStaffProfile,
            staff_type: 'Dental Assistant',
          },
        });

        alert('Dental assistant employee record created.');
        navigate('/adminEmployees');
        return;
      }

      await api.post('/auth/staff', {
        email: payload.accessEmail || payload[`${prefix}Email`],
        name: fullName,
        role,
        home_branch_id: branchId,
        branch_ids: [branchId],
        phone: payload[`${prefix}Contact`],
        password: payload.accessPassword,
        staffProfile: commonStaffProfile,
      });

      alert('Employee and web access account created.');
      navigate('/adminSettings');
    } catch (err) {
      console.error('Failed to create employee', err);
      alert(err.response?.data?.message || 'Failed to create employee.');
    }
  }

  function Field({
    label,
    name,
    type = 'text',
    readOnly = false,
    value,
    onChange,
    placeholder,
    required = false,
    min,
  }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <input
          type={type}
          name={name}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          style={{
            ...styles.input,
            ...(readOnly ? styles.readOnlyInput : {}),
          }}
        />
      </div>
    );
  }

  function SelectField({
    label,
    name,
    options,
    placeholder,
    disabled = false,
    required = false,
  }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>{label}</label>
        <select
          name={name}
          disabled={disabled}
          required={required}
          defaultValue=""
          style={{
            ...styles.input,
            ...(disabled ? styles.readOnlyInput : {}),
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function Section({ sectionKey, title, children }) {
    const open = isSectionOpen(sectionKey);

    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <button
            type="button"
            style={styles.circleBtn}
            onClick={() => toggleSection(sectionKey)}
          >
            {open ? '−' : '+'}
          </button>

          <h2 style={styles.sectionTitle}>{title}</h2>
        </div>

        {open && <div style={styles.content}>{children}</div>}
      </div>
    );
  }

  function GenderField({ name }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>Gender:</label>

        <div style={styles.radioInlineGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name={name}
              value="Female"
              style={styles.radioInput}
            />
            Female
          </label>

          <label style={styles.radioLabel}>
            <input
              type="radio"
              name={name}
              value="Male"
              style={styles.radioInput}
            />
            Male
          </label>
        </div>
      </div>
    );
  }

  function ScheduleField({ name }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>Work Schedule Days</label>

        <div style={styles.scheduleGrid}>
          {dayOptions.map((day) => (
            <label key={day} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name={name}
                value={day}
                style={styles.checkboxInput}
              />
              {day}
            </label>
          ))}
        </div>
      </div>
    );
  }

  function TimeRangeField({ startName, endName }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>Working Hours</label>

        <div style={styles.timeGroup}>
          <input type="time" name={startName} style={styles.input} />
          <span style={styles.separator}>to</span>
          <input type="time" name={endName} style={styles.input} />
        </div>
      </div>
    );
  }

  function DurationField({ startName, endName }) {
    return (
      <div style={styles.field}>
        <label style={styles.label}>Duration</label>

        <div style={styles.timeGroup}>
          <input type="month" name={startName} style={styles.input} />
          <span style={styles.separator}>to</span>
          <input type="month" name={endName} style={styles.input} />
        </div>
      </div>
    );
  }

  function PersonalInformation({ type, prefix }) {
    const roleLabel =
      type === 'dentist'
        ? 'doctor'
        : type === 'dentalAssistant'
          ? 'da'
          : 'recep';

    return (
      <>
        <div style={styles.rowThree}>
          <Field label="First Name:" name={`${prefix}FirstName`} />
          <Field label="Middle Name:" name={`${prefix}MiddleName`} />
          <Field label="Last Name:" name={`${prefix}LastName`} />
        </div>

        <div style={styles.rowTwo}>
          <Field label="Preferred Nickname:" name={`${prefix}Nickname`} />

          <div style={styles.field}>
            <label style={styles.label}>Suffix:</label>

            <select
              name={`${prefix}Suffix`}
              disabled={noSuffix[type]}
              defaultValue=""
              style={{
                ...styles.input,
                ...(noSuffix[type] ? styles.readOnlyInput : {}),
              }}
            >
              <option value="" disabled>
                Suffix
              </option>

              {suffixOptions.map((suffix) => (
                <option key={suffix} value={suffix}>
                  {suffix}
                </option>
              ))}
            </select>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={noSuffix[type]}
                  onChange={(event) => handleNoSuffixChange(type, event)}
                  style={styles.checkboxInput}
                />
                None
              </label>
            </div>
          </div>
        </div>

        <div style={styles.rowTwo}>
          <Field
            label="Birthday:"
            name={`${prefix}Birthday`}
            type="date"
            onChange={(event) => handleBirthdayChange(type, event)}
          />

          <Field
            label="Age:"
            name={`${prefix}Age`}
            value={ageValues[type]}
            readOnly
          />
        </div>

        <div style={styles.rowTwo}>
          <GenderField name={`${roleLabel}Gender`} />

          <SelectField
            label="Civil Status:"
            name={`${prefix}CivilStatus`}
            placeholder="Select Civil Status"
            options={civilStatusOptions}
          />
        </div>

        <div style={styles.rowTwo}>
          <SelectField
            label="Religion:"
            name={`${prefix}Religion`}
            placeholder="Select Religion"
            options={religionOptions}
          />

          <SelectField
            label="Nationality:"
            name={`${prefix}Nationality`}
            placeholder="Select Nationality"
            options={nationalityOptions}
          />
        </div>

        <div style={styles.rowThree}>
          <Field label="Home Address:" name={`${prefix}Address`} />
          <Field label="Contact Number:" name={`${prefix}Contact`} type="tel" />
          <Field label="Email Address:" name={`${prefix}Email`} type="email" />
        </div>
      </>
    );
  }

  function DoctorWorkExperience({ item }) {
    return (
      <div style={styles.workItem}>
        {item > 1 && <h3 style={styles.subTitle}>Another Previous Work</h3>}

        <div style={styles.rowTwo}>
          <Field label="Clinic / Hospital Name:" name="prevName[]" />
          <Field label="Clinic / Hospital Address:" name="prevAddress[]" />
        </div>

        <div style={styles.rowTwo}>
          <Field
            label="Specialization:"
            name="prevClinicSpecialization[]"
          />

          <DurationField
            startName="docPrevClinicStart[]"
            endName="docPClinicEnd[]"
          />
        </div>

        <div style={styles.rowTwo}>
          <Field label="Reason for Leaving:" name="prevClinicReason[]" />
        </div>
      </div>
    );
  }

  function AssistantWorkExperience({ item }) {
    return (
      <div style={styles.workItem}>
        {item > 1 && <h3 style={styles.subTitle}>Another Previous Work</h3>}

        <div style={styles.rowTwo}>
          <Field label="Clinic Name" name="daPrevName[]" />
          <Field label="Clinic Address" name="daPrevAddress[]" />
        </div>

        <div style={styles.rowTwo}>
          <Field label="Position" name="daPrevPosition[]" />

          <DurationField
            startName="daPrevStart[]"
            endName="daPrevEnd[]"
          />
        </div>
      </div>
    );
  }

  function ReceptionistWorkExperience({ item }) {
    return (
      <div style={styles.workItem}>
        {item > 1 && <h3 style={styles.subTitle}>Another Previous Work</h3>}

        <div style={styles.rowTwo}>
          <Field label="Company / Clinic Name" name="prevName[]" />
          <Field label="Company / Clinic Address" name="prevAddress[]" />
        </div>

        <div style={styles.rowTwo}>
          <Field label="Position" name="prevPosition[]" />

          <DurationField
            startName="recepPrevClinicStart[]"
            endName="recepPClinicEnd[]"
          />
        </div>

        <div style={styles.rowTwo}>
          <Field label="Job Responsibilities" name="prevResponsibilities[]" />
          <Field label="Reason for Leaving" name="prevReason[]" />
        </div>
      </div>
    );
  }

  function DentistForm() {
    return (
      <div style={styles.formSection}>
        <Section sectionKey="docPersonal" title="Section 1 - Personal Information">
          <PersonalInformation type="dentist" prefix="doctor" />
        </Section>

        <Section
          sectionKey="docProfessional"
          title="Section 2 - Professional Information"
        >
          <div style={styles.rowTwo}>
            <Field label="Medical Degree" name="medicalDegree" />
            <Field label="Medical License Number" name="licenseNumber" />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Specialization" name="specialization" />
            <Field
              label="Years of Experience"
              name="experienceYears"
              type="number"
              min="0"
            />
          </div>

          <h3 style={styles.subTitle}>Previous Work</h3>

          {doctorWorkItems.map((item) => (
            <DoctorWorkExperience key={item} item={item} />
          ))}

          <div style={styles.addWork}>
            <button
              type="button"
              style={styles.addWorkBtn}
              onClick={addDoctorWorkExperience}
            >
              Add Work Experience
            </button>
          </div>
        </Section>

        <Section sectionKey="docWork" title="Section 3 - Work Details">
          <div style={styles.rowTwo}>
            <SelectField
              label="Assigned Branch"
              name="branchId"
              placeholder="Select branch"
              options={branchOptions}
              required
            />

            <SelectField
              label="Specialization"
              name="department"
              placeholder="Select specialization"
              options={dentistSpecializations}
              required
            />

            <Field label="Start Date" name="startDate" type="date" />
          </div>

          <div style={styles.rowTwo}>
            <SelectField
              label="Employment Type"
              name="employmentType"
              placeholder="Select Type"
              options={employmentTypes}
            />

            <SelectField
              label="Shift Type"
              name="shiftType"
              placeholder="Select Type"
              options={['By Appointment']}
            />
          </div>

          <div style={styles.rowTwo}>
            <ScheduleField name="schedule[]" />
            <TimeRangeField startName="docWorkStart" endName="docWorkEnd" />
          </div>
        </Section>

        <Section sectionKey="docAccess" title="Section 4 - Web Access">
          <div style={styles.rowTwo}>
            <Field label="Email Address" name="accessEmail" type="email" />
            <Field label="Password" name="accessPassword" type="password" />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Access Role" name="accessRole" value="Dentist" readOnly />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
            />
          </div>
        </Section>
      </div>
    );
  }

  function DentalAssistantForm() {
    return (
      <div style={styles.formSection}>
        <Section sectionKey="daPersonal" title="Section 1 - Personal Information">
          <PersonalInformation type="dentalAssistant" prefix="da" />
        </Section>

        <Section
          sectionKey="daProfessional"
          title="Section 2 - Professional Information"
        >
          <div style={styles.rowTwo}>
            <Field
              label="Position"
              name="daPosition"
              value="Dental Assistant"
              readOnly
            />

            <Field
              label="Years of Experience"
              name="daExperienceYears"
              type="number"
              min="0"
            />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Skills" name="daSkills" />
          </div>

          <h3 style={styles.subTitle}>Previous Work</h3>

          {assistantWorkItems.map((item) => (
            <AssistantWorkExperience key={item} item={item} />
          ))}

          <div style={styles.addWork}>
            <button
              type="button"
              style={styles.addWorkBtn}
              onClick={addAssistantWorkExperience}
            >
              Add Work Experience
            </button>
          </div>
        </Section>

        <Section sectionKey="daWork" title="Section 3 - Work Details">
          <div style={styles.rowTwo}>
            <SelectField
              label="Assigned Branch"
              name="branchId"
              placeholder="Select branch"
              options={branchOptions}
              required
            />
          </div>

          <div style={styles.rowTwo}>
            <ScheduleField name="schedule[]" />
            <TimeRangeField startName="daWorkStart" endName="daWorkEnd" />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Department" name="daDepartment" />

            <SelectField
              label="Assigned Dentist"
              name="daAssignedDentist"
              placeholder="Select Dentist"
              options={dentistOptions}
            />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Start Date" name="daStartDate" type="date" />

            <SelectField
              label="Employment Type"
              name="daEmploymentType"
              placeholder="Select Type"
              options={employmentTypes}
            />
          </div>

          <div style={styles.rowTwo}>
            <SelectField
              label="Shift Type"
              name="daShiftType"
              placeholder="Select Type"
              options={['Day', 'Afternoon', 'Night']}
            />
          </div>
        </Section>
      </div>
    );
  }

  function ReceptionistForm() {
    return (
      <div style={styles.formSection}>
        <Section sectionKey="recPersonal" title="Section 1 - Personal Information">
          <PersonalInformation type="receptionist" prefix="recep" />
        </Section>

        <Section sectionKey="recPosition" title="Section 2 - Position Information">
          <div style={styles.rowTwo}>
            <Field
              label="Position"
              name="recepPosition"
              value="Receptionist"
              readOnly
            />

            <Field
              label="Years of Experience"
              name="recepExperienceYears"
              type="number"
              min="0"
            />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Skills" name="recepSkills" />
          </div>

          <h3 style={styles.subTitle}>Previous Work</h3>

          {receptionistWorkItems.map((item) => (
            <ReceptionistWorkExperience key={item} item={item} />
          ))}

          <div style={styles.addWork}>
            <button
              type="button"
              style={styles.addWorkBtn}
              onClick={addReceptionistWorkExperience}
            >
              Add Work Experience
            </button>
          </div>
        </Section>

        <Section sectionKey="recWork" title="Section 3 - Work Details">
          <div style={styles.rowTwo}>
            <SelectField
              label="Assigned Branch"
              name="branchId"
              placeholder="Select branch"
              options={branchOptions}
              required
            />
          </div>

          <div style={styles.rowTwo}>
            <ScheduleField name="schedule[]" />
            <TimeRangeField startName="recepWorkStart" endName="recepWorkEnd" />
          </div>

          <div style={styles.rowTwo}>
            <Field label="Start Date" name="startDate" type="date" />
          </div>
        </Section>

        <Section sectionKey="recAccess" title="Section 4 - Web Access">
          <div style={styles.rowTwo}>
            <Field label="Email Address" name="accessEmail" type="email" />
            <Field label="Password" name="accessPassword" type="password" />
          </div>

          <div style={styles.rowTwo}>
            <Field
              label="Access Role"
              name="accessRole"
              value="Receptionist"
              readOnly
            />

            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
            />
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <form style={styles.employeeForm} onSubmit={handleSubmit}>
        <div style={styles.container}>
          <div style={styles.header}>
            <button
              type="button"
              style={styles.backBtn}
              onClick={handleBackClick}
              aria-label="Go back"
            >
              ←
            </button>

            <h2 style={styles.headerTitle}>Clinic Employee Form</h2>

            <p style={styles.headerText}>
              Complete the required details for the employee records.
            </p>
          </div>

          <div style={styles.radioGroup}>
            <label style={styles.employeeTypeLabel}>
              <input
                type="radio"
                name="employeeType"
                value="dentist"
                checked={employeeType === 'dentist'}
                onChange={handleEmployeeTypeChange}
                style={styles.radioInput}
              />
              Dentist
            </label>

            <label style={styles.employeeTypeLabel}>
              <input
                type="radio"
                name="employeeType"
                value="dentalAssistant"
                checked={employeeType === 'dentalAssistant'}
                onChange={handleEmployeeTypeChange}
                style={styles.radioInput}
              />
              Dental Assistant
            </label>

            <label style={styles.employeeTypeLabel}>
              <input
                type="radio"
                name="employeeType"
                value="receptionist"
                checked={employeeType === 'receptionist'}
                onChange={handleEmployeeTypeChange}
                style={styles.radioInput}
              />
              Receptionist
            </label>
          </div>

          {!employeeType && (
            <div style={styles.emptyState}>
              Select an employee type to show the form.
            </div>
          )}

          {employeeType === 'dentist' && <DentistForm />}
          {employeeType === 'dentalAssistant' && <DentalAssistantForm />}
          {employeeType === 'receptionist' && <ReceptionistForm />}

          {employeeType && (
            <div style={styles.formSubmit}>
              <button type="submit" style={styles.submitBtn}>
                Submit
              </button>
            </div>
          )}
        </div>
      </form>

      {showBackModal && (
        <div style={styles.modal} onClick={handleModalOverlayClick}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-users-alt" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.modalTitle}>Leave Employee Form?</h2>

            <p style={styles.modalText}>
              Are you sure you want to go back? Any unsaved changes to this
              employee form will be lost.
            </p>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.confirmBtn }}
                onClick={confirmBack}
              >
                Yes
              </button>

              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeBackModal}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
