import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styles from './App.module.css'

const INVESTMENT = 160000
const OPERATING_DAYS = 30
const HORIZON_MONTHS = 24
const CMV_RATE = 42
const HIGH_SEASON_MONTHS = new Set([1, 2, 3, 10, 11, 12])
const RAINY_SEASON_MONTHS = new Set([5, 6, 7, 8])

const scenarios = {
  conservador: {
    label: 'Conservador',
    ticket: 22,
    dailyClients: 40,
    wacc: 18,
    fixedCosts: 22000,
    royalties: 8,
    seasonality: 25,
    retentionMonths: 3,
    monthlyFrequency: 1.5,
  },
  moderado: {
    label: 'Moderado',
    ticket: 25,
    dailyClients: 75,
    wacc: 14,
    fixedCosts: 26000,
    royalties: 7,
    seasonality: 20,
    retentionMonths: 6,
    monthlyFrequency: 2,
  },
  otimista: {
    label: 'Otimista',
    ticket: 28,
    dailyClients: 110,
    wacc: 12,
    fixedCosts: 30000,
    royalties: 6,
    seasonality: 15,
    retentionMonths: 10,
    monthlyFrequency: 2.5,
  },
}

const premiseNotes = [
  {
    key: 'ticket',
    title: 'V1. Ticket medio',
    source: 'IBGE PNAD Continua e ABRASEL',
    reason: 'Faixa de R$ 15 a R$ 40. Representa o premio de conveniencia da tapioca/cuscuz em cone frente ao alimento tradicional.',
  },
  {
    key: 'dailyClients',
    title: 'V2. Fluxo de clientes/dia',
    source: 'Hipotese declarada',
    reason: 'Faixa de 20 a 200 clientes/dia. Assume interceptacao de 0,5% a 1% do fluxo do corredor comercial do shopping.',
  },
  {
    key: 'wacc',
    title: 'V3. WACC anual',
    source: 'Banco Central e premio de risco do varejo',
    reason: 'Faixa de 5% a 30% a.a. Representa o custo de oportunidade usado no VPL e no payback descontado.',
  },
  {
    key: 'fixedCosts',
    title: 'V4. Custo fixo mensal',
    source: 'IPECE-AL, adaptado ao contexto local',
    reason: 'Faixa de R$ 10.000 a R$ 40.000. Inclui ocupacao, condominio, fundo de promocao e folha base.',
  },
  {
    key: 'royalties',
    title: 'V5. Royalties Konioca',
    source: 'Circular de Oferta de Franquia',
    reason: 'Faixa de 2% a 15%. Incide sobre faturamento bruto antes da leitura do ponto de equilibrio.',
  },
  {
    key: 'seasonality',
    title: 'V6. Sazonalidade',
    source: 'SETUR/AL - fluxo turistico',
    reason: 'Faixa de 0% a 50%. Aplica alta em outubro-marco e retracao na quadra chuvosa de maio-agosto.',
  },
  {
    key: 'retentionMonths',
    title: 'V7. Retencao recorrente',
    source: 'Hipotese de comportamento',
    reason: 'Estima por quantos meses um cliente recorrente continua comprando apos conhecer a marca.',
  },
  {
    key: 'monthlyFrequency',
    title: 'V8. Frequencia mensal',
    source: 'Hipotese de consumo',
    reason: 'Estimativa de compras mensais de um cliente recorrente para calcular LTV operacional.',
  },
]

const referenceMetrics = [
  { metric: 'VPL (24 meses)', conservador: '-R$ 127.310', moderado: 'R$ 138.165', otimista: 'R$ 559.540' },
  { metric: 'TIR anualizada', conservador: 'Negativa', moderado: '84,6%', otimista: '241,8%' },
  { metric: 'Payback descontado', conservador: 'Nao recupera', moderado: '13,2 meses', otimista: '5,4 meses' },
  { metric: 'LTV/CAC', conservador: '1,1x', moderado: '3,8x', otimista: '6,5x' },
]

const references = [
  'Estudo de Caso Konioca - Maceio/AL. Comite de Inteligencia Estrategica, 2026.',
  'IBGE. PNAD Continua.',
  'ABRASEL. Indicadores do setor de alimentacao fora do lar.',
  'Banco Central do Brasil. Taxa Selic.',
  'SETUR/AL. Relatorio de Fluxo Turistico.',
  'Circular de Oferta de Franquia (COF) Konioca.',
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercent = (value) =>
  value == null
    ? 'Negativa'
    : new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(value)

const formatUnits = (value) =>
  new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value)

function getSeasonalityFactor(monthIndex, seasonality) {
  const month = (monthIndex % 12) + 1

  if (HIGH_SEASON_MONTHS.has(month)) {
    return 1 + seasonality / 100
  }

  if (RAINY_SEASON_MONTHS.has(month)) {
    return 1 - seasonality / 100
  }

  return 1
}

