import { type SVGProps } from 'react';

export function OriginMarkerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div
      className="origin-marker-root"
      style={{
        position: 'relative',
        width: '3rem',
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <style>{`
        .origin-marker-pulse {
          position: absolute;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          background: #FFEE02;
          opacity: 0.4;
          animation: origin-marker-radar 2.5s ease-out infinite;
          transform-origin: center center;
        }

        .origin-marker-svg {
          position: relative;
          z-index: 1;
          width: 1.5rem;
          height: 1.5rem;
        }

        @keyframes origin-marker-radar {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          66.66% {
            transform: scale(2);
            opacity: 0;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
      <span className="origin-marker-pulse" />
      <svg
        className="origin-marker-svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="12" cy="12" r="10" fill="#FFEE02" />
        <circle cx="12" cy="12" r="10" stroke="#333000" strokeWidth="4" />
      </svg>
    </div>
  );
}
