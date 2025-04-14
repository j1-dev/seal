import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import CharCounter from './char-counter';

interface SendBoxProps {
  buttonLabel?: string;
  placeholder?: string;
  height?: number;
  onSend: (content: string) => void;
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setLength(e.target.value.length);
  };

  return (
    <div className="grid w-full gap-4 border-b border-border p-3">
      <Textarea
        className={`border-none shadow-none resize-none outline-none focus:outline-none focus:border-none h-[${
          height ?? 0
        }]`}
        placeholder={placeholder ?? "What's on your mind...?"}
        value={content}
        onChange={handleChange}
        maxLength={235}
      />
      <CharCounter length={length} />
      <Button
        className="text-md font-bold h-10"
        disabled={disabled}
        onClick={() => {
          if (!content.trim()) return;
          setDisabled(true)
          onSend(content);
          setContent(''); // Clear input after sending
          setDisabled(false)
        }}>
        {buttonLabel ?? 'Send'}
      </Button>
    </div>
  );
}
