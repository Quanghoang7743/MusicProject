import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children, viewMoreLink }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    if (viewMoreLink) {
      navigate(viewMoreLink);
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">{title}</h2>
        {viewMoreLink && (
          <button
            onClick={handleViewMore}
            className="text-sm text-slate-400 hover:text-cyan-400 transition cursor-pointer"
          >
            View More
          </button>
        )}
      </div>
      {children}
    </section>
  );
};

export default Section;