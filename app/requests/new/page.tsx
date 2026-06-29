"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Car,
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle,
  Search,
  Gauge,
  Fuel,
  Settings2,
  Calendar,
  FileText,
  Navigation,
  Hash,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatBudget } from '@/lib/utils/cn'

const COMMON_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Tesla', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen',
  'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'GMC', 'Ram', 'Jeep', 'Porsche',
  'Volvo', 'Land Rover', 'Mitsubishi',
]

const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe', 'Van', 'Any']
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Any']
const TRANSMISSIONS = ['Automatic', 'Manual', 'Any']
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'financing', label: 'Financing' },
  { value: 'either', label: 'Either' },
] as const

const STEPS = [
  { id: 1, label: 'Vehicle', icon: Car },
  { id: 2, label: 'Budget', icon: DollarSign },
  { id: 3, label: 'Location', icon: MapPin },
]

interface FormData {
  make: string
  model: string
  year_min: number
  year_max: number
  body_type: string
  fuel_type: string
  transmission: string
  mileage_max: number
  max_budget: number
  payment_method: 'cash' | 'financing' | 'either'
  location_zip: string
  location_radius_miles: number
  notes: string
}

const initialForm: FormData = {
  make: '', model: '', year_min: 2015, year_max: 2026,
  body_type: 'Any', fuel_type: 'Any', transmission: 'Any',
  mileage_max: 80000, max_budget: 30000, payment_method: 'cash',
  location_zip: '', location_radius_miles: 50, notes: '',
}

