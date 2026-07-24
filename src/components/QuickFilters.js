import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './QuickFilters.css';

import scootersImg from '../Images/categories/scooters.png';
import trailImg from '../Images/categories/trail.png';
import sportImg from '../Images/categories/sport.png';
import cruiserImg from '../Images/categories/cruiser.png';
import electricImg from '../Images/categories/electric.png';
import highCapacityImg from '../Images/categories/high-capacity.png';
import atvAdvImg from '../Images/categories/atv-adv.png';

const CATEGORIES = [
  {
    id: 'scooters',
    name: 'Scooters',
    desc: 'City & daily rides',
    image: scootersImg,
    accent: '#FFD600',
  },
  {
    id: 'trail',
    name: 'Trail',
    desc: 'Off-road adventures',
    image: trailImg,
    accent: '#10B981',
  },
  {
    id: 'sport',
    name: 'Sport',
    desc: 'Speed & performance',
    image: sportImg,
    accent: '#EF4444',
  },
  {
    id: 'cruiser',
    name: 'Classic / Cruiser',
    desc: 'Timeless style',
    image: cruiserImg,
    accent: '#A855F7',
  },
  {
    id: 'electric',
    name: 'Electric',
    desc: 'Eco-friendly rides',
    image: electricImg,
    accent: '#06B6D4',
  },
  {
    id: 'high-capacity',
    name: 'High Capacity',
    desc: 'Heavy-duty bikes',
    image: highCapacityImg,
    accent: '#F97316',
  },
  {
    id: 'atv-adv',
    name: 'ATV / ADV',
    desc: 'All-terrain explorers',
    image: atvAdvImg,
    accent: '#6366F1',
  },
];

const QuickFilters = ({ translations }) => {
  const title = translations?.categories || 'Categories';

  return (
    <section className="category-browse" aria-label={title}>
      <div className="category-browse__shell">
        <header className="category-browse__header">
          <div>
            <span className="category-browse__eyebrow">Browse</span>
            <h2 className="category-browse__title">{title}</h2>
            <p className="category-browse__subtitle">
              Find the perfect bike for your next ride
            </p>
          </div>
          <Link to="/browse/all" className="category-browse__view-all">
            View all bikes
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <div className="category-grid">
          {CATEGORIES.map(({ id, name, desc, image, accent }) => (
            <Link
              key={id}
              to={`/browse/${id}`}
              className="category-card"
              aria-label={`Browse ${name}`}
              title={name}
              style={{ '--cat-accent': accent }}
            >
              <div
                className="category-card__bg"
                style={{ backgroundImage: `url(${image})` }}
                aria-hidden="true"
              />
              <div className="category-card__overlay" aria-hidden="true" />
              <span className="category-card__arrow-badge">
                <ArrowRight className="category-card__arrow" size={16} aria-hidden="true" />
              </span>
              <div className="category-card__content">
                <div className="category-card__body">
                  <span className="category-card__name">{name}</span>
                  <span className="category-card__desc">{desc}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;

