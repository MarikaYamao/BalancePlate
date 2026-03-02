import { conditionTagsInfo } from "@/lib/constants/conditionTags";
import type { ConditionTag } from "@/types";

interface ConditionFeedbackParams {
  conditionTags: ConditionTag[];
  note?: string;
  dateKey: string;
}

export async function generateConditionFeedback({
  conditionTags,
  note,
}: ConditionFeedbackParams): Promise<string> {
  // コンディションタグの詳細情報を取得
  const tagDetails = conditionTags
    .map((tagId) => conditionTagsInfo.find((t) => t.id === tagId))
    .filter(Boolean);

  // カテゴリ別に分類
  const hasPhysicalIssue = tagDetails.some((tag) =>
    tag?.id.includes("tired") || tag?.id.includes("sleep")
  );
  const hasMentalIssue = tagDetails.some((tag) =>
    tag?.id.includes("stress") || tag?.id.includes("irritable")
  );
  const hasGoodCondition = tagDetails.some((tag) =>
    tag?.id.includes("good") || tag?.id.includes("energetic")
  );

  // フィードバックを生成（実際のAI APIを使用する場合はここを置き換え）
  let feedback = "";

  if (hasGoodCondition) {
    feedback = "素晴らしい体調ですね！✨\n\n";
    feedback += "今日の良いコンディションを維持するためのポイント：\n";
    feedback += "• バランスの良い食事を継続しましょう\n";
    feedback += "• 適度な運動を心がけましょう\n";
    feedback += "• 十分な睡眠時間を確保しましょう\n\n";
    feedback += "この調子を維持できるよう、無理のない範囲で活動してください。";
  } else if (hasPhysicalIssue && hasMentalIssue) {
    feedback = "心身ともにお疲れのようですね。\n\n";
    feedback += "今日は特に以下の点を意識してください：\n";
    feedback += "• 消化の良い温かい食事を選びましょう\n";
    feedback += "• カフェインは控えめにして、ハーブティーなどでリラックス\n";
    feedback += "• 早めの就寝を心がけ、睡眠の質を優先しましょう\n";
    feedback += "• 深呼吸や軽いストレッチで緊張をほぐしましょう\n\n";
    feedback += "無理せず、ご自身のペースで回復を優先してくださいね。";
  } else if (hasPhysicalIssue) {
    feedback = "身体的な疲れが見られるようです。\n\n";
    feedback += "体力回復のためのアドバイス：\n";
    feedback += "• ビタミンB群を含む食材（豚肉、納豆、卵など）を摂取\n";
    feedback += "• 消化に負担のかからない食事を選択\n";
    feedback += "• 十分な水分補給を心がける\n";
    feedback += "• 可能なら短時間の昼寝（15-20分）を取る\n\n";
    feedback += "身体のサインに耳を傾けて、休息を大切にしてください。";
  } else if (hasMentalIssue) {
    feedback = "精神的なストレスを感じているようですね。\n\n";
    feedback += "心のケアのための提案：\n";
    feedback += "• トリプトファンを含む食材（バナナ、チーズ、大豆など）でセロトニン分泌を促進\n";
    feedback += "• 好きな音楽を聴いたり、軽い散歩でリフレッシュ\n";
    feedback += "• 温かいお風呂でリラックスタイムを作る\n";
    feedback += "• 誰かと話したり、感情を書き出してみる\n\n";
    feedback += "ストレスは誰にでもあるもの。自分に優しくしてくださいね。";
  } else {
    feedback = "今日のコンディションを記録しました。\n\n";
    feedback += "健康維持のための基本ポイント：\n";
    feedback += "• 規則正しい食事時間を心がける\n";
    feedback += "• 栄養バランスを意識した食事選び\n";
    feedback += "• 適度な運動と休息のバランス\n";
    feedback += "• 質の良い睡眠の確保\n\n";
    feedback += "日々の記録が健康管理の第一歩です。継続していきましょう！";
  }

  if (note) {
    feedback += "\n\n📝 あなたのメモより：\n";
    feedback += `「${note}」\n`;
    feedback += "このメモも含めて、今後の体調管理の参考にしていきましょう。";
  }

  return feedback;
}