export default function RequestWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      setAuthReady(true)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Partial<Record<keyof FormData, string>> = {}
    if (currentStep === 1) {
      if (!form.make.trim()) stepErrors.make = 'Make is required'
      if (!form.model.trim()) stepErrors.model = 'Model is required'
      if (form.year_min > form.year_max) stepErrors.year_min = 'Min year must be ≤ max year'
    }
    if (currentStep === 2) {
      if (!form.max_budget || form.max_budget < 5000) stepErrors.max_budget = 'Budget must be at least $5,000'
    }
    if (currentStep === 3) {
      if (!form.location_zip.trim()) stepErrors.location_zip = 'ZIP code is required'
      if (form.location_zip.length !== 5 || !/^\d{5}$/.test(form.location_zip))
        stepErrors.location_zip = 'Enter a valid 5-digit ZIP'
    }
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(3, s + 1))
  }

  const back = () => {
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)
    setSubmitError(null)

    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      currentUserId = user?.id || null
    }

    if (!currentUserId) {
      setSubmitError('Your session has expired. Please sign in again.')
      setSubmitting(false)
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    const payload = {
      buyer_id: currentUserId,
      make: form.make.trim(),
      model: form.model.trim(),
      year_min: form.year_min,
      year_max: form.year_max,
      body_type: form.body_type === 'Any' ? null : form.body_type.toLowerCase(),
      fuel_type: form.fuel_type.toLowerCase(),
      transmission: form.transmission.toLowerCase(),
      mileage_max: form.mileage_max,
      max_budget: form.max_budget,
      payment_method: form.payment_method,
      location_zip: form.location_zip.trim(),
      location_radius_miles: form.location_radius_miles,
      notes: form.notes.trim() || null,
      status: 'active',
    }

    const { error } = await supabase.from('car_requests').insert(payload).select().single()

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const monthlyPayment =
    form.payment_method !== 'cash'
      ? calcMonthlyPayment(form.max_budget, 0.06, 60)
      : 0

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="text-[#5e6ad2] animate-spin" size={24} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#08090a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-[15px] tracking-tight text-[#f7f8f8] hover:opacity-80 transition-opacity"
            style={{ fontWeight: 510 }}
          >
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
            style={{ fontWeight: 510 }}
          >
            Cancel
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-[22px] sm:text-[26px] tracking-tight text-[#f7f8f8]"
            style={{ fontWeight: 510, letterSpacing: '-0.02em' }}
          >
            New car request
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#8a8f98] mt-1.5 leading-relaxed">
            Describe what you’re looking for and let verified sellers come to you with offers.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon
              const isComplete = step > s.id
              const isActive = step === s.id
              const isPending = step < s.id
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        isComplete
                          ? 'border-[#5e6ad2] bg-[#5e6ad2] text-white'
                          : isActive
                          ? 'border-[#7170ff] bg-[#5e6ad2]/10 text-[#7170ff] shadow-[0_0_0_3px_rgba(94,106,210,0.15)]'
                          : 'border-white/[0.08] bg-transparent text-[#62666d]'
                      }`}
                    >
                      {isComplete ? <Check size={15} /> : <Icon size={15} />}
                    </div>
                    <span
                      className={`mt-2 text-[11px] sm:text-[12px] transition-colors duration-200 ${
                        isActive ? 'text-[#f7f8f8]' : isComplete ? 'text-[#7170ff]' : 'text-[#62666d]'
                      }`}
                      style={{ fontWeight: 510 }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-2 sm:mx-4 mb-5 h-px flex-1 transition-all duration-300 ${
                        isComplete ? 'bg-[#5e6ad2]' : 'bg-white/[0.06]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-5 sm:p-8 min-h-[420px] shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          <div className="transition-all duration-300 ease-out" key={step}>
            {step === 1 && <Step1Specs form={form} setForm={setForm} errors={errors} />}
            {step === 2 && <Step2Budget form={form} setForm={setForm} errors={errors} monthlyPayment={monthlyPayment} />}
            {step === 3 && <Step3Location form={form} setForm={setForm} errors={errors} />}
          </div>

          {submitError && (
            <div className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-[13px] text-[#ef4444]">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={back}
            disabled={step === 1 || submitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] px-4 py-2.5 text-[13px] text-[#d0d6e0] transition-all duration-200 disabled:opacity-40 disabled:hover:bg-white/[0.02] disabled:hover:border-white/[0.08]"
            style={{ fontWeight: 510 }}
          >
            <ChevronLeft size={15} />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={next}
              className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all duration-200 shadow-[0_0_0_0_rgba(94,106,210,0)] hover:shadow-[0_0_20px_rgba(94,106,210,0.25)]"
              style={{ fontWeight: 510 }}
            >
              Continue
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2.5 text-[13px] text-white transition-all duration-200 disabled:opacity-60 shadow-[0_0_0_0_rgba(94,106,210,0)] hover:shadow-[0_0_20px_rgba(94,106,210,0.25)]"
              style={{ fontWeight: 510 }}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Check size={15} />
                  Submit request
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

/* ---------- Step 1: Car Specs ---------- */
function Step1Specs({
  form,
  setForm,
  errors,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  errors: Partial<Record<keyof FormData, string>>
}) {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2.5 text-[#f7f8f8]">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5e6ad2]/10 text-[#7170ff]">
          <Car size={16} />
        </div>
        <h2 className="text-[17px] sm:text-[18px]" style={{ fontWeight: 510 }}>
          Vehicle details
        </h2>
      </div>

      {/* Make + Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Make *" error={errors.make}>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
            <input
              list="common-makes"
              placeholder="e.g. Toyota"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              className={`w-full rounded-[10px] border bg-white/[0.02] py-2.5 pl-10 pr-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all duration-200 focus:outline-none focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:ring-1 focus:ring-[#5e6ad2]/20 ${
                errors.make ? 'border-[#ef4444]/40' : 'border-white/[0.08]'
              }`}
            />
          </div>
          <datalist id="common-makes">
            {COMMON_MAKES.map((m) => <option key={m} value={m} />)}
          </datalist>
        </Field>

        <Field label="Model *" error={errors.model}>
          <input
            placeholder="e.g. Camry"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className={`w-full rounded-[10px] border bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all duration-200 focus:outline-none focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:ring-1 focus:ring-[#5e6ad2]/20 ${
              errors.model ? 'border-[#ef4444]/40' : 'border-white/[0.08]'
            }`}
          />
        </Field>
      </div>

      {/* Year range */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            <Calendar size={14} className="text-[#62666d]" />
            Year range
          </label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>
            {form.year_min} – {form.year_max}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-wide text-[#62666d]" style={{ fontWeight: 510 }}>
              Min year
            </label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_min}
              onChange={(e) => setForm({ ...form, year_min: Math.min(Number(e.target.value), form.year_max) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-wide text-[#62666d]" style={{ fontWeight: 510 }}>
              Max year
            </label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_max}
              onChange={(e) => setForm({ ...form, year_max: Math.max(Number(e.target.value), form.year_min) })}
              className="w-full"
            />
          </div>
        </div>
        {errors.year_min && <p className="mt-2 text-[12px] text-[#ef4444]">{errors.year_min}</p>}
      </div>

      {/* Chips */}
      <ChipSelector
        label="Body type"
        icon={<Settings2 size={14} className="text-[#62666d]" />}
        options={BODY_TYPES}
        value={form.body_type}
        onChange={(v) => setForm({ ...form, body_type: v })}
      />
      <ChipSelector
        label="Fuel type"
        icon={<Fuel size={14} className="text-[#62666d]" />}
        options={FUEL_TYPES}
        value={form.fuel_type}
        onChange={(v) => setForm({ ...form, fuel_type: v })}
      />
      <ChipSelector
        label="Transmission"
        icon={<Gauge size={14} className="text-[#62666d]" />}
        options={TRANSMISSIONS}
        value={form.transmission}
        onChange={(v) => setForm({ ...form, transmission: v })}
      />

      {/* Max mileage */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            Max mileage
          </label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>
            {form.mileage_max.toLocaleString()} mi
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={5000}
          value={form.mileage_max}
          onChange={(e) => setForm({ ...form, mileage_max: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-[11px] text-[#62666d]">
          <span>0 mi</span>
          <span>200k mi</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 2: Budget ---------- */
function Step2Budget({
  form,
  setForm,
  errors,
  monthlyPayment,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  errors: Partial<Record<keyof FormData, string>>
  monthlyPayment: number
}) {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2.5 text-[#f7f8f8]">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5e6ad2]/10 text-[#7170ff]">
          <DollarSign size={16} />
        </div>
        <h2 className="text-[17px] sm:text-[18px]" style={{ fontWeight: 510 }}>
          Budget & payment
        </h2>
      </div>

      {/* Max budget slider */}
      <div className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-end justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            Max budget
          </label>
          <span className="text-[24px] sm:text-[28px] leading-none text-[#f7f8f8] tabular-nums" style={{ fontWeight: 510 }}>
            {formatBudget(form.max_budget)}
          </span>
        </div>
        <input
          type="range"
          min={5000}
          max={150000}
          step={1000}
          value={form.max_budget}
          onChange={(e) => setForm({ ...form, max_budget: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-3 flex justify-between text-[11px] text-[#62666d]">
          <span>$5k</span>
          <span>$150k</span>
        </div>
        {errors.max_budget && <p className="mt-3 text-[12px] text-[#ef4444]">{errors.max_budget}</p>}
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-3 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
          Payment method
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              type="button"
              onClick={() => setForm({ ...form, payment_method: pm.value })}
              className={`rounded-[10px] border px-3 sm:px-4 py-2.5 text-[13px] transition-all duration-200 ${
                form.payment_method === pm.value
                  ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#7170ff]'
                  : 'border-white/[0.08] bg-white/[0.02] text-[#8a8f98] hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
              style={{ fontWeight: 510 }}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly payment estimate */}
      {form.payment_method !== 'cash' && monthlyPayment > 0 && (
        <div className="rounded-[12px] border border-[#5e6ad2]/15 bg-[#5e6ad2]/[0.04] p-4 transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] text-[#8a8f98]" style={{ fontWeight: 510 }}>
                Estimated monthly payment
              </p>
              <p className="text-[11px] text-[#62666d] mt-0.5">6% APR · 60 months · 0% down</p>
            </div>
            <p className="text-xl text-[#7170ff] tabular-nums shrink-0" style={{ fontWeight: 510 }}>
              {formatBudget(monthlyPayment)}
              <span className="text-[12px] text-[#62666d]">/mo</span>
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      <Field label="Additional notes" optional>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any specific preferences? Color, features, condition…"
          rows={3}
          className="w-full rounded-[10px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all duration-200 focus:outline-none focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:ring-1 focus:ring-[#5e6ad2]/20 resize-none"
        />
      </Field>
    </div>
  )
}

/* ---------- Step 3: Location ---------- */
function Step3Location({
  form,
  setForm,
  errors,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  errors: Partial<Record<keyof FormData, string>>
}) {
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2.5 text-[#f7f8f8]">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5e6ad2]/10 text-[#7170ff]">
          <MapPin size={16} />
        </div>
        <h2 className="text-[17px] sm:text-[18px]" style={{ fontWeight: 510 }}>
          Location & radius
        </h2>
      </div>

      <Field label="ZIP code *" error={errors.location_zip}>
        <div className="relative">
          <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62666d]" />
          <input
            type="text"
            maxLength={5}
            placeholder="e.g. 27407"
            value={form.location_zip}
            onChange={(e) => setForm({ ...form, location_zip: e.target.value.replace(/\D/g, '') })}
            className={`w-full max-w-[220px] rounded-[10px] border bg-white/[0.02] py-2.5 pl-10 pr-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] tabular-nums tracking-wide transition-all duration-200 focus:outline-none focus:border-[#5e6ad2]/50 focus:bg-white/[0.03] focus:ring-1 focus:ring-[#5e6ad2]/20 ${
              errors.location_zip ? 'border-[#ef4444]/40' : 'border-white/[0.08]'
            }`}
          />
        </div>
      </Field>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
            <Navigation size={14} className="text-[#62666d]" />
            Search radius
          </label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>
            {form.location_radius_miles} miles
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={form.location_radius_miles}
          onChange={(e) => setForm({ ...form, location_radius_miles: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-[11px] text-[#62666d]">
          <span>10 mi</span>
          <span>200 mi</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-2 rounded-[12px] border border-[#5e6ad2]/15 bg-[#5e6ad2]/[0.04] p-5">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-[#7170ff] mb-4" style={{ fontWeight: 510 }}>
          <FileText size={14} />
          Request summary
        </div>
        <div className="space-y-2.5 text-[14px]">
          <SummaryRow label="Vehicle" value={`${form.make || '—'} ${form.model || ''}`} />
          <SummaryRow label="Year range" value={`${form.year_min} – ${form.year_max}`} />
          <SummaryRow label="Max mileage" value={`${form.mileage_max.toLocaleString()} mi`} />
          <SummaryRow label="Body type" value={form.body_type} />
          <SummaryRow label="Fuel type" value={form.fuel_type} />
          <SummaryRow label="Transmission" value={form.transmission} />
          <SummaryRow label="Budget" value={formatBudget(form.max_budget)} />
          <SummaryRow label="Payment" value={form.payment_method} />
          <SummaryRow
            label="Location"
            value={`${form.location_zip || '—'} · ${form.location_radius_miles} mi radius`}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="text-[#8a8f98]">{label}</span>
      <span className="text-[#f7f8f8] capitalize text-right truncate max-w-[60%]" style={{ fontWeight: 510 }}>
        {value}
      </span>
    </div>
  )
}

function ChipSelector({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string
  icon?: React.ReactNode
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
        {icon}
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-all duration-200 ${
              value === opt
                ? 'border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#7170ff]'
                : 'border-white/[0.08] bg-white/[0.02] text-[#8a8f98] hover:border-white/[0.15] hover:bg-white/[0.03]'
            }`}
            style={{ fontWeight: 510 }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>
        {label}
        {optional && <span className="text-[#62666d] ml-1">(optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[12px] text-[#ef4444]">{error}</p>}
    </div>
  )
}
