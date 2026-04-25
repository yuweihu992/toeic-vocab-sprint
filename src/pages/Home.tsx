import { useEffect, useState } from 'react';
import { getStats } from '../data/loadVocab';
import { db } from '../db/dexie';

interface Props {
  onStartSprint: () => void;
  onOpenGallery: () => void;
}

export function Home({ onStartSprint, onOpenGallery }: Props) {
  const stats = getStats();
  const [progress, setProgress] = useState({
    learned: 0,
    dueNow: 0,
    todayReviewed: 0,
  });

  useEffect(() => {
    (async () => {
      const all = await db.progress.toArray();
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayStart = startOfDay.getTime();

      setProgress({
        learned: all.filter((p) => p.reviewCount > 0).length,
        dueNow: all.filter((p) => p.nextDue <= now && p.reviewCount > 0).length,
        todayReviewed: all.filter((p) => p.lastReviewed >= todayStart).length,
      });
    })();
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <div className="max-w-xl w-full">
        <header className="mb-12 mt-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            TOEIC 單字練習
          </h1>
          <p className="text-slate-500">5 分鐘衝刺、無壓力學習</p>
        </header>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-800 tabular-nums">
                {progress.learned}
              </div>
              <div className="text-xs text-slate-500 mt-1">已學單字</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-500 tabular-nums">
                {progress.dueNow}
              </div>
              <div className="text-xs text-slate-500 mt-1">待複習</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500 tabular-nums">
                {progress.todayReviewed}
              </div>
              <div className="text-xs text-slate-500 mt-1">今日已練</div>
            </div>
          </div>
        </div>

        <button
          onClick={onStartSprint}
          className="w-full bg-slate-800 text-white text-lg font-medium py-5 rounded-2xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-md"
        >
          開始 5 分鐘 Sprint
        </button>

        <button
          onClick={onOpenGallery}
          className="w-full mt-3 bg-white border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-2xl hover:bg-slate-100 active:scale-[0.98] transition-all"
        >
          查看角色圖鑑 →
        </button>

        <div className="mt-8 text-center text-xs text-slate-400">
          詞庫總計 {stats.total} 字 ·{' '}
          {stats.byTopic.map((t) => `${t.name} ${t.count}`).join(' · ')}
        </div>
      </div>
    </div>
  );
}
