import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface CommentBoxProps {
  height?: number;
  onSend: (content: string, setDisabled: (disabled: boolean) => void) => void;
}

export default function CommentBox({ height, onSend }: CommentBoxProps) {
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <div className="grid w-full gap-4 px-4 border-b border-border pb-4">
      <Textarea
        className={`border-none shadow-none resize-none outline-none focus:outline-none focus:border-none h-[${
          height ?? 0
        }]`}
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        disabled={disabled}
        onClick={() => {
          if (!content.trim()) return;
          onSend(content, setDisabled);
          setContent(''); // Clear input after sending
        }}>
        {!disabled ? 'Comment' : 'Commenting...'}
      </Button>
    </div>
  );
}
