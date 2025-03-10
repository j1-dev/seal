import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/utils/context/auth';
import { createPost } from '@/utils/services';
import { Post } from '@/utils/types';
import { useState } from 'react';

export function Sendbox() {
  const [content, setContent] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
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
    if (!content.trim()) return; // Prevent sending empty posts

    try {
      const post = await constructPost(content);
      await createPost(post);
      setContent(''); // Clear the content after the post is successfully created
    } catch (error) {
      console.error('Failed to send post:', error);
    }
    setDisabled(false);
  };

  return (
    <div className="grid w-full gap-4 border-b border-border p-4">
      <Textarea
        disabled={disabled}
        placeholder="Type your message here."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button disabled={disabled} onClick={handleSend}>
        {!disabled ? 'Send message' : 'Sending...'}
      </Button>
    </div>
  );
}