function buildProjection(inputs) {
  return Array.from({ length: HORIZON_MONTHS }, (_, index) => {
    const month = index + 1
    const seasonalityFactor = getSeasonalityFactor(index, inputs.seasonality)
    const clients = inputs.dailyClients * OPERATING_DAYS * seasonalityFactor
    const revenue = clients * inputs.ticket
    const cmv = revenue * (CMV_RATE / 100)
    const royalties = revenue * (inputs.royalties / 100)
    const totalCosts = inputs.fixedCosts + cmv + royalties
    const cashFlow = revenue - totalCosts

    return {
      month: `M${month}`,
      clientes: Math.round(clients),
      receita: Math.round(revenue),
      custos: Math.round(totalCosts),
      fluxo: Math.round(cashFlow),
    }
  })
}

function calculateNpv(cashFlows, annualWacc) {
  const monthlyRate = (1 + annualWacc / 100) ** (1 / 12) - 1

  return cashFlows.reduce(
    (total, cashFlow, index) => total + cashFlow / (1 + monthlyRate) ** index,
    0,
  )
}

function calculateIrr(cashFlows) {
  const npvAt = (rate) =>
    cashFlows.reduce((total, cashFlow, index) => total + cashFlow / (1 + rate) ** index, 0)

  let low = -0.95
  let high = 1

  if (npvAt(low) * npvAt(high) > 0) {
    return null
  }

  for (let index = 0; index < 100; index += 1) {
    const mid = (low + high) / 2
    if (npvAt(low) * npvAt(mid) <= 0) {
      high = mid
    } else {
      low = mid
    }
  }

  return (1 + (low + high) / 2) ** 12 - 1
}

function calculateDiscountedPayback(monthlyCashFlows, annualWacc) {
  const monthlyRate = (1 + annualWacc / 100) ** (1 / 12) - 1
  let accumulated = -INVESTMENT

  for (let index = 0; index < monthlyCashFlows.length; index += 1) {
    const previous = accumulated
    const discountedFlow = monthlyCashFlows[index] / (1 + monthlyRate) ** (index + 1)
    accumulated += discountedFlow

    if (accumulated >= 0) {
      const monthFraction = Math.abs(previous) / discountedFlow
      return index + monthFraction
    }
  }

  return null
}

function calculateSimplePayback(monthlyCashFlows) {
  let accumulated = -INVESTMENT

  for (let index = 0; index < monthlyCashFlows.length; index += 1) {
    const previous = accumulated
    accumulated += monthlyCashFlows[index]

    if (accumulated >= 0) {
      return index + Math.abs(previous) / monthlyCashFlows[index]
    }
  }

  return null
}

