import type { BodyConstitutionTag, LifestyleTag } from '@/types';

/**
 * 性別に基づいて、利用可能な体質タグをフィルタリングする
 * 子宮を持たない性別の場合、生理・妊娠関連のタグを除外する
 */
export function filterBodyConstitutionByGender(
  tags: BodyConstitutionTag[],
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): BodyConstitutionTag[] {
  // 子宮関連のタグ（生理・更年期・妊娠など）
  const uterusRelatedTags: BodyConstitutionTag[] = [
    'pms_severe',        // PMS強め
    'irregular_periods', // 生理不順
    'heavy_periods',     // 生理が重い
    'menopause',        // 更年期
    'pregnancy',        // 妊娠中
    'breastfeeding',    // 授乳中
    'hormone_mtf',      // ホルモン療法中（MTF）
  ];

  // 性別が男性の場合、子宮関連のタグを除外
  if (gender === 'male') {
    return tags.filter(tag => !uterusRelatedTags.includes(tag));
  }

  // その他の性別の場合はすべてのタグを返す
  return tags;
}

/**
 * 性別に基づいて、利用可能なライフスタイルタグをフィルタリングする
 * 子宮を持たない性別の場合、妊娠・授乳関連のタグを除外する
 */
export function filterLifestyleByGender(
  tags: LifestyleTag[],
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): LifestyleTag[] {
  // 妊娠・授乳関連のタグ
  const pregnancyRelatedTags: LifestyleTag[] = [
    'pregnant',        // 妊娠中
    'breastfeeding',   // 授乳中
  ];

  // 性別が男性の場合、妊娠・授乳関連のタグを除外
  if (gender === 'male') {
    return tags.filter(tag => !pregnancyRelatedTags.includes(tag));
  }

  // その他の性別の場合はすべてのタグを返す
  return tags;
}

/**
 * 性別に基づいて体質タグが利用可能かどうかをチェック
 */
export function isBodyConstitutionAvailable(
  tag: BodyConstitutionTag,
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): boolean {
  const uterusRelatedTags: BodyConstitutionTag[] = [
    'pms_severe',
    'irregular_periods',
    'heavy_periods',
    'menopause',
    'pregnancy',
    'breastfeeding',
    'hormone_mtf',
  ];

  if (gender === 'male' && uterusRelatedTags.includes(tag)) {
    return false;
  }

  return true;
}

/**
 * 性別に基づいてライフスタイルタグが利用可能かどうかをチェック
 */
export function isLifestyleAvailable(
  tag: LifestyleTag,
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): boolean {
  const pregnancyRelatedTags: LifestyleTag[] = [
    'pregnant',
    'breastfeeding',
  ];

  if (gender === 'male' && pregnancyRelatedTags.includes(tag)) {
    return false;
  }

  return true;
}

/**
 * 性別に基づいて、利用可能なコンディションタグをフィルタリングする
 * 子宮を持たない性別の場合、生理関連のタグを除外する
 */
export function filterConditionTagsByGender(
  tags: string[],
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): string[] {
  // 生理関連のタグ
  const menstruationRelatedTags = [
    'period_before',  // 生理前
    'period_during',  // 生理中
    'period_after',   // 生理後
    'ovulation',      // 排卵期っぽい
    'morning_sickness', // つわり
  ];

  // 性別が男性の場合、生理関連のタグを除外
  if (gender === 'male') {
    return tags.filter(tag => !menstruationRelatedTags.includes(tag));
  }

  // その他の性別の場合はすべてのタグを返す
  return tags;
}

/**
 * 性別に基づいてコンディションタグが利用可能かどうかをチェック
 */
export function isConditionTagAvailable(
  tag: string,
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
): boolean {
  const menstruationRelatedTags = [
    'period_before',
    'period_during',
    'period_after',
    'ovulation',
    'morning_sickness',
  ];

  if (gender === 'male' && menstruationRelatedTags.includes(tag)) {
    return false;
  }

  return true;
}