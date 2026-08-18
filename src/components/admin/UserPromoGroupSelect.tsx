import { useQuery } from '@tanstack/react-query';
import { Select } from '@telegram-apps/telegram-ui';
import { listPromoGroups } from '../../api/admin';

interface UserPromoGroupSelectProps {
  value: number | null;
  onChange: (groupId: number | null) => Promise<void>;
}

export default function UserPromoGroupSelect({ value, onChange }: UserPromoGroupSelectProps) {
  const { data } = useQuery({ queryKey: ['admin', 'promo-groups'], queryFn: listPromoGroups });

  return (
    <Select
      header="Промогруппа"
      value={value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    >
      <option value="">Без скидки</option>
      {data?.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name} (-{group.discount_percent}%)
        </option>
      ))}
    </Select>
  );
}
