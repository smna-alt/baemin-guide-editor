'use client';

import { useState, useRef, useCallback } from 'react';

interface Block {
  id: string;
  type: string;
  content: string;
  title?: string;
  items?: string[];
}

const TEXT_ITEMS = [
  { type: 'h1', label: 'H1 대제목', desc: '22px Bold', preview: 'H1' },
  { type: 'h2', label: 'H2 소제목', desc: '19px Bold', preview: 'H2' },
  { type: 'h3', label: 'H3 세부제목', desc: '17px Bold', preview: 'H3' },
  { type: 'p', label: 'P 본문', desc: '16px Regular', preview: 'P' },
];

const STYLE_ITEMS = [
  { type: 'box-body', label: '박스·본문단독형' },
  { type: 'box-title-mixed', label: '박스·제목혼합형' },
  { type: 'box-body-sm', label: '박스·본문단독형(소)' },
  { type: 'box-title-mixed-sm', label: '박스·제목혼합형(소)' },
  { type: 'bullet-list', label: '불릿 목록' },
  { type: 'number-list', label: '번호 목록' },
  { type: 'data-table', label: '데이터 표' },
  { type: 'faq', label: 'FAQ' },
  { type: 'box-title', label: '박스·제목혼합' },
  { type: 'caption', label: '캡션' },
  { type: 'divider', label: '구분선' },
];

function renderBlockHTML(block: Block): string {
  switch (block.type) {
    case 'h1': return `<h1 style="font-size:22px;font-weight:700;line-height:1.4;margin-bottom:16px;color:#1a1a1a;">${block.content}</h1>`;
    case 'h2': return `<h2 style="font-size:19px;font-weight:700;line-height:1.4;margin-bottom:12px;color:#1a1a1a;">${block.content}</h2>`;
    case 'h3': return `<h3 style="font-size:17px;font-weight:700;line-height:1.4;margin-bottom:10px;color:#1a1a1a;">${block.content}</h3>`;
    case 'p': return `<p style="font-size:16px;line-height:1.7;margin-bottom:12px;color:#333;">${block.content}</p>`;
    case 'box-body': return `<div style="background:#f8f8f8;border-radius:8px;padding:20px;margin-bottom:16px;"><p style="font-size:15px;line-height:1.7;color:#333;">${block.content}</p></div>`;
    case 'box-title-mixed': return `<div style="background:#f8f8f8;border-radius:8px;padding:20px;margin-bottom:16px;"><strong style="display:block;font-size:16px;font-weight:700;margin-bottom:8px;">${block.title||'제목'}</strong><p style="font-size:15px;line-height:1.7;color:#333;">${block.content}</p></div>`;
    case 'box-body-sm': return `<div style="background:#f8f8f8;border-radius:6px;padding:14px 16px;margin-bottom:12px;"><p style="font-size:14px;line-height:1.6;color:#555;">${block.content}</p></div>`;
    case 'box-title-mixed-sm': return `<div style="background:#f8f8f8;border-radius:6px;padding:14px 16px;margin-bottom:12px;"><strong style="display:block;font-size:14px;font-weight:700;margin-bottom:6px;">${block.title||'제목'}</strong><p style="font-size:14px;line-height:1.6;color:#555;">${block.content}</p></div>`;
    case 'bullet-list': return `<ul style="padding-left:20px;margin-bottom:16px;">${(block.items||['항목 1','항목 2']).map(i=>`<li style="font-size:15px;line-height:1.7;color:#333;margin-bottom:4px;">${i}</li>`).join('')}</ul>`;
    case 'number-list': return `<ol style="padding-left:20px;margin-bottom:16px;">${(block.items||['항목 1','항목 2']).map(i=>`<li style="font-size:15px;line-height:1.7;color:#333;margin-bottom:4px;">${i}</li>`).join('')}</ol>`;
    case 'data-table': return `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;"><thead><tr><th style="border:1px solid #ddd;padding:10px;background:#f0f0f0;text-align:left;">항목</th><th style="border:1px solid #ddd;padding:10px;background:#f0f0f0;text-align:left;">내용</th></tr></thead><tbody><tr><td style="border:1px solid #ddd;padding:10px;">${block.content||'데이터'}</td><td style="border:1px solid #ddd;padding:10px;">값</td></tr></tbody></table>`;
    case 'faq': return `<div style="margin-bottom:16px;"><div style="background:#fff9e6;border-left:3px solid #ffb700;padding:14px 16px;margin-bottom:4px;"><strong style="font-size:15px;">Q. ${block.title||'질문'}</strong></div><div style="background:#f8f8f8;padding:14px 16px;font-size:14px;line-height:1.7;color:#555;">A. ${block.content}</div></div>`;
    case 'box-title': return `<div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin-bottom:16px;"><div style="background:#1a1a1a;padding:12px 16px;"><strong style="font-size:15px;color:#fff;">${block.title||'제목'}</strong></div><div style="padding:16px;font-size:14px;line-height:1.7;color:#333;">${block.content}</div></div>`;
    case 'caption': return `<p style="font-size:12px;color:#888;text-align:center;margin-bottom:12px;font-style:italic;">${block.content}</p>`;
    case 'divider': return `<hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;"/>`;
    default: return `<p>${block.content}</p>`;
  }
}

