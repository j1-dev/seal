import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import CharCounter from './char-counter';
import Image from 'next/image';
import { FaRegImage } from 'react-icons/fa6';

interface SendBoxProps {
  buttonLabel?: string;
  placeholder?: string;
  height?: number;
  onSend: (content: string, image: File | null) => void;
}

export default function SendBox({
  buttonLabel,
  placeholder,
  height,
  onSend,
}: SendBoxProps) {
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [length, setLength] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setLength(e.target.value.length);
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setImage(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <div className="grid w-full gap-4 border-b border-border p-3 relative">
      <Textarea
        className={`border-none shadow-none resize-none outline-none focus:outline-none focus:border-none h-[${
          height ?? 0
        }]`}
        placeholder={placeholder ?? "What's on your mind...?"}
        value={content}
        onChange={handleChange}
        maxLength={235}
      />
      {image && (
        <Image
          src={URL.createObjectURL(image)}
          alt="image"
          width={128}
          height={128}
          className="rounded-lg"
        />
      )}

      <div
        className="absolute bottom-16 left-2 flex items-center justify-center border rounded-full border-border w-10 h-10 scale-100 hover:scale-110 transition-all cursor-pointer"
        onClick={handleAddImage}>
        <FaRegImage size={24} />
      </div>

      <CharCounter length={length} />
      <Button
        className="text-md font-bold h-10"
        disabled={disabled}
        onClick={() => {
          if (!content.trim()) return;
          setDisabled(true);
          onSend(content, image);
          setContent(''); // Clear input after sending
          setImage(null);
          setDisabled(false);
        }}>
        {buttonLabel ?? 'Send'}
      </Button>
    </div>
  );
}
