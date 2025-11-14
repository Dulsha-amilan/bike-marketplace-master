// components/FeaturedListings.js
import React, { useMemo } from 'react';
import { useVehicles } from './vehiclesStore';
import VehicleCard from './VehicleCard';
import './FeaturedListings.css';

const FeaturedListings = ({ translations }) => {
  const { allVehicles } = useVehicles();

  // Filter and sort for the most reliable vehicles
  const featuredVehicles = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    return allVehicles
      .filter(vehicle => {
        // Must have an image
        if (!vehicle.image) return false;
        
        // Must have title
        if (!vehicle.title) return false;
        
        // Must have location
        if (!vehicle.location) return false;
        
        return true;
      })
      .map(vehicle => {
        // Calculate reliability score
        let score = 0;
        
        // Condition: New vehicles get highest score
        if (vehicle.condition === 'New') {
          score += 100;
        } else if (vehicle.condition === 'Used') {
          score += 50;
        }
        
        // Year: Newer vehicles get higher score (max 50 points)
        if (vehicle.year) {
          const age = currentYear - vehicle.year;
          score += Math.max(0, 50 - (age * 2)); // Newer = higher score
        }
        
        // Mileage: Lower mileage gets higher score (max 30 points)
        if (vehicle.mileageKm != null && vehicle.mileageKm >= 0) {
          if (vehicle.mileageKm === 0) {
            score += 30; // Brand new
          } else if (vehicle.mileageKm < 10000) {
            score += 25; // Very low mileage
          } else if (vehicle.mileageKm < 25000) {
            score += 20; // Low mileage
          } else if (vehicle.mileageKm < 50000) {
            score += 15; // Moderate mileage
          } else if (vehicle.mileageKm < 100000) {
            score += 10; // Higher mileage
          }
        } else {
          // Unknown mileage gets neutral score
          score += 15;
        }
        
        // Price: Having a reasonable price indicates well-maintained (max 20 points)
        if (vehicle.price != null && vehicle.price > 0) {
          score += 20; // Has a price (well-listed)
        }
        
        // Has gallery images (bonus points)
        if (vehicle.gallery && vehicle.gallery.length > 0) {
          score += 10;
        }
        
        return { ...vehicle, reliabilityScore: score };
      })
      .sort((a, b) => {
        // Sort by reliability score (highest first)
        if (b.reliabilityScore !== a.reliabilityScore) {
          return b.reliabilityScore - a.reliabilityScore;
        }
        // If scores are equal, prefer newer posted dates
        return new Date(b.postedAt) - new Date(a.postedAt);
      })
      .slice(0, 8); // Show top 8 most reliable vehicles
  }, [allVehicles]);

  if (featuredVehicles.length === 0) {
    return null;
  }

  return (
    <section className="featured-listings">
      <div className="container">
        <h3>{translations.featured}</h3>
        <div className="listings-grid">
          {featuredVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
