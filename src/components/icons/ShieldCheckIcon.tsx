import { type SVGProps } from 'react';

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 15.5279V2.6C4 2.26863 4.26863 2 4.6 2H19.4C19.7314 2 20 2.26863 20 2.6V15.5279C20 17.043 19.144 18.428 17.7889 19.1056L12.2683 21.8658C12.0994 21.9503 11.9006 21.9503 11.7317 21.8658L6.21115 19.1056C4.85601 18.428 4 17.043 4 15.5279Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5L11.5 13.5L16.5 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
