
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api-remittance.fundio.in/api/v1/remittance/rate'

const currencies = [
  'INR', 'MYR', 'USD', 'SGD', 'EUR', 'GBP', 'AED'
]

async function getExchangeRate(from, to) {
  const response = await fetch(
    `${API_URL}?from=${from}&to=${to}`
  )

  if (!response.ok) {
    throw new Error('Unable to fetch exchange rate')
  }

  return response.json()
}

function App() {
  const [from, setFrom] = useState('INR')
  const [to, setTo] = useState('MYR')
  const [amount, setAmount] = useState('10000')

  const [rateData, setRateData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Automatically fetch rate whenever currencies change
  useEffect(() => {
    let cancelled = false

    async function loadRate() {
      try {
        const data = await getExchangeRate(from, to)

        if (!cancelled) {
          setRateData(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setRateData(null)
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRate()

    return () => {
      cancelled = true
    }
  }, [from, to])

  // Manual exchange rate refresh
  async function fetchRate() {
    setLoading(true)
    setError('')

    try {
      const data = await getExchangeRate(from, to)
      setRateData(data)
    } catch (err) {
      setRateData(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Swap currencies
  function swapCurrencies() {
    setFrom(to)
    setTo(from)
  }

  // Avoid displaying a previous currency pair's rate
  const rate =
    rateData?.fromCurrency === from &&
    rateData?.toCurrency === to
      ? rateData.exchangeRate
      : null

  // Calculate converted amount
  const convertedAmount =
    rate !== null &&
    amount !== '' &&
    Number.isFinite(Number(amount)) &&
    Number(amount) >= 0
      ? (Number(amount) * rate).toFixed(2)
      : '0.00'

  return (
    <div className="app">

      {/* Navigation */}
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">F</span>
          <span>FUN-DIO</span>
        </div>

        <span className="nav-label">REMITTANCE</span>
      </header>

      <main className="main">

        {/* Introduction */}
        <section className="intro">
          <p className="eyebrow">
            SMART INTERNATIONAL TRANSFERS
          </p>

          <h1>Currency Exchange</h1>

          <p className="subtitle">
            Check exchange rates and calculate your international remittance.
          </p>
        </section>

        {/* Calculator */}
        <section className="calculator">

          <div className="card-heading">
            <div>
              <h2>Remittance Calculator</h2>
              <p>Live exchange rate information</p>
            </div>

            <span className="live-status">
              <span className="dot"></span>
              LIVE
            </span>
          </div>

          {/* Send Currency */}
          <div className="field">
            <label>YOU SEND</label>

            <div className="currency-input">
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />

              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency Swap */}
          <div className="swap-row">
            <div className="exchange-line"></div>

            <button
              type="button"
              className="swap-button"
              onClick={swapCurrencies}
              aria-label="Swap currencies"
            >
              ⇅
            </button>

            <div className="exchange-line"></div>
          </div>

          {/* Recipient Currency */}
          <div className="field">
            <label>RECIPIENT GETS</label>

            <div className="currency-input result-input">
              <div className="result-amount">
                {convertedAmount}
              </div>

              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* API Error */}
          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {/* Exchange Rate */}
          <div className="rate-info">
            {loading && rate === null ? (
              <span>Fetching latest exchange rate...</span>
            ) : rate !== null ? (
              <>
                <span>
                  1 {from} = {rate} {to}
                </span>

                <span className="rate-date">
                  {rateData.rateDate}
                </span>
              </>
            ) : (
              <span>Exchange rate unavailable</span>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            className="refresh-button"
            onClick={fetchRate}
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : '↻ Refresh Exchange Rate'}
          </button>

          <p className="provider">
            Exchange rate provider: {rateData?.provider || 'Frankfurter'}
          </p>

        </section>

        {/* Footer */}
        <footer>
          <p>Powered by FUN-DIO Remittance Rates API</p>

          <p>
            Exchange rates are indicative and may differ from transfer provider rates.
          </p>
        </footer>

      </main>
    </div>
  )
}

export default App
