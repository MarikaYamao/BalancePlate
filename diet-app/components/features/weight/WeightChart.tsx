'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import type { WeightLog } from '@/types';

interface WeightChartProps {
  weightLogs: WeightLog[];
  daysToShow: number;
}

export function WeightChart({ weightLogs, daysToShow }: WeightChartProps) {
  const chartData = useMemo(() => {
    // 日付ごとにグループ化して最新の記録を取得
    const dataByDate = weightLogs.reduce((acc, log) => {
      const date = log.dateKey;
      if (!acc[date] || new Date(log.timestamp) > new Date(acc[date].timestamp)) {
        acc[date] = log;
      }
      return acc;
    }, {} as Record<string, WeightLog>);

    // 日付順にソートして最新N日分を取得
    const sortedData = Object.values(dataByDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-daysToShow);

    return sortedData.map(log => ({
      date: new Date(log.timestamp).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      }),
      weight: log.weight,
      fullDate: log.timestamp,
      note: log.note
    }));
  }, [weightLogs, daysToShow]);

  if (chartData.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚖️</div>
          <p className="text-gray-600 mb-2">体重の記録がありません</p>
          <p className="text-sm text-gray-500">体重を記録すると、ここに推移グラフが表示されます</p>
        </div>
      </Card>
    );
  }

  // 統計情報を計算
  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const latestWeight = weights[weights.length - 1];
  const previousWeight = weights.length > 1 ? weights[weights.length - 2] : null;
  const weightChange = previousWeight ? latestWeight - previousWeight : 0;

  // Y軸の範囲を設定（少し余裕を持たせる）
  const weightRange = maxWeight - minWeight;
  const yAxisMin = minWeight - (weightRange * 0.1) - 1;
  const yAxisMax = maxWeight + (weightRange * 0.1) + 1;

  const formatTooltip = (value: any, name?: string) => {
    if (name === 'weight') {
      return [`${value}kg`, '体重'];
    }
    return [value, name];
  };

  const formatLabel = (label: any, payload?: any) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload;
      return new Date(data.fullDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
    return String(label);
  };

  return (
    <div className="space-y-4">
      {/* サマリー統計 */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{latestWeight}kg</div>
              <div className="text-xs text-gray-600">最新</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${weightChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)}kg
              </div>
              <div className="text-xs text-gray-600">前回比</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{chartData.length}</div>
              <div className="text-xs text-gray-600">記録日数</div>
            </div>
          </div>
        </div>
      </Card>

      {/* グラフ */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-4">体重推移グラフ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                />
                <YAxis 
                  domain={[yAxisMin, yAxisMax]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* 記録履歴 */}
      {chartData.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-4">記録履歴</h3>
            <div className="space-y-3">
              {[...chartData].reverse().slice(0, 10).map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">⚖️</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{data.date}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(data.fullDate).toLocaleDateString('ja-JP', { weekday: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{data.weight}kg</div>
                    {data.note && (
                      <div className="text-xs text-gray-500 max-w-20 truncate">{data.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}