import Marquee from '@/components/common/Marquee';
import { useSettings } from '@/hooks/useSettings';

export default function AnnouncementBar() {
  const { data: settings } = useSettings();
  const text = settings?.announcement_text || 'FREE SHIPPING ON ORDERS OVER RS.10,000 ★ TRACE™';

  if (!text.trim()) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-primary z-[60] flex items-center overflow-hidden">
      <Marquee className="w-full">
        <span className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mx-4">
          {text}
        </span>
      </Marquee>
    </div>
  );
}
