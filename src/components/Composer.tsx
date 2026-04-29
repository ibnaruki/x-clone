import { useState } from 'react';
import { supabase } from '../lib/supabase';

const MAX = 280;

type Props = {
  userId: string;
  username: string;
  onPosted: () => void;
};

export function Composer({ userId, username, onPosted }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX - content.length;
  const trimmed = content.trim();
  const canPost = trimmed.length > 0 && content.length <= MAX && !submitting;

  const submit = async () => {
    if (!canPost) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('posts').insert({ user_id: userId, content: trimmed });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setContent('');
    onPosted();
  };

  return (
    <div className="x-composer">
      <div className="x-avatar" aria-hidden>{username.charAt(0)}</div>
      <div className="x-composer-main">
        <textarea
          placeholder="いまどうしてる？"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX + 50}
          aria-label="投稿内容"
        />
        {error && <div className="x-error">{error}</div>}
        <div className="x-composer-footer">
          <span className={`x-counter ${remaining < 0 ? 'over' : ''}`}>{remaining}</span>
          <button className="x-btn-primary" disabled={!canPost} onClick={submit}>
            {submitting ? '投稿中…' : 'ポストする'}
          </button>
        </div>
      </div>
    </div>
  );
}
