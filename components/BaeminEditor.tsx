'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

/* ━━━ 라이브러리 패널 아이템 정의 ━━━ */

// 텍스트 블록 타입
const TEXT_ITEMS = [
  { id: 'h1', icon: 'H1', label: '대제목', desc: '22px · Bold',
    block: { type: 'heading' as const, props: { level: 1 as const } } },
  { id: 'h2', icon: 'H2', label: '소제목', desc: '19px · Bold',
    block: { type: 'heading' as const, props: { level: 2 as const } } },
  { id: 'h3', icon: 'H3', label: '세부제목', desc: '17px · Bold',
    block: { type: 'heading' as const, props: { level: 3 as const } } },
  { id: 'p', icon: 'P', label: '본문', desc: '16px · Regular',
    block: { type: 'paragraph' as const, props: {} } },
];

// 배민 스타일 블록 타입 (HTML 커스텀 블록으로 구현)
const BAEMIN_ITEMS = [
  {
    id: 'box-body',
    icon: '□',
    label: '박스 · 본문단독형',
    desc: '16px · 제목 없는 강조 박스',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '내용을 입력하세요.',
    },
    style: 'baemin-box-body',
  },
  {
    id: 'box-title',
    icon: '▣',
    label: '박스 · 제목혼합형',
    desc: '16px · 제목 + 내용 강조 박스',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '제목을 입력하세요.',
    },
    style: 'baemin-box-title',
  },
  {
    id: 'box-body-sm',
    icon: '□',
    label: '박스 · 본문단독형(소)',
    desc: '14px · 제목 없는 강조 박스',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '내용을 입력하세요.',
    },
    style: 'baemin-box-body-sm',
  },
  {
    id: 'box-title-sm',
    icon: '▣',
    label: '박스 · 제목혼합형(소)',
    desc: '14px · 제목 + 내용 강조 박스',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '제목을 입력하세요.',
    },
    style: 'baemin-box-title-sm',
  },
  {
    id: 'bullet',
    icon: '≡',
    label: '불릿 목록',
    desc: '비순서형 리스트',
    block: { type: 'bulletListItem' as const, props: {} },
  },
  {
    id: 'numbered',
    icon: '1·',
    label: '번호 목록',
    desc: '순서형 리스트',
    block: { type: 'numberedListItem' as const, props: {} },
  },
  {
    id: 'table',
    icon: '⊞',
    label: '데이터 표',
    desc: '둥근 모서리 테이블',
    block: { type: 'table' as const, props: {} },
  },
  {
    id: 'faq',
    icon: 'Q&A',
    label: 'FAQ',
    desc: '질문·답변 세트',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: 'Q. 질문을 입력하세요.',
    },
    style: 'baemin-faq',
  },
  {
    id: 'box-mixed',
    icon: 'T+',
    label: '박스·제목혼합',
    desc: '제목+본문 박스',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '제목을 입력하세요.',
    },
    style: 'baemin-box-mixed',
  },
  {
    id: 'caption',
    icon: 'Aa',
    label: '캡션',
    desc: '14px · 보조 설명',
    block: {
      type: 'paragraph' as const,
      props: {},
      content: '보조 설명을 입력하세요.',
    },
    style: 'baemin-caption',
  },
  {
    id: 'divider',
    icon: '─',
    label: '구분선',
    desc: '섹션 구분',
    block: { type: 'paragraph' as const, props: {}, content: '' },
    style: 'baemin-divider',
  },
];

/* ━━━ 샘플 블록 ━━━ */
const SAMPLE_BLOCKS = [
  { type: 'heading' as const, props: { level: 1 as const }, content: '배민외식업광장 사용 가이드' },
  { type: 'paragraph' as const, content: '배민외식업광장에서 제공하는 다양한 서비스를 효과적으로 활용하는 방법을 안내합니다.' },
  { type: 'heading' as const, props: { level: 2 as const }, content: '서비스 시작하기' },
  { type: 'heading' as const, props: { level: 3 as const }, content: '1. 앱 설치 및 로그인' },
  { type: 'numberedListItem' as const, content: 'App Store 또는 Google Play에서 앱 검색' },
  { type: 'numberedListItem' as const, content: '대표자 휴대폰 번호로 본인인증' },
  { type: 'numberedListItem' as const, content: '사업자 정보 입력 후 가입 완료' },
  { type: 'paragraph' as const, content: '꼭 확인하세요: 사업자등록번호와 대표자 정보가 일치해야 정상적으로 가입됩니다.' },
  { type: 'heading' as const, props: { level: 2 as const }, content: '주요 기능 안내' },
  { type: 'bulletListItem' as const, content: '매출 분석: 일·주·월별 매출 리포트' },
  { type: 'bulletListItem' as const, content: '리뷰 관리: 리뷰 작성·답글 통합 관리' },
  { type: 'bulletListItem' as const, content: '마케팅: 쿠폰 발행 및 광고 관리' },
];

