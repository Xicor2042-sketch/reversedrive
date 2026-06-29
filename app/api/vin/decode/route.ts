import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// VIN decode using free NHTSA API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vin = searchParams.get('vin')

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'Valid 17-character VIN required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
    )
    const data = await response.json()

    // Extract relevant fields
    const results = data.Results || []
    const get = (variable: string) =>
      results.find((r: any) => r.Variable === variable)?.Value

    const vehicle = {
      make: get('Make') || '',
      model: get('Model') || '',
      year: get('Model Year') || '',
      bodyType: get('Body Class') || '',
      fuelType: get('Fuel Type - Primary') || '',
      transmission: get('Transmission Style') || '',
      engine: get('Engine Model') || '',
      displacement: get('Displacement (L)') || '',
      plantCountry: get('Plant Country') || '',
      errorCode: data.ErrorCode || '',
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('VIN decode error:', error)
    return NextResponse.json({ error: 'Failed to decode VIN' }, { status: 500 })
  }
}