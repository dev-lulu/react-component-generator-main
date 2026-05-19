import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: { id: Viewport; label: string; width: string; icon: string }[] = [
  { id: 'mobile',  label: '모바일',  width: '375px', icon: '📱' },
  { id: 'tablet',  label: '태블릿',  width: '768px', icon: '📲' },
  { id: 'desktop', label: '데스크탑', width: '100%',  icon: '🖥' },
];

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const current = VIEWPORTS.find((v) => v.id === viewport)!;

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-controls">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              className={`viewport-btn${viewport === v.id ? ' viewport-btn--active' : ''}`}
              onClick={() => setViewport(v.id)}
              title={`${v.label} (${v.width})`}
            >
              <span className="viewport-btn__icon">{v.icon}</span>
              <span className="viewport-btn__label">{v.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render-wrapper">
            <div
              className="preview-render"
              style={{ width: current.width, maxWidth: '100%' }}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
