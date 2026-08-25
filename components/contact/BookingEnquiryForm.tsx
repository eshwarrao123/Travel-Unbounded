'use client';

import { useState, useId, FormEvent, ChangeEvent } from 'react';

export interface BookingEnquiryFormData {
  fullName: string;
  countryCode: string;
  contactNumber: string;
  email: string;
  dateOfTravel: string;
  numberOfPeople: number | string;
  hotelCategory: 'Standard' | 'Deluxe' | 'Luxury' | '';
  numberOfChildren: number | string;
}

export interface FormErrors {
  fullName?: string;
  contactNumber?: string;
  email?: string;
  dateOfTravel?: string;
  numberOfPeople?: string;
  hotelCategory?: string;
  numberOfChildren?: string;
}

export const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'US / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
];

const getTomorrowString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookingEnquiryForm() {
  const formId = useId();
  const tomorrowString = getTomorrowString();

  const [formData, setFormData] = useState<BookingEnquiryFormData>({
    fullName: '',
    countryCode: '+91',
    contactNumber: '',
    email: '',
    dateOfTravel: '',
    numberOfPeople: 1,
    hotelCategory: '',
    numberOfChildren: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate single field or all fields
  const validate = (data: BookingEnquiryFormData): FormErrors => {
    const newErrors: FormErrors = {};

    // 1. Full Name
    if (!data.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    // 2. Contact Number
    const cleanPhone = data.contactNumber.replace(/\D/g, '');
    if (!data.contactNumber.trim()) {
      newErrors.contactNumber = 'Please enter your contact number.';
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      newErrors.contactNumber = 'Please enter a valid contact number (7–15 digits).';
    }

    // 3. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(data.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // 4. Date of Travel (must be strictly in the future)
    if (!data.dateOfTravel) {
      newErrors.dateOfTravel = 'Please select your intended travel date.';
    } else {
      const selectedDate = new Date(data.dateOfTravel + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.dateOfTravel = 'Please choose a future travel date.';
      }
    }

    // 5. Number of People
    const peopleNum = Number(data.numberOfPeople);
    if (data.numberOfPeople === '' || isNaN(peopleNum) || peopleNum < 1) {
      newErrors.numberOfPeople = 'Number of travelers must be at least 1.';
    }

    // 6. Hotel Category
    if (!data.hotelCategory || !['Standard', 'Deluxe', 'Luxury'].includes(data.hotelCategory)) {
      newErrors.hotelCategory = 'Please select a hotel category.';
    }

    // 7. Number of Children
    const childrenNum = Number(data.numberOfChildren);
    if (data.numberOfChildren !== '' && (isNaN(childrenNum) || childrenNum < 0)) {
      newErrors.numberOfChildren = 'Number of children cannot be negative.';
    }

    return newErrors;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Real-time validation update for touched fields
      if (touched[name]) {
        const fieldErrors = validate(updated);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldErrors[name as keyof FormErrors],
        }));
      }
      return updated;
    });
  };

  const handleBlur = (field: keyof BookingEnquiryFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field as keyof FormErrors],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {
      fullName: true,
      contactNumber: true,
      email: true,
      dateOfTravel: true,
      numberOfPeople: true,
      hotelCategory: true,
      numberOfChildren: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first field with error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(`${formId}-${firstErrorField}`);
      element?.focus();
      return;
    }

    // Client validation passed — Simulate submitting state UX
    setSubmitError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      countryCode: '+91',
      contactNumber: '',
      email: '',
      dateOfTravel: '',
      numberOfPeople: 1,
      hotelCategory: '',
      numberOfChildren: 0,
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setSubmitError(null);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-emerald-200 p-8 md:p-12 rounded-xl shadow-lg text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            Enquiry Received!
          </h3>
          <p className="text-base text-gray-600 max-w-md mx-auto">
            Thank you, <span className="font-semibold text-gray-900">{formData.fullName}</span>! Our travel expert will contact you within 24 hours to design your bespoke journey.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-left max-w-sm mx-auto space-y-1 text-xs text-gray-600">
          <p><strong className="text-gray-900">Contact:</strong> {formData.countryCode} {formData.contactNumber}</p>
          <p><strong className="text-gray-900">Email:</strong> {formData.email}</p>
          <p><strong className="text-gray-900">Travel Date:</strong> {formData.dateOfTravel}</p>
          <p><strong className="text-gray-900">Guests:</strong> {formData.numberOfPeople} Adults, {formData.numberOfChildren || 0} Children</p>
          <p><strong className="text-gray-900">Hotel Category:</strong> {formData.hotelCategory}</p>
        </div>

        <button
          onClick={handleResetForm}
          type="button"
          className="btn btn-secondary text-sm px-6 py-2.5"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Booking Enquiry Form"
      className="bg-white border border-[var(--color-border)] p-6 md:p-10 space-y-6"
    >
      <div className="border-b border-[var(--color-border)] pb-6 mb-2">
        <h3 className="heading-subsection text-[var(--color-text-primary)]">
          Plan Your Travel Enquiry
        </h3>
        <p className="body-small text-[var(--color-text-secondary)] mt-2">
          Fill out the details below and our travel concierge will tailor a custom itinerary for you.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{submitError}</p>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor={`${formId}-fullName`}
          className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id={`${formId}-fullName`}
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={() => handleBlur('fullName')}
          placeholder="e.g. Ananya Sharma"
          aria-invalid={!!(touched.fullName && errors.fullName)}
          aria-describedby={touched.fullName && errors.fullName ? `${formId}-fullName-error` : undefined}
          className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            touched.fullName && errors.fullName
              ? 'border-red-500 bg-red-50/30'
              : 'border-gray-300 focus:border-[var(--color-accent)]'
          }`}
        />
        {touched.fullName && errors.fullName && (
          <p id={`${formId}-fullName-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
            <span>⚠️</span> {errors.fullName}
          </p>
        )}
      </div>

      {/* Contact Number with Country Code */}
      <div className="space-y-2">
        <label
          htmlFor={`${formId}-contactNumber`}
          className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
        >
          Contact Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {/* Country Code Select */}
          <div className="relative w-36 shrink-0">
            <select
              id={`${formId}-countryCode`}
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              aria-label="Country Code"
              className="w-full px-3 py-3.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
            >
              {countryCodes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.code} ({item.country})
                </option>
              ))}
            </select>
          </div>

          {/* Phone Input */}
          <div className="flex-1">
            <input
              id={`${formId}-contactNumber`}
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('contactNumber')}
              placeholder="e.g. 9876543210"
              aria-invalid={!!(touched.contactNumber && errors.contactNumber)}
              aria-describedby={touched.contactNumber && errors.contactNumber ? `${formId}-contactNumber-error` : undefined}
              className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
                touched.contactNumber && errors.contactNumber
                  ? 'border-red-500 bg-red-50/30'
                  : 'border-gray-300 focus:border-[var(--color-accent)]'
              }`}
            />
          </div>
        </div>
        {touched.contactNumber && errors.contactNumber && (
          <p id={`${formId}-contactNumber-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
            <span>⚠️</span> {errors.contactNumber}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor={`${formId}-email`}
          className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          placeholder="e.g. ananya@example.com"
          aria-invalid={!!(touched.email && errors.email)}
          aria-describedby={touched.email && errors.email ? `${formId}-email-error` : undefined}
          className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            touched.email && errors.email
              ? 'border-red-500 bg-red-50/30'
              : 'border-gray-300 focus:border-[var(--color-accent)]'
          }`}
        />
        {touched.email && errors.email && (
          <p id={`${formId}-email-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
            <span>⚠️</span> {errors.email}
          </p>
        )}
      </div>

      {/* Date of Travel */}
      <div className="space-y-2">
        <label
          htmlFor={`${formId}-dateOfTravel`}
          className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
        >
          Date of Travel <span className="text-red-500">*</span>
        </label>
        <input
          id={`${formId}-dateOfTravel`}
          name="dateOfTravel"
          type="date"
          min={tomorrowString}
          value={formData.dateOfTravel}
          onChange={handleChange}
          onBlur={() => handleBlur('dateOfTravel')}
          aria-invalid={!!(touched.dateOfTravel && errors.dateOfTravel)}
          aria-describedby={touched.dateOfTravel && errors.dateOfTravel ? `${formId}-dateOfTravel-error` : undefined}
          className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            touched.dateOfTravel && errors.dateOfTravel
              ? 'border-red-500 bg-red-50/30'
              : 'border-gray-300 focus:border-[var(--color-accent)]'
          }`}
        />
        {touched.dateOfTravel && errors.dateOfTravel && (
          <p id={`${formId}-dateOfTravel-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
            <span>⚠️</span> {errors.dateOfTravel}
          </p>
        )}
      </div>

      {/* Grid: Number of People & Hotel Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of People */}
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-numberOfPeople`}
            className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
          >
            Number of People <span className="text-red-500">*</span>
          </label>
          <input
            id={`${formId}-numberOfPeople`}
            name="numberOfPeople"
            type="number"
            min="1"
            value={formData.numberOfPeople}
            onChange={handleChange}
            onBlur={() => handleBlur('numberOfPeople')}
            aria-invalid={!!(touched.numberOfPeople && errors.numberOfPeople)}
            aria-describedby={touched.numberOfPeople && errors.numberOfPeople ? `${formId}-numberOfPeople-error` : undefined}
            className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              touched.numberOfPeople && errors.numberOfPeople
                ? 'border-red-500 bg-red-50/30'
                : 'border-gray-300 focus:border-[var(--color-accent)]'
            }`}
          />
          {touched.numberOfPeople && errors.numberOfPeople && (
            <p id={`${formId}-numberOfPeople-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
              <span>⚠️</span> {errors.numberOfPeople}
            </p>
          )}
        </div>

        {/* Hotel Category */}
        <div className="space-y-2">
          <label
            htmlFor={`${formId}-hotelCategory`}
            className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
          >
            Hotel Category <span className="text-red-500">*</span>
          </label>
          <select
            id={`${formId}-hotelCategory`}
            name="hotelCategory"
            value={formData.hotelCategory}
            onChange={handleChange}
            onBlur={() => handleBlur('hotelCategory')}
            aria-invalid={!!(touched.hotelCategory && errors.hotelCategory)}
            aria-describedby={touched.hotelCategory && errors.hotelCategory ? `${formId}-hotelCategory-error` : undefined}
            className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
              touched.hotelCategory && errors.hotelCategory
                ? 'border-red-500 bg-red-50/30'
                : 'border-gray-300 focus:border-[var(--color-accent)]'
            }`}
          >
            <option value="">Select Hotel Category</option>
            <option value="Standard">Standard (3★ Boutique)</option>
            <option value="Deluxe">Deluxe (4★ Heritage)</option>
            <option value="Luxury">Luxury (5★ Sanctuary)</option>
          </select>
          {touched.hotelCategory && errors.hotelCategory && (
            <p id={`${formId}-hotelCategory-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
              <span>⚠️</span> {errors.hotelCategory}
            </p>
          )}
        </div>
      </div>

      {/* Number of Children */}
      <div className="space-y-2">
        <label
          htmlFor={`${formId}-numberOfChildren`}
          className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-primary)]"
        >
          Number of Children <span className="text-gray-400 font-normal text-xs">(Optional)</span>
        </label>
        <input
          id={`${formId}-numberOfChildren`}
          name="numberOfChildren"
          type="number"
          min="0"
          value={formData.numberOfChildren}
          onChange={handleChange}
          onBlur={() => handleBlur('numberOfChildren')}
          aria-invalid={!!(touched.numberOfChildren && errors.numberOfChildren)}
          aria-describedby={touched.numberOfChildren && errors.numberOfChildren ? `${formId}-numberOfChildren-error` : undefined}
          className={`w-full px-4 py-3.5 rounded-lg border text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
            touched.numberOfChildren && errors.numberOfChildren
              ? 'border-red-500 bg-red-50/30'
              : 'border-gray-300 focus:border-[var(--color-accent)]'
          }`}
        />
        {touched.numberOfChildren && errors.numberOfChildren && (
          <p id={`${formId}-numberOfChildren-error`} className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
            <span>⚠️</span> {errors.numberOfChildren}
          </p>
        )}
      </div>

      {/* Submit Action Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full py-4 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting…</span>
            </>
          ) : (
            <span>Submit Enquiry</span>
          )}
        </button>
      </div>
    </form>
  );
}
