const { App } = window;

// 対象メソッド名を列挙
type ApiKeys = keyof typeof App;

type ElectronService = Pick<typeof App, ApiKeys>;

export const electronApiService = App satisfies ElectronService;
