import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

export default function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center h-16 px-4">
      <IoArrowBack
        onClick={() => history.back()}
        size={32}
        className="cursor-pointer transition-colors hover:text-foreground/80"
      />
      <h1 className="text-2xl font-bold flex-1 text-center ">{title}</h1>
      <IoArrowBack size={32} className="opacity-0" /> {/** !?!?!?!?!?!?!?!?!?!?!?!?! */}
    </div>
  );
}
