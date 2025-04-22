from opentrons import simulate
from opentrons import protocol_api
import io

def simulate_protocol(protocol_code: str):
  """Simulates an Opentrons protocol and returns the run log.

  Args:
      protocol_code: The Opentrons protocol code as a string.

  Returns:
      A list of dictionaries representing the run log.
  """
  try:
    # Create a file-like object from the protocol code
    protocol_file = io.StringIO(protocol_code)

    # Simulate the protocol
    run_log, bundle = simulate.simulate(protocol_file)

    # Format the run log for human readability (optional)
    formatted_runlog = simulate.format_runlog(run_log)
    print(formatted_runlog)

    return run_log

  except Exception as e:
    print(f"Error during simulation: {e}")
    return None

# Example usage:
protocol_code = """
metadata = {'apiLevel': '2.13'}

def run(protocol):
    tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '1')
    plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '2')
    pipette = protocol.load_instrument('p300_single', 'left', tip_racks=[tiprack])

    pipette.pick_up_tip()
    pipette.aspirate(100, plate['A1'])
    pipette.dispense(100, plate['B1'])
    pipette.drop_tip()
"""

run_log = simulate_protocol(protocol_code)

if run_log:
  print("Simulation successful!")
  # Process the run log to display the simulation results
else:
  print("Simulation failed.")