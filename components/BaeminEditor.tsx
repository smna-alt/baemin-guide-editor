'use client';

import { useEffect, useState, useCallback } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView, useCreateBlockNote } from '@blocknote/react';
import '@blocknote/mantine/style.css';

/* ── 라이브러리 패널 데이터 */
const TEXT_ITEMS = [
  { type: 'heading' as const, props: { level: 1 as const }, icon: 'H1', label: '대제목', desc: '22px · Bold' },
  { type: 'heading' as const, props: { level: 2 as const }, icon: 'H2', label: '소제목', desc: '19px · Bold' },
  { type: 'heading' as const, props: { level: 3 as const }, icon: 'H3', label: '세부제목', desc: '17px · Bold' },
  { type: 'paragraph' as const, props: {}, icon: 'P', label: '본문', desc: '16px · Regular' },
];

const STYLE_ITEMS = [
  { type: 'bulletListItem' as const, props: {}, icon: '≡', label: '불릿 목록', desc: '비순서형 리스트' },
  { type: 'numberedListItem' as const, props: {}, icon: '1·', label: '번호 목록', desc: '순서형 리스트' },
  { type: 'checkListItem' as const, props: {}, icon: '☑', label: '체크 목록', desc: '완료 체크 리스트' },
  { type: 'paragraph' as const, props: {}, icon: 'Aa', label: '캡션', desc: '14px · 보조 설명' },
];

/* ── 샘플 블록 */
const SAMPLE_BLOCKS: PartialBlock[] = [
  { type: 'heading', props: { level: 1 }, content: '배민외식업광장 사용 가이드' },
  { type: 'paragraph', content: '배민외식업광장에서 제공하는 다양한 서비스를 효과적으로 활용하는 방법을 안내합니다.' },
  { type: 'heading', props: { level: 2 }, content: '서비스 시작하기' },
  { type: 'heading', props: { level: 3 }, content: '1. 앱 설치 및 로그인' },
  { type: 'numberedListItem', content: 'App Store 또는 Google Play에서 앱 검색' },
  { type: 'numberedListItem', content: '대표자 휴대폰 번호로 본인인증' },
  { type: 'numberedListItem', content: '사업자 정보 입력 후 가입 완료' },
  { type: 'paragraph', content: '꼭 확인하세요: 사업자등록번호와 대표자 정보가 일치해야 정상적으로 가입됩니다.' },
  { type: 'heading', props: { level: 2 }, content: '주요 기능' },
  { type: 'bulletListItem', content: '매출 통계 및 분석 대시보드' },
  { type: 'bulletListItem', content: '마케팅 광고 설정 및 관리' },
  { type: 'bulletListItem', content: '가게 정보 및 메뉴 관리' },
  { type: 'paragraph', content: '' },
];

/* ── HTML 내보내기 */
function blocksToHTML(blocks: any[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const getInlineText = (content: any): string => {
      if (!content) return '';
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map((s: any) => {
          let text = s.text || '';
          if (s.styles?.bold) text = `<strong>${text}</strong>`;
          if (s.styles?.italic) text = `<em>${text}</em>`;
          return text;
        }).join('');
      }
      return '';
    };

    const text = getInlineText(block.content);
    switch (block.type) {
      case 'heading': {
        const lvl = block.props?.level || 1;
        const sizes: Record<number, string> = { 1: '22px', 2: '19px', 3: '17px' };
        const margins: Record<number, string> = { 1: '24px', 2: '20px', 3: '16px' };
        lines.push(`<h${lvl} style="font-size:${sizes[lvl]};font-weight:700;line-height:1.4;margin-bottom:${margins[lvl]};margin-top:0;color:#1a1a1a;">${text}</h${lvl}>`);
        break;
      }
      case 'paragraph':
        if (text) lines.push(`<p style="font-size:16px;line-height:1.7;margin-bottom:10px;color:#3a3a3a;">${text}</p>`);
        break;
      case 'bulletListItem':
        lines.push(`<li style="font-size:16px;line-height:1.7;color:#3a3a3a;margin-bottom:4px;margin-left:20px;">${text}</li>`);
        break;
      case 'numberedListItem':
        lines.push(`<li style="font-size:16px;line-height:1.7;color:#3a3a3a;margin-bottom:4px;margin-left:20px;">${text}</li>`);
        break;
      case 'checkListItem':
        const checked = block.props?.checked ? '✅ ' : '☐ ';
        lines.push(`<p style="font-size:16px;line-height:1.7;color:#3a3a3a;margin-bottom:4px;">${checked}${text}</p>`);
        break;
    }
    if (block.children?.length) {
      lines.push(blocksToHTML(block.children));
    }
  }
  return lines.join('\n');
}

/* ── 메인 컴포넌트 */
export default function BaeminEditor() {
  const [previewHTML, setPreviewHTML] = useState('');

  const editor = useCreateBlockNote({
    initialContent: [{ type: 'paragraph', content: '' }],
  });

  const updatePreview = useCallback(() => {
    const html = blocksToHTML(editor.document);
    setPreviewHTML(html);
  }, [editor]);

  useEffect(() => {
    updatePreview();
  }, []);

  const insertBlock = (type: string, props?: Record<string, any>) => {
    const block: PartialBlock = { type: type as any, props: props || {} };
    try {
      const cursor = editor.getTextCursorPosition();
      if (cursor) {
        editor.insertBlocks([block], cursor.block, 'after');
      } else {
        const lastBlock = editor.document[editor.document.length - 1];
        editor.insertBlocks([block], lastBlock, 'after');
      }
    } catch {
      editor.insertBlocks([block], editor.document[0], 'before');
    }
    setTimeout(updatePreview, 100);
  };

  const loadSample = () => {
    editor.replaceBlocks(editor.document, SAMPLE_BLOCKS);
    setTimeout(updatePreview, 200);
  };

  const resetEditor = () => {
    editor.replaceBlocks(editor.document, [{ type: 'paragraph', content: '' }]);
    setPreviewHTML('');
  };

  const exportDocs = () => {
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>배민 가이드</title>
<style>body{font-family:'Apple SD Gothic Neo',sans-serif;max-width:720px;margin:0 auto;padding:40px;color:#1a1a1a;}</style>
</head>
<body>${blocksToHTML(editor.document)}</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'baemin-guide.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToCMS = async () => {
    const html = blocksToHTML(editor.document);
    try {
      await navigator.clipboard.writeText(html);
      alert('✅ CMS용 HTML이 복사됐습니다!');
    } catch {
      alert('복사 실패: 직접 Ctrl+C를 사용해주세요');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Spoqa Han Sans Neo', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif", background: '#f5f5f7' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, padding: '0 16px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '0.67px solid #e9e9ed', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#00c4a7', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✦</span>
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1c1e' }}>배민 콘텐츠 에디터</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {['샘플 불러오기', '초기화'].map((label, i) => (
            <button key={label} onClick={i === 0 ? loadSample : resetEditor}
              style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '6px 9px', borderRadius: 5 }}
              onMouseOver={e => ((e.target as HTMLElement).style.background = 'rgba(0,0,0,0.04)')}
              onMouseOut={e => ((e.target as HTMLElement).style.background = 'none')}
            >{label}</button>
          ))}
          <div style={{ width: 1, height: 16, background: '#d1d1d6', margin: '0 4px' }} />
          <button onClick={exportDocs}
            style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '6px 9px', borderRadius: 5 }}
            onMouseOver={e => ((e.target as HTMLElement).style.background = 'rgba(0,0,0,0.04)')}
            onMouseOut={e => ((e.target as HTMLElement).style.background = 'none')}
          >Docs 내보내기</button>
          <button onClick={copyToCMS}
            style={{ background: '#00c4a7', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: 5 }}
          >CMS에 복사</button>
        </div>
      </header>

      {/* 바디 3단 */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 420px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* 좌측 라이브러리 */}
        <aside style={{ background: 'rgb(248,248,250)', borderRight: '0.67px solid #e9e9ed', overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#b0b0ba', padding: '0 14px 6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>라이브러리</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#b0b0ba', padding: '8px 14px 4px', letterSpacing: '0.5px' }}>텍스트</div>
          {TEXT_ITEMS.map(item => (
            <button key={item.icon} onClick={() => insertBlock(item.type, item.props)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', margin: '1px 6px', border: 'none', background: 'transparent', width: 'calc(100% - 12px)', textAlign: 'left' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,196,167,0.07)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div style={{ width: 22, height: 22, background: 'rgb(235,235,234)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#6e6e73', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1e' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#aeaeb2' }}>{item.desc}</div>
              </div>
            </button>
          ))}
          <div style={{ fontSize: 10, fontWeight: 600, color: '#b0b0ba', padding: '12px 14px 4px', letterSpacing: '0.5px' }}>배민 스타일</div>
          {STYLE_ITEMS.map(item => (
            <button key={item.type + item.label} onClick={() => insertBlock(item.type, item.props)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', margin: '1px 6px', border: 'none', background: 'transparent', width: 'calc(100% - 12px)', textAlign: 'left' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,196,167,0.07)')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <div style={{ width: 22, height: 22, background: 'rgb(235,235,234)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#6e6e73', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1e' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#aeaeb2' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* 중앙 에디터 */}
        <section style={{ background: 'rgb(235,235,238)', overflow: 'hidden auto', padding: '40px 32px 100px' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '60px 72px 80px', maxWidth: 760, margin: '0 auto', boxShadow: 'rgba(60,60,80,0.07) 0px 1px 3px, rgba(60,60,80,0.08) 0px 4px 20px, rgba(60,60,80,0.06) 0px 0px 0px 1px', minHeight: 600 }}>
            <BlockNoteView
              editor={editor}
              theme="light"
              onChange={updatePreview}
            />
          </div>
        </section>

        {/* 우측 모바일 미리보기 */}
        <aside style={{ background: 'rgb(248,248,250)', borderLeft: '0.67px solid #e9e9ed', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 0', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#b0b0ba', letterSpacing: '0.5px', marginBottom: 12, textTransform: 'uppercase' }}>모바일 미리보기</div>
          <div style={{ width: 320, background: '#1c1c1e', borderRadius: 44, padding: '12px 9px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 110, height: 28, background: '#1c1c1e', borderRadius: 20, zIndex: 10 }} />
            <div style={{ width: '100%', height: 656, background: '#fff', borderRadius: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 8px', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>9:41</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
                  <span>▪▪▪</span><span>WiFi</span><span>🔋</span>
                </div>
              </div>
              <div style={{ background: '#f2f2f7', padding: '5px 10px', flexShrink: 0 }}>
                <div style={{ background: '#e5e5ea', borderRadius: 7, padding: '4px 10px', fontSize: 11, color: '#636366', textAlign: 'center' }}>baeminbiz.com</div>
              </div>
              <div style={{ padding: '8px 12px 0', flexShrink: 0, borderBottom: '0.5px solid #e5e5e5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 24, height: 24, background: '#00c4a7', borderRadius: 6 }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>장사노하우</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 16 }}>🔍🔔≡</div>
                </div>
                <div style={{ display: 'flex' }}>
                  {['전체', '장사소식', '매출 상승', '식자재 정보'].map((tab, i) => (
                    <div key={tab} style={{ fontSize: 11, padding: '5px 7px', color: i === 0 ? '#00c4a7' : '#636366', borderBottom: i === 0 ? '2px solid #00c4a7' : '2px solid transparent', fontWeight: i === 0 ? 600 : 400, flexShrink: 0 }}>{tab}</div>
                  ))}
                  <div style={{ fontSize: 11, padding: '5px 4px', color: '#636366' }}>∨</div>
                </div>
              </div>
              <div
                style={{ flex: 1, overflow: 'auto', padding: '10px 12px', fontSize: 12, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: previewHTML || '<p style="color:#c7c7cc;text-align:center;padding-top:40px;font-size:12px;">에디터에서 블록을 추가하면<br/>여기서 미리볼 수 있어요</p>' }}
              />
              <div style={{ height: 40, background: '#f9f9f9', borderTop: '0.5px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0, fontSize: 16 }}>
                <span style={{ color: '#636366' }}>◀</span>
                <span style={{ color: '#636366' }}>▶</span>
                <span style={{ color: '#636366' }}>⬆</span>
                <span style={{ color: '#636366' }}>□</span>
                <span style={{ color: '#636366' }}>⊞</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#aeaeb2', marginTop: 8, textAlign: 'center', lineHeight: 1.6 }}>iPhone 12 Pro · Safari · 배민외식업광장</p>
        </aside>
      </div>
    </div>
  );
}
