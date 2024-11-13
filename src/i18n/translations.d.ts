interface HeroTranslations {
  title: string;
  description: string;
  learnMore: string;
  contactUs: string;
}


interface Translations {
  hero: HeroTranslations;
  nav: NavigationMenuItem;
}




interface TranslationData {
  en: Translations;
  no: Translations;
}

declare module '@/i18n/translations.json' {
  const value: TranslationData;
  export default value;
}
