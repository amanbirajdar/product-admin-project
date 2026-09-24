"""
Test the delivery simulator with all provided test cases and base case.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from delivery_simulator import (
    load_data, assign_packages_to_agents, simulate_deliveries,
    find_best_agent, euclidean_distance
)

def run_test(test_name, data_path):
    """Run a single test case and print results."""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"{'='*60}")

    data = load_data(data_path)
    warehouses = data["warehouses"]
    agents = data["agents"]
    packages = data["packages"]

    print(f"Packages: {len(packages)}, Agents: {len(agents)}, Warehouses: {len(warehouses)}")

    # Assign packages
    agent_packages = assign_packages_to_agents(warehouses, agents, packages)

    print("\nAssignments:")
    for aid, pkgs in agent_packages.items():
        print(f"  {aid}: {[p['id'] for p in pkgs]}")

    # Simulate (no random seed for consistent results)
    random_seed = 42
    import random
    random.seed(random_seed)
    report = simulate_deliveries(agents, warehouses, agent_packages)

    best = find_best_agent(report)

    print(f"\nBest Agent: {best}")
    print(f"Total packages delivered: {sum(r['packages_delivered'] for r in report.values())}")
    print(f"Expected packages: {len(packages)}")

    # Verify all packages delivered
    total_delivered = sum(r['packages_delivered'] for r in report.values())
    assert total_delivered == len(packages), f"Mismatch: {total_delivered} != {len(packages)}"

    print("✓ All packages accounted for")

    return report

if __name__ == "__main__":
    import random

    base_dir = os.path.dirname(__file__)

    # Base case is in the same directory as the script
    base_case_path = os.path.join(base_dir, "base_case.json")

    # Test case files live in the same directory as the script
    tc_dir = base_dir

    # Test base case
    run_test("Base Case", base_case_path)

    # Test all 10 test cases
    for i in range(1, 11):
        tc_path = os.path.join(tc_dir, f"test_case_{i}.json")
        if os.path.exists(tc_path):
            run_test(f"Test Case {i}", tc_path)
        else:
            print(f"Skipping test_case_{i}.json (not found)")

    print(f"\n{'='*60}")
    print("All tests passed!")