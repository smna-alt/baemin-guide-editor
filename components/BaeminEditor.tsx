'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

/* ━━━ 라이브러리 패널 아이템 정의 ━━━ */

const TEXT_ITEMS = [
  { id: 'h1', icon: 'H1', label: '대제목', desc: '22px · Bold',
    block: { type: 'heading' as const, props: { level: 1 as const }, content: [] } },
  { id: 'h2', icon: 'H2', label: '소제목', desc: '19px · Bold',
    block: { type: 'heading' as const, props: { level: 2 as const }, content: [] } },
  { id: 'h3', icon: 'H3', label: '세부제목', desc: '17px · Bold',
    block: { type: 'heading' as const, props: { level: 3 as const }, content: [] } },
  { id: 'p', icon: 'P', label: '본문', desc: '16px · Regular',
    block: { type: 'paragraph' as const, props: {}, content: [] } },
];

const BAEMIN_ITEMS = [
  { id: 'box-body', icon: '□', label: '박스 · 본문단독형', desc: '16px · 제목 없는 강조 박스',
    block: { type: 'paragraph' as const, props: { textColor: 'default', backgroundColor: 'blue' }, content: [] } },
  { id: 'box-title', icon: '▣', label: '박스 · 제목혼합형', desc: '16px · 제목 + 내용 강조 박스',
    block: { type: 'heading' as const, props: { level: 2 as const, textColor: 'default', backgroundColor: 'yellow' }, content: [] } },
  { id: 'box-body-sm', icon: '□', label: '박스 · 본문단독형(소)', desc: '14px · 제목 없는 강조 박스',
    block: { type: 'paragraph' as const, props: { textColor: 'default', backgroundColor: 'gray' }, content: [] } },
  { id: 'box-title-sm', icon: '▣', label: '박스 · 제목혼합형(소)', desc: '14px · 제목 + 내용 강조 박스',
    block: { type: 'heading' as const, props: { level: 3 as const, textColor: 'default', backgroundColor: 'gray' }, content: [] } },
  { id: 'bullet', icon: '≡', label: '불릿 목록', desc: '비순서형 리스트',
    block: { type: 'bulletListItem' as const, props: {}, content: [] } },
  { id: 'numbered', icon: '1·', label: '번호 목록', desc: '순서형 리스트',
    block: { type: 'numberedListItem' as const, props: {}, content: [] } },
  { id: 'table', icon: '⊞', label: '데이터 표', desc: '둥근 모서리 테이블',
    block: null, isTable: true },
  { id: 'faq', icon: 'Q&A', label: 'FAQ', desc: '질문·답변 세트',
    block: { type: 'paragraph' as const, props: { textColor: 'default', backgroundColor: 'orange' }, content: [{ type: 'text' as const, text: 'Q. 질문을 입력하세요.', styles: {} }] } },
  { id: 'box-mixed', icon: 'T+', label: '박스·제목혼합', desc: '제목+본문 박스',
    block: { type: 'heading' as const, props: { level: 2 as const, textColor: 'default', backgroundColor: 'purple' }, content: [] } },
  { id: 'caption', icon: 'Aa', label: '캡션', desc: '14px · 보조 설명',
    block: { type: 'paragraph' as const, props: { textColor: 'gray' }, content: [] } },
  { id: 'divider', icon: '─', label: '구분선', desc: '섹션 구분',
    block: { type: 'paragraph' as const, props: { textColor: 'gray', backgroundColor: 'gray' }, content: [{ type: 'text' as const, text: '─────────────────────────', styles: {} }] } },
];

/* ━━━ 샘플 블록 ━━━ */
const SAMPLE_BLOCKS = [
  { type: 'heading' as const, props: { level: 1 as const }, content: [{ type: 'text' as const, text: '배민외식업광장 사용 가이드', styles: {} }] },
  { type: 'paragraph' as const, props: {}, content: [{ type: 'text' as const, text: '배민외식업광장에서 제공하는 다양한 서비스를 효과적으로 활용하는 방법을 안내합니다.', styles: {} }] },
  { type: 'heading' as const, props: { level: 2 as const }, content: [{ type: 'text' as const, text: '서비스 시작하기', styles: {} }] },
  { type: 'heading' as const, props: { level: 3 as const }, content: [{ type: 'text' as const, text: '1. 앱 설치 및 로그인', styles: {} }] },
  { type: 'numberedListItem' as const, props: {}, content: [{ type: 'text' as const, text: 'App Store 또는 Google Play에서 앱 검색', styles: {} }] },
  { type: 'numberedListItem' as const, props: {}, content: [{ type: 'text' as const, text: '대표자 휴대폰 번호로 본인인증', styles: {} }] },
  { type: 'numberedListItem' as const, props: {}, content: [{ type: 'text' as const, text: '사업자 정보 입력 후 가입 완료', styles: {} }] },
  { type: 'paragraph' as const, props: { textColor: 'default', backgroundColor: 'yellow' }, content: [{ type: 'text' as const, text: '📌 꼭 확인하세요  사업자등록번호와 대표자 정보가 일치해야 정상적으로 가입됩니다.', styles: {} }] },
  { type: 'heading' as const, props: { level: 2 as const }, content: [{ type: 'text' as const, text: '주요 기능 안내', styles: {} }] },
  { type: 'bulletListItem' as const, props: {}, content: [{ type: 'text' as const, text: '매출 분석: 일·주·월별 매출 리포트', styles: {} }] },
  { type: 'bulletListItem' as const, props: {}, content: [{ type: 'text' as const, text: '리뷰 관리: 리뷰 작성·답글 통합 관리', styles: {} }] },
  { type: 'bulletListItem' as const, props: {}, content: [{ type: 'text' as const, text: '마케팅: 쿠폰 발행 및 광고 관리', styles: {} }] },
];

