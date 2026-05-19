import { useState, useEffect } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const { isStreaming } = component;
  const [activeTab, setActiveTab] = useState<Tab>(isStreaming ? 'code' : 'preview');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (!isStreaming && activeTab === 'code') {
      setActiveTab('preview');
    }
  }, [isStreaming]);

  const createdAt = component.createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayCode = isStreaming ? (component.streamingText ?? '') : component.code;
  const disableActions = isStreaming || isLoading;

  return (
    <div className={`component-card${isStreaming ? ' component-card--streaming' : ''}`}>
      <div className="card-header">
        <div className="card-title-group">
          <span>{createdAt}</span>
          <p className="card-prompt">{component.prompt}</p>
        </div>
        <div className="card-actions">
          {isStreaming && (
            <span className="streaming-indicator">
              <span className="streaming-dot" />
              스트리밍 중...
            </span>
          )}
          <button
            className="btn-refresh"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
            aria-label="미리보기 새로고침"
            disabled={disableActions}
          >
            ↻
          </button>
          <button
            className="btn-regenerate"
            onClick={() => onRegenerate(component.prompt)}
            disabled={disableActions}
          >
            {disableActions ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(component.id)}
            disabled={isStreaming}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <button
          className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
          disabled={isStreaming}
        >
          미리보기
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          코드{isStreaming && ' ▶'}
        </button>
      </div>
      <div className={`card-content${isStreaming ? ' card-content--streaming' : ''}`}>
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={component.code} />
        ) : (
          <CodeView code={displayCode} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}
