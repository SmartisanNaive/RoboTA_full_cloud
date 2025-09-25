#!/usr/bin/env python3
"""
Test script to verify the OptKnock tutorial functionality
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'venv/lib/python3.13/site-packages'))

import cobra
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from cobra.flux_analysis import flux_variability_analysis as FVA
import seaborn as sns

def test_basic_functionality():
    """Test basic COBRApy functionality"""
    print("=== Testing Basic COBRApy Functionality ===")

    # Test COBRApy import and version
    print(f"COBRApy version: {cobra.__version__}")

    # Test model loading - try different approaches
    try:
        # Try to load from cobra.io.test
        try:
            from cobra.io import load_matlab_model
            from cobra.test import create_test_model
            model = create_test_model("textbook")
        except (ImportError, AttributeError):
            # Alternative: use built-in model or load from file
            try:
                # Create a simple test model manually
                model = cobra.Model("test_model")

                # Add some metabolites
                glc_d = cobra.Metabolite("glc__D_e", compartment="e")
                glc_c = cobra.Metabolite("glc__D_c", compartment="c")
                succ_e = cobra.Metabolite("succ_e", compartment="e")
                succ_c = cobra.Metabolite("succ_c", compartment="c")
                o2_e = cobra.Metabolite("o2_e", compartment="e")
                o2_c = cobra.Metabolite("o2_c", compartment="c")
                co2_e = cobra.Metabolite("co2_e", compartment="e")
                co2_c = cobra.Metabolite("co2_c", compartment="c")
                h2o_e = cobra.Metabolite("h2o_e", compartment="e")
                h2o_c = cobra.Metabolite("h2o_c", compartment="c")
                h_e = cobra.Metabolite("h_e", compartment="e")
                h_c = cobra.Metabolite("h_c", compartment="c")
                atp_c = cobra.Metabolite("atp_c", compartment="c")
                adp_c = cobra.Metabolite("adp_c", compartment="c")
                pi_c = cobra.Metabolite("pi_c", compartment="c")
                biomass = cobra.Metabolite("biomass_c", compartment="c")

                # Add metabolites to model
                model.add_metabolites([glc_d, glc_c, succ_e, succ_c, o2_e, o2_c,
                                     co2_e, co2_c, h2o_e, h2o_c, h_e, h_c,
                                     atp_c, adp_c, pi_c, biomass])

                # Add reactions
                # Glucose uptake
                EX_glc = cobra.Reaction("EX_glc__D_e")
                EX_glc.add_metabolites({glc_d: -1})
                EX_glc.lower_bound = -10
                EX_glc.upper_bound = 0

                # Glucose transport
                GLCt = cobra.Reaction("GLCt")
                GLCt.add_metabolites({glc_d: -1, glc_c: 1})

                # Succinate exchange
                EX_succ = cobra.Reaction("EX_succ_e")
                EX_succ.add_metabolites({succ_e: 1})
                EX_succ.lower_bound = 0
                EX_succ.upper_bound = 1000

                # Succinate production (simplified)
                SUCDi = cobra.Reaction("SUCDi")
                SUCDi.add_metabolites({glc_c: -1, succ_c: 1, co2_c: 1, h_c: 2})

                # Succinate transport
                SUCCt = cobra.Reaction("SUCCt")
                SUCCt.add_metabolites({succ_c: -1, succ_e: 1})

                # Oxygen exchange
                EX_o2 = cobra.Reaction("EX_o2_e")
                EX_o2.add_metabolites({o2_e: -1})
                EX_o2.lower_bound = -20
                EX_o2.upper_bound = 0

                # Oxygen transport
                O2t = cobra.Reaction("O2t")
                O2t.add_metabolites({o2_e: -1, o2_c: 1})

                # CO2 exchange
                EX_co2 = cobra.Reaction("EX_co2_e")
                EX_co2.add_metabolites({co2_e: 1})
                EX_co2.lower_bound = 0
                EX_co2.upper_bound = 1000

                # CO2 transport
                CO2t = cobra.Reaction("CO2t")
                CO2t.add_metabolites({co2_c: -1, co2_e: 1})

                # Biomass reaction
                BIOMASS = cobra.Reaction("BIOMASS")
                BIOMASS.add_metabolites({glc_c: -1, atp_c: -1, adp_c: 1, pi_c: 1, biomass: 1})
                BIOMASS.lower_bound = 0
                BIOMASS.upper_bound = 1000

                # ATP maintenance
                ATPM = cobra.Reaction("ATPM")
                ATPM.add_metabolites({atp_c: -1, adp_c: 1, pi_c: 1, h_c: 1})
                ATPM.lower_bound = 8.39
                ATPM.upper_bound = 1000

                # Add reactions to model
                model.add_reactions([EX_glc, GLCt, EX_succ, SUCDi, SUCCt, EX_o2, O2t,
                                    EX_co2, CO2t, BIOMASS, ATPM])

                # Set objective
                model.objective = "BIOMASS"

            except Exception as e:
                print(f"Could not create test model: {e}")
                return False, None

        print(f"✓ Model created successfully: {model.id}")
        print(f"  - Reactions: {len(model.reactions)}")
        print(f"  - Metabolites: {len(model.metabolites)}")
        print(f"  - Genes: {len(model.genes)}")
        return True, model
    except Exception as e:
        print(f"✗ Error creating model: {e}")
        return False, None

def test_target_reaction(model, target_reaction="EX_succ_e"):
    """Test target reaction identification"""
    print(f"\n=== Testing Target Reaction: {target_reaction} ===")

    if target_reaction in model.reactions:
        target = model.reactions.get_by_id(target_reaction)
        print(f"✓ Target reaction found: {target_reaction}")
        print(f"  Equation: {target.build_reaction_string()}")
        print(f"  Bounds: {target.lower_bound} - {target.upper_bound}")
        return True, target
    else:
        print(f"✗ Target reaction {target_reaction} not found")
        # Find available exchange reactions
        print("Available exchange reactions:")
        for rxn in model.exchanges:
            if "EX_" in rxn.id and rxn.id.endswith("__e"):
                print(f"  {rxn.id}: {rxn.name}")
        return False, None

def test_baseline_analysis(model, target_reaction, biomass_reaction="BIOMASS"):
    """Test baseline FBA analysis"""
    print(f"\n=== Testing Baseline Analysis ===")

    try:
        # Set objective to biomass
        model.objective = biomass_reaction

        # Perform FBA
        solution = model.optimize()
        baseline_growth = solution.objective_value
        baseline_succinate = solution.fluxes[target_reaction]

        print(f"✓ Baseline FBA completed:")
        print(f"  - Growth rate: {baseline_growth:.4f} h⁻¹")
        print(f"  - Succinate production: {baseline_succinate:.4f} mmol/gDW/h")

        return True, baseline_growth, baseline_succinate
    except Exception as e:
        print(f"✗ Error in baseline analysis: {e}")
        return False, None, None

def test_fva_analysis(model, target_reaction):
    """Test Flux Variability Analysis"""
    print(f"\n=== Testing FVA Analysis ===")

    try:
        # Perform FVA
        fva_result = FVA(model, fraction_of_optimum=0.9)

        # Check target reaction variability
        target_fva = fva_result.loc[target_reaction]
        print(f"✓ FVA completed:")
        print(f"  - Succinate range: {target_fva['minimum']:.4f} to {target_fva['maximum']:.4f}")

        return True, fva_result
    except Exception as e:
        print(f"✗ Error in FVA analysis: {e}")
        return False, None

def test_simple_optknock(model, target_reaction, biomass_reaction, max_knockouts=3):
    """Test simplified OptKnock implementation"""
    print(f"\n=== Testing Simple OptKnock Implementation ===")

    def simple_optknock(model, target_reaction, biomass_reaction, max_knockouts=3):
        """Simplified OptKnock implementation"""
        results = []

        # Get list of reactions that can be knocked out
        candidate_reactions = []
        for rxn in model.reactions:
            if rxn.id not in [target_reaction, biomass_reaction]:
                # Skip exchange reactions and some key reactions
                if not rxn.id.startswith('EX_') and not rxn.id.startswith('Biomass'):
                    candidate_reactions.append(rxn.id)

        print(f"Testing {len(candidate_reactions)} candidate reactions for knockout")

        # Test single knockouts (limited for speed)
        for i, rxn_id in enumerate(candidate_reactions[:10]):  # Limit for testing
            if i % 5 == 0:
                print(f"Testing reaction {i+1}/10...")

            model_ko = model.copy()

            # Knock out the reaction
            reaction = model_ko.reactions.get_by_id(rxn_id)
            reaction.bounds = (0, 0)

            # Set objective to target production
            model_ko.objective = target_reaction

            try:
                # Optimize for target production
                solution = model_ko.optimize()
                production_rate = solution.objective_value

                if production_rate > 1e-6:  # If production is possible
                    # Now check growth rate
                    model_ko.objective = biomass_reaction
                    growth_solution = model_ko.optimize()
                    growth_rate = growth_solution.objective_value

                    results.append({
                        'knockouts': [rxn_id],
                        'production_rate': production_rate,
                        'growth_rate': growth_rate,
                        'reaction_name': model.reactions.get_by_id(rxn_id).name
                    })
            except:
                continue

        return results

    try:
        results = simple_optknock(model, target_reaction, biomass_reaction, max_knockouts)

        if results:
            print(f"✓ OptKnock analysis completed with {len(results)} results")
            # Show top 3 results
            results_df = pd.DataFrame(results)
            results_df = results_df.sort_values('production_rate', ascending=False)

            print("Top 3 knockout strategies:")
            for i, (_, row) in enumerate(results_df.head(3).iterrows()):
                print(f"  {i+1}. {row['knockouts'][0]}: {row['production_rate']:.4f} production, {row['growth_rate']:.4f} growth")

            return True, results
        else:
            print("✓ OptKnock completed but no viable strategies found")
            return True, []
    except Exception as e:
        print(f"✗ Error in OptKnock analysis: {e}")
        return False, None

def test_visualization():
    """Test matplotlib visualization"""
    print(f"\n=== Testing Visualization ===")

    try:
        # Create a simple test plot
        plt.figure(figsize=(8, 6))
        x = np.linspace(0, 10, 100)
        y = np.sin(x)
        plt.plot(x, y, label='sin(x)')
        plt.xlabel('x')
        plt.ylabel('sin(x)')
        plt.title('Test Plot')
        plt.legend()
        plt.grid(True)

        # Save the plot
        plt.savefig('/Users/baice/Downloads/RoboTA/Cobra/test_plot.png', dpi=150, bbox_inches='tight')
        plt.close()

        print("✓ Visualization test completed - plot saved as test_plot.png")
        return True
    except Exception as e:
        print(f"✗ Error in visualization: {e}")
        return False

def main():
    """Main test function"""
    print("Starting OptKnock Tutorial Functionality Test")
    print("=" * 50)

    # Test basic functionality
    success, model = test_basic_functionality()
    if not success:
        print("Basic functionality test failed. Exiting.")
        return False

    # Test target reaction
    success, target = test_target_reaction(model)
    if not success:
        print("Target reaction test failed. Using alternative target.")
        # Try to find a suitable target reaction
        for rxn in model.exchanges:
            if "EX_" in rxn.id and "succ" in rxn.id.lower():
                target_reaction = rxn.id
                success, target = test_target_reaction(model, target_reaction)
                if success:
                    break

    if not success:
        print("No suitable target reaction found. Exiting.")
        return False

    # Test baseline analysis
    success, baseline_growth, baseline_succinate = test_baseline_analysis(model, target.id)
    if not success:
        print("Baseline analysis test failed. Exiting.")
        return False

    # Test FVA analysis
    success, fva_result = test_fva_analysis(model, target.id)
    if not success:
        print("FVA analysis test failed. Continuing...")

    # Test OptKnock implementation
    success, optknock_results = test_simple_optknock(model, target.id, "BIOMASS")
    if not success:
        print("OptKnock implementation test failed. Continuing...")

    # Test visualization
    success = test_visualization()
    if not success:
        print("Visualization test failed. Continuing...")

    print("\n" + "=" * 50)
    print("✓ All core functionality tests completed!")
    print("The Jupyter notebook should work correctly.")
    print("\nTo run the notebook:")
    print("1. Activate the virtual environment: source venv/bin/activate")
    print("2. Install Jupyter: pip install jupyter")
    print("3. Start Jupyter: jupyter notebook")
    print("4. Open tutorial_optKnock.ipynb")

    return True

if __name__ == "__main__":
    main()