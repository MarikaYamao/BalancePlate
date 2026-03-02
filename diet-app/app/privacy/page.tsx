'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. はじめに</h2>
              <p>
                「やさしいダイエット」（以下、「本アプリ」といいます）は、
                お客様のプライバシーを最優先に考えて設計されています。
                本プライバシーポリシーでは、本アプリがお客様の情報をどのように取り扱うかについて説明します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. プライバシーファーストの設計</h2>
              <p className="mb-3">
                本アプリは「ローカルファースト」の設計思想を採用しています：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>データは端末内に保存</strong>：
                  体質情報、食事記録、体重データなど、全ての個人データはお客様の端末内（ブラウザのIndexedDB）にのみ保存されます
                </li>
                <li>
                  <strong>サーバーへの送信なし</strong>：
                  当社のサーバーには個人を特定できる情報は一切送信・保存されません
                </li>
                <li>
                  <strong>暗号化による保護</strong>：
                  端末内のデータはWeb Crypto API（AES-GCM 256bit）により暗号化されています
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. 収集する情報</h2>
              
              <h3 className="text-lg font-medium mb-2 mt-4">3.1 お客様が入力する情報</h3>
              <p>以下の情報を端末内にのみ保存します：</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>体質・生活習慣の設定（体質タグ、活動レベル等）</li>
                <li>ダイエット目標（目標体重、期間等）</li>
                <li>日々の体調記録</li>
                <li>食事記録</li>
                <li>体重記録</li>
                <li>冷蔵庫の在庫情報</li>
                <li>買い物リスト</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">3.2 自動的に収集される情報</h3>
              <p>本アプリは以下の情報を収集しません：</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>IPアドレス</li>
                <li>位置情報</li>
                <li>デバイス識別子</li>
                <li>クッキー（認証や個人追跡目的）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. 情報の利用目的</h2>
              <p>お客様の情報は以下の目的でのみ、端末内で処理されます：</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>パーソナライズされた食事提案の生成</li>
                <li>体重推移のグラフ表示</li>
                <li>体調に応じたアドバイスの提供</li>
                <li>買い物リストの作成支援</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. AI機能について</h2>
              <p className="mb-3">
                本アプリのAI機能（食事提案・アドバイス）を利用する際の情報の取り扱い：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>OpenAI APIの利用</strong>：
                  AI機能使用時のみ、食事内容や体調情報がOpenAI社のAPIに送信されます
                </li>
                <li>
                  <strong>匿名化された送信</strong>：
                  氏名、メールアドレス等の個人を特定する情報は含まれません
                </li>
                <li>
                  <strong>一時的な処理</strong>：
                  OpenAI社のデータ保持ポリシーに従い、送信データは30日後に削除されます
                </li>
                <li>
                  <strong>学習への不使用</strong>：
                  APIを通じて送信されたデータは、OpenAIのモデル学習には使用されません
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. データの共有</h2>
              <p>
                本アプリは、お客様の個人データを第三者と共有することはありません。
                ただし、以下の場合を除きます：
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>お客様がAI機能を利用した場合のOpenAI APIへの限定的な送信</li>
                <li>法令に基づく開示要請があった場合（ただし、当社はお客様のデータを保有していません）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. データの削除</h2>
              <p className="mb-3">
                お客様はいつでも自分のデータを削除できます：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>設定画面の「データリセット」機能で全データを削除可能</li>
                <li>ブラウザのデータクリア機能でも削除可能</li>
                <li>アプリをアンインストール（PWAの場合）すると自動的に削除</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. データのバックアップ</h2>
              <p>
                お客様自身でデータのバックアップとリストアが可能です：
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>暗号化されたJSONファイルとしてエクスポート</li>
                <li>パスワード保護されたバックアップファイル</li>
                <li>お客様が管理するクラウドストレージへの保存も可能</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. お子様のプライバシー</h2>
              <p>
                本アプリは13歳未満のお子様を対象としていません。
                13歳未満のお子様は保護者の同意を得てご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. セキュリティ対策</h2>
              <p>本アプリは以下のセキュリティ対策を実施しています：</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Web Crypto APIによる強力な暗号化（AES-GCM 256bit）</li>
                <li>Content Security Policy（CSP）の実装</li>
                <li>HTTPSによる通信の暗号化</li>
                <li>定期的なセキュリティアップデート</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. プライバシーポリシーの変更</h2>
              <p>
                本プライバシーポリシーは、必要に応じて更新される場合があります。
                重要な変更がある場合は、アプリ内でお知らせします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. お問い合わせ</h2>
              <p>
                プライバシーに関するご質問やご懸念がございましたら、
                GitHubのIssuesまたは以下のメールアドレスまでお問い合わせください。
              </p>
              <p className="mt-2">
                メール: privacy@example.com（※実際の連絡先に変更してください）
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                制定日：2024年3月1日<br />
                最終更新日：2024年3月1日
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}