import React from 'react';

interface GifComponentProps {
  gifSrc: string;
  alt: string;
}

const GifComponent: React.FC<GifComponentProps> = ({ gifSrc, alt }) => {
  return (
    <div className="flex justify-center">
      <img src={gifSrc} alt={alt} className="max-w-full h-auto" />
    </div>
  );
};

export default GifComponent;