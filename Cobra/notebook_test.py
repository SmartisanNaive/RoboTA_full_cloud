#!/usr/bin/env python3
"""
Simple test to verify Jupyter notebook functionality
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'venv/lib/python3.13/site-packages'))

import cobra
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from cobra.flux_analysis import flux_variability_analysis as FVA

def test_imports():
    """Test that all required packages can be imported"""
    print("=== Testing Package Imports ===")

    try:
        print(f"✓ COBRApy: {cobra.__version__}")
        print(f"✓ NumPy: {np.__version__}")
        print(f"✓ Pandas: {pd.__version__}")
        print(f"✓ Matplotlib: {plt.__version__}")
        return True
    except Exception as e:
        print(f"✗ Import error: {e}")
        return False

def test_basic_model():
    """Test basic model creation"""
    print("\n=== Testing Basic Model Creation ===")

    try:
        # Create a simple model
        model = cobra.Model("test")

        # Add metabolites
        glc = cobra.Metabolite("glc__D_c", compartment="c")
        succ = cobra.Metabolite("succ_c", compartment="c")

        # Add reactions
        EX_glc = cobra.Reaction("EX_glc__D_e")
        EX_glc.add_metabolites({glc: -1})
        EX_glc.lower_bound = -10

        PROD_succ = cobra.Reaction("PROD_succ")
        PROD_succ.add_metabolites({glc: -1, succ: 1})

        EX_succ = cobra.Reaction("EX_succ_e")
        EX_succ.add_metabolites({succ: 1})
        EX_succ.lower_bound = 0

        model.add_reactions([EX_glc, PROD_succ, EX_succ])
        model.objective = "EX_succ_e"

        # Test FBA
        solution = model.optimize()
        print(f"✓ Model created and optimized")
        print(f"  - Objective value: {solution.objective_value:.4f}")
        print(f"  - Glucose uptake: {solution.fluxes['EX_glc__D_e']:.4f}")
        print(f"  - Succinate production: {solution.fluxes['EX_succ_e']:.4f}")

        return True
    except Exception as e:
        print(f"✗ Model creation error: {e}")
        return False

def test_visualization():
    """Test plotting functionality"""
    print("\n=== Testing Visualization ===")

    try:
        # Create a simple plot
        plt.figure(figsize=(6, 4))
        x = np.linspace(0, 2*np.pi, 100)
        y = np.sin(x)
        plt.plot(x, y, 'b-', label='sin(x)')
        plt.xlabel('x')
        plt.ylabel('sin(x)')
        plt.title('Test Plot')
        plt.legend()
        plt.grid(True, alpha=0.3)

        # Save plot
        plt.savefig('/Users/baice/Downloads/RoboTA/Cobra/notebook_test_plot.png', dpi=150, bbox_inches='tight')
        plt.close()

        print("✓ Plot created and saved")
        return True
    except Exception as e:
        print(f"✗ Plotting error: {e}")
        return False

def main():
    """Run all tests"""
    print("Jupyter Notebook Functionality Test")
    print("=" * 40)

    success = True

    # Test imports
    if not test_imports():
        success = False

    # Test basic model
    if not test_basic_model():
        success = False

    # Test visualization
    if not test_visualization():
        success = False

    print("\n" + "=" * 40)
    if success:
        print("✓ All tests passed!")
        print("\nTo run the notebook:")
        print("1. Activate virtual environment: source venv/bin/activate")
        print("2. Start Jupyter: jupyter notebook")
        print("3. Open tutorial_optKnock.ipynb")
    else:
        print("✗ Some tests failed")

    return success

if __name__ == "__main__":
    main()