import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Post, type Profile } from '../lib/supabase';
import { Composer } from '../components/Composer';
import { PostItem } from '../components/PostItem';

type Props = {
  session: Session;
};

export function TimelinePage({ session }: Props) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = session.user.id;

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, content, created_at, profiles:profiles!posts_user_id_fkey(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setError(error.message);
      return;
    }
    setPosts((data ?? []) as unknown as Post[]);
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, created_at')
        .eq('id', userId)
        .maybeSingle();
      if (!cancelled) {
        if (error) setError(error.message);
        else setProfile(data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        void loadPosts();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadPosts]);

  const username = profile?.username ?? session.user.email?.split('@')[0] ?? 'me';

  return (
    <div className="x-app">
      <header className="x-header">
        <h1>ホーム</h1>
        <button className="x-icon-btn" onClick={() => supabase.auth.signOut()}>
          ログアウト
        </button>
      </header>
      <Composer userId={userId} username={username} onPosted={loadPosts} />
      {error && <div className="x-error">{error}</div>}
      {posts === null ? (
        <div className="x-loading">読み込み中…</div>
      ) : posts.length === 0 ? (
        <div className="x-empty">まだ投稿はありません。最初のポストをしてみましょう。</div>
      ) : (
        posts.map((p) => (
          <PostItem key={p.id} post={p} currentUserId={userId} onDeleted={loadPosts} />
        ))
      )}
    </div>
  );
}