function getDefaultBlock(type: string): Block {
  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  const d: Record<string,Partial<Block>> = {
    h1:{content:'대제목을 입력하세요'},h2:{content:'소제목을 입력하세요'},h3:{content:'세부제목을 입력하세요'},
    p:{content:'본문 내용을 입력하세요.'},'box-body':{content:'박스 내용을 입력하세요.'},
    'box-title-mixed':{title:'박스 제목',content:'박스 본문을 입력하세요.'},
    'box-body-sm':{content:'작은 박스 내용을 입력하세요.'},
    'box-title-mixed-sm':{title:'소형 제목',content:'작은 박스 내용을 입력하세요.'},
    'bullet-list':{content:'',items:['불릿 항목 1','불릿 항목 2','불릿 항목 3']},
    'number-list':{content:'',items:['번호 항목 1','번호 항목 2','번호 항목 3']},
    'data-table':{content:'데이터 내용'},'faq':{title:'자주 묻는 질문',content:'답변 내용을 입력하세요.'},
    'box-title':{title:'박스 제목',content:'박스 내용을 입력하세요.'},
    'caption':{content:'캡션을 입력하세요'},'divider':{content:''},
  };
  return {id,type,content:'',...d[type]};
}

const SAMPLE: Block[] = [
  {id:'s1',type:'h1',content:'배달의민족 가이드 제목'},
  {id:'s2',type:'h2',content:'1. 서비스 소개'},
  {id:'s3',type:'p',content:'배달의민족은 국내 최대 배달 플랫폼으로, 음식점 사장님들의 매출 향상을 위한 다양한 서비스를 제공합니다.'},
  {id:'s4',type:'box-title-mixed',title:'핵심 포인트',content:'이 가이드를 통해 서비스를 효과적으로 활용하는 방법을 배울 수 있습니다.'},
  {id:'s5',type:'bullet-list',content:'',items:['할인 쿠폰 설정하기','메뉴 사진 등록하기','리뷰 관리하기']},
  {id:'s6',type:'faq',title:'쿠폰은 어떻게 등록하나요?',content:'사장님 앱 > 마케팅 > 쿠폰 메뉴에서 등록할 수 있습니다.'},
  {id:'s7',type:'divider',content:''},
  {id:'s8',type:'h2',content:'2. 시작하기'},
  {id:'s9',type:'number-list',content:'',items:['앱 설치','회원가입','가게 정보 등록','메뉴 등록']},
];

