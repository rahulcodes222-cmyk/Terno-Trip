import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface InclusionsExclusionsProps {
  inclusions: string[];
  exclusions: string[];
}

export default function InclusionsExclusions({
  inclusions,
  exclusions,
}: InclusionsExclusionsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Inclusions */}
      <div>
        <h4 className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" /> Included
        </h4>
        <ul className="space-y-2">
          {inclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusions */}
      <div>
        <h4 className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-400" /> Not Included
        </h4>
        <ul className="space-y-2">
          {exclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
