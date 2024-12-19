import React from 'react';

const Marquee = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-hidden w-full">
      <div className="marquee-content flex gap-4 items-center animate-marquee">
        {children}
      </div>
    </div>
  );
};

export {Marquee};
