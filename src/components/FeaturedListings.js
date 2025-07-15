// components/FeaturedListings.js
import React from 'react';
import { mockListings } from '../data/mockData';

const FeaturedListings = ({ translations }) => {
  return (
    <section className="featured-listings">
      <div className="container">
        <h3>{translations.featured}</h3>
        <div className="listings-grid">
          {mockListings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                <img src={listing.image} alt={listing.title} />
                <div className="listing-badge">{listing.condition}</div>
              </div>
              <div className="listing-content">
                <h4 className="listing-title">{listing.title}</h4>
                <p className="listing-price">Rs. {listing.price.toLocaleString()}</p>
                <p className="listing-location">📍 {listing.location}</p>
                <p className="listing-year">📅 {listing.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
