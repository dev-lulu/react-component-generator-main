import { useState } from 'react';

interface CodeViewProps {
  code: string;
  isStreaming?: boolean;
}

export function CodeView({ code, isStreaming }: CodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-panel">
      <div className="panel-header">
        <h3>
          코드
          {isStreaming && <span className="streaming-badge">생성 중</span>}
        </h3>
        <button className="btn-copy" onClick={handleCopy} disabled={isStreaming}>
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>
      <pre className={`code-block${isStreaming ? ' code-block--streaming' : ''}`}>
        <code>{code}</code>
        {isStreaming && <span className="code-cursor" />}
      </pre>
    </div>
  );
}
