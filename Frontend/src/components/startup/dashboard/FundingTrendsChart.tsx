import type { FC } from "react";
import { Card } from "antd";
import { Column } from "@ant-design/charts";
import type { DashboardStats } from "../../../interfaces/startup/dashboard";

interface Props {
  stats: DashboardStats;
  data: any[]; // Dữ liệu dạng {name: 'Project A', Goal: 1000, Raised: 500}
  formatCurrency: (amount: number) => string;
}

export const FundingTrendsChart: FC<Props> = ({ data, formatCurrency }) => {
  // Chuyển đổi dữ liệu sang định dạng phù hợp cho Grouped Column Chart của Ant Design Charts
  const chartData: any[] = [];
  data.forEach((item) => {
    chartData.push({
      name: item.name,
      type: "Goal",
      value: item.Goal,
    });
    chartData.push({
      name: item.name,
      type: "Raised",
      value: item.Raised,
    });
  });

  const config = {
    data: chartData,
    xField: "name",
    yField: "value",
    seriesField: "type",
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ["#e5e7eb", "#10b981"], // Goal màu xám, Raised màu xanh lá
    legend: {
      position: "top-right" as const,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: formatCurrency(datum.value),
      }),
    },
    label: {
      // Hiển thị giá trị trên cột nếu muốn, hoặc bỏ đi
      position: "middle",
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
  };

  return (
    <Card title="Funding Progress (Goal vs Raised)">
      {chartData.length > 0 ? (
        <Column {...config} height={300} />
      ) : (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "#6b7280" }}>No project data available</p>
        </div>
      )}
    </Card>
  );
};
