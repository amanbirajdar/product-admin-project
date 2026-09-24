"""
Mystery Delivery System - FastBox Logistics Simulator
Simulates one day of delivery operations and produces a performance report.
"""

import json
import math
import random
import csv
import os
from typing import Dict, List, Tuple, Any


def euclidean_distance(p1: List[float], p2: List[float]) -> float:
    """Calculate Euclidean distance between two 2D points."""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)


def normalize_data(data_path: str) -> tuple:
    """
    Read JSON data. Supports both base_case format (list of objects with id)
    and test_case format (dict with id -> [x, y]).
    Returns (warehouses_dict, agents_dict, packages_list).
    """
    with open(data_path, 'r') as f:
        data = json.load(f)

    # Base case format: arrays with objects containing id and location
    if isinstance(data.get("warehouses"), list):
        warehouses = {w["id"]: w["location"] for w in data["warehouses"]}
        agents = {a["id"]: a["location"] for a in data["agents"]}
        packages = [
            {"id": p["id"], "warehouse": p["warehouse_id"], "destination": p["destination"]}
            for p in data["packages"]
        ]
        return warehouses, agents, packages

    # Test case format: dict mapping
    warehouses = data.get("warehouses", {})
    agents = data.get("agents", {})
    packages = data.get("packages", [])

    # Handle packages with warehouse key instead of warehouse_id
    for pkg in packages:
        if "warehouse" not in pkg and "warehouse_id" in pkg:
            pkg["warehouse"] = pkg["warehouse_id"]

    return warehouses, agents, packages


def assign_packages_to_agents(
    warehouses: Dict[str, List[float]],
    agents: Dict[str, List[float]],
    packages: List[Dict]
) -> Dict[str, List[Dict]]:
    """
    Assign each package to the nearest agent based on Euclidean distance
    from agent's current location to the package's warehouse.
    Returns mapping of agent_id -> list of assigned packages.
    """
    agent_packages = {agent_id: [] for agent_id in agents}

    for pkg in packages:
        warehouse_loc = warehouses[pkg["warehouse"]]
        nearest_agent = None
        min_distance = float('inf')

        for agent_id, agent_loc in agents.items():
            dist = euclidean_distance(agent_loc, warehouse_loc)
            if dist < min_distance:
                min_distance = dist
                nearest_agent = agent_id

        agent_packages[nearest_agent].append(pkg)

    return agent_packages


def simulate_deliveries(
    agents: Dict[str, List[float]],
    warehouses: Dict[str, List[float]],
    agent_packages: Dict[str, List[Dict]]
) -> Dict[str, Any]:
    """
    Simulate each agent picking up packages from their warehouse and delivering
    to destinations. Compute total distance traveled and efficiency (packages/distance).
    """
    report = {}

    for agent_id, agent_loc in agents.items():
        pkgs = agent_packages[agent_id]
        total_distance = 0.0
        current_loc = agent_loc.copy()
        packages_delivered = []

        for pkg in pkgs:
            # Distance from current location to warehouse
            warehouse_id = pkg.get("warehouse", pkg.get("warehouse_id"))
            warehouse_loc = warehouses[warehouse_id]
            dist_to_warehouse = euclidean_distance(current_loc, warehouse_loc)

            # Random delivery delay (bonus feature) - 0-10% extra distance
            delay_factor = random.uniform(1.0, 1.1)

            # Distance from warehouse to destination
            destination = pkg["destination"]
            dist_to_destination = euclidean_distance(warehouse_loc, destination)

            # Total leg distance with random delay
            leg_distance = (dist_to_warehouse + dist_to_destination) * delay_factor
            total_distance += leg_distance

            packages_delivered.append({
                "id": pkg["id"],
                "distance": round(leg_distance, 2)
            })

            # Agent is now at the delivery destination
            current_loc = destination

        # Efficiency = total distance / packages delivered (lower is better)
        # Using packages per distance unit as efficiency metric
        efficiency = round(total_distance / len(pkgs), 2) if pkgs else 0.0

        report[agent_id] = {
            "packages_delivered": len(pkgs),
            "total_distance": round(total_distance, 2),
            "efficiency": efficiency,
            "deliveries": packages_delivered
        }

    return report


def find_best_agent(report: Dict[str, Any]) -> str:
    """
    Find the most efficient agent (lowest distance per package).
    """
    best_agent = None
    best_efficiency = float('inf')

    for agent_id, data in report.items():
        if data["efficiency"] < best_efficiency:
            best_efficiency = data["efficiency"]
            best_agent = agent_id

    return best_agent


