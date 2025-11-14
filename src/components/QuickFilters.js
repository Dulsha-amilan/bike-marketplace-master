import React from 'react';
import { Link } from 'react-router-dom';
import { FaFlagCheckered, FaMotorcycle, FaMountain } from 'react-icons/fa';
import { MdElectricScooter, MdElectricBolt, MdTerrain, MdSpeed } from 'react-icons/md';
import './QuickFilters.css';

const QuickFilters = () => {
  // Source of truth for filters
  const filters = [
    { id: 'scooters', name: 'Scooters', Icon: MdElectricScooter },
    { id: 'trail', name: 'Trail', Icon: MdTerrain },
    { id: 'sport', name: 'Sport', Icon: FaFlagCheckered },
    { id: 'cruiser', name: 'Classic / Cruiser', Icon: FaMotorcycle },
    { id: 'electric', name: 'Electric', Icon: MdElectricBolt },
    { id: 'high-capacity', name: 'High Capacity', Icon: MdSpeed },
    { id: 'atv-adv', name: 'ATV / ADV', Icon: FaMountain },
  ];

  // Enforce exact layout as requested:
  // Row 1: Scooters, Trail, Sport, Classic / Cruiser
  // Row 2: Electric, High Capacity, ATV / ADV
  const firstRowIds = ['scooters', 'trail', 'sport', 'cruiser'];
  const secondRowIds = ['electric', 'high-capacity', 'atv-adv'];

  const byId = Object.fromEntries(filters.map(f => [f.id, f]));
  const firstRow = firstRowIds.map(id => byId[id]).filter(Boolean);
  const secondRow = secondRowIds.map(id => byId[id]).filter(Boolean);

  return (
    <section className="quick-filters" aria-label="Quick filters">
      <div className="filters-grid two-rows">
        <div className="row top">
          {firstRow.map(({ id, name, Icon }) => (
            <Link
              key={id}
              to={`/browse/${id}`}
              className="filter-card"
              aria-label={name}
              title={name}
            >
              <Icon className="filter-card-icon" aria-hidden="true" />
              <span className="filter-card-name">{name}</span>
            </Link>
          ))}
        </div>

        <div className="row bottom">
          {secondRow.map(({ id, name, Icon }) => (
            <Link
              key={id}
              to={`/browse/${id}`}
              className="filter-card"
              aria-label={name}
              title={name}
            >
              <Icon className="filter-card-icon" aria-hidden="true" />
              <span className="filter-card-name">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;