/* ━━━ 모바일 HTML 생성 ━━━ */
function generateMobileHTML(blocks: any[]): string {
  return blocks.map(block => {
    const text = Array.isArray(block.content)
      ? block.content.map((c: any) => c.text || '').join('')
      : '';
    const bg = block.props?.backgroundColor;
    const boxStyle = bg && bg !== 'default' && bg !== 'transparent'
      ? 'background:#f0f8ff;border-left:3px solid #00c4b4;padding:8px 12px;border-radius:4px;margin:6px 0;'
      : '';
    switch (block.type) {
      case 'heading': {
        const sizes: Record<number, string> = { 1: '20px', 2: '17px', 3: '15px' };
        const size = sizes[block.props?.level as number] || '17px';
        if (boxStyle) return '<div style="' + boxStyle + 'font-weight:700;font-size:' + size + ';color:#111;">' + text + '</div>';
        return '<div style="font-weight:700;font-size:' + size + ';margin:14px 0 6px;color:#111;">' + text + '</div>';
      }
      case 'paragraph':
        if (!text) return '<br/>';
        if (boxStyle) return '<div style="' + boxStyle + 'font-size:14px;color:#333;line-height:1.6;">' + text + '</div>';
        if (block.props?.textColor === 'gray') return '<p style="font-size:12px;color:#999;margin:2px 0;">' + text + '</p>';
        return '<p style="font-size:14px;margin:4px 0;color:#333;line-height:1.6;">' + text + '</p>';
      case 'bulletListItem':
        return '<div style="font-size:14px;margin:2px 0;padding-left:16px;color:#333;">• ' + text + '</div>';
      case 'numberedListItem':
        return '<div style="font-size:14px;margin:2px 0;padding-left:16px;color:#333;">' + text + '</div>';
      default:
        return text ? '<p style="font-size:14px;color:#333;">' + text + '</p>' : '';
    }
  }).join('');
}

