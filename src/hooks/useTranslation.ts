import { useLanguage } from '@/contexts/language-context';
import translations from '@/i18n/translations.json';

type Translations = typeof translations['en'];

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: NestedKeyOf<Translations>) => {
    const keys = key.split('.') as (keyof Translations)[];
    let result: any = translations[language];
    for (const k of keys) {
      result = result[k];
    }
    return result;
  };

  return { t };
}
