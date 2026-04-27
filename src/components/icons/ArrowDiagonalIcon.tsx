import { type SVGProps } from 'react';

export function ArrowDiagonalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0)">
        <path
          d="M3.02349 6.6872L14.631 3.4371C14.9126 3.35825 15.1721 3.61773 15.0932 3.89932L11.8431 15.5068C11.7482 15.8459 11.2806 15.879 11.1388 15.5567L8.70258 10.02C8.6648 9.9341 8.59622 9.86552 8.51036 9.82774L2.97357 7.39156C2.65131 7.24976 2.68445 6.78214 3.02349 6.6872Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