/* ━━━ 메인 컴포넌트 ━━━ */
export default function BaeminEditor() {
  const editor = useCreateBlockNote();
  const [mobileHTML, setMobileHTML] = useState('');

  useEffect(() => {
    if (!editor) return;
    const updateMobile = () => setMobileHTML(generateMobileHTML(editor.document));
    editor.onChange(updateMobile);
    updateMobile();
  }, [editor]);

  /* ━━━ 라이브러리 블록 삽입 ━━━ */
  const insertBlock = useCallback((item: any) => {
    try {
      const cursorPos = editor.getTextCursorPosition();
      const currentBlock = cursorPos.block;
      const currentContent = currentBlock.content;
      const isEmpty = !currentContent || (Array.isArray(currentContent) && currentContent.length === 0) ||
        (Array.isArray(currentContent) && currentContent.every((c: any) => !c.text || c.text === ''));

      if (item.isTable) {
        const tableBlock = {
          type: 'table' as const,
          content: {
            type: 'tableContent' as const,
            rows: [
              { cells: [[{ type: 'text' as const, text: '항목', styles: {} }], [{ type: 'text' as const, text: '내용', styles: {} }], [{ type: 'text' as const, text: '대상', styles: {} }]] },
              { cells: [[{ type: 'text' as const, text: '', styles: {} }], [{ type: 'text' as const, text: '', styles: {} }], [{ type: 'text' as const, text: '', styles: {} }]] },
            ],
          },
        };
        if (isEmpty) {
          editor.updateBlock(currentBlock, tableBlock);
        } else {
          editor.insertBlocks([tableBlock], currentBlock, 'after');
        }
      } else {
        const newBlock = {
          type: item.block.type,
          props: item.block.props || {},
          content: item.block.content || [],
        };
        if (isEmpty) {
          editor.updateBlock(currentBlock, newBlock);
        } else {
          editor.insertBlocks([newBlock], currentBlock, 'after');
        }
      }
      setTimeout(() => editor.focus(), 30);
    } catch (e) {
      console.error('insertBlock error:', e);
    }
  }, [editor]);

  /* ━━━ 샘플 불러오기 ━━━ */
  const loadSample = useCallback(() => {
    try {
      const allBlocks = editor.document;
      editor.insertBlocks(SAMPLE_BLOCKS, allBlocks[0], 'before');
      const updatedDoc = editor.document;
      const trailingEmpties = updatedDoc.filter((b: any, i: number) => {
        if (i < SAMPLE_BLOCKS.length) return false;
        const cont = Array.isArray(b.content) ? b.content : [];
        return b.type === 'paragraph' && cont.length === 0;
      });
      if (trailingEmpties.length > 0) editor.removeBlocks(trailingEmpties);
      setTimeout(() => editor.focus(), 30);
    } catch (e) { console.error(e); }
  }, [editor]);

  /* ━━━ 초기화 ━━━ */
  const resetEditor = useCallback(() => {
    try {
      const allBlocks = editor.document;
      if (allBlocks.length > 1) editor.removeBlocks(allBlocks.slice(1));
      editor.updateBlock(allBlocks[0], { type: 'paragraph', props: {}, content: [] });
      setTimeout(() => editor.focus(), 30);
    } catch (e) { console.error(e); }
  }, [editor]);

  /* ━━━ Docs 내보내기 ━━━ */
  const exportDocs = useCallback(() => {
    const html = generateMobileHTML(editor.document);
    const blob = new Blob(['<!DOCTYPE html><html><head><meta charset="utf-8"><title>가이드</title><style>body{font-family:"Apple SD Gothic Neo",sans-serif;max-width:800px;margin:0 auto;padding:24px;}</style></head><body>' + html + '</body></html>'], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'guide.html'; a.click();
  }, [editor]);

  /* ━━━ CMS에 복사 ━━━ */
  const copyToCMS = useCallback(() => {
    navigator.clipboard.writeText(generateMobileHTML(editor.document))
      .then(() => alert('HTML이 클립보드에 복사되었습니다.'));
  }, [editor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Spoqa Han Sans Neo', 'Apple SD Gothic Neo', sans-serif" }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '46px', background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '22px', height: '22px', background: '#00c4b4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700 }}>✦</div>
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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 좌측 라이브러리 */}
        <aside style={{ width: '210px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e8e8e8', overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ padding: '0 14px 8px', fontSize: '11px', color: '#999', fontWeight: 600 }}>라이브러리</div>
          <div style={{ padding: '4px 14px 6px', fontSize: '11px', color: '#bbb', fontWeight: 500 }}>텍스트</div>
          {TEXT_ITEMS.map(item => (
            <div key={item.id} onMouseDown={(e) => { e.preventDefault(); insertBlock(item); }} style={libItemStyle}>
              <div style={{ ...libIconStyle, background: '#f0f0f0', color: '#666', fontSize: '11px', fontWeight: 700 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px 14px 6px', fontSize: '11px', color: '#bbb', fontWeight: 500 }}>배민 스타일</div>
          {BAEMIN_ITEMS.map(item => (
            <div key={item.id} onMouseDown={(e) => { e.preventDefault(); insertBlock(item); }} style={libItemStyle}>
              <div style={{ ...libIconStyle, background: '#f0f0f0', color: '#666', fontSize: item.icon.length > 2 ? '9px' : '11px', fontWeight: 700 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* 에디터 영역 */}
        <main style={{ flex: 1, background: '#ebebee', overflowY: 'auto', padding: '32px 24px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', minHeight: '600px', padding: '32px' }}>
            <BlockNoteView editor={editor} theme="light" />
          </div>
        </main>

        {/* 우측 모바일 미리보기 */}
        <aside style={{ width: '340px', flexShrink: 0, background: '#f5f5f5', borderLeft: '1px solid #e8e8e8', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px', alignSelf: 'flex-start' }}>모바일 미리보기</div>
          <div style={{ width: '300px', borderRadius: '36px', overflow: 'hidden', border: '8px solid #1a1a1a', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#fff', padding: '10px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>9:41</span>
              <span style={{ fontSize: '10px', color: '#333' }}>▪ ▪ ▪ WiFi</span>
            </div>
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
            <div style={{ padding: '16px', minHeight: '400px', fontSize: '14px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: mobileHTML || '<p style="color:#bbb;text-align:center;margin-top:40px;font-size:13px;">에디터에서 블록을 추가하면<br/>여기서 미리볼 수 있어요</p>' }} />
            <div style={{ background: '#fff', borderTop: '1px solid #f0f0f0', padding: '8px 0', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
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

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '13px', color: '#444', padding: '4px 8px', borderRadius: '4px', fontWeight: 500,
};

const libItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
};

const libIconStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '5px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
};
