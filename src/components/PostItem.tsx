import { supabase } from '../lib/supabase';
import { formatRelative } from '../lib/time';
import type { Post } from '../lib/supabase';

type Props = {
  post: Post;
  currentUserId: string | null;
  onDeleted: () => void;
};

export function PostItem({ post, currentUserId, onDeleted }: Props) {
  const username = post.profiles?.username ?? 'unknown';
  const displayName = post.profiles?.display_name ?? username;
  const isOwner = currentUserId === post.user_id;

  const onDelete = async () => {
    if (!confirm('この投稿を削除しますか？')) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      alert(`削除に失敗しました: ${error.message}`);
      return;
    }
    onDeleted();
  };

  return (
    <article className="x-post">
      <div className="x-avatar" aria-hidden>{username.charAt(0)}</div>
      <div className="x-post-body">
        <div className="x-post-meta">
          <span className="x-post-name">{displayName}</span>
          <span className="x-post-handle">@{username}</span>
          <span className="x-post-time">· {formatRelative(post.created_at)}</span>
        </div>
        <div className="x-post-content">{post.content}</div>
        {isOwner && (
          <div className="x-post-actions">
            <button className="x-post-action" onClick={onDelete}>削除</button>
          </div>
        )}
      </div>
    </article>
  );
}