function App() {
  const [inputs, setInputs] = useState(scenarios.moderado)

  const projection = useMemo(() => buildProjection(inputs), [inputs])
  const firstMonth = projection[0]
  const cashFlows = [-INVESTMENT, ...projection.map((month) => month.fluxo)]
  const monthlyCashFlows = projection.map((month) => month.fluxo)
  const npv = calculateNpv(cashFlows, inputs.wacc)
  const irr = calculateIrr(cashFlows)
  const simplePayback = calculateSimplePayback(monthlyCashFlows)
  const discountedPayback = calculateDiscountedPayback(monthlyCashFlows, inputs.wacc)
  const occupationLimit = firstMonth.receita * 0.12
  const unitContribution = inputs.ticket * (1 - CMV_RATE / 100 - inputs.royalties / 100)
  const breakEvenClients = unitContribution > 0
    ? inputs.fixedCosts / (unitContribution * OPERATING_DAYS)
    : 0
  const burnRate = Math.max(0, -firstMonth.fluxo)
  const ltv = unitContribution * inputs.monthlyFrequency * inputs.retentionMonths

  const breakEvenData = [
    { name: 'Atual', clientes: inputs.dailyClients, color: '#386641' },
    { name: 'Breakeven', clientes: Math.ceil(breakEvenClients), color: '#ae2012' },
  ]

  function updateInput(key, value) {
    setInputs((current) => ({
      ...current,
      [key]: Number(value),
    }))
  }

  function applyScenario(scenario) {
    setInputs(scenarios[scenario])
  }

  return (
    <main className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>AV2 - estudo de caso Maceio/AL</p>
          <h1>Simulador Financeiro Konioca</h1>
        </div>
        <div className={styles.scenarioButtons}>
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              className={styles.btn}
              key={key}
              type="button"
              onClick={() => applyScenario(key)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </header>

      <section className={styles.scopeNote}>
        <strong>Base do modelo:</strong> loja compacta/quiosque em shopping center,
        investimento estimado de {formatCurrency(INVESTMENT)} e horizonte de 24 meses.
        A receita usa fluxo diario x ticket x 30 dias, com ajuste sazonal de Maceio.
      </section>

      <section className={styles.mainGrid}>
        <aside className={styles.controlsPanel}>
          <h2>8 premissas ajustaveis</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="ticket">Ticket medio: {formatCurrency(inputs.ticket)}</label>
            <input
              id="ticket"
              max="40"
              min="15"
              step="1"
              type="range"
              value={inputs.ticket}
              onChange={(event) => updateInput('ticket', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="dailyClients">Clientes/dia: {formatUnits(inputs.dailyClients)}</label>
            <input
              id="dailyClients"
              max="200"
              min="20"
              step="5"
              type="range"
              value={inputs.dailyClients}
              onChange={(event) => updateInput('dailyClients', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="wacc">WACC anual: {inputs.wacc}%</label>
            <input
              id="wacc"
              max="30"
              min="5"
              step="0.5"
              type="range"
              value={inputs.wacc}
              onChange={(event) => updateInput('wacc', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="fixedCosts">Custo fixo mensal: {formatCurrency(inputs.fixedCosts)}</label>
            <input
              id="fixedCosts"
              max="40000"
              min="10000"
              step="1000"
              type="range"
              value={inputs.fixedCosts}
              onChange={(event) => updateInput('fixedCosts', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="royalties">Royalties: {inputs.royalties}%</label>
            <input
              id="royalties"
              max="15"
              min="2"
              step="0.5"
              type="range"
              value={inputs.royalties}
              onChange={(event) => updateInput('royalties', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="seasonality">Sazonalidade: {inputs.seasonality}%</label>
            <input
              id="seasonality"
              max="50"
              min="0"
              step="5"
              type="range"
              value={inputs.seasonality}
              onChange={(event) => updateInput('seasonality', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="retentionMonths">Retencao recorrente: {inputs.retentionMonths} meses</label>
            <input
              id="retentionMonths"
              max="18"
              min="1"
              step="1"
              type="range"
              value={inputs.retentionMonths}
              onChange={(event) => updateInput('retentionMonths', event.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="monthlyFrequency">Frequencia mensal: {inputs.monthlyFrequency} compras</label>
            <input
              id="monthlyFrequency"
              max="5"
              min="1"
              step="0.5"
              type="range"
              value={inputs.monthlyFrequency}
              onChange={(event) => updateInput('monthlyFrequency', event.target.value)}
            />
          </div>
        </aside>

        <section className={styles.metricsPanel}>
          <article className={styles.metricCard}>
            <h3>Receita mes 1</h3>
            <p className={styles.positive}>{formatCurrency(firstMonth.receita)}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>Fluxo mes 1</h3>
            <p className={firstMonth.fluxo >= 0 ? styles.positive : styles.negative}>
              {formatCurrency(firstMonth.fluxo)}
            </p>
          </article>
          <article className={styles.metricCard}>
            <h3>VPL 24 meses</h3>
            <p className={npv >= 0 ? styles.positive : styles.negative}>{formatCurrency(npv)}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>TIR anualizada</h3>
            <p className={irr == null || irr < 0 ? styles.negative : styles.neutral}>
              {formatPercent(irr)}
            </p>
          </article>
          <article className={styles.metricCard}>
            <h3>Payback descontado</h3>
            <p>{discountedPayback == null ? 'Nao recupera' : `${discountedPayback.toFixed(1)} meses`}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>Payback simples</h3>
            <p>{simplePayback == null ? 'Nao recupera' : `${simplePayback.toFixed(1)} meses`}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>Burn rate</h3>
            <p className={burnRate > 0 ? styles.negative : styles.positive}>{formatCurrency(burnRate)}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>LTV recorrente</h3>
            <p className={styles.neutral}>{formatCurrency(ltv)}</p>
          </article>
          <article className={styles.metricCard}>
            <h3>Teto ocupacao 12%</h3>
            <p>{formatCurrency(occupationLimit)}</p>
          </article>
        </section>
      </section>

      <section className={styles.chartsPanel}>
        <article className={styles.chartContainer}>
          <h2>Fluxo projetado em 24 meses</h2>
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line dataKey="receita" name="Receita" stroke="#386641" strokeWidth={2} />
              <Line dataKey="custos" name="Custos" stroke="#ae2012" strokeWidth={2} />
              <Line dataKey="fluxo" name="Fluxo" stroke="#1a535c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className={styles.chartContainer}>
          <h2>Breakeven em clientes/dia</h2>
          <ResponsiveContainer height={300} width="100%">
            <BarChart data={breakEvenData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${formatUnits(value)} clientes/dia`} />
              <Bar dataKey="clientes" radius={[4, 4, 0, 0]}>
                {breakEvenData.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className={styles.documentationGrid}>
        <article className={styles.documentationPanel}>
          <h2>Premissas do estudo de caso</h2>
          <div className={styles.premiseList}>
            {premiseNotes.map((premise) => (
              <article className={styles.premiseItem} key={premise.key}>
                <h3>{premise.title}</h3>
                <p><strong>Fonte:</strong> {premise.source}</p>
                <p>{premise.reason}</p>
              </article>
            ))}
          </div>
        </article>

        <article className={styles.documentationPanel}>
          <h2>Benchmark do relatorio</h2>
          <table className={styles.metricsTable}>
            <thead>
              <tr>
                <th>Metrica</th>
                <th>Cons.</th>
                <th>Mod.</th>
                <th>Otim.</th>
              </tr>
            </thead>
            <tbody>
              {referenceMetrics.map((row) => (
                <tr key={row.metric}>
                  <td>{row.metric}</td>
                  <td>{row.conservador}</td>
                  <td>{row.moderado}</td>
                  <td>{row.otimista}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Referencias</h2>
          <ul className={styles.referenceList}>
            {references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
