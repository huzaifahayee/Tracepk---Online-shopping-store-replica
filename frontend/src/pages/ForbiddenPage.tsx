import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-[20vw] text-muted/15 leading-none">403</h1>
      <p className="font-display text-xl mt-2">ACCESS DENIED</p>
      <Link to="/" className="btn-primary mt-6">GO HOME →</Link>
    </div>
  );
}
