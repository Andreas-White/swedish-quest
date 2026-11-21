export function Icon({ d, size = 18, sw = 2 }: { d: string; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const I = {
  speaker: (s = 18) => <Icon size={s} d="M11 5 6 9H2v6h4l5 4V5z M15.5 8.5a5 5 0 0 1 0 7 M18.5 5.5a9.4 9.4 0 0 1 0 13" />,
  play: (s = 18) => <Icon size={s} d="M6 4l14 8-14 8V4z" />,
  pause: (s = 18) => <Icon size={s} d="M7 4h4v16H7z M13 4h4v16h-4z" />,
  stop: (s = 18) => <Icon size={s} d="M6 6h12v12H6z" />,
  lock: (s = 16) => <Icon size={s} d="M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4" />,
  check: (s = 18) => <Icon size={s} sw={2.5} d="M4 12.5l5 5L20 6.5" />,
  x: (s = 18) => <Icon size={s} sw={2.5} d="M6 6l12 12 M18 6L6 18" />,
  sun: (s = 18) => <Icon size={s} d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4" />,
  moon: (s = 18) => <Icon size={s} d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
  auto: (s = 18) => <Icon size={s} d="M12 2v20 M2 12h20" />,
  left: (s = 18) => <Icon size={s} sw={2.5} d="M15 5l-7 7 7 7" />,
  right: (s = 18) => <Icon size={s} sw={2.5} d="M9 5l7 7-7 7" />,
  trophy: (s = 18) => <Icon size={s} d="M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0V4z M7 6H4a2 2 0 0 0 2 4h1 M17 6h3a2 2 0 0 1-2 4h-1" />,
  flame: (s = 18) => <Icon size={s} d="M12 22c4 0 7-2.8 7-6.5 0-4-3-6-3-9-3 1-4 3-4 3S9 7 8 4C5 7 5 10 5 12c-1 1-1.5 2.5-1.5 3.5C3.5 19.2 8 22 12 22z" />,
  book: (s = 18) => <Icon size={s} d="M3 5a2 2 0 0 1 2-2h7v16H5a2 2 0 0 0-2 2z M21 5a2 2 0 0 0-2-2h-7v16h7a2 2 0 0 1 2 2z" />,
  home: (s = 18) => <Icon size={s} d="M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10" />,
  ear: (s = 18) => <Icon size={s} d="M6 10a6 6 0 0 1 12 0c0 3-2 4-2 6a4 4 0 0 1-8 0" />,
};
