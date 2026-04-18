import React from 'react';

interface InteractiveNameProps {
  name: string;
}

const InteractiveName: React.FC<InteractiveNameProps> = ({ name }) => {
  return (
    <h1 className="text-[18vw] font-black leading-[0.85] tracking-[-0.06em] lg:text-[12rem]">{name}</h1>
  );
};

export default InteractiveName;
