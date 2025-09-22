# Simple Python demo code
import math

def calculate_circle_area(radius):
    """Calculate circle area"""
    return math.pi * radius ** 2

# Calculate areas for different radii
radii = [1, 2, 3, 4, 5]
areas = [calculate_circle_area(r) for r in radii]

# Print results
for i, (r, a) in enumerate(zip(radii, areas)):
    print(f"Radius {r} circle area: {a:.2f}")

# Calculate total area
total_area = sum(areas)
print(f"Total area: {total_area:.2f}"
