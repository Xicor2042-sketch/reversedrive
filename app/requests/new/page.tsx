'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Car, DollarSign, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { cn, formatCurrency } from '@/lib/utils/cn'

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
  { id: 1, label: 'Car Specs', icon: Car },
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
  make: '',
  model: '',
  year_min: 2015,
  year_max: 2026,
  body_type: 'Any',
  fuel_type: 'Any',
  transmission: 'Any',
  mileage_max: 80000,
  max_budget: 30000,
  payment_method: 'cash',
  location_zip: '',
  location_radius_miles: 50,
  notes: '',
}

export default function RequestWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    setDirection(1)
    setStep((s) => Math.min(3, s + 1))
  }

  const back = () => {
    setDirection(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)
    setSubmitError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError('You must be signed in.')
      setSubmitting(false)
      return
    }

    const payload = {
      buyer_id: user.id,
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

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Car Request</h1>
        <p className="mt-1 text-sm text-gray-400">
          Tell us what you&apos;re looking for. We&apos;ll match you with sellers who have it.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isComplete = step > s.id
          const isActive = step === s.id
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isComplete && 'border-[#3B82F6] bg-[#3B82F6] text-white',
                    isActive && 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#06B6D4]',
                    !isActive && !isComplete && 'border-white/10 bg-transparent text-gray-600'
                  )}
                >
                  {isComplete ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isActive ? 'text-white' : isComplete ? 'text-[#3B82F6]' : 'text-gray-600'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 mb-6 h-0.5 flex-1 rounded-full transition-all',
                    isComplete ? 'bg-[#3B82F6]' : 'bg-white/10'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Form card */}
      <Card className="min-h-[420px] border-white/10 bg-[#111827]/60 p-6 backdrop-blur-sm">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {step === 1 && (
              <Step1Specs form={form} setForm={setForm} errors={errors} />
            )}
            {step === 2 && (
              <Step2Budget
                form={form}
                setForm={setForm}
                errors={errors}
                monthlyPayment={monthlyPayment}
              />
            )}
            {step === 3 && (
              <Step3Location form={form} setForm={setForm} errors={errors} />
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {submitError}
          </div>
        )}
      </Card>

      {/* Nav buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 1 || submitting}>
          <ChevronLeft size={16} className="mr-1.5" />
          Back
        </Button>

        {step < 3 ? (
          <Button variant="primary" onClick={next}>
            Continue
            <ChevronRight size={16} className="ml-1.5" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Submit Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
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
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Car Specifications</h2>

      {/* Make + Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Make *</label>
          <Input
            list="common-makes"
            placeholder="e.g. Toyota"
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            className={errors.make ? 'border-red-500/50' : ''}
          />
          <datalist id="common-makes">
            {COMMON_MAKES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          {errors.make && <p className="mt-1 text-xs text-red-400">{errors.make}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Model *</label>
          <Input
            placeholder="e.g. Camry"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className={errors.model ? 'border-red-500/50' : ''}
          />
          {errors.model && <p className="mt-1 text-xs text-red-400">{errors.model}</p>}
        </div>
      </div>

      {/* Year range */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Year Range</label>
          <span className="text-sm text-[#06B6D4]">
            {form.year_min} – {form.year_max}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Min Year</label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_min}
              onChange={(e) =>
                setForm({
                  ...form,
                  year_min: Math.min(Number(e.target.value), form.year_max),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Max Year</label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_max}
              onChange={(e) =>
                setForm({
                  ...form,
                  year_max: Math.max(Number(e.target.value), form.year_min),
                })
              }
              className="w-full"
            />
          </div>
        </div>
        {errors.year_min && <p className="mt-1 text-xs text-red-400">{errors.year_min}</p>}
      </div>

      {/* Body type chips */}
      <ChipSelector
        label="Body Type"
        options={BODY_TYPES}
        value={form.body_type}
        onChange={(v) => setForm({ ...form, body_type: v })}
      />

      {/* Fuel type chips */}
      <ChipSelector
        label="Fuel Type"
        options={FUEL_TYPES}
        value={form.fuel_type}
        onChange={(v) => setForm({ ...form, fuel_type: v })}
      />

      {/* Transmission chips */}
      <ChipSelector
        label="Transmission"
        options={TRANSMISSIONS}
        value={form.transmission}
        onChange={(v) => setForm({ ...form, transmission: v })}
      />

      {/* Max mileage */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Max Mileage</label>
          <span className="text-sm text-[#06B6D4]">
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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Budget & Payment</h2>

      {/* Max budget slider */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Max Budget</label>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
            {formatCurrency(form.max_budget)}
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
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>$5k</span>
          <span>$150k</span>
        </div>
        {errors.max_budget && <p className="mt-1 text-xs text-red-400">{errors.max_budget}</p>}
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              type="button"
              onClick={() => setForm({ ...form, payment_method: pm.value })}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                form.payment_method === pm.value
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              )}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly payment estimate */}
      {form.payment_method !== 'cash' && monthlyPayment > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Estimated Monthly Payment</p>
                <p className="text-sm text-gray-500">6% APR · 60 months · 0% down</p>
              </div>
              <p className="text-2xl font-bold text-[#06B6D4]">
                {formatCurrency(monthlyPayment)}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Location</h2>

      {/* ZIP code */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">ZIP Code *</label>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="e.g. 90210"
          value={form.location_zip}
          onChange={(e) =>
            setForm({ ...form, location_zip: e.target.value.replace(/\D/g, '').slice(0, 5) })
          }
          className={cn('max-w-[200px]', errors.location_zip && 'border-red-500/50')}
        />
        {errors.location_zip && (
          <p className="mt-1 text-xs text-red-400">{errors.location_zip}</p>
        )}
      </div>

      {/* Radius slider */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Search Radius</label>
          <span className="text-sm text-[#06B6D4]">{form.location_radius_miles} miles</span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={form.location_radius_miles}
          onChange={(e) =>
            setForm({ ...form, location_radius_miles: Number(e.target.value) })
          }
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>10 mi</span>
          <span>200 mi</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          Additional Notes <span className="text-gray-600">(optional)</span>
        </label>
        <textarea
          rows={4}
          placeholder="Any specifics? Color preferences, must-have features, deal-breakers..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
        />
      </div>
    </div>
  )
}

/* ---------- Chip selector ---------- */
function ChipSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
              value === opt
                ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Utils ---------- */
function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}