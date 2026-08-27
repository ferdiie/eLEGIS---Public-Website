import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

export default function CouncilorCard({ member }) {
  return (
    <Link
      to={`/council/member/${member.id}`}
      className="card group flex flex-col items-center gap-3 p-5 text-center transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-forest-600 ring-2 ring-forest-100 group-hover:ring-forest-300">
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-9 w-9" aria-hidden="true" />
        )}
      </span>
      <div>
        <p className="font-semibold text-ink">{member.full_name}</p>
        <p className="text-sm capitalize text-muted">{member.position}</p>
      </div>
      {member.term_period && (
        <span className="badge bg-forest-50 text-forest-700">{member.term_period}</span>
      )}
    </Link>
  );
}
