import React, { useEffect, useState } from 'react';

export default function CharCounter({ length }: { length: number }) {
  const [charactersLeft, setCharactersLeft] = useState<number>(235);

  useEffect(() => {
    setCharactersLeft(235 - length);
  }, [length]);

  return (
    <div>
      <span
        className={`${
          charactersLeft <= 10 ? 'text-red-500' : 'text-foreground'
        } p-2 text-xs float-right`}>
        {charactersLeft}
      </span>
    </div>
  );
}
