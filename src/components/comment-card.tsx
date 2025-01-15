'use client';

import React, { useEffect, useState } from 'react';
import { Comment, User } from '@/utils/types';
import { deleteComment, getUserById } from '@/utils/services';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FaRegTrashCan } from 'react-icons/fa6';

export default function CommentCard({ comment }: { comment: Comment }) {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const getUser = async () => {
      const data = await getUserById(comment.user_id);
      setUser(data);
    };
    getUser();
  }, [comment.user_id]);

  return (
    <div className="mx-4 my-2 relative">
      <div className="absolute right-5 top-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <HiDotsHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            {user?.id === comment.user_id && (
              <div onClick={() => comment.id && deleteComment(comment.id)}>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">
                  <FaRegTrashCan />
                  <span className="pt-1">Delete</span>
                </DropdownMenuItem>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-2">
        <Image
          src={
            user?.profile_picture ||
            process.env.NEXT_PUBLIC_DEFAULT_PROFILE_PIC!
          }
          alt="avatar"
          className="w-8 h-8 rounded-full"
          width={32}
          height={32}
        />
        <span>{user?.username}</span>
      </div>
      <div>{comment.content}</div>
    </div>
  );
}
