import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../../redis/redis.service'

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: Date
}

const CACHE_KEY = 'currency:exchange_rates'
const CACHE_TTL_SECONDS = 3600 // 1 hour

/**
 * Currency Conversion Service
 * 
 * Handles currency conversion between USD (internal) and VND (SePay).
 * Caches exchange rates in Redis with 1-hour TTL.
 */
@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyService.name)
  private fallbackRate: number

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    // Fallback rate from env or default to ~25,000 VND per USD
    this.fallbackRate = this.configService.get<number>('FALLBACK_USD_VND_RATE', 25000)
  }

  async onModuleInit() {
    // Pre-fetch exchange rate on startup
    try {
      await this.getExchangeRate('USD', 'VND')
      this.logger.log('Exchange rate pre-fetched successfully')
    } catch (error) {
      this.logger.warn(`Failed to pre-fetch exchange rate, will use fallback: ${this.fallbackRate}`)
    }
  }

  /**
   * Get current exchange rate from USD to VND
   * Fetches from external API with Redis caching
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const cacheKey = `${CACHE_KEY}:${from}:${to}`

    // Check cache first
    const cachedStr = await this.redisService.get(cacheKey)
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as ExchangeRate
      this.logger.debug(`Exchange rate cache hit: ${from}/${to} = ${cached.rate}`)
      return cached
    }

    // Fetch from external API
    const rate = await this.fetchExchangeRate(from, to)
    const exchangeRate: ExchangeRate = {
      from,
      to,
      rate,
      timestamp: new Date(),
    }

    // Cache the result
    await this.redisService.set(cacheKey, JSON.stringify(exchangeRate), CACHE_TTL_SECONDS)
    this.logger.log(`Exchange rate fetched and cached: ${from}/${to} = ${rate}`)

    return exchangeRate
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ amount: number; rate: number; timestamp: Date }> {
    if (from === to) {
      return { amount, rate: 1, timestamp: new Date() }
    }

    const exchangeRate = await this.getExchangeRate(from, to)
    const convertedAmount = Math.round(amount * exchangeRate.rate)

    this.logger.debug(
      `Converted ${amount} ${from} to ${convertedAmount} ${to} @ rate ${exchangeRate.rate}`,
    )

    return {
      amount: convertedAmount,
      rate: exchangeRate.rate,
      timestamp: exchangeRate.timestamp,
    }
  }

  /**
   * Convert USD to VND (convenience method for SePay)
   */
  async usdToVnd(amountUsd: number): Promise<{ amountVnd: number; rate: number; timestamp: Date }> {
    const result = await this.convert(amountUsd, 'USD', 'VND')
    return {
      amountVnd: result.amount,
      rate: result.rate,
      timestamp: result.timestamp,
    }
  }

  /**
   * Fetch exchange rate from external API
   * Using exchangerate-api.com free tier (1500 requests/month)
   */
  private async fetchExchangeRate(from: string, to: string): Promise<number> {
    const apiKey = this.configService.get<string>('EXCHANGE_RATE_API_KEY')
    
    if (!apiKey) {
      this.logger.warn('No EXCHANGE_RATE_API_KEY configured, using fallback rate')
      return from === 'USD' && to === 'VND' ? this.fallbackRate : 1
    }

    try {
      // Using exchangerate-api.com
      const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.result !== 'success') {
        throw new Error(`API error: ${data['error-type'] || 'Unknown error'}`)
      }

      return data.conversion_rate
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate: ${error.message}`)
      
      // Use fallback rate for USD->VND
      if (from === 'USD' && to === 'VND') {
        this.logger.warn(`Using fallback rate: ${this.fallbackRate}`)
        return this.fallbackRate
      }
      
      throw error
    }
  }

  /**
   * Get the fallback rate (for display/testing)
   */
  getFallbackRate(): number {
    return this.fallbackRate
  }
}