def visualize_route_ascii(
    agent_id: str,
    agent_start: List[float],
    packages: List[Dict],
    warehouses: Dict[str, List[float]]
) -> str:
    """
    Bonus: Visualize delivery route in ASCII art (20x40 grid).
    """
    grid_width, grid_height = 40, 20
    grid = [['.' for _ in range(grid_width)] for _ in range(grid_height)]

    # Scale coordinates to fit grid
    all_x = [agent_start[0]] + [p["destination"][0] for p in packages]
    all_y = [agent_start[1]] + [p["destination"][1] for p in packages]

    for wh_loc in warehouses.values():
        all_x.extend(wh_loc)

    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)

    def scale_x(x):
        if max_x == min_x:
            return grid_width // 2
        return max(0, min(grid_width - 1, int((x - min_x) / (max_x - min_x) * (grid_width - 1))))

    def scale_y(y):
        if max_y == min_y:
            return grid_height // 2
        return max(0, min(grid_height - 1, int((y - min_y) / (max_y - min_y) * (grid_height - 1))))

    # Place warehouses (W)
    for wh_id, wh_loc in warehouses.items():
        sx, sy = scale_x(wh_loc[0]), scale_y(wh_loc[1])
        grid[sy][sx] = 'W'

    # Place agent start (A)
    sx, sy = scale_x(agent_start[0]), scale_y(agent_start[1])
    grid[sy][sx] = 'A'

    # Place destinations (P) and draw routes
    for pkg in packages:
        dx, dy = scale_x(pkg["destination"][0]), scale_y(pkg["destination"][1])
        grid[dy][dx] = 'P'

        # Draw simple line from warehouse to destination
        wh_loc = warehouses[pkg["warehouse"]]
        wx, wy = scale_x(wh_loc[0]), scale_y(wh_loc[1])

        # Simple Bresenham-like line
        steps = max(abs(dx - wx), abs(dy - wy))
        if steps > 0:
            for i in range(1, steps):
                ix = wx + (dx - wx) * i // steps
                iy = wy + (dy - wy) * i // steps
                if 0 <= iy < grid_height and 0 <= ix < grid_width:
                    if grid[iy][ix] == '.':
                        grid[iy][ix] = '*'

    # Build ASCII string
    lines = [f"Route for {agent_id}:", "+" + "-" * grid_width + "+"]
    for row in grid:
        lines.append("|" + "".join(row) + "|")
    lines.append("+" + "-" * grid_width + "+")
    lines.append("W=Warehouse, A=Agent Start, P=Package Destination, *=Route")

    return "\n".join(lines)


def handle_new_agent(
    agents: Dict[str, List[float]],
    report: Dict[str, Any],
    new_agent_id: str,
    new_agent_loc: List[float],
    remaining_packages: List[Dict],
    warehouses: Dict[str, List[float]]
) -> Dict[str, Any]:
    """
    Bonus: Handle a new agent joining mid-day and picking up remaining packages.
    """
    if not remaining_packages:
        return report

    # Assign remaining packages to new agent
    agent_packages = {new_agent_id: []}
    for pkg in remaining_packages:
        warehouse_loc = warehouses[pkg["warehouse"]]
        dist = euclidean_distance(new_agent_loc, warehouse_loc)
        agent_packages[new_agent_id].append((pkg, dist))

    # Sort by distance and assign
    agent_packages[new_agent_id].sort(key=lambda x: x[1])
    packages = [p[0] for p in agent_packages[new_agent_id]]

    # Simulate deliveries for new agent
    new_agent_report = simulate_deliveries(
        {new_agent_id: new_agent_loc},
        warehouses,
        {new_agent_id: packages}
    )

    report[new_agent_id] = new_agent_report[new_agent_id]
    return report


def export_top_performer_to_csv(report: Dict[str, Any], best_agent: str, filepath: str):
    """
    Bonus: Export the top performer's data to CSV.
    """
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Agent", "Packages Delivered", "Total Distance", "Efficiency"])
        data = report[best_agent]
        writer.writerow([
            best_agent,
            data["packages_delivered"],
            data["total_distance"],
            data["efficiency"]
        ])


