import { Card } from "@/components/ui/card";

export function CompactKpiCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card className="flex h-[104px] flex-col justify-center rounded-xl p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}