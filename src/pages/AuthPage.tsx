import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
          throw new Error('ユーザー名は3〜20文字の英数字とアンダースコアのみ使えます');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, display_name: username } },
        });
        if (error) throw error;
        if (data.session) return;
        setInfo('確認メールを送信しました。メール内のリンクから認証を完了してください。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="x-auth">
      <div className="x-auth-card">
        <svg className="x-auth-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <h2>{mode === 'signin' ? 'ログイン' : 'アカウントを作成'}</h2>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="x-field">
              <label htmlFor="username">ユーザー名</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="x-field">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="x-field">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && <div className="x-error">{error}</div>}
          {info && <div className="x-error" style={{ color: 'var(--x-accent)', borderColor: 'var(--x-accent)', background: 'rgba(29,155,240,0.1)' }}>{info}</div>}
          <button type="submit" className="x-auth-submit" disabled={loading}>
            {loading ? '処理中…' : mode === 'signin' ? 'ログイン' : '登録'}
          </button>
        </form>
        <div className="x-auth-toggle">
          {mode === 'signin' ? (
            <>
              アカウントをお持ちでないですか？
              <button onClick={() => { setMode('signup'); setError(null); setInfo(null); }}>登録</button>
            </>
          ) : (
            <>
              すでにアカウントがありますか？
              <button onClick={() => { setMode('signin'); setError(null); setInfo(null); }}>ログイン</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