def run_simulation(data_filepath: str, report_filepath: str, enable_bonus: bool = True):
    """
    Main simulation pipeline: load data, assign, simulate, report.
    """
    # Step 1: Load data
    data = load_data(data_filepath)

    warehouses = data["warehouses"]
    agents = data["agents"]
    packages = data["packages"]

    print(f"Loaded {len(packages)} packages, {len(agents)} agents, {len(warehouses)} warehouses\n")

    # Step 2: Assign packages to nearest agents
    agent_packages = assign_packages_to_agents(warehouses, agents, packages)

    print("Package Assignments:")
    for agent_id, pkgs in agent_packages.items():
        pkg_ids = [p["id"] for p in pkgs]
        print(f"  {agent_id}: {pkg_ids}")

    # Step 3: Simulate deliveries
    random.seed(42)  # For reproducible results
    report = simulate_deliveries(agents, warehouses, agent_packages)

    # Step 4: Find best agent
    best_agent = find_best_agent(report)
    report["best_agent"] = best_agent

    # Step 5: Generate final report (remove internal delivery details)
    output_report = {}
    for agent_id, data in report.items():
        if agent_id != "best_agent" and agent_id != "deliveries":
            output_report[agent_id] = {
                "packages_delivered": data["packages_delivered"],
                "total_distance": data["total_distance"],
                "efficiency": data["efficiency"]
            }
    output_report["best_agent"] = best_agent

    # Save report
    with open(report_filepath, 'w') as f:
        json.dump(output_report, f, indent=2)

    print(f"\n{'='*60}")
    print("DELIVERY REPORT")
    print(f"{'='*60}")
    for agent_id, stats in output_report.items():
        if agent_id != "best_agent":
            print(f"{agent_id}: {stats['packages_delivered']} packages, "
                  f"{stats['total_distance']} distance, "
                  f"{stats['efficiency']} efficiency")
    print(f"\nBest Agent: {best_agent}")
    print(f"\nReport saved to {report_filepath}")

    # Bonus features
    if enable_bonus:
        print(f"\n{'='*60}")
        print("BONUS FEATURES")
        print(f"{'='*60}")

        # ASCII route visualization for each agent
        for agent_id in agents:
            if agent_packages[agent_id]:
                ascii_map = visualize_route_ascii(
                    agent_id,
                    agents[agent_id],
                    agent_packages[agent_id],
                    warehouses
                )
                print(f"\n{ascii_map}")

        # CSV export for top performer
        csv_path = report_filepath.replace(".json", "_top.csv")
        export_top_performer_to_csv(output_report, best_agent, csv_path)
        print(f"\nTop performer exported to {csv_path}")

        # Handle new agent joining mid-day (bonus)
        # Simulate scenario where A4 joins after first 3 packages delivered
        if len(agents) < 4:
            new_agent_id = "A4"
            new_agent_loc = [50, 50]  # Middle of map
            remaining = packages[3:]  # Last 2 packages as "remaining"

            report_with_new = handle_new_agent(
                agents, output_report, new_agent_id,
                new_agent_loc, remaining, warehouses
            )
            print(f"\nNew agent {new_agent_id} joined mid-day!")
            print(f"  Assigned {len(remaining)} remaining packages")
            print(f"  Updated report saved with new agent data")

    return output_report


if __name__ == "__main__":
    # Run with the base case data
    data_path = os.path.join(os.path.dirname(__file__), "data.json")
    report_path = os.path.join(os.path.dirname(__file__), "report.json")

    # Check if data.json exists, otherwise use base_case format
    if not os.path.exists(data_path):
        # Create sample data.json from base_case format for testing
        sample_data = {
            "warehouses": {"W1": [0, 0], "W2": [50, 75], "W3": [100, 25]},
            "agents": {"A1": [5, 5], "A2": [60, 60], "A3": [95, 30]},
            "packages": [
                {"id": "P1", "warehouse": "W1", "destination": [30, 40]},
                {"id": "P2", "warehouse": "W2", "destination": [70, 90]},
                {"id": "P3", "warehouse": "W3", "destination": [105, 20]},
                {"id": "P4", "warehouse": "W1", "destination": [10, 10]},
                {"id": "P5", "warehouse": "W2", "destination": [40, 80]}
            ]
        }
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        with open(data_path, 'w') as f:
            json.dump(sample_data, f, indent=2)
        print(f"Created sample {data_path}\n")

    run_simulation(data_path, report_path, enable_bonus=True)