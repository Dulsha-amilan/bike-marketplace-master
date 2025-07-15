// components/LanguageToggle.js
import React from 'react';

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div className="language-toggle">
      <button 
        className={`lang-btn ${language === 'sinhala' ? 'active' : ''}`}
        onClick={() => setLanguage('sinhala')}
      >
        සිංහල
      </button>
      <span className="separator">|</span>
      <button 
        className={`lang-btn ${language === 'english' ? 'active' : ''}`}
        onClick={() => setLanguage('english')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageToggle;
