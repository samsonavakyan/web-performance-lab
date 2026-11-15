import { BulletinNotice, useNoticeArrival } from './BulletinNotice';

export function Bulletin({ replay }: { replay: number }) {
  const isVisible = useNoticeArrival(replay);

  return (
    <div className="bulletin-slot">
      {isVisible ? <BulletinNotice /> : <div className="bulletin-placeholder" aria-hidden="true" />}
    </div>
  );
}