/* ━━━ 모바일 HTML 생성 ━━━ */
function generateMobileHTML(blocks: any[]): string {
  return blocks.map(block => {
    const text = Array.isArray(block.content)
      ? block.content.map((c: any) => c.text || '').join('')
      : (block.content || '');
    switch (block.type) {
      case 'heading': {
        const sizes = { 1: '18px', 2: '16px', 3: '14px' };
        const size = sizes[block.props?.level as 1|2|3] || '16px';
        return `<div style="font-weight:700;font-size:${size};margin:12px 0 6px;color:#111;">${text}</div>`;
      }
      case 'paragraph':
        return text ? `<p style="font-size:14px;margin:4px 0;color:#333;line-height:1.6;">${text}</p>` : '<br/>';
      case 'bulletListItem':
        return `<div style="font-size:14px;margin:2px 0;padding-left:16px;color:#333;">• ${text}</div>`;
      case 'numberedListItem':
        return `<div style="font-size:14px;margin:2px 0;padding-left:16px;color:#333;">${text}</div>`;
      default:
        return text ? `<p style="font-size:14px;color:#333;">${text}</p>` : '';
    }
  }).join('');
}

/* ━━━ 메인 컴포넌트 ━━━ */
export default function BaeminEditor() {
  const editor = useCreateBlockNote();
  const [mobileHTML, setMobileHTML] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  // 에디터 내용 변경 시 모바일 HTML 업데이트
  useEffect(() => {
    if (!editor) return;
    const updateMobile = () => {
      const blocks = editor.document;
      setMobileHTML(generateMobileHTML(blocks));
    };
    editor.onChange(updateMobile);
    updateMobile();
  }, [editor]);

  /* ━━━ 라이브러리 블록 삽입 함수 ━━━ */
  const insertBlock = useCallback((item: typeof TEXT_ITEMS[0] | typeof BAEMIN_ITEMS[0]) => {
    const block = (item as any).block;
    if (!block) return;

    // 현재 포커스된 블록 위치에 삽입
    const currentBlock = editor.getTextCursorPosition().block;

    // table 타입은 특별 처리
    if (block.type === 'table') {
      editor.insertBlocks(
        [{
          type: 'table',
          content: {
            type: 'tableContent',
            rows: [
              { cells: [
                [{ type: 'text', text: '항목', styles: {} }],
                [{ type: 'text', text: '내용', styles: {} }],
                [{ type: 'text', text: '대상', styles: {} }],
              ]},
              { cells: [
                [{ type: 'text', text: '', styles: {} }],
                [{ type: 'text', text: '', styles: {} }],
                [{ type: 'text', text: '', styles: {} }],
              ]},
            ],
          },
        }],
        currentBlock,
        'after'
      );
    } else {
      // 일반 블록 삽입
      const contentStr = block.content || '';
      editor.insertBlocks(
        [{
          type: block.type,
          props: block.props || {},
          content: contentStr ? [{ type: 'text', text: contentStr, styles: {} }] : [],
        }],
        currentBlock,
        'after'
      );
    }

    // 포커스 이동
    setTimeout(() => {
      editor.focus();
    }, 50);
  }, [editor]);

  /* ━━━ 샘플 불러오기 ━━━ */
  const loadSample = useCallback(() => {
    editor.removeBlocks(editor.document);
    const blocks = SAMPLE_BLOCKS.map(b => ({
      type: b.type,
      props: (b as any).props || {},
      content: [{ type: 'text' as const, text: b.content, styles: {} }],
    }));
    editor.insertBlocks(blocks, editor.document[0], 'before');
    setTimeout(() => editor.focus(), 50);
  }, [editor]);

  /* ━━━ 초기화 ━━━ */
  const resetEditor = useCallback(() => {
    editor.removeBlocks(editor.document);
    editor.insertBlocks(
      [{ type: 'paragraph', content: [] }],
      editor.document[0] || { id: '' } as any,
      'before'
    );
    setTimeout(() => editor.focus(), 50);
  }, [editor]);

  /* ━━━ Docs 내보내기 ━━━ */
  const exportDocs = useCallback(() => {
    const blocks = editor.document;
    const html = generateMobileHTML(blocks);
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>가이드</title></head><body style="font-family:sans-serif;max-width:800px;margin:0 auto;padding:24px;">${html}</body></html>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'guide.html';
    a.click();
  }, [editor]);

  /* ━━━ CMS에 복사 ━━━ */
  const copyToCMS = useCallback(() => {
    const blocks = editor.document;
    const html = generateMobileHTML(blocks);
    navigator.clipboard.writeText(html).then(() => alert('HTML이 클립보드에 복사되었습니다.'));
  }, [editor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Spoqa Han Sans Neo', 'Apple SD Gothic Neo', sans-serif" }}>
      {/* ━━━ 헤더 ━━━ */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '46px', background: '#fff',
        borderBottom: '1px solid #e8e8e8', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', background: '#00c4b4', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 700,
          }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>배민 콘텐츠 에디터</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={loadSample} style={btnStyle}>샘플 불러오기</button>
          <button onClick={resetEditor} style={btnStyle}>초기화</button>
          <span style={{ color: '#ddd', margin: '0 4px' }}>|</span>
          <button onClick={exportDocs} style={btnStyle}>Docs 내보내기</button>
          <button onClick={copyToCMS} style={{ ...btnStyle, background: '#00c4b4', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>CMS에 복사</button>
        </div>
      </header>

      {/* ━━━ 본문 레이아웃 ━━━ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ━━━ 좌측 라이브러리 패널 ━━━ */}
        <aside style={{
          width: '210px', flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e8e8e8', overflowY: 'auto', padding: '16px 0',
        }}>
          <div style={{ padding: '0 14px 8px', fontSize: '11px', color: '#999', fontWeight: 600, letterSpacing: '0.05em' }}>라이브러리</div>

          {/* 텍스트 섹션 */}
          <div style={{ padding: '4px 14px 6px', fontSize: '11px', color: '#bbb', fontWeight: 500 }}>텍스트</div>
          {TEXT_ITEMS.map(item => (
            <div
              key={item.id}
              onMouseDown={(e) => { e.preventDefault(); insertBlock(item); }}
              style={libItemStyle}
            >
              <div style={{ ...libIconStyle, background: '#f0f0f0', color: '#666', fontSize: '11px', fontWeight: 700 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{item.desc}</div>
              </div>
            </div>
          ))}

          {/* 배민 스타일 섹션 */}
          <div style={{ padding: '12px 14px 6px', fontSize: '11px', color: '#bbb', fontWeight: 500 }}>배민 스타일</div>
          {BAEMIN_ITEMS.map(item => (
            <div
              key={item.id}
              onMouseDown={(e) => { e.preventDefault(); insertBlock(item); }}
              style={libItemStyle}
            >
              <div style={{
                ...libIconStyle,
                background: '#f0f0f0', color: '#666',
                fontSize: item.icon.length > 2 ? '9px' : '11px',
                fontWeight: 700,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* ━━━ 에디터 영역 ━━━ */}
        <main style={{ flex: 1, background: '#ebebee', overflowY: 'auto', padding: '32px 24px' }}>
          <div style={{
            background: '#fff', borderRadius: '8px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            minHeight: '600px', padding: '32px',
          }}>
            <BlockNoteView
              editor={editor}
              theme="light"
            />
          </div>
        </main>

        {/* ━━━ 우측 모바일 미리보기 ━━━ */}
        <aside style={{
          width: '340px', flexShrink: 0, background: '#f5f5f5',
          borderLeft: '1px solid #e8e8e8', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px',
        }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px', alignSelf: 'flex-start' }}>모바일 미리보기</div>
          {/* 아이폰 프레임 */}
          <div style={{
            width: '300px', borderRadius: '36px', overflow: 'hidden',
            border: '8px solid #1a1a1a', background: '#fff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            {/* 상태바 */}
            <div style={{ background: '#fff', padding: '10px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>9:41</span>
              <span style={{ fontSize: '10px', color: '#333' }}>▪ ▪ ▪ WiFi</span>
            </div>
            {/* 앱 상단 */}
            <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '8px 16px' }}>
              <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginBottom: '4px' }}>baeminbiz.com</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', background: '#00c4b4', borderRadius: '6px' }}></div>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>장사노하우</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', borderBottom: '2px solid #00c4b4', paddingBottom: '4px' }}>
                <span style={{ color: '#00c4b4', fontWeight: 700 }}>전체</span>
                <span style={{ color: '#999' }}>장사소식</span>
                <span style={{ color: '#999' }}>매출 상승</span>
                <span style={{ color: '#999' }}>식자재 정보</span>
                <span style={{ color: '#999' }}>∨</span>
              </div>
            </div>
            {/* 콘텐츠 */}
            <div
              style={{ padding: '16px', minHeight: '400px', fontSize: '14px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: mobileHTML || '<p style="color:#bbb;text-align:center;margin-top:40px;">에디터에서 블록을 추가하면<br/>여기서 미리볼 수 있어요</p>' }}
            />
            {/* 하단 네비 바 */}
            <div style={{
              background: '#fff', borderTop: '1px solid #f0f0f0',
              padding: '8px 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            }}>
              {['◀', '▶', '↑', '□', '⊞'].map((icon, i) => (
                <span key={i} style={{ fontSize: '14px', color: '#666', padding: '4px 8px' }}>{icon}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '12px' }}>iPhone 12 Pro · Safari · 배민외식업광장</div>
        </aside>
      </div>
    </div>
  );
}

/* ━━━ 공통 스타일 상수 ━━━ */
const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '13px', color: '#444', padding: '4px 8px',
  borderRadius: '4px', fontWeight: 500,
};

const libItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
  transition: 'background 0.12s',
};

const libIconStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '5px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, letterSpacing: '-0.5px',
};
