import { useQuery } from '@tanstack/react-query';
import { Select, Text } from '@gravity-ui/uikit';
import { listPromoGroups } from '../../api/admin';

interface UserPromoGroupSelectProps {
  value: number | null;
  onChange: (groupId: number | null) => Promise<void>;
}

export default function UserPromoGroupSelect({ value, onChange }: UserPromoGroupSelectProps) {
  const { data } = useQuery({ queryKey: ['admin', 'promo-groups'], queryFn: listPromoGroups });

  return (
    <div className="flex flex-col gap-1">
      <Text variant="caption-2" color="secondary">
        Промогруппа
      </Text>
      <Select
        value={[value === null ? '' : String(value)]}
        onUpdate={(values) => onChange(values[0] ? Number(values[0]) : null)}
        width="max"
      >
        {[
          <Select.Option key="none" value="">
            Без скидки
          </Select.Option>,
          ...(data ?? []).map((group) => (
            <Select.Option key={group.id} value={String(group.id)}>
              {group.name} (-{group.discount_percent}%)
            </Select.Option>
          )),
        ]}
      </Select>
    </div>
  );
}
