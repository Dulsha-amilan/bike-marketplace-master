import React from 'react';
import { Link } from 'react-router-dom';
import { FaFlagCheckered, FaMotorcycle } from 'react-icons/fa';
import { MdElectricScooter, MdElectricBolt, MdTerrain, MdSpeed } from 'react-icons/md';

const QuickFilters = () => {
  const filters = [
    { id: 'scooters', name: 'Scooters', Icon: MdElectricScooter },
    { id: 'trail', name: 'Trail', Icon: MdTerrain },
    { id: 'sport', name: 'Sport', Icon: FaFlagCheckered },
    { id: 'cruiser', name: 'Classic / Cruiser', Icon: FaMotorcycle },
    { id: 'electric', name: 'Electric', Icon: MdElectricBolt },
    { id: 'high-capacity', name: 'High Capacity', Icon: MdSpeed }, // NEW
  ];

  return (
    <section className="quick-filters">
      <div className="filters-grid">
        {filters.map(({ id, name, Icon }) => (
          <Link key={id} to={`/browse/${id}`} className="filter-card" aria-label={name}>
            <Icon className="filter-card-icon" aria-hidden="true" />
            <span className="filter-card-name">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickFilters;