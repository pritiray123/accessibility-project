import React, { useState, useRef, useEffect } from 'react';
import {
  registrationSchema,
  calculatePasswordScore,
  passwordCriteria,
  RegistrationFormData,
} from '../validation/registrationSchema.ts';
import { AccessibleDialog } from './AccessibleDialog.tsx';

interface FormErrors {
  fullName?: string;
  email?: string;
  accountType?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
  agreePrivacy?: string;
}

export const AccessibleRegistrationForm: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    accountType: 'individual',
    password: '',
    confirmPassword: '',
    accommodations: [],
    agreeTerms: false as unknown as true,
    agreePrivacy: false as unknown as true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Async Validation Simulation State
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string>('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);
  const termsTriggerRef = useRef<HTMLButtonElement>(null);
  const privacyTriggerRef = useRef<HTMLButtonElement>(null);

  // Focus & Accessibility Refs
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // Password Live Announcement Debounce
  const [announcedStrength, setAnnouncedStrength] = useState<string>('');
  const passwordScoreData = calculatePasswordScore(formData.password);

  useEffect(() => {
    if (!formData.password) {
      setAnnouncedStrength('');
      return;
    }
    const timer = setTimeout(() => {
      setAnnouncedStrength(`Password strength: ${passwordScoreData.label}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.password, passwordScoreData.label]);

  // Handle Field Value Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'accommodations') {
        const current = [...formData.accommodations];
        const next = checked
          ? [...current, value]
          : current.filter((item) => item !== value);
        setFormData((prev) => ({ ...prev, accommodations: next }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
        // Clear error on toggle
        if (errors[name as keyof FormErrors]) {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Realtime validation clearing once valid
      if (touched[name] && errors[name as keyof FormErrors]) {
        const partialResult = registrationSchema.safeParse({
          ...formData,
          [name]: value,
        });
        if (partialResult.success) {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        } else {
          const fieldIssue = partialResult.error.issues.find(
            (issue) => issue.path[0] === name
          );
          if (!fieldIssue) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
          }
        }
      }
    }
  };

  // Blur Handler
  const handleBlur = (field: keyof RegistrationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Async Email Check simulation
    if (field === 'email' && formData.email && formData.email.includes('@')) {
      setIsCheckingEmail(true);
      setEmailStatusMessage('Verifying email availability...');
      setTimeout(() => {
        setIsCheckingEmail(false);
        if (formData.email.toLowerCase() === 'taken@example.com') {
          setErrors((prev) => ({
            ...prev,
            email: 'This email is already registered. Please choose another address or log in.',
          }));
          setEmailStatusMessage('Email address is unavailable.');
        } else {
          setEmailStatusMessage('Email address is available.');
        }
      }, 700);
    }

    // Partial field validation on blur
    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      if (issue) {
        setErrors((prev) => ({ ...prev, [field]: issue.message }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    }
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      accountType: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
      agreePrivacy: true,
    });

    const result = registrationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);

      // Programmatically shift focus to Error Summary (WCAG 3.3.1)
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 50);
      return;
    }

    // Submit Simulation
    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        successHeadingRef.current?.focus();
      }, 100);
    }, 1200);
  };

  // Focus specific input on error link click
  const focusField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const errorKeys = Object.keys(errors).filter(
    (key) => !!errors[key as keyof FormErrors]
  ) as (keyof FormErrors)[];

  // If successfully registered, display success confirmation with accessible status
  if (isSuccess) {
    return (
      <main id="main-content" tabIndex={-1} className="app-container">
        <section
          role="status"
          aria-live="polite"
          className="registration-card success-banner"
        >
          <h2
            ref={successHeadingRef}
            tabIndex={-1}
            style={{ outline: 'none' }}
          >
            Registration Completed Successfully
          </h2>
          <p>
            Welcome, <strong>{formData.fullName}</strong>. Your account has been
            provisioned with the email address <strong>{formData.email}</strong>.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            A confirmation email has been dispatched. You may now proceed to log in.
          </p>
          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  fullName: '',
                  email: '',
                  accountType: 'individual',
                  password: '',
                  confirmPassword: '',
                  accommodations: [],
                  agreeTerms: false as unknown as true,
                  agreePrivacy: false as unknown as true,
                });
                setTouched({});
                setErrors({});
              }}
            >
              Register Another Account
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="app-container">
      <header style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Enterprise Account Registration</h1>
        <p className="page-subtitle">
          Please fill out the form below. All fields marked with an asterisk (
          <span className="required-indicator" aria-hidden="true">*</span>
          ) are required. This form complies with WCAG 2.2 AA accessibility guidelines.
        </p>
      </header>

      {/* Screen Reader Live Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        {announcedStrength}
        {emailStatusMessage}
      </div>

      {/* Error Summary Banner (WCAG 3.3.1 Error Identification) */}
      {errorKeys.length > 0 && (
        <section
          ref={errorSummaryRef}
          role="alert"
          aria-labelledby="error-summary-title"
          className="error-summary"
          tabIndex={-1}
        >
          <h2 id="error-summary-title" className="error-summary-heading">
            <svg
              className="error-message-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="5" x2="10" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="10" cy="14" r="1" fill="currentColor" />
            </svg>
            There is a problem with your submission ({errorKeys.length}{' '}
            {errorKeys.length === 1 ? 'error' : 'errors'} to correct)
          </h2>
          <ul className="error-summary-list">
            {errorKeys.map((key) => (
              <li key={key}>
                <a
                  href={`#field-${key}`}
                  className="error-summary-link"
                  onClick={(e) => {
                    e.preventDefault();
                    focusField(`field-${key}`);
                  }}
                >
                  {errors[key]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Registration Form */}
      <div className="registration-card">
        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="User Account Registration Form"
        >
          {/* SECTION 1: Personal & Identity Information */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">1. Personal & Contact Information</legend>
            <p className="legend-description">
              Provide your legal or preferred identity name and a verified contact email.
            </p>

            {/* Full Name */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="field-fullName" className="form-label">
                  Full Name
                  <span className="required-indicator" aria-hidden="true"> *</span>
                  <span className="visually-hidden">(Required)</span>
                </label>
              </div>
              <input
                ref={fullNameInputRef}
                id="field-fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                aria-invalid={touched.fullName && !!errors.fullName ? 'true' : 'false'}
                aria-describedby={
                  touched.fullName && errors.fullName
                    ? 'fullName-error fullName-help'
                    : 'fullName-help'
                }
              />
              <p id="fullName-help" className="helper-text">
                Enter your first and last name (minimum 2 characters).
              </p>
              {touched.fullName && errors.fullName && (
                <p id="fullName-error" className="error-message" role="alert">
                  <span aria-hidden="true" className="error-message-icon">▲</span>
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="field-email" className="form-label">
                  Email Address
                  <span className="required-indicator" aria-hidden="true"> *</span>
                  <span className="visually-hidden">(Required)</span>
                </label>
                {isCheckingEmail && (
                  <span
                    className="skeleton-line"
                    style={{ width: '120px' }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <input
                ref={emailInputRef}
                id="field-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                aria-invalid={touched.email && !!errors.email ? 'true' : 'false'}
                aria-describedby={
                  touched.email && errors.email
                    ? 'email-error email-help'
                    : 'email-help'
                }
              />
              <p id="email-help" className="helper-text">
                We will send an activation verification email to this address.
              </p>
              {touched.email && errors.email && (
                <p id="email-error" className="error-message" role="alert">
                  <span aria-hidden="true" className="error-message-icon">▲</span>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>
          </fieldset>

          {/* SECTION 2: Account Role & Tier Selection */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">2. Account Type & Role</legend>
            <p className="legend-description">
              Choose the primary role for this identity profile.
            </p>

            <div
              role="radiogroup"
              aria-labelledby="account-type-group-label"
              className="choice-group"
            >
              <span id="account-type-group-label" className="visually-hidden">
                Account Type Selection
              </span>

              <label className="choice-item">
                <input
                  type="radio"
                  name="accountType"
                  value="individual"
                  checked={formData.accountType === 'individual'}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    <strong>Individual Practitioner</strong>
                  </span>
                  <p className="choice-label-desc">
                    For individual engineers, researchers, and personal projects.
                  </p>
                </div>
              </label>

              <label className="choice-item">
                <input
                  type="radio"
                  name="accountType"
                  value="developer"
                  checked={formData.accountType === 'developer'}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    <strong>Professional Developer</strong>
                  </span>
                  <p className="choice-label-desc">
                    Includes advanced API access and sandbox testing environments.
                  </p>
                </div>
              </label>

              <label className="choice-item">
                <input
                  type="radio"
                  name="accountType"
                  value="enterprise"
                  checked={formData.accountType === 'enterprise'}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    <strong>Enterprise Team</strong>
                  </span>
                  <p className="choice-label-desc">
                    Multi-user tenant management, SSO, and dedicated SLA support.
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          {/* SECTION 3: Credentials & Accessible Authentication */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              3. Security & Authentication (WCAG 3.3.8)
            </legend>
            <p className="legend-description">
              Create a robust password. Password managers, copy/paste, and visibility
              toggles are fully supported to alleviate cognitive fatigue.
            </p>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="field-password" className="form-label">
                  Create Password
                  <span className="required-indicator" aria-hidden="true"> *</span>
                  <span className="visually-hidden">(Required)</span>
                </label>
              </div>

              <div className="password-input-wrapper">
                <input
                  ref={passwordInputRef}
                  id="field-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={touched.password && !!errors.password ? 'true' : 'false'}
                  aria-describedby={
                    touched.password && errors.password
                      ? 'password-error password-help password-strength-desc'
                      : 'password-help password-strength-desc'
                  }
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password characters' : 'Show password as plain text'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <p id="password-help" className="helper-text">
                Must be at least 12 characters and include uppercase, lowercase, number, and special character.
              </p>

              {/* Password Strength Indicator */}
              <div
                className="password-strength-container"
                id="password-strength-desc"
                aria-label={`Password strength evaluation: ${passwordScoreData.label}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span>Strength: <strong>{passwordScoreData.label}</strong></span>
                  <span>Criteria: {
                    [
                      passwordCriteria.minLength(formData.password),
                      passwordCriteria.hasUpper(formData.password),
                      passwordCriteria.hasLower(formData.password),
                      passwordCriteria.hasNumber(formData.password),
                      passwordCriteria.hasSpecial(formData.password),
                    ].filter(Boolean).length
                  } / 5</span>
                </div>

                <div className="strength-bar-track" aria-hidden="true">
                  <div
                    className="strength-bar-fill"
                    data-score={passwordScoreData.score}
                  />
                </div>

                <ul className="strength-criteria-list" aria-label="Password rules checklist">
                  <li
                    className={`strength-criteria-item ${passwordCriteria.minLength(formData.password) ? 'met' : ''}`}
                  >
                    <span aria-hidden="true">
                      {passwordCriteria.minLength(formData.password) ? '✓' : '○'}
                    </span>
                    <span>12+ characters</span>
                  </li>
                  <li
                    className={`strength-criteria-item ${passwordCriteria.hasUpper(formData.password) ? 'met' : ''}`}
                  >
                    <span aria-hidden="true">
                      {passwordCriteria.hasUpper(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Uppercase letter (A-Z)</span>
                  </li>
                  <li
                    className={`strength-criteria-item ${passwordCriteria.hasLower(formData.password) ? 'met' : ''}`}
                  >
                    <span aria-hidden="true">
                      {passwordCriteria.hasLower(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Lowercase letter (a-z)</span>
                  </li>
                  <li
                    className={`strength-criteria-item ${passwordCriteria.hasNumber(formData.password) ? 'met' : ''}`}
                  >
                    <span aria-hidden="true">
                      {passwordCriteria.hasNumber(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Numerical digit (0-9)</span>
                  </li>
                  <li
                    className={`strength-criteria-item ${passwordCriteria.hasSpecial(formData.password) ? 'met' : ''}`}
                  >
                    <span aria-hidden="true">
                      {passwordCriteria.hasSpecial(formData.password) ? '✓' : '○'}
                    </span>
                    <span>Special character (!@#$)</span>
                  </li>
                </ul>
              </div>

              {touched.password && errors.password && (
                <p id="password-error" className="error-message" role="alert">
                  <span aria-hidden="true" className="error-message-icon">▲</span>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="field-confirmPassword" className="form-label">
                  Confirm Password
                  <span className="required-indicator" aria-hidden="true"> *</span>
                  <span className="visually-hidden">(Required)</span>
                </label>
              </div>

              <div className="password-input-wrapper">
                <input
                  ref={confirmPasswordInputRef}
                  id="field-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  aria-invalid={touched.confirmPassword && !!errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={
                    touched.confirmPassword && errors.confirmPassword
                      ? 'confirmPassword-error confirmPassword-help'
                      : 'confirmPassword-help'
                  }
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-pressed={showConfirmPassword}
                  aria-label={showConfirmPassword ? 'Hide confirm password characters' : 'Show confirm password as plain text'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <p id="confirmPassword-help" className="helper-text">
                Re-enter your password to prevent typographical errors.
              </p>

              {touched.confirmPassword && errors.confirmPassword && (
                <p id="confirmPassword-error" className="error-message" role="alert">
                  <span aria-hidden="true" className="error-message-icon">▲</span>
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </fieldset>

          {/* SECTION 4: Accessibility Preferences & Accommodations */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">
              4. Accessibility Preferences (Optional)
            </legend>
            <p className="legend-description">
              Select default interface configurations for your profile.
            </p>

            <div className="choice-group">
              <label className="choice-item">
                <input
                  type="checkbox"
                  name="accommodations"
                  value="high-contrast"
                  checked={formData.accommodations.includes('high-contrast')}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    Enhanced High-Contrast Theme (AAA Contrast Enforcement)
                  </span>
                  <p className="choice-label-desc">
                    Increases minimum visual contrast on text and graphical elements to 7:1.
                  </p>
                </div>
              </label>

              <label className="choice-item">
                <input
                  type="checkbox"
                  name="accommodations"
                  value="reduced-motion"
                  checked={formData.accommodations.includes('reduced-motion')}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    Strict Reduced Motion Default
                  </span>
                  <p className="choice-label-desc">
                    Disables all smooth transitions and animated indicators.
                  </p>
                </div>
              </label>

              <label className="choice-item">
                <input
                  type="checkbox"
                  name="accommodations"
                  value="screen-reader-verbose"
                  checked={formData.accommodations.includes('screen-reader-verbose')}
                  onChange={handleChange}
                />
                <div>
                  <span className="choice-label-text">
                    Extended Assistive Technology Verbosity
                  </span>
                  <p className="choice-label-desc">
                    Injects contextual screen-reader explanations into operational dashboards.
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          {/* SECTION 5: Legal & Consents */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">5. Agreements & Consents</legend>

            <div className="choice-group">
              {/* Terms of Service Checkbox */}
              <div>
                <label className="choice-item">
                  <input
                    id="field-agreeTerms"
                    type="checkbox"
                    name="agreeTerms"
                    checked={Boolean(formData.agreeTerms)}
                    onChange={handleChange}
                    aria-invalid={touched.agreeTerms && !!errors.agreeTerms ? 'true' : 'false'}
                    aria-describedby={
                      touched.agreeTerms && errors.agreeTerms
                        ? 'agreeTerms-error agreeTerms-help'
                        : 'agreeTerms-help'
                    }
                  />
                  <div>
                    <span className="choice-label-text">
                      I agree to the{' '}
                      <button
                        ref={termsTriggerRef}
                        type="button"
                        className="link-button"
                        onClick={() => setActiveModal('terms')}
                        aria-haspopup="dialog"
                      >
                        Terms of Service
                      </button>
                      <span className="required-indicator" aria-hidden="true"> *</span>
                      <span className="visually-hidden">(Required)</span>
                    </span>
                    <p id="agreeTerms-help" className="choice-label-desc">
                      Defines platform usage rights, account responsibilities, and SLA standards.
                    </p>
                  </div>
                </label>
                {touched.agreeTerms && errors.agreeTerms && (
                  <p id="agreeTerms-error" className="error-message" role="alert" style={{ marginLeft: '32px' }}>
                    <span aria-hidden="true" className="error-message-icon">▲</span>
                    <span>{errors.agreeTerms}</span>
                  </p>
                )}
              </div>

              {/* Privacy Policy Checkbox */}
              <div>
                <label className="choice-item">
                  <input
                    id="field-agreePrivacy"
                    type="checkbox"
                    name="agreePrivacy"
                    checked={Boolean(formData.agreePrivacy)}
                    onChange={handleChange}
                    aria-invalid={touched.agreePrivacy && !!errors.agreePrivacy ? 'true' : 'false'}
                    aria-describedby={
                      touched.agreePrivacy && errors.agreePrivacy
                        ? 'agreePrivacy-error agreePrivacy-help'
                        : 'agreePrivacy-help'
                    }
                  />
                  <div>
                    <span className="choice-label-text">
                      I acknowledge and accept the{' '}
                      <button
                        ref={privacyTriggerRef}
                        type="button"
                        className="link-button"
                        onClick={() => setActiveModal('privacy')}
                        aria-haspopup="dialog"
                      >
                        Privacy Policy
                      </button>
                      <span className="required-indicator" aria-hidden="true"> *</span>
                      <span className="visually-hidden">(Required)</span>
                    </span>
                    <p id="agreePrivacy-help" className="choice-label-desc">
                      Outlines data handling, encryption at rest, and GDPR/CCPA consumer rights.
                    </p>
                  </div>
                </label>
                {touched.agreePrivacy && errors.agreePrivacy && (
                  <p id="agreePrivacy-error" className="error-message" role="alert" style={{ marginLeft: '32px' }}>
                    <span aria-hidden="true" className="error-message-icon">▲</span>
                    <span>{errors.agreePrivacy}</span>
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Form Actions */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-icon" aria-hidden="true">◌</span>
                  <span>Submitting Registration...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFormData({
                  fullName: '',
                  email: '',
                  accountType: 'individual',
                  password: '',
                  confirmPassword: '',
                  accommodations: [],
                  agreeTerms: false as unknown as true,
                  agreePrivacy: false as unknown as true,
                });
                setErrors({});
                setTouched({});
              }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Accessible Dialogs for Terms and Privacy */}
      <AccessibleDialog
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        description="Enterprise platform usage guidelines and legal responsibilities."
        triggerRef={termsTriggerRef}
      >
        <p style={{ marginBottom: '16px' }}>
          Welcome to our Enterprise Platform. By accessing or using this service,
          you agree to adhere to strict security standards, account integrity rules,
          and fair computational resource utilization.
        </p>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '16px 0 8px' }}>
          1. Acceptable Use
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Accounts may not be shared across unaffiliated organizations. All identity
          credentials must be kept confidential, and users must follow authorized
          authentication workflows.
        </p>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '16px 0 8px' }}>
          2. Accessibility Standards
        </h3>
        <p>
          We are committed to maintaining WCAG 2.2 AA compliance across all workflows.
          If you encounter any accessibility barriers, please report them directly to our
          digital accessibility team.
        </p>
      </AccessibleDialog>

      <AccessibleDialog
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        description="Comprehensive notice on data governance and cryptographic security."
        triggerRef={privacyTriggerRef}
      >
        <p style={{ marginBottom: '16px' }}>
          This Privacy Notice explains how personal data is collected, processed, and
          protected in strict compliance with global privacy regulations including GDPR,
          CCPA, and modern encryption mandates.
        </p>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '16px 0 8px' }}>
          1. Data Encryption & Storage
        </h3>
        <p style={{ marginBottom: '16px' }}>
          All personal identifiable information (PII) is encrypted at rest using AES-256
          and transmitted exclusively over TLS 1.3 connections. Passwords are hash-salted
          using Argon2id algorithms.
        </p>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '16px 0 8px' }}>
          2. Consumer Rights
        </h3>
        <p>
          You retain the right to audit, export, or request the deletion of your personal
          identity records at any time via your account management preferences.
        </p>
      </AccessibleDialog>
    </main>
  );
};
