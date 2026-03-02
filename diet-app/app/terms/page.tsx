'use client';

import { MainLayout } from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">利用規約</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
              <p>
                本規約は、「やさしいダイエット」（以下、「本アプリ」といいます）の利用条件を定めるものです。
                ユーザーの皆さまには、本規約に従って本アプリをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第2条（利用登録）</h2>
              <p>
                本アプリは利用登録不要でご利用いただけます。
                初回利用時に体質・生活習慣等の情報を登録していただきますが、
                これらの情報は全てお客様の端末内にのみ保存されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第3条（データの取り扱い）</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>本アプリで記録された全てのデータは、お客様の端末内（ブラウザのIndexedDB）に暗号化して保存されます</li>
                <li>当社のサーバーには個人情報は一切保存されません</li>
                <li>AI機能利用時のみ、食事内容や体調情報が一時的にOpenAI社のAPIに送信されますが、個人を特定する情報は含まれません</li>
                <li>データのバックアップはお客様自身で管理していただく必要があります</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第4条（禁止事項）</h2>
              <p>ユーザーは、本アプリの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>本アプリの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第5条（本アプリの提供の停止等）</h2>
              <p>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本アプリの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>本アプリにかかるシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本アプリの提供が困難となった場合</li>
                <li>その他、当社が本アプリの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第6条（免責事項）</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>本アプリは健康的な生活をサポートすることを目的としていますが、医学的アドバイスではありません</li>
                <li>健康上の問題がある場合は、必ず医師等の専門家にご相談ください</li>
                <li>本アプリの利用によって生じたいかなる損害についても、当社は一切の責任を負いません</li>
                <li>端末の故障等によるデータの消失について、当社は責任を負いません</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第7条（利用規約の変更）</h2>
              <p>
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、本アプリ内に掲示した時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">第8条（準拠法・裁判管轄）</h2>
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
                本アプリに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
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