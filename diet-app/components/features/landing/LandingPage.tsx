'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, radius } from '@/lib/design-tokens';

export const LandingPage = () => {
  const features = [
    {
      icon: '🔒',
      title: 'プライバシー重視',
      description: 'すべてのデータはローカルに暗号化保存。あなたの情報は端末内で安全に管理されます。'
    },
    {
      icon: '🤖',
      title: 'AI食事提案',
      description: 'あなたの体質と生活習慣に合わせて、3つのプラン（A/B/C）を毎日提案します。'
    },
    {
      icon: '📱',
      title: 'オフライン対応',
      description: 'PWA対応でインターネットに繋がらない場所でも、安心して記録を続けられます。'
    },
    {
      icon: '💝',
      title: 'やさしいアプローチ',
      description: '無理をしないことを前提に設計。記録しない日があっても全然OK。自分のペースで。'
    },
    {
      icon: '📊',
      title: 'シンプルな記録',
      description: 'テキストで食事を記録するだけ。複雑な計算や入力は必要ありません。'
    },
    {
      icon: '🌟',
      title: '体質を理解',
      description: '40種類以上の体質・習慣タグで、あなた自身の傾向を理解し、最適な提案を受けられます。'
    }
  ];

  const userFlowSteps = [
    {
      step: '1',
      title: '体質・習慣を設定',
      description: '40種類以上のタグから、あなたの体質や生活習慣に当てはまるものを選択',
      color: colors.brand.primary
    },
    {
      step: '2',
      title: '今日のコンディション',
      description: '起動時に軽く今日の体調をチェック（スキップも可能）',
      color: colors.brand.secondary
    },
    {
      step: '3',
      title: 'AI食事プラン提案',
      description: 'A（しっかり）/B（バランス）/C（最低限）の3つのプランから選択',
      color: colors.accent.lavender
    },
    {
      step: '4',
      title: '食事記録とフィードバック',
      description: 'テキストで簡単に記録、AIから優しいフィードバックを受け取る',
      color: colors.semantic.success
    }
  ];

  return (
    <div style={{ backgroundColor: colors.bg.primary }} className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
            opacity: 0.03
          }}
        />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div 
                className="inline-flex items-center justify-center w-20 h-20 mb-6"
                style={{ 
                  backgroundColor: colors.bg.surface,
                  borderRadius: radius.xl,
                  boxShadow: `0 8px 32px ${colors.shadow.lg}`
                }}
              >
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ 
                  color: colors.text.primary,
                  lineHeight: typography.lineHeight.tight
                }}
              >
                やさしい<span style={{ color: colors.brand.primary }}>ダイエット</span>
              </h1>
              <p 
                className="text-xl md:text-2xl mb-8"
                style={{ 
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.relaxed
                }}
              >
                体質と習慣に寄り添う<br className="md:hidden" />パーソナル ダイエット支援アプリ
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                style={{
                  backgroundColor: colors.brand.primary,
                  color: colors.text.inverse,
                  padding: `${spacing.lg} ${spacing['2xl']}`,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.semibold,
                  borderRadius: radius.full,
                  boxShadow: `0 4px 16px ${colors.shadow.md}`,
                  border: 'none'
                }}
                className="hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                onClick={() => window.location.href = '/onboarding'}
              >
                今すぐ始める
              </Button>
              <Button
                style={{
                  backgroundColor: 'transparent',
                  color: colors.brand.primary,
                  border: `2px solid ${colors.brand.primary}`,
                  padding: `${spacing.lg} ${spacing['2xl']}`,
                  fontSize: typography.size.lg,
                  borderRadius: radius.full
                }}
                className="hover:bg-opacity-5 transition-all duration-200"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                特徴を見る
              </Button>
            </div>

            {/* 信頼性指標 */}
            <div 
              className="inline-flex items-center gap-6 px-6 py-3 rounded-full text-sm"
              style={{ 
                backgroundColor: colors.bg.surface,
                border: `1px solid ${colors.border.light}`,
                color: colors.text.secondary
              }}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.semantic.success }}></span>
                プライバシー保護
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.semantic.success }}></span>
                オフライン対応
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.semantic.success }}></span>
                無料で利用
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" style={{ padding: `${spacing['4xl']} 0` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              なぜ<span style={{ color: colors.brand.primary }}>やさしい</span>のか
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ 
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}
            >
              従来のダイエットアプリの「頑張らなくてはいけない」プレッシャーを取り除き、<br />
              あなたのペースで続けられる設計になっています。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="h-full transition-all duration-300 hover:scale-105"
                padding="large"
                shadow="md"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 
                    className="text-xl font-semibold mb-3"
                    style={{ 
                      color: colors.text.primary,
                      fontWeight: typography.weight.semibold
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    style={{ 
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.relaxed
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section style={{ 
        backgroundColor: colors.bg.surface,
        padding: `${spacing['4xl']} 0` 
      }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: colors.text.primary }}
            >
              簡単4ステップ
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ 
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}
            >
              複雑な設定は不要。今日から始められます。
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {userFlowSteps.map((step, index) => (
              <div key={index} className="flex items-start mb-12 last:mb-0">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-6"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>
                <div className="flex-grow pt-2">
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ 
                      color: colors.text.primary,
                      fontWeight: typography.weight.semibold
                    }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    style={{ 
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.relaxed
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section style={{ 
        background: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.secondary} 100%)`,
        padding: `${spacing['4xl']} 0` 
      }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: colors.text.inverse }}
            >
              今日から始める<br />やさしいダイエット
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ 
                color: colors.text.inverse,
                opacity: 0.9,
                lineHeight: typography.lineHeight.relaxed
              }}
            >
              無理をしない。比較しない。自分のペースで。<br />
              あなたの体質に合った食事提案を今すぐ受け取りましょう。
            </p>
            
            <Button
              style={{
                backgroundColor: colors.bg.surface,
                color: colors.brand.primary,
                padding: `${spacing.lg} ${spacing['2xl']}`,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                borderRadius: radius.full,
                border: 'none',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.15)`
              }}
              className="hover:scale-105 transition-all duration-200 transform"
              onClick={() => window.location.href = '/onboarding'}
            >
              無料で始める
            </Button>
            
            <p 
              className="mt-4 text-sm"
              style={{ 
                color: colors.text.inverse,
                opacity: 0.7
              }}
            >
              アカウント登録不要・すぐに利用開始
            </p>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer style={{ 
        backgroundColor: colors.bg.primary,
        borderTop: `1px solid ${colors.border.light}`,
        padding: `${spacing['2xl']} 0`
      }}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">🍽️</span>
            <span 
              className="text-xl font-semibold"
              style={{ color: colors.text.primary }}
            >
              やさしいダイエット
            </span>
          </div>
          <p style={{ color: colors.text.tertiary }}>
            体質と習慣に寄り添うパーソナル ダイエット支援アプリ
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <button 
              style={{ color: colors.text.tertiary }}
              className="hover:opacity-70 transition-opacity"
              onClick={() => window.location.href = '/privacy'}
            >
              プライバシーポリシー
            </button>
            <button 
              style={{ color: colors.text.tertiary }}
              className="hover:opacity-70 transition-opacity"
              onClick={() => window.location.href = '/terms'}
            >
              利用規約
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};