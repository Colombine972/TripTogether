type ExchangeRateCache = {
  rate: number;
  date: string | null;
  expiresAt: number;
};

type FrankfurterRateResponse = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

class ExchangeRateService {
  private cache = new Map<string, ExchangeRateCache>();

  private readonly CACHE_DURATION = 1000 * 60 * 60;

  async getRate(from: string, to: string): Promise<number> {
    const source = from.trim().toUpperCase();
    const target = to.trim().toUpperCase();

    if (!source || !target) {
      throw new Error("Les codes des devises sont obligatoires.");
    }

    if (source.length !== 3 || target.length !== 3) {
      throw new Error("Les codes des devises doivent contenir 3 caractères.");
    }

    if (source === target) {
      return 1;
    }

    const cacheKey = `${source}-${target}`;
    const cachedRate = this.cache.get(cacheKey);

    if (cachedRate && cachedRate.expiresAt > Date.now()) {
      return cachedRate.rate;
    }

    const apiUrl =
      `https://api.frankfurter.dev/v2/rate/` +
      `${encodeURIComponent(source)}/${encodeURIComponent(target)}`;

    console.log("Appel Frankfurter :", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = (await response.json().catch(() => null)) as
      | FrankfurterRateResponse
      | null;

    if (!response.ok) {
      console.error("Réponse Frankfurter :", {
        status: response.status,
        data,
      });

      throw new Error(
        `Impossible de récupérer le taux ${source}/${target}.`,
      );
    }

    const rate = Number(data?.rate);

    if (!Number.isFinite(rate) || rate <= 0) {
      console.error("Réponse Frankfurter invalide :", data);

      throw new Error(
        `Taux de conversion ${source}/${target} introuvable.`,
      );
    }

    this.cache.set(cacheKey, {
      rate,
      date: data?.date || null,
      expiresAt: Date.now() + this.CACHE_DURATION,
    });

    return rate;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new ExchangeRateService();