export default function BaeminEditor() {
  const [blocks,setBlocks]=useState<Block[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [copied,setCopied]=useState(false);

  const addBlock=(type:string)=>{
    const b=getDefaultBlock(type);
    setBlocks(p=>[...p,b]);
    setSelectedId(b.id);
  };
  const updateBlock=(id:string,field:string,value:string)=>setBlocks(p=>p.map(b=>b.id===id?{...b,[field]:value}:b));
  const updateItem=(id:string,idx:number,v:string)=>setBlocks(p=>p.map(b=>{
    if(b.id!==id)return b;
    const items=[...(b.items||[])];items[idx]=v;return{...b,items};
  }));
  const deleteBlock=(id:string)=>{setBlocks(p=>p.filter(b=>b.id!==id));setSelectedId(null);};
  const moveBlock=(id:string,dir:'up'|'down')=>setBlocks(p=>{
    const i=p.findIndex(b=>b.id===id);if(i===-1)return p;
    if(dir==='up'&&i===0)return p;if(dir==='down'&&i===p.length-1)return p;
    const a=[...p];const t=dir==='up'?i-1:i+1;[a[i],a[t]]=[a[t],a[i]];return a;
  });
  const loadSample=()=>{setBlocks(SAMPLE);setSelectedId(null);};
  const reset=()=>{setBlocks([]);setSelectedId(null);};
  const exportDocs=()=>{
    const html=blocks.map(renderBlockHTML).join('\n');
    const full=`<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<title>배민 가이드</title>\n<style>body{font-family:'Noto Sans KR',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;}</style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    const blob=new Blob([full],{type:'text/html'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download='baemin-guide.html';a.click();URL.revokeObjectURL(url);
  };
  const copyCMS=async()=>{
    await navigator.clipboard.writeText(blocks.map(renderBlockHTML).join('\n'));
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };
  const preview=blocks.map(renderBlockHTML).join('');

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:"'Noto Sans KR',sans-serif",background:'#f5f5f5'}}>
      {/* LEFT: LIBRARY */}
      <div style={{width:200,minWidth:200,background:'#fff',borderRight:'1px solid #e8e8e8',overflowY:'auto'}}>
        <div style={{padding:'16px 12px 8px',fontSize:11,fontWeight:700,color:'#888',letterSpacing:'0.05em',textTransform:'uppercase'}}>라이브러리</div>
        <div style={{padding:'0 8px 8px'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#aaa',padding:'6px 4px 4px',marginBottom:4}}>텍스트</div>
          {TEXT_ITEMS.map(item=>(
            <div key={item.type} onClick={()=>addBlock(item.type)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:6,cursor:'pointer',marginBottom:2}}
              onMouseEnter={e=>(e.currentTarget.style.background='#f5f5f5')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <span style={{width:28,height:28,background:'#f0f0f0',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#555',flexShrink:0}}>{item.preview}</span>
              <div><div style={{fontSize:12,fontWeight:600,color:'#1a1a1a',lineHeight:1.3}}>{item.label}</div><div style={{fontSize:10,color:'#aaa'}}>{item.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{padding:'0 8px 16px',borderTop:'1px solid #f0f0f0'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#aaa',padding:'10px 4px 4px',marginBottom:4}}>배민 스타일</div>
          {STYLE_ITEMS.map(item=>(
            <div key={item.type} onClick={()=>addBlock(item.type)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:6,cursor:'pointer',marginBottom:2}}
              onMouseEnter={e=>(e.currentTarget.style.background='#f5f5f5')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <span style={{width:28,height:28,background:'#fff9e6',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#ffb700',flexShrink:0}}>B</span>
              <div style={{fontSize:12,color:'#333'}}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: EDITOR */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:52,background:'#fff',borderBottom:'1px solid #e8e8e8',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#1a1a1a'}}>배민 가이드 에디터</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={loadSample} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #ddd',background:'#fff',fontSize:13,color:'#333',cursor:'pointer',fontFamily:'inherit'}}>샘플 불러오기</button>
            <button onClick={reset} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #ddd',background:'#fff',fontSize:13,color:'#333',cursor:'pointer',fontFamily:'inherit'}}>초기화</button>
            <button onClick={exportDocs} style={{padding:'6px 14px',borderRadius:6,border:'1px solid #ddd',background:'#fff',fontSize:13,color:'#333',cursor:'pointer',fontFamily:'inherit'}}>Docs 내보내기</button>
            <button onClick={copyCMS} style={{padding:'6px 16px',borderRadius:6,border:'none',background:copied?'#2da44e':'#00c4a7',fontSize:13,color:'#fff',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>
              {copied?'복사됨!':'CMS에 복사'}
            </button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'24px 32px'}}>
          {blocks.length===0?(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#aaa',textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:16}}>📝</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:8,color:'#999'}}>좌측 라이브러리에서 블록을 추가하세요</div>
              <div style={{fontSize:13,color:'#bbb'}}>텍스트, 배민 스타일 블록을 클릭하면 추가됩니다</div>
            </div>
          ):(
            <div style={{maxWidth:720,margin:'0 auto'}}>
              {blocks.map((block,idx)=>(
                <BlockEditor key={block.id} block={block} isSelected={selectedId===block.id}
                  onSelect={()=>setSelectedId(block.id)}
                  onUpdate={(f,v)=>updateBlock(block.id,f,v)}
                  onUpdateItem={(i,v)=>updateItem(block.id,i,v)}
                  onDelete={()=>deleteBlock(block.id)}
                  onMoveUp={()=>moveBlock(block.id,'up')}
                  onMoveDown={()=>moveBlock(block.id,'down')}
                  isFirst={idx===0} isLast={idx===blocks.length-1}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: MOBILE PREVIEW */}
      <div style={{width:280,minWidth:280,background:'#f0f0f0',borderLeft:'1px solid #e8e8e8',display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px'}}>
        <div style={{fontSize:11,fontWeight:700,color:'#888',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:16}}>모바일 미리보기</div>
        <div style={{position:'relative',width:220,background:'#1a1a1a',borderRadius:40,padding:'12px 8px',boxShadow:'0 20px 60px rgba(0,0,0,0.35),inset 0 0 0 2px #333'}}>
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:100,height:28,background:'#1a1a1a',borderRadius:'0 0 16px 16px',zIndex:10}}/>
          <div style={{background:'#fff',borderRadius:32,overflow:'hidden',height:440,display:'flex',flexDirection:'column'}}>
            <div style={{background:'#f8f8f8',padding:'28px 8px 6px',borderBottom:'1px solid #eee',flexShrink:0}}>
              <div style={{background:'#fff',borderRadius:6,padding:'3px 8px',fontSize:8,color:'#666',border:'1px solid #e0e0e0',textAlign:'center'}}>baeminbiz.com</div>
            </div>
            <div style={{background:'#fff',borderBottom:'1px solid #eee',display:'flex',padding:'0 4px',flexShrink:0}}>
              {['전체','장사소식','매출 상승','식자재'].map((tab,i)=>(
                <div key={tab} style={{flex:1,textAlign:'center',padding:'6px 2px',fontSize:8,color:i===0?'#00c4a7':'#999',borderBottom:i===0?'2px solid #00c4a7':'2px solid transparent',fontWeight:i===0?700:400}}>{tab}</div>
              ))}
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'10px'}}>
              {preview?(
                <div style={{fontSize:9,lineHeight:1.5}} dangerouslySetInnerHTML={{__html:preview}}/>
              ):(
                <div style={{color:'#ccc',fontSize:9,textAlign:'center',marginTop:40}}>에디터에서 블록을 추가하면<br/>여기서 미리볼 수 있어요</div>
              )}
            </div>
          </div>
          <div style={{height:20,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:60,height:4,background:'#555',borderRadius:2}}/>
          </div>
        </div>
        <div style={{marginTop:12,fontSize:10,color:'#aaa',textAlign:'center',lineHeight:1.5}}>iPhone 12 Pro · Safari<br/>배민외식업광장</div>
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block:Block;isSelected:boolean;onSelect:()=>void;
  onUpdate:(f:string,v:string)=>void;onUpdateItem:(i:number,v:string)=>void;
  onDelete:()=>void;onMoveUp:()=>void;onMoveDown:()=>void;isFirst:boolean;isLast:boolean;
}
function BlockEditor({block,isSelected,onSelect,onUpdate,onUpdateItem,onDelete,onMoveUp,onMoveDown,isFirst,isLast}:BlockEditorProps){
  const base:React.CSSProperties={position:'relative',marginBottom:12,borderRadius:8,border:isSelected?'2px solid #00c4a7':'2px solid transparent',background:'#fff',padding:16,cursor:'pointer'};
  const inp=(fs:number,fw=400):React.CSSProperties=>({width:'100%',border:'none',outline:'none',fontSize:fs,fontWeight:fw,fontFamily:"'Noto Sans KR',sans-serif",color:'#1a1a1a',background:'transparent',resize:'none' as const,lineHeight:1.5,padding:0});
  return(
    <div style={base} onClick={onSelect}>
      {isSelected&&(
        <div style={{position:'absolute',top:-1,right:-1,display:'flex',gap:2,background:'#00c4a7',borderRadius:'0 6px 0 6px',padding:'2px 4px'}}>
          <button onClick={e=>{e.stopPropagation();onMoveUp();}} disabled={isFirst} style={{background:'none',border:'none',color:'#fff',cursor:isFirst?'not-allowed':'pointer',opacity:isFirst?0.4:1,fontSize:12,padding:'0 2px'}}>↑</button>
          <button onClick={e=>{e.stopPropagation();onMoveDown();}} disabled={isLast} style={{background:'none',border:'none',color:'#fff',cursor:isLast?'not-allowed':'pointer',opacity:isLast?0.4:1,fontSize:12,padding:'0 2px'}}>↓</button>
          <button onClick={e=>{e.stopPropagation();onDelete();}} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:12,padding:'0 2px'}}>✕</button>
        </div>
      )}
      <div style={{fontSize:9,color:'#ccc',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.05em'}}>{block.type}</div>
      {block.type==='h1'&&<textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(22,700),minHeight:36}} rows={1} placeholder="대제목을 입력하세요"/>}
      {block.type==='h2'&&<textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(19,700),minHeight:32}} rows={1} placeholder="소제목을 입력하세요"/>}
      {block.type==='h3'&&<textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(17,700),minHeight:28}} rows={1} placeholder="세부제목을 입력하세요"/>}
      {block.type==='p'&&<textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(16),minHeight:60}} rows={3} placeholder="본문 내용을 입력하세요"/>}
      {(block.type==='box-body'||block.type==='box-body-sm')&&(
        <div style={{background:'#f8f8f8',borderRadius:6,padding:12}}>
          <textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(14),background:'transparent',minHeight:48}} rows={2} placeholder="박스 내용을 입력하세요"/>
        </div>
      )}
      {(block.type==='box-title-mixed'||block.type==='box-title-mixed-sm'||block.type==='box-title')&&(
        <div style={{background:'#f8f8f8',borderRadius:6,overflow:'hidden'}}>
          {block.type==='box-title'?<div style={{background:'#1a1a1a',padding:'8px 12px'}}><input value={block.title||''} onChange={e=>onUpdate('title',e.target.value)} style={{...inp(14,700),color:'#fff'}} placeholder="제목"/></div>:<input value={block.title||''} onChange={e=>onUpdate('title',e.target.value)} style={{...inp(14,700),padding:'10px 12px 4px'}} placeholder="제목"/>}
          <div style={{padding:'4px 12px 10px'}}><textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(13),background:'transparent',minHeight:48}} rows={2} placeholder="내용을 입력하세요"/></div>
        </div>
      )}
      {(block.type==='bullet-list'||block.type==='number-list')&&(
        <div>
          {(block.items||[]).map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:4}}>
              <span style={{flexShrink:0,marginTop:4,color:'#555'}}>{block.type==='bullet-list'?'•':`${i+1}.`}</span>
              <input value={item} onChange={e=>onUpdateItem(i,e.target.value)} style={{...inp(14),flex:1}} placeholder={`항목 ${i+1}`}/>
            </div>
          ))}
          <button onClick={()=>onUpdateItem((block.items||[]).length,'새 항목')} style={{fontSize:12,color:'#00c4a7',background:'none',border:'none',cursor:'pointer',padding:0,marginTop:4}}>+ 항목 추가</button>
        </div>
      )}
      {block.type==='data-table'&&(
        <div style={{border:'1px solid #e0e0e0',borderRadius:6,overflow:'hidden'}}>
          <div style={{background:'#f0f0f0',padding:'8px 12px',fontSize:12,fontWeight:600,color:'#555'}}>데이터 표</div>
          <div style={{padding:12}}><textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(13),minHeight:48}} rows={2} placeholder="표 내용을 입력하세요"/></div>
        </div>
      )}
      {block.type==='faq'&&(
        <div>
          <div style={{background:'#fff9e6',borderLeft:'3px solid #ffb700',padding:'10px 12px',marginBottom:4}}>
            <input value={block.title||''} onChange={e=>onUpdate('title',e.target.value)} style={{...inp(14,600),color:'#1a1a1a'}} placeholder="Q. 질문을 입력하세요"/>
          </div>
          <div style={{background:'#f8f8f8',padding:'10px 12px'}}>
            <textarea value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(13),minHeight:48,background:'transparent'}} rows={2} placeholder="A. 답변을 입력하세요"/>
          </div>
        </div>
      )}
      {block.type==='caption'&&<input value={block.content} onChange={e=>onUpdate('content',e.target.value)} style={{...inp(12),color:'#888',textAlign:'center'}} placeholder="캡션을 입력하세요"/>}
      {block.type==='divider'&&<hr style={{border:'none',borderTop:'1px dashed #ddd',margin:'4px 0'}}/>}
    </div>
  );
}
