'use client';

import SendBox from '@/components/send-box';
import Feed from '@/components/feeds/post-feed';
import { useUser } from '@/utils/context/auth';
import { createPost, uploadPostImage } from '@/utils/services';
import { Post } from '@/utils/types';

export default function Home() {
  const { user } = useUser();

  const handleSend = async (content: string, image: File | null) => {
    if (!content.trim()) {
      return;
    }

    let imgUrl = ''
    if(image) {
      const urlObject = await uploadPostImage(image)
      console.log(urlObject.signedUrl)
      imgUrl = urlObject.signedUrl;
    }

    try {
      const post: Post = {
        user_id: user?.id ?? '',
        content: content,
        media: imgUrl,
      };
      await createPost(post);
    } catch (error) {
      console.error('Failed to send post:', error);
    }
  };

  return (
    <div>
      <SendBox onSend={handleSend} />
      <Feed />
    </div>
  );
}
