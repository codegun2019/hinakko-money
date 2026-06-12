import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { useTranslation } from "~/lib/i18n";

interface ChartEntry {
  name:  string;
  value: number;
  color: string;
}

interface Props {
  chartData:    ChartEntry[];
  totalExpense: number;
}

export default function CategoryChart({ chartData, totalExpense }: Props) {
  const fmt = useFormatCurrency();
  const { t } = useTranslation();

  return (
    <div className="card-surface mx-4 mt-3 px-4 py-5">
      <p className="text-label text-fg-muted mb-4">{t("categories.chartTitle")}</p>
      <div className="relative category-chart-wrap h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="var(--color-border-subtle)"
              strokeWidth={1}
              animationDuration={600}
              animationBegin={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [fmt(value), ""]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "var(--shadow-card-hover)",
                fontSize: "0.8125rem",
                backgroundColor: "var(--color-card)",
                color: "var(--color-fg)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: "var(--color-fg)", padding: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-label text-fg-muted">{t("categories.chartTotal")}</p>
          <p className="text-title text-fg tabular-nums">{fmt(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
}
