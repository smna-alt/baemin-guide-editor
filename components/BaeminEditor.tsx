'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  BlockNoteEditor,
  filterSuggestionItems,
  insertOrUpdateBlock,
} from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import {
  useCreateBlockNote,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from '@blocknote/react';

/* ── 커스텀 블록 스키마 ──────────────────────────────────────── */
import { defaultBlockSpecs, createReactBlockSpec } from '@blocknote/react';

// 박스·본문단독형
const BoxBody = createReactBlockSpec(
  {
    type: 'box_body',
    propSchema: { content: { default: '' } },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }: any) => (
      <div style={{ background: '#fffbe6', border: '1.5px solid #ffe066', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
        <div ref={contentRef} />
      </div>
    ),
  }
);

// 박스·제목혼합형
const BoxTitleMixed = createReactBlockSpec(
  {
    type: 'box_title_mixed',
    propSchema: { title: { default: '제목' }, content: { default: '' } },
    content: 'inline',
  },
  {
    render: ({ block, contentRef }: any) => (
      <div style={{ background: '#fff9db', border: '1.5px solid #ffe066', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#b7791f' }}>{block.props.title}</div>
        <div ref={contentRef} />
      </div>
    ),
  }
);

// 구분선
const Divider = createReactBlockSpec(
  { type: 'bm_divider', propSchema: {}, content: 'none' },
  { render: () => <hr style={{ border: 'none', borderTop: '1.5px solid #e5e5e5', margin: '12px 0' }} /> }
);

// 캡션
const Caption = createReactBlockSpec(
  { type: 'bm_caption', propSchema: { content: { default: '' } }, content: 'inline' },
  {
    render: ({ contentRef }: any) => (
      <div ref={contentRef} style={{ fontSize: 13, color: '#888', marginTop: -4, marginBottom: 8 }} />
    ),
  }
);

const customBlockSpecs = {
  ...defaultBlockSpecs,
  box_body: BoxBody,
  box_title_mixed: BoxTitleMixed,
  bm_divider: Divider,
  bm_caption: Caption,
};

/* ── 라이브러리 패널 데이터 ───────────────────────────────────── */
const TEXT_ITEMS = [
  { type: 'heading', level: 1, icon: 'H1', label: '대제목', desc: '22px · Bold' },
  { type: 'heading', level: 2, icon: 'H2', label: '소제목', desc: '19px · Bold' },
  { type: 'heading', level: 3, icon: 'H3', label: '세부제목', desc: '17px · Bold' },
  { type: 'paragraph', level: null, icon: 'P', label: '본문', desc: '16px · Regular' },
];

const STYLE_ITEMS = [
  { type: 'box_body', icon: '□', label: '박스 · 본문단독형', desc: '16px · 제목 없는 강조 박스' },
  { type: 'box_title_mixed', icon: '▣', label: '박스 · 제목혼합형', desc: '16px · 제목 + 내용 강조 박스' },
  { type: 'bulletListItem', icon: '≡', label: '불릿 목록', desc: '비순서형 리스트' },
  { type: 'numberedListItem', icon: '1·', label: '번호 목록', desc: '순서형 리스트' },
  { type: 'bm_caption', icon: 'Aa', label: '캡션', desc: '14px · 보조 설명' },
  { type: 'bm_divider', icon: '─', label: '구분선', desc: '섹션 구분' },
];

/* ── 샘플 블록 ───────────────────────────────────────────────── */
const SAMPLE_BLOCKS: any[] = [
  { type: 'heading', content: '배민외식업광장 사용 가이드', props: { level: 1 } },
  { type: 'paragraph', content: '배민외식업광장에서 제공하는 다양한 서비스를 효과적으로 활용하는 방법을 안내합니다.' },
  { type: 'heading', content: '서비스 시작하기', props: { level: 2 } },
  { type: 'heading', content: '1. 앱 설치 및 로그인', props: { level: 3 } },
  { type: 'numberedListItem', content: 'App Store 또는 Google Play에서 앱 검색' },
  { type: 'numberedListItem', content: '대표자 휴대폰 번호로 본인인증' },
  { type: 'numberedListItem', content: '사업자 정보 입력 후 가입 완료' },
  { type: 'box_body', content: '사업자등록번호와 대표자 정보가 일치해야 정상적으로 가입됩니다.' },
  { type: 'paragraph', content: '' },
  { type: 'bm_divider' },
];

/* ── HTML 내보내기 헬퍼 ──────────────────────────────────────── */
function blocksToHTML(blocks: any[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const text = Array.isArray(block.content)
      ? block.content.map((s: any) => s.text || '').join('')
      : '';
    switch (block.type) {
      case 'heading':
        const lvl = block.props?.level || 1;
        const sizes: Record<number, string> = { 1: '22px', 2: '19px', 3: '17px' };
        lines.push(`<h${lvl} style="font-size:${sizes[lvl]};font-weight:700;line-height:1.4;margin-bottom:8px;color:#1a1a1a;">${text}</h${lvl}>`);
        break;
      case 'paragraph':
        if (text) lines.push(`<p style="font-size:16px;line-height:1.7;margin-bottom:8px;color:#3a3a3a;">${text}</p>`);
        break;
      case 'bulletListItem':
        lines.push(`<li style="font-size:16px;line-height:1.7;color:#3a3a3a;margin-bottom:4px;">${text}</li>`);
        break;
      case 'numberedListItem':
        lines.push(`<li style="font-size:16px;line-height:1.7;color:#3a3a3a;margin-bottom:4px;">${text}</li>`);
        break;
      case 'box_body':
        lines.push(`<div style="background:#fffbe6;border:1.5px solid #ffe066;border-radius:8px;padding:12px 16px;margin-bottom:8px;font-size:16px;line-height:1.6;">${text}</div>`);
        break;
      case 'box_title_mixed':
        lines.push(`<div style="background:#fff9db;border:1.5px solid #ffe066;border-radius:8px;padding:12px 16px;margin-bottom:8px;"><strong style="display:block;font-size:14px;font-weight:700;color:#b7791f;margin-bottom:4px;">${block.props?.title || '제목'}</strong><div style="font-size:16px;">${text}</div></div>`);
        break;
      case 'bm_caption':
        lines.push(`<p style="font-size:13px;color:#888;margin-bottom:8px;">${text}</p>`);
        break;
      case 'bm_divider':
        lines.push('<hr style="border:none;border-top:1.5px solid #e5e5e5;margin:12px 0;" />');
        break;
    }
  }
  return lines.join('\n');
}

/* ── 메인 컴포넌트 ───────────────────────────────────────────── */
export default function BaeminEditor() {
  const [previewHTML, setPreviewHTML] = useState('');

  const editor = useCreateBlockNote({
    schema: { blockSpecs: customBlockSpecs } as any,
    initialContent: [{ type: 'paragraph', content: '' }],
  });

  const updatePreview = useCallback(() => {
    const blocks = editor.document;
    setPreviewHTML(blocksToHTML(blocks));
  }, [editor]);

  useEffect(() => {
    const unsubscribe = editor.onChange(updatePreview);
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [editor, updatePreview]);

  const insertBlock = (type: string, level?: number | null) => {
    try {
      const block: any = { type: type === 'heading' ? 'heading' : type };
      if (level) block.props = { level };
      editor.focus();
      const cur = editor.getTextCursorPosition();
      if (cur) {
        editor.insertBlocks([block], cur.block, 'after');
      } else {
        editor.insertBlocks([block], editor.document[editor.document.length - 1], 'after');
      }
      setTimeout(updatePreview, 100);
    } catch (e) { console.error(e); }
  };

  const loadSample = () => {
    try {
      editor.replaceBlocks(editor.document, SAMPLE_BLOCKS as any);
      setTimeout(updatePreview, 200);
    } catch (e) { console.error(e); }
  };

  const resetEditor = () => {
    editor.replaceBlocks(editor.document, [{ type: 'paragraph', content: '' }]);
    setPreviewHTML('');
  };

  const exportDocs = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>가이드</title></head><body style="font-family:sans-serif;max-width:720px;margin:0 auto;padding:40px;">${blocksToHTML(editor.document)}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'baemin-guide.html';
    a.click();
  };

  const copyToCMS = () => {
    const html = blocksToHTML(editor.document);
    navigator.clipboard.writeText(html).then(() => alert('CMS용 HTML이 복사됐습니다!'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Spoqa Han Sans Neo', 'Noto Sans KR', sans-serif" }}>
      {/* ── 헤더 ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 46, padding: '0 16px 0 16px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '0.67px solid rgb(233,233,237)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#00c4a7', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✦</span>
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1c1c1e' }}>배민 콘텐츠 에디터</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={loadSample} style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '0 9px', borderRadius: 5 }}>샘플 불러오기</button>
          <button onClick={resetEditor} style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '0 9px', borderRadius: 5 }}>초기화</button>
          <div style={{ width: 1, height: 16, background: '#d1d1d6', margin: '0 4px' }} />
          <button onClick={exportDocs} style={{ background: 'none', border: 'none', color: '#6e6e73', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '0 9px', borderRadius: 5 }}>Docs 내보내기</button>
          <button onClick={copyToCMS} style={{ background: '#00c4a7', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: 5 }}>CMS에 복사</button>
        </div>
      </header>

      {/* ── 바디 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr 420px', flex: 1, overflow: 'hidden' }}>
        {/* 좌측 라이브러리 */}
        <aside style={{ background: 'rgb(248,248,250)', borderRight: '0.67px solid rgb(233,233,237)', overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', padding: '0 12px 6px', letterSpacing: 1 }}>라이브러리</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', padding: '8px 12px 4px', letterSpacing: 1 }}>텍스트</div>
          {TEXT_ITEMS.map(item => (
            <div
              key={item.icon}
              onClick={() => insertBlock(item.type, item.level)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', margin: '1px 6px' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,196,167,0.08)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 22, height: 22, background: 'rgb(235,235,234)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#6e6e73', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1e' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', padding: '12px 12px 4px', letterSpacing: 1 }}>배민 스타일</div>
          {STYLE_ITEMS.map(item => (
            <div
              key={item.type}
              onClick={() => insertBlock(item.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', margin: '1px 6px' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,196,167,0.08)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 22, height: 22, background: 'rgb(235,235,234)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#6e6e73', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1c1c1e' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* 중앙 에디터 */}
        <section style={{ background: 'rgb(235,235,238)', overflow: 'hidden auto', padding: '40px 32px 100px' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '72px 80px 96px', maxWidth: 760, margin: '0 auto', boxShadow: 'rgba(60,60,80,0.07) 0px 1px 3px, rgba(60,60,80,0.08) 0px 4px 20px, rgba(60,60,80,0.06) 0px 0px 0px 1px', minHeight: 500 }}>
            <BlockNoteView
              editor={editor}
              theme="light"
              style={{ fontFamily: "'Spoqa Han Sans Neo','Noto Sans KR',sans-serif" }}
            />
          </div>
        </section>

        {/* 우측 모바일 미리보기 */}
        <aside style={{ background: 'rgb(248,248,250)', borderLeft: '0.67px solid rgb(233,233,237)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 0' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', letterSpacing: 1, marginBottom: 12 }}>모바일 미리보기</div>
          {/* iPhone 프레임 */}
          <div style={{ width: 340, height: 720, background: '#1a1a1a', borderRadius: 44, padding: '12px 10px', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', position: 'relative', flexShrink: 0 }}>
            {/* 상단 노치 */}
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, background: '#1a1a1a', borderRadius: 16, zIndex: 10 }} />
            {/* 스크린 */}
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* 상태바 */}
              <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>9:41</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 10 }}>▪▪▪</span>
                  <span style={{ fontSize: 10 }}>WiFi</span>
                  <span style={{ fontSize: 10 }}>🔋</span>
                </div>
              </div>
              {/* 브라우저 바 */}
              <div style={{ background: '#f2f2f7', padding: '6px 12px', flexShrink: 0 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#888', textAlign: 'center' }}>baeminbiz.com</div>
              </div>
              {/* 앱 헤더 */}
              <div style={{ padding: '8px 12px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 24, height: 24, background: '#00c4a7', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 12 }}>🏪</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>장사노하우</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 16 }}>🔍 🔔 ≡</div>
                </div>
                {/* 탭 */}
                <div style={{ display: 'flex', gap: 0, marginTop: 8, borderBottom: '1px solid #e5e5e5' }}>
                  {['전체', '장사소식', '매출 상승', '식자재 정보'].map((tab, i) => (
                    <div key={tab} style={{ fontSize: 11, padding: '6px 8px', color: i === 0 ? '#00c4a7' : '#666', borderBottom: i === 0 ? '2px solid #00c4a7' : 'none', fontWeight: i === 0 ? 600 : 400, flexShrink: 0 }}>{tab}</div>
                  ))}
                  <div style={{ fontSize: 11, padding: '6px 4px', color: '#666' }}>∨</div>
                </div>
              </div>
              {/* 콘텐츠 */}
              <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', fontSize: 12, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: previewHTML || '<p style="color:#ccc;text-align:center;margin-top:40px;">에디터에 내용을 입력하면\n여기에 미리볼 수 있어요</p>' }}
              />
              {/* 하단 바 */}
              <div style={{ height: 44, background: '#f9f9f9', borderTop: '0.5px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0, fontSize: 18 }}>
                <span>◀</span><span>▶</span><span>⬆</span><span>□</span><span>⬜</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#aaa', marginTop: 8, textAlign: 'center' }}>iPhone 12 Pro · Safari · 배민외식업광장</p>
        </aside>
      </div>
    </div>
  );
}
