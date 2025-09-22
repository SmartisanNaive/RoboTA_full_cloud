import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    // Instead of using child_process, we'll simulate the output
    const simulatedOutput = simulateOpentrons(code)
    return NextResponse.json({ success: true, log: simulatedOutput })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Simple simulation function that doesn't use Node.js modules
function simulateOpentrons(code: string): string {
  // Extract key parts from the code to create a realistic simulation output
  const lines = code.split("\n")
  let output = "Simulated Opentrons execution:\n\n"

  // Look for key patterns in the code
  const labwareMatches = code.match(/load_labware$$['"](.*?)['"],\s*['"](.*?)['"]$$/g) || []
  const instrumentMatches = code.match(/load_instrument\(['"](.*?)['"],\s*['"](.*?)['"]/g) || []

  // Add labware loading messages
  output += "Loading labware...\n"
  labwareMatches.forEach((match) => {
    const parts = match.match(/load_labware$$['"](.*?)['"],\s*['"](.*?)['"]$$/)
    if (parts && parts.length >= 3) {
      output += `Loaded ${parts[1]} in slot ${parts[2]}\n`
    }
  })

  // Add instrument loading messages
  output += "Loading instruments...\n"
  instrumentMatches.forEach((match) => {
    const parts = match.match(/load_instrument\(['"](.*?)['"],\s*['"](.*?)['"]/)
    if (parts && parts.length >= 3) {
      output += `Loaded ${parts[1]} on ${parts[2]} mount\n`
    }
  })

  // Look for common operations
  if (code.includes("pick_up_tip")) {
    output += "Picking up tip\n"
  }

  if (code.includes("aspirate")) {
    output += "Aspirating liquid\n"
  }

  if (code.includes("dispense")) {
    output += "Dispensing liquid\n"
  }

  if (code.includes("drop_tip")) {
    output += "Dropping tip\n"
  }

  output += "Protocol complete!"
  return output
}

