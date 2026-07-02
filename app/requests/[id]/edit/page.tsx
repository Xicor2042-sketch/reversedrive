"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Check, Car, DollarSign, MapPin, Loader2, AlertCircle, Fuel, Settings as SettingsIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatBudget } from "@/lib/utils/cn"
import { updateRequest } from "../../_actions"

const COMMON_MAKES = [
  "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes-Benz",
  "Audi", "Tesla", "Hyundai", "Kia", "Mazda", "Subaru", "Volkswagen",
  "Lexus", "Acura", "Infiniti", "Cadillac", "GMC", "Ram", "Jeep", "Porsche",
  "Volvo", "Land Rover", "Mitsubishi",
]

const BODY_TYPES = ["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Van", "Any"]
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "Any"]
const TRANSMISSIONS = ["Automatic", "Manual", "Any"]
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "financing", label: "Financing" },
  { value: "either", label: "Either" },
] as const

const STEPS = [
  { id: 1, label: "Car Specs", icon: Car },
  { id: 2, label: "Budget", icon: DollarSign },
  { id: 3, label: "Location", icon: MapPin },
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
  payment_method: "cash" | "financing" | "either"
  location_zip: string
  location_radius_miles: number
  notes: string
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

function Wrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a] flex items-center justify-center"><Loader2 className="animate-spin text-[#5e6ad2]" size={28} /></div>}>
      <EditRequestPage />
    </Suspense>
  )
}

function EditRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("id")
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!requestId) {
        setAuthError(true)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAuthError(true)
        setLoading(false)
        return
      }
      const { data: req } = await supabase
        .from("car_requests")
        .select("*")
        .eq("id", requestId)
        .eq("buyer_id", user.id)
        .single()

      if (!req) {
        setAuthError(true)
        setLoading(false)
        return
      }

      setForm({
        make: req.make,
        model: req.model,
        year_min: req.year_min || 2015,
        year_max: req.year_max || 2026,
        body_type: req.body_type ? req.body_type.charAt(0).toUpperCase() + req.body_type.slice(1) : "Any",
        fuel_type: req.fuel_type ? req.fuel_type.charAt(0).toUpperCase() + req.fuel_type.slice(1) : "Any",
        transmission: req.transmission ? req.transmission.charAt(0).toUpperCase() + req.transmission.slice(1) : "Any",
        mileage_max: req.mileage_max || 80000,
        max_budget: Number(req.max_budget),
        payment_method: req.payment_method || "cash",
        location_zip: req.location_zip,
        location_radius_miles: req.location_radius_miles,
        notes: req.notes || "",
      })
      setLoading(false)
    }
    load()
  }, [requestId, supabase])

  const validateStep = (currentStep: number): boolean => {
    if (!form) return false
    const stepErrors: Partial<Record<keyof FormData, string>> = {}
    if (currentStep === 1) {
      if (!form.make.trim()) stepErrors.make = "Make is required"
      if (!form.model.trim()) stepErrors.model = "Model is required"
      if (form.year_min > form.year_max) stepErrors.year_min = "Min year must be ≤ max year"
    }
    if (currentStep === 2) {
      if (!form.max_budget || form.max_budget < 5000) stepErrors.max_budget = "Budget must be at least $5,000"
    }
    if (currentStep === 3) {
      if (!form.location_zip.trim()) stepErrors.location_zip = "ZIP code is required"
      if (form.location_zip.length !== 5 || !/^\d{5}$/.test(form.location_zip))
        stepErrors.location_zip = "Enter a valid 5-digit ZIP"
    }
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(3, s + 1))
  }

  const back = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = async () => {
    if (!form || !validateStep(3) || !requestId) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      await updateRequest(requestId, {
        make: form.make.trim(),
        model: form.model.trim(),
        year_min: form.year_min,
        year_max: form.year_max,
        body_type: form.body_type === "Any" ? undefined : form.body_type.toLowerCase(),
        fuel_type: form.fuel_type === "Any" ? undefined : form.fuel_type.toLowerCase(),
        transmission: form.transmission === "Any" ? undefined : form.transmission.toLowerCase(),
        mileage_max: form.mileage_max,
        max_budget: form.max_budget,
        payment_method: form.payment_method,
        location_zip: form.location_zip.trim(),
        location_radius_miles: form.location_radius_miles,
        notes: form.notes.trim(),
      })
      router.push(`/requests/${requestId}`)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update request")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5e6ad2]" size={28} />
      </div>
    )
  }

  if (authError || !form) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-[15px] text-[#d0d6e0] mb-4" style={{ fontWeight: 510 }}>Request not found or access denied.</p>
          <Link href="/dashboard" className="text-[13px] text-[#7170ff] hover:text-[#828fff]">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const monthlyPayment = form.payment_method !== "cash" ? calcMonthlyPayment(form.max_budget, 0.06, 60) : 0

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8]" style={{ fontFeatureSettings: '"cv01", "ss03"' }}>
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#0f1011]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-[15px] tracking-tight" style={{ fontWeight: 510 }}>
            Reverse<span className="text-[#7170ff]">Drive</span>
          </Link>
          <Link href={`/requests/${requestId}`} className="text-[13px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors" style={{ fontWeight: 510 }}>
            Cancel
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl tracking-tight mb-2" style={{ fontWeight: 510, letterSpacing: "-0.02em" }}>Edit Request</h1>
          <p className="text-sm text-[#8a8f98]">Update what you&apos;re looking for.</p>
        </div>

        <div className="mb-10 flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const isComplete = step > s.id
            const isActive = step === s.id
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                      isComplete ? "border-[#5e6ad2] bg-[#5e6ad2] text-white" :
                      isActive ? "border-[#7170ff] bg-[#5e6ad2]/10 text-[#7170ff]" :
                      "border-white/[0.08] bg-transparent text-[#62666d]"
                    }`}
                  >
                    {isComplete ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`mt-2 text-[11px] ${isActive ? "text-[#f7f8f8]" : isComplete ? "text-[#7170ff]" : "text-[#62666d]"}`} style={{ fontWeight: 510 }}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-3 mb-6 h-px flex-1 transition-all ${isComplete ? "bg-[#5e6ad2]" : "bg-white/[0.06]"}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="glass-card rounded-[12px] p-8 min-h-[420px]">
          {step === 1 && form && <Step1Specs form={form} setForm={setForm as any} errors={errors} />}
          {step === 2 && form && <Step2Budget form={form} setForm={setForm as any} errors={errors} monthlyPayment={monthlyPayment} />}
          {step === 3 && form && <Step3Location form={form} setForm={setForm as any} errors={errors} />}

          {submitError && (
            <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3 text-[13px] text-[#ef4444]">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1 || submitting}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] px-4 py-2 text-[13px] text-[#d0d6e0] transition-all disabled:opacity-40"
            style={{ fontWeight: 510 }}
          >
            <ChevronLeft size={15} /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2 text-[13px] text-white transition-all"
              style={{ fontWeight: 510 }}
            >
              Continue
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#5e6ad2] hover:bg-[#7170ff] px-5 py-2 text-[13px] text-white transition-all disabled:opacity-60"
              style={{ fontWeight: 510 }}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : (
                <><Check size={15} /> Save Changes</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1Specs({ form, setForm, errors }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-[17px]" style={{ fontWeight: 510 }}>Car Specifications</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Make *</label>
          <input
            list="common-makes"
            placeholder="e.g. Toyota"
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            className={`w-full rounded-[6px] border bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:outline-none focus:border-[#5e6ad2]/50 focus:ring-1 focus:ring-[#5e6ad2]/20 ${errors.make ? "border-[#ef4444]/40" : "border-white/[0.08]"}`}
          />
          <datalist id="common-makes">
            {COMMON_MAKES.map((m) => <option key={m} value={m} />)}
          </datalist>
          {errors.make && <p className="mt-1.5 text-[11px] text-[#ef4444]">{errors.make}</p>}
        </div>
        <div>
          <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Model *</label>
          <input
            placeholder="e.g. Camry"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className={`w-full rounded-[6px] border bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:outline-none focus:border-[#5e6ad2]/50 focus:ring-1 focus:ring-[#5e6ad2]/20 ${errors.model ? "border-[#ef4444]/40" : "border-white/[0.08]"}`}
          />
          {errors.model && <p className="mt-1.5 text-[11px] text-[#ef4444]">{errors.model}</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Year Range</label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>{form.year_min} – {form.year_max}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-[11px] text-[#62666d]">Min Year</label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_min}
              onChange={(e) => setForm({ ...form, year_min: Math.min(Number(e.target.value), form.year_max) })}
              className="w-full accent-[#5e6ad2]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#62666d]">Max Year</label>
            <input
              type="range"
              min={1990}
              max={2026}
              value={form.year_max}
              onChange={(e) => setForm({ ...form, year_max: Math.max(Number(e.target.value), form.year_min) })}
              className="w-full accent-[#5e6ad2]"
            />
          </div>
        </div>
        {errors.year_min && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.year_min}</p>}
      </div>

      <ChipSelector label="Body Type" options={BODY_TYPES} value={form.body_type} onChange={(v) => setForm({ ...form, body_type: v })} />
      <ChipSelector label="Fuel Type" options={FUEL_TYPES} value={form.fuel_type} onChange={(v) => setForm({ ...form, fuel_type: v })} />
      <ChipSelector label="Transmission" options={TRANSMISSIONS} value={form.transmission} onChange={(v) => setForm({ ...form, transmission: v })} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Max Mileage</label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>{form.mileage_max.toLocaleString()} mi</span>
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={5000}
          value={form.mileage_max}
          onChange={(e) => setForm({ ...form, mileage_max: Number(e.target.value) })}
          className="w-full accent-[#5e6ad2]"
        />
      </div>
    </div>
  )
}

function Step2Budget({ form, setForm, errors, monthlyPayment }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>; errors: Partial<Record<keyof FormData, string>>; monthlyPayment: number }) {
  return (
    <div className="space-y-6">
      <h2 className="text-[17px]" style={{ fontWeight: 510 }}>Budget &amp; Payment</h2>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Max Budget</label>
          <span className="text-2xl text-[#10b981] tabular-nums" style={{ fontWeight: 510 }}>{formatBudget(form.max_budget)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={150000}
          step={1000}
          value={form.max_budget}
          onChange={(e) => setForm({ ...form, max_budget: Number(e.target.value) })}
          className="w-full accent-[#5e6ad2]"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-[#62666d]">
          <span>$5k</span><span>$150k</span>
        </div>
        {errors.max_budget && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.max_budget}</p>}
      </div>

      <div>
        <label className="mb-2.5 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.value}
              type="button"
              onClick={() => setForm({ ...form, payment_method: pm.value })}
              className={`rounded-[8px] border px-4 py-2.5 text-[13px] transition-all ${
                form.payment_method === pm.value
                  ? "border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#7170ff]"
                  : "border-white/[0.08] bg-white/[0.02] text-[#8a8f98] hover:border-white/[0.15]"
              }`}
              style={{ fontWeight: 510 }}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      {form.payment_method !== "cash" && monthlyPayment > 0 && (
        <div className="rounded-[10px] border border-[#5e6ad2]/15 bg-[#5e6ad2]/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#8a8f98]">Estimated Monthly Payment</p>
              <p className="text-[11px] text-[#62666d] mt-0.5">6% APR · 60 months · 0% down</p>
            </div>
            <p className="text-xl text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>
              {formatBudget(monthlyPayment)}
              <span className="text-[12px] text-[#62666d]"> /mo</span>
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Additional Notes <span className="text-[#62666d]">(optional)</span></label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any specific preferences? Color, features, conditions..."
          rows={3}
          className="w-full rounded-[6px] border border-white/[0.08] bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] transition-all focus:outline-none focus:border-[#5e6ad2]/50 focus:ring-1 focus:ring-[#5e6ad2]/20 resize-none"
        />
      </div>
    </div>
  )
}

function Step3Location({ form, setForm, errors }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>>; errors: Partial<Record<keyof FormData, string>> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-[17px]" style={{ fontWeight: 510 }}>Location &amp; Radius</h2>
      <div>
        <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>ZIP Code *</label>
        <input
          type="text"
          maxLength={5}
          placeholder="e.g. 27407"
          value={form.location_zip}
          onChange={(e) => setForm({ ...form, location_zip: e.target.value.replace(/\D/g, "") })}
          className={`w-full max-w-[200px] rounded-[6px] border bg-white/[0.02] py-2.5 px-3.5 text-[14px] text-[#f7f8f8] placeholder-[#62666d] tabular-nums transition-all focus:outline-none focus:border-[#5e6ad2]/50 focus:ring-1 focus:ring-[#5e6ad2]/20 ${errors.location_zip ? "border-[#ef4444]/40" : "border-white/[0.08]"}`}
        />
        {errors.location_zip && <p className="mt-1.5 text-[11px] text-[#ef4444]">{errors.location_zip}</p>}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>Search Radius</label>
          <span className="text-[13px] text-[#7170ff] tabular-nums" style={{ fontWeight: 510 }}>{form.location_radius_miles} miles</span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={form.location_radius_miles}
          onChange={(e) => setForm({ ...form, location_radius_miles: Number(e.target.value) })}
          className="w-full accent-[#5e6ad2]"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-[#62666d]">
          <span>10 mi</span><span>200 mi</span>
        </div>
      </div>

      <div className="mt-8 rounded-[10px] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="text-[12px] text-[#62666d] mb-3" style={{ fontWeight: 510 }}>REQUEST SUMMARY</div>
        <div className="space-y-2 text-[14px]">
          <SummaryRow label="Vehicle" value={`${form.make} ${form.model}`} />
          <SummaryRow label="Year Range" value={`${form.year_min} – ${form.year_max}`} />
          <SummaryRow label="Max Mileage" value={`${form.mileage_max.toLocaleString()} mi`} />
          <SummaryRow label="Body Type" value={form.body_type} />
          <SummaryRow label="Budget" value={formatBudget(form.max_budget)} />
          <SummaryRow label="Payment" value={form.payment_method} />
          <SummaryRow label="Location" value={`${form.location_zip || "—"} · ${form.location_radius_miles}mi radius`} />
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#8a8f98]">{label}</span>
      <span className="text-[#f7f8f8] capitalize" style={{ fontWeight: 510 }}>{value}</span>
    </div>
  )
}

function ChipSelector({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] text-[#d0d6e0]" style={{ fontWeight: 510 }}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition-all ${
              value === opt
                ? "border-[#5e6ad2]/50 bg-[#5e6ad2]/10 text-[#7170ff]"
                : "border-white/[0.08] bg-white/[0.02] text-[#8a8f98] hover:border-white/[0.15]"
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

export default Wrapper
