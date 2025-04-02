import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/utils/context/auth';
import { createPost } from '@/utils/services';
import { Post } from '@/utils/types';
import { useState } from 'react';
import CharCounter from '@/components/char-counter';

export function Sendbox({}) {
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [length, setLength] = useState<number>(0);
  const { user } = useUser();

  const constructPost = async (content: string): Promise<Post> => {
    const user_id = user?.id || '';
    const post: Post = {
      content,
      user_id,
      // created_at: new Date().toISOString(),
    };
    return post;
  };

  const handleSend = async () => {
    setDisabled(true);
    if (!content.trim()) {
      setDisabled(false);
      return;
    }

    try {
      const post = await constructPost(content);
      await createPost(post);
      setContent(''); // Clear the content after the post is successfully created
    } catch (error) {
      console.error('Failed to send post:', error);
    }
    setDisabled(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setLength(e.target.value.length);
  };

  return (
    <div className="grid w-full gap-4 border-b border-border p-3">
      <Textarea
        disabled={disabled}
        placeholder="Type your message here."
        value={content}
        onChange={(e) => handleChange(e)}
        maxLength={235}
        className="border-0 shadow-none resize-none p-2 h-20 text-lg"
      />
      <CharCounter length={length} />
      <Button
        className="text-md font-bold h-10"
        disabled={disabled}
        onClick={handleSend}>
        {!disabled ? 'Post' : 'Posting...'}
      </Button>
    </div>
  );
}
