interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export default function Marquee({ children, className = '', speed = 22 }: MarqueeProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-block animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <span className="inline-block">{children}</span>
        <span className="inline-block">{children}</span>
      </div>
    </div>
  );
}
