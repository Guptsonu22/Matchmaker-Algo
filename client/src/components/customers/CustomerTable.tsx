import { useNavigate } from 'react-router-dom';
import type { Client } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { JourneyBadge, VerificationBadge } from '@/components/common/Badge';
import { getAge, formatINR, formatHeight, MARITAL_STATUS_LABEL } from '@/utils/formatters';

interface CustomerTableProps {
  customers: Client[];
  onSelectCustomer?: (customer: Client) => void;
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-brand-border bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Customer</th>
              <th scope="col" className="px-4 py-3.5">Age & Height</th>
              <th scope="col" className="px-4 py-3.5">Location</th>
              <th scope="col" className="px-4 py-3.5">Profession & Income</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5">Verification</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {customers.map((c) => {
              const age = getAge(c.dob);
              return (
                <tr
                  key={c._id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/customers/${c._id}`)}
                >
                  {/* Name + Avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        seed={c.avatarSeed}
                        gender={c.gender}
                        name={c.fullName}
                        size="md"
                      />
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-brand-accent transition-colors flex items-center gap-1.5">
                          {c.fullName}
                          <span className="text-xs text-gray-400 font-normal">
                            ({c.gender === 'male' ? 'M' : 'F'})
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">ID: {c.profileId}</p>
                      </div>
                    </div>
                  </td>

                  {/* Age & Height */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-medium">{age} yrs</div>
                    <div className="text-xs text-gray-500">{formatHeight(c.heightCm)}</div>
                  </td>

                  {/* Location & Religion */}
                  <td className="px-4 py-4">
                    <div className="text-gray-900">{c.city}, {c.state}</div>
                    <div className="text-xs text-gray-500">
                      {c.religion} {c.caste ? `• ${c.caste}` : ''}
                    </div>
                  </td>

                  {/* Profession & Income */}
                  <td className="px-4 py-4">
                    <div className="text-gray-900 truncate max-w-[180px]">{c.occupation}</div>
                    <div className="text-xs text-gray-500">{formatINR(c.annualIncomeINR)} / yr</div>
                  </td>

                  {/* Journey Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <JourneyBadge status={c.journeyStatus} />
                    <div className="text-[11px] text-gray-400 mt-1">
                      {MARITAL_STATUS_LABEL[c.maritalStatus]}
                    </div>
                  </td>

                  {/* Verification Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <VerificationBadge status={c.verificationStatus} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${c._id}/matches`);
                      }}
                      className="btn-primary text-xs py-1.5 px-3 mr-2 bg-rose-gold hover:bg-rose-600"
                      title="View recommended matches"
                    >
                      Find Matches
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${c._id}`);
                      }}
                      className="btn-secondary text-xs py-1.5 px-2.5 text-gray-600"
                      title="View full biodata"
                    >
                      Biodata
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
