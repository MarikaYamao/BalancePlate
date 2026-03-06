"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import type { WeightLog } from "@/types";

interface WeightHistoryProps {
  weightLogs: WeightLog[];
  isLoading?: boolean;
}

export function WeightHistory({
  weightLogs,
  isLoading = false,
}: WeightHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "all"
  >("30d");

  // 期間でフィルタリング
  const filteredLogs = useMemo(() => {
    if (selectedPeriod === "all") return weightLogs;

    const days =
      selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return weightLogs.filter((log) => new Date(log.timestamp) >= cutoffDate);
  }, [weightLogs, selectedPeriod]);

  // 統計計算
  const stats = useMemo(() => {
    if (filteredLogs.length === 0) return null;

    const weights = filteredLogs.map((log) => log.weight);
    const sortedLogs = filteredLogs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return {
      count: filteredLogs.length,
      latest: weights[weights.length - 1],
      min: Math.min(...weights),
      max: Math.max(...weights),
      average:
        Math.round(
          (weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10,
        ) / 10,
      change:
        sortedLogs.length > 1
          ? Math.round(
              (sortedLogs[sortedLogs.length - 1].weight -
                sortedLogs[0].weight) *
                10,
            ) / 10
          : 0,
    };
  }, [filteredLogs]);

  // ユーティリティ関数を最初に定義
  const formatDate = (timestamp: Date | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: Date | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimingIcon = (timing?: string) => {
    switch (timing) {
      case "morning":
        return "🌅";
      case "night":
        return "🌙";
      default:
        return "⏰";
    }
  };

  const periodOptions = [
    { value: "7d" as const, label: "7日" },
    { value: "30d" as const, label: "30日" },
    { value: "90d" as const, label: "90日" },
    { value: "all" as const, label: "全期間" },
  ];

  // Recharts用のグラフデータ
  const chartData = useMemo(() => {
    if (filteredLogs.length === 0) return { hasData: false, data: [] };

    // 選択された期間の開始日と終了日を計算
    const today = new Date();
    let periodStartDate: Date;
    let periodEndDate = today;

    switch (selectedPeriod) {
      case "7d":
        periodStartDate = new Date(today);
        periodStartDate.setDate(periodStartDate.getDate() - 6); // 今日を含めて7日
        break;
      case "30d":
        periodStartDate = new Date(today);
        periodStartDate.setDate(periodStartDate.getDate() - 29); // 今日を含めて30日
        break;
      case "90d":
        periodStartDate = new Date(today);
        periodStartDate.setDate(periodStartDate.getDate() - 89); // 今日を含めて90日
        break;
      case "all":
      default:
        // 全期間の場合は記録のある期間を使用
        const sortedLogs = filteredLogs.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        if (sortedLogs.length === 0) return { hasData: false, data: [] };
        periodStartDate = new Date(sortedLogs[0].dateKey);
        periodEndDate = new Date(sortedLogs[sortedLogs.length - 1].dateKey);
        // 今日まで延長
        if (periodEndDate < today) {
          periodEndDate = today;
        }
        break;
    }

    const startDateKey = periodStartDate.toISOString().split("T")[0];
    const endDateKey = periodEndDate.toISOString().split("T")[0];

    // 日付順にソート
    const sortedLogs = filteredLogs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // 各日の最新の体重を取得
    const dailyMap = new Map<string, WeightLog>();
    sortedLogs.forEach((log) => {
      const dateKey = log.dateKey;
      const existing = dailyMap.get(dateKey);
      if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
        dailyMap.set(dateKey, log);
      }
    });

    // 期間内のすべての日付を生成
    const allDates = [];
    let currentDate = new Date(periodStartDate);

    while (currentDate <= periodEndDate) {
      allDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (allDates.length === 0) return { hasData: false, data: [] };

    // 記録の中で最も古い体重を初期値として使用
    const availableLogs = Array.from(dailyMap.values()).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey),
    );
    let defaultWeight = availableLogs.length > 0 ? availableLogs[0].weight : 60; // フォールバック値

    // Recharts用のデータ構造に変換
    let lastKnownWeight = defaultWeight;
    let lastKnownLog: WeightLog | null = null;
    const chartData = allDates.map((dateKey) => {
      const existingLog = dailyMap.get(dateKey);
      if (existingLog) {
        lastKnownWeight = existingLog.weight;
        lastKnownLog = existingLog;
        return {
          date: dateKey,
          weight: existingLog.weight,
          isActual: true,
          displayDate: formatDate(existingLog.timestamp),
          sourceLog: existingLog,
        };
      } else {
        // 記録がない日は前回の体重を維持
        return {
          date: dateKey,
          weight: lastKnownWeight,
          isActual: false,
          displayDate: formatDate(new Date(dateKey)),
          sourceLog: lastKnownLog,
        };
      }
    });

    return {
      hasData: true,
      data: chartData,
      startDate: startDateKey,
      endDate: endDateKey,
      actualRecordCount: availableLogs.length,
      totalDays: allDates.length,
    };
  }, [filteredLogs, selectedPeriod]);

  // カスタムドットコンポーネント（実際の記録のみ表示）
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.isActual) return null; // 実測値のみ表示

    return (
      <Dot
        cx={cx}
        cy={cy}
        r={3} // サイズを小さく
        fill="#ec4899"
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (weightLogs.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-6xl opacity-30">⚖️</div>
        <p className="text-gray-500">まだ体重記録がありません</p>
        <p className="text-sm text-gray-400">
          体重を記録してグラフを見てみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 期間選択とエクスポート */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-lg
                transition-all duration-200
                ${
                  selectedPeriod === option.value
                    ? "bg-pink-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rechartsグラフ */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span>📈</span>
          体重グラフ
        </h3>

        {!chartData.hasData ? (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2 opacity-30">📊</div>
              <p className="font-medium">記録なし</p>
              <p className="text-sm">体重を記録するとグラフが表示されます</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.data}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={["dataMin - 0.5", "dataMax + 0.5"]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => {
                      if (value === undefined) return ["", ""];
                      return [`${value}kg`, ""];
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("ja-JP");
                    }}
                    separator=""
                    contentStyle={{
                      backgroundColor: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* グラフ情報と補間説明 */}
            <div className="mt-4 space-y-1">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>
                  {selectedPeriod === "all"
                    ? `全期間 (${chartData.totalDays}日間)`
                    : `${periodOptions.find((opt) => opt.value === selectedPeriod)?.label} (${chartData.totalDays}日間)`}
                </span>
                <span>記録: {chartData.actualRecordCount}日</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 記録一覧 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span>📋</span>
          記録一覧
          <span className="text-sm font-normal text-gray-500">
            (
            {selectedPeriod === "all"
              ? "全期間"
              : periodOptions.find((opt) => opt.value === selectedPeriod)
                  ?.label}
            )
          </span>
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )
            .map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-pink-200 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getTimingIcon(log.measurementTiming)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">
                      {log.weight}kg
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {log.note && (
                    <div className="text-sm text-gray-600 max-w-32 truncate">
                      📝 {log.note}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {log.measurementTiming === "morning"
                      ? "朝"
                      : log.measurementTiming === "night"
                        ? "夜"
                        : "その他"}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
