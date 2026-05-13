import dynamic from 'next/dynamic';

const BaeminEditor = dynamic(() => import('@/components/BaeminEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#aaa', fontSize: 14 }}>
      에디터를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  return (
    <main style={{ height: '100vh', overflow: 'hidden' }}>
      <BaeminEditor />
    </main>
  );
}
