import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    // Create a temporary Python file
    const tempFile = join(process.cwd(), 'temp', `script_${Date.now()}.py`)
    await writeFile(tempFile, code)
    
    // Execute the Python code
    const { stdout, stderr } = await execAsync(`python ${tempFile}`)
    
    // Return the output
    return NextResponse.json({
      output: stderr ? `Error: ${stderr}` : stdout,
    })
  } catch (error) {
    console.error('Error executing Python code:', error)
    return NextResponse.json(
      { error: 'Failed to execute Python code' },
      { status: 500 }
    )
  }
}

const MAX_CODE_LENGTH = 1000
const ALLOWED_MODULES = ["math", "random", "statistics"]

function validatePythonCode(code: string): boolean {
  if (code.length > MAX_CODE_LENGTH) return false

  const importRegex = /^import\s+(\w+)/gm
  const fromImportRegex = /^from\s+(\w+)\s+import/gm

  let match
  while ((match = importRegex.exec(code)) !== null) {
    if (!ALLOWED_MODULES.includes(match[1])) return false
  }
  while ((match = fromImportRegex.exec(code)) !== null) {
    if (!ALLOWED_MODULES.includes(match[1])) return false
  }

  return true
}

