import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  ChartConfiguration,
  ScriptableContext,
  registerables,
} from 'chart.js';

Chart.register(...registerables);

type TabId = 'overview' | 'charts' | 'countries' | 'insights' | 'sql';

interface Tab {
  id: TabId;
  label: string;
}

interface KeyStat {
  label: string;
  value: string;
  sub: string;
  tone?: 'good' | 'bad';
}

interface InsightCard {
  title: string;
  body: string;
  tone: 'good' | 'warn' | 'bad' | 'info';
}

interface VaxBandRow {
  band: string;
  countries: number;
  avgDeathRate: string;
  tone: 'good' | 'warn' | 'bad' | 'critical';
}

interface Recommendation {
  title: string;
  body: string;
  tone: 'good' | 'warn' | 'bad' | 'info';
}

interface SqlPhase {
  id: string;
  title: string;
  blurb: string;
  code: string;
  open: boolean;
}

@Component({
  selector: 'app-covid-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './covid-detail.component.html',
  styleUrls: ['./covid-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CovidDetailComponent
  implements AfterViewInit, OnDestroy
{
  @Output() close = new EventEmitter<void>();
  @ViewChildren('chartCanvas')
  private canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  private charts: Chart[] = [];

  // ────────────────────────────────────────────────────────────────
  //  TAB STATE
  // ────────────────────────────────────────────────────────────────

  activeTab = signal<TabId>('overview');

  tabs: Tab[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'charts',    label: 'Charts' },
    { id: 'countries', label: 'Countries' },
    { id: 'insights',  label: 'Insights & Recs' },
    { id: 'sql',       label: 'SQL Code' },
  ];

  setTab(id: TabId): void {
    this.activeTab.set(id);
    if (id === 'charts') {
      setTimeout(() => this.rebuildCharts(), 0);
    } else {
      this.destroyCharts();
    }
  }

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — OVERVIEW
  // ────────────────────────────────────────────────────────────────

  tags: { label: string; tone: 'sql' | 'excel' | 'analytics' }[] = [
    { label: 'SQL',       tone: 'sql' },
    { label: 'Excel',     tone: 'excel' },
    { label: 'Analytics', tone: 'analytics' },
  ];

  keyStats: KeyStat[] = [
    { label: 'Total Cases',        value: '775.9M', sub: 'Global cumulative (243 countries)' },
    { label: 'Total Deaths',       value: '7.06M',  sub: '2020-01 to 2024-08', tone: 'bad' },
    { label: 'Avg Death Rate',     value: '1.23%',  sub: 'Country mean (CFR)' },
    { label: 'Avg Vax Rate',       value: '58.0%',  sub: 'Population fully vaccinated', tone: 'good' },
    { label: 'Low-Vax Death Rate', value: '1.40%',  sub: '<20% vax band (40 countries)', tone: 'bad' },
    { label: 'High-Vax Death Rate',value: '0.57%',  sub: '80%+ vax band (45 countries)', tone: 'good' },
  ];

  insights: InsightCard[] = [
    {
      title: 'Vaccination materially lowered death rates',
      body:
        'Countries below 20% vaccination averaged a 1.40% death rate. Countries above 80% vaccination averaged 0.57% — a 2.5× difference across 85 countries in the extreme bands.',
      tone: 'good',
    },
    {
      title: 'GDP is the stronger predictor than continent',
      body:
        'Countries under $5k GDP per capita averaged 1.92% death rate. $50k+ countries averaged 0.35%. The gradient is smooth across every band, while continent rollups hide the spread.',
      tone: 'info',
    },
    {
      title: 'Africa\'s low deaths-per-million is an artefact',
      body:
        'Africa shows 182 deaths per million — far below Europe (2,581) or South America (3,104). With low testing capacity and reporting infrastructure, this almost certainly reflects undercounting rather than lower mortality.',
      tone: 'warn',
    },
    {
      title: 'Two clear waves dominate the timeline',
      body:
        'Cases peak in Nov 2020 – Jan 2021 (Alpha wave) and again in Dec 2021 – Feb 2022 (Omicron). The second wave was ~4× the case volume but with a much lower CFR — vaccine rollout had already shifted the curve.',
      tone: 'info',
    },
    {
      title: 'Early-pandemic CFR was wildly inflated',
      body:
        'March–April 2020 reported 6–9% case-fatality rates. By 2022, monthly CFR fell below 0.5%. Most of this is testing coverage: early counts captured only the sickest patients, not actual prevalence.',
      tone: 'warn',
    },
    {
      title: 'Income gap drove vaccination gap',
      body:
        '<$5k GDP countries averaged 34% vaccination. $50k+ countries reached 79%. The 2.3× gap in protection maps directly onto the 5.5× gap in death rate — supply and logistics, not policy alone, set the outcome.',
      tone: 'bad',
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — CHARTS
  // ────────────────────────────────────────────────────────────────

  vaxBandTable: VaxBandRow[] = [
    { band: '0–20%',  countries: 40, avgDeathRate: '1.40%', tone: 'bad' },
    { band: '20–40%', countries: 36, avgDeathRate: '2.04%', tone: 'critical' },
    { band: '40–60%', countries: 50, avgDeathRate: '1.35%', tone: 'warn' },
    { band: '60–80%', countries: 72, avgDeathRate: '0.88%', tone: 'warn' },
    { band: '80%+',   countries: 45, avgDeathRate: '0.57%', tone: 'good' },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — COUNTRIES
  // ────────────────────────────────────────────────────────────────

  topDeathCountries: { name: string; deaths: string; rate: string }[] = [
    { name: 'United States', deaths: '1,193,165', rate: '1.15%' },
    { name: 'Brazil',        deaths: '702,116',   rate: '1.87%' },
    { name: 'India',         deaths: '533,623',   rate: '1.18%' },
    { name: 'Russia',        deaths: '403,188',   rate: '1.66%' },
    { name: 'Mexico',        deaths: '334,551',   rate: '4.39%' },
    { name: 'United Kingdom',deaths: '232,112',   rate: '0.93%' },
    { name: 'Peru',          deaths: '220,975',   rate: '4.88%' },
    { name: 'Italy',         deaths: '197,542',   rate: '0.74%' },
    { name: 'Germany',       deaths: '174,979',   rate: '0.46%' },
    { name: 'France',        deaths: '167,985',   rate: '0.43%' },
  ];

  topVaxCountries: { name: string; vax: string; rate: string }[] = [
    { name: 'Qatar',                vax: '105.8%', rate: '0.13%' },
    { name: 'United Arab Emirates', vax: '103.7%', rate: '0.22%' },
    { name: 'Chile',                vax: '90.3%',  rate: '1.19%' },
    { name: 'China',                vax: '89.5%',  rate: '0.12%' },
    { name: 'Taiwan',               vax: '87.0%',  rate: '—' },
    { name: 'Spain',                vax: '85.7%',  rate: '0.87%' },
    { name: 'Peru',                 vax: '84.3%',  rate: '4.88%' },
    { name: 'Japan',                vax: '83.4%',  rate: '0.22%' },
    { name: 'Canada',               vax: '82.6%',  rate: '1.15%' },
    { name: 'Brazil',               vax: '81.8%',  rate: '1.87%' },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — INSIGHTS & RECS
  // ────────────────────────────────────────────────────────────────

  findings: string[] = [
    'Vaccination correlates strongly with reduced country-level death rate (<20% band: 1.40% vs 80%+ band: 0.57%).',
    'GDP per capita separates outcomes more cleanly than continent — a 5.5× death-rate gap between the poorest and richest bands.',
    'Reported death rates in March–April 2020 were 6–9%; by mid-2022 they fell below 0.5% as testing broadened.',
    'Africa\'s reported 182 deaths/M is implausibly low and likely reflects testing and reporting gaps rather than true mortality.',
    'Two case-volume peaks dominate: late 2020 (Alpha) and winter 2021–22 (Omicron) — the second was larger but far less deadly per case.',
  ];

  recommendations: Recommendation[] = [
    {
      title: 'Equity in vaccine distribution',
      body:
        'Low-income countries (<$5k GDP) averaged 34% vaccination vs 79% for high-income. Global supply mechanisms (COVAX-style) need stronger funding and earlier delivery in the next pandemic.',
      tone: 'bad',
    },
    {
      title: 'Invest in surveillance, not just hospitals',
      body:
        'Undercounting in low-resource regions distorts the global picture. Routine population testing and seroprevalence studies should be standing public-health infrastructure, not crisis-mode add-ons.',
      tone: 'warn',
    },
    {
      title: 'Standardise outcome reporting',
      body:
        'CFR comparisons across countries are unreliable without consistent definitions for COVID-attributed death, testing rate, and population denominators. WHO-coordinated reporting standards would let us trust the numbers.',
      tone: 'info',
    },
    {
      title: 'Preserve the data legacy',
      body:
        'OWID\'s daily country-level dataset is one of the few clean, comparable cross-country pandemic archives. Funding open, longitudinal datasets like this is the cheapest preparedness investment a government can make.',
      tone: 'good',
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — SQL
  // ────────────────────────────────────────────────────────────────

  sqlPhases: SqlPhase[] = [
    {
      id: 'phase-0',
      title: 'Phase 0 — Data Import & Exploration',
      blurb: 'Loaded OWID daily COVID dataset (405,726 rows × 16 cols) and sanity-checked structure.',
      open: false,
      code: `-- Quick structure & sample check
SELECT TOP 100 * FROM dbo.OwidCovid;

-- Row counts and date span
SELECT
    COUNT(*)                AS TotalRows,
    COUNT(DISTINCT location) AS Countries,
    MIN(date)               AS FirstDate,
    MAX(date)               AS LastDate
FROM dbo.OwidCovid;
-- 405,726 rows | 243 locations | 2020-01-05 to 2024-08-14

-- Coverage check by continent
SELECT continent, COUNT(DISTINCT location) AS Countries
FROM dbo.OwidCovid
WHERE continent IS NOT NULL
GROUP BY continent
ORDER BY Countries DESC;`,
    },
    {
      id: 'phase-1',
      title: 'Phase 1 — Analytical Panel (Country_Summary view)',
      blurb: 'One unified row per country: latest cumulative totals + derived rates.',
      open: true,
      code: `IF OBJECT_ID('dbo.Country_Summary', 'V') IS NOT NULL
    DROP VIEW dbo.Country_Summary;
GO

CREATE VIEW dbo.Country_Summary
AS
WITH LatestPerCountry AS (
    SELECT
        location,
        continent,
        MAX(date) AS LatestDate
    FROM dbo.OwidCovid
    WHERE continent IS NOT NULL
    GROUP BY location, continent
)
SELECT
    o.location                            AS Country,
    o.continent                           AS Continent,
    o.population                          AS Population,
    o.total_cases                         AS TotalCases,
    o.total_deaths                        AS TotalDeaths,
    o.people_fully_vaccinated             AS PeopleVaccinated,
    o.gdp_per_capita                      AS GdpPerCapita,

    /* Derived rates */
    CAST(o.total_cases AS FLOAT)
        / NULLIF(o.population, 0)         AS InfectionRate,
    CAST(o.total_deaths AS FLOAT)
        / NULLIF(o.total_cases, 0)        AS DeathRate,
    CAST(o.people_fully_vaccinated AS FLOAT)
        / NULLIF(o.population, 0)         AS VaccinationRate
FROM dbo.OwidCovid AS o
INNER JOIN LatestPerCountry AS lpc
       ON o.location = lpc.location
      AND o.date     = lpc.LatestDate;
GO`,
    },
    {
      id: 'phase-2',
      title: 'Phase 2 — Data Quality Checks',
      blurb: 'NULLs, impossible values, duplicates. Flagged region rows (continent IS NULL) for exclusion.',
      open: false,
      code: `-- 2.1 Missing values per critical column
SELECT
    SUM(CASE WHEN total_cases    IS NULL THEN 1 ELSE 0 END) AS MissingCases,
    SUM(CASE WHEN total_deaths   IS NULL THEN 1 ELSE 0 END) AS MissingDeaths,
    SUM(CASE WHEN population     IS NULL THEN 1 ELSE 0 END) AS MissingPopulation,
    SUM(CASE WHEN gdp_per_capita IS NULL THEN 1 ELSE 0 END) AS MissingGdp
FROM dbo.OwidCovid;

-- 2.2 Region aggregates masquerading as countries
SELECT DISTINCT location
FROM dbo.OwidCovid
WHERE continent IS NULL;
-- 'World', 'European Union', 'High income', etc. — excluded from per-country analysis

-- 2.3 Impossible values (negative new cases / deaths from data revisions)
SELECT COUNT(*) AS NegativeNewCases
FROM dbo.OwidCovid
WHERE new_cases < 0;

-- 2.4 Duplicate (location, date) check
SELECT location, date, COUNT(*) AS rows
FROM dbo.OwidCovid
GROUP BY location, date
HAVING COUNT(*) > 1;
-- No duplicates found`,
    },
    {
      id: 'phase-3',
      title: 'Phase 3 — Trend & Seasonality',
      blurb: 'Monthly global aggregates and 7-day rolling daily series for top countries.',
      open: false,
      code: `-- 3.1 Global monthly trend (56 months)
SELECT
    FORMAT(date, 'yyyy-MM') AS Month,
    SUM(new_cases)          AS NewCases,
    SUM(new_deaths)         AS NewDeaths,
    CAST(SUM(new_deaths) AS FLOAT)
      / NULLIF(SUM(new_cases), 0) AS MonthlyCfr
FROM dbo.OwidCovid
WHERE continent IS NOT NULL
GROUP BY FORMAT(date, 'yyyy-MM')
ORDER BY Month;

-- 3.2 7-day rolling average for top 12 countries by population
WITH TopCountries AS (
    SELECT TOP 12 location
    FROM dbo.OwidCovid
    WHERE continent IS NOT NULL
    GROUP BY location
    ORDER BY MAX(population) DESC
)
SELECT
    o.location,
    o.date,
    o.new_cases,
    AVG(CAST(o.new_cases AS FLOAT)) OVER (
        PARTITION BY o.location
        ORDER BY o.date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS Rolling7DayCases
FROM dbo.OwidCovid AS o
INNER JOIN TopCountries AS tc ON o.location = tc.location
ORDER BY o.location, o.date;`,
    },
    {
      id: 'phase-4',
      title: 'Phase 4 — Vaccination Effectiveness (key analysis)',
      blurb: 'Bucketed countries by vaccination rate, compared mean death rate per band. The main finding.',
      open: false,
      code: `-- 4.1 Country-level: vax band vs death rate
WITH Banded AS (
    SELECT
        Country,
        VaccinationRate,
        DeathRate,
        GdpPerCapita,
        CASE
            WHEN VaccinationRate <  0.20 THEN '1. 0-20%'
            WHEN VaccinationRate <  0.40 THEN '2. 20-40%'
            WHEN VaccinationRate <  0.60 THEN '3. 40-60%'
            WHEN VaccinationRate <  0.80 THEN '4. 60-80%'
            ELSE                              '5. 80%+'
        END AS VaxBand
    FROM dbo.Country_Summary
    WHERE VaccinationRate IS NOT NULL
      AND DeathRate       IS NOT NULL
)
SELECT
    VaxBand,
    COUNT(*)        AS Countries,
    AVG(DeathRate)  AS AvgDeathRate,
    MIN(DeathRate)  AS MinDeathRate,
    MAX(DeathRate)  AS MaxDeathRate
FROM Banded
GROUP BY VaxBand
ORDER BY VaxBand;
-- Verdict: 0-20% band: 1.40%   |   80%+ band: 0.57%`,
    },
    {
      id: 'phase-5',
      title: 'Phase 5 — Confounders: GDP, continent',
      blurb: 'Could income explain the vax–death link? GDP correlates with both — separated the effects.',
      open: false,
      code: `-- 5.1 Death rate by GDP per capita band
WITH GdpBanded AS (
    SELECT
        Country,
        DeathRate,
        InfectionRate,
        VaccinationRate,
        CASE
            WHEN GdpPerCapita <  5000  THEN '1. <$5k'
            WHEN GdpPerCapita < 15000  THEN '2. $5k-$15k'
            WHEN GdpPerCapita < 30000  THEN '3. $15k-$30k'
            WHEN GdpPerCapita < 50000  THEN '4. $30k-$50k'
            ELSE                              '5. $50k+'
        END AS GdpBand
    FROM dbo.Country_Summary
    WHERE GdpPerCapita IS NOT NULL
)
SELECT
    GdpBand,
    COUNT(*)              AS Countries,
    AVG(DeathRate)        AS AvgDeathRate,
    AVG(InfectionRate)    AS AvgInfectionRate,
    AVG(VaccinationRate)  AS AvgVaxRate
FROM GdpBanded
GROUP BY GdpBand
ORDER BY GdpBand;

-- 5.2 Continent rollup
SELECT
    Continent,
    COUNT(*)         AS Countries,
    SUM(Population)  AS Population,
    SUM(TotalCases)  AS TotalCases,
    SUM(TotalDeaths) AS TotalDeaths,
    CAST(SUM(TotalDeaths) AS FLOAT) * 1000000.0
        / NULLIF(SUM(Population), 0) AS DeathsPerMillion
FROM dbo.Country_Summary
GROUP BY Continent
ORDER BY DeathsPerMillion DESC;`,
    },
  ];

  toggleSql(phase: SqlPhase): void {
    phase.open = !phase.open;
  }

  // ────────────────────────────────────────────────────────────────
  //  LIFECYCLE
  // ────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    // Charts built lazily on tab activation.
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  // ────────────────────────────────────────────────────────────────
  //  CHART CONFIGURATION (dark theme)
  // ────────────────────────────────────────────────────────────────

  private rebuildCharts(): void {
    this.destroyCharts();

    const palette = {
      blue:   '#60A5FA',
      gold:   '#FBBF24',
      green:  '#34D399',
      red:    '#F87171',
      indigo: '#818CF8',
      cyan:   '#38BDF8',
      orange: '#FB923C',
      text:   '#9CA3AF',
      grid:   'rgba(255, 255, 255, 0.06)',
      surface:'#10141B',
    };

    Chart.defaults.font.family =
      "'DM Sans', 'Inter', system-ui, sans-serif";
    Chart.defaults.color = palette.text;
    Chart.defaults.borderColor = palette.grid;
    Chart.defaults.plugins.tooltip.backgroundColor = '#181D26';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#F3F4F6';
    Chart.defaults.plugins.tooltip.bodyColor = '#D1D5DB';

    const canvases = this.canvases.toArray();
    for (const ref of canvases) {
      const id = ref.nativeElement.dataset['chart'];
      const cfg = this.configFor(id, palette);
      if (cfg) this.charts.push(new Chart(ref.nativeElement, cfg));
    }
  }

  private configFor(
    id: string | undefined,
    p: any,
  ): ChartConfiguration | null {
    switch (id) {
      case 'monthly-trend':    return this.monthlyTrendChart(p);
      case 'vax-effect':       return this.vaxEffectChart(p);
      case 'gdp-effect':       return this.gdpEffectChart(p);
      case 'continent-deaths': return this.continentDeathsChart(p);
      case 'vax-scatter':      return this.vaxScatterChart(p);
      case 'cfr-decline':      return this.cfrDeclineChart(p);
      default: return null;
    }
  }

  // ── Monthly trend: cases vs deaths (twin axis) ──
  private monthlyTrendChart(p: any): ChartConfiguration {
    const labels = [
      '2020-03','2020-06','2020-09','2020-12',
      '2021-03','2021-06','2021-09','2021-12',
      '2022-03','2022-06','2022-09','2022-12',
      '2023-03','2023-06','2023-09','2023-12',
      '2024-03','2024-06','2024-08',
    ];
    const cases = [
      611_707, 3_936_842, 8_143_085, 17_255_870,
      12_862_026, 10_825_132, 15_487_432, 19_382_239,
      46_082_638, 15_145_306, 14_173_580, 67_065_965,
      3_635_723, 918_539, 830_747, 1_614_765,
      355_645, 190_568, 47_169,
    ];
    const deaths = [
      35_799, 144_336, 160_002, 329_388,
      253_439, 258_624, 246_832, 197_605,
      175_994, 38_228, 46_161, 57_961,
      26_682, 8_226, 8_827, 18_055,
      6_746, 2_914, 815,
    ];

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'New Cases',
            data: cases,
            backgroundColor: p.blue,
            borderRadius: 3,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'New Deaths',
            data: deaths,
            borderColor: p.red,
            backgroundColor: p.red,
            pointBackgroundColor: p.red,
            pointRadius: 2,
            tension: 0.3,
            yAxisID: 'y1',
            order: 1,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: ${(ctx.parsed.y as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            position: 'left',
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `${((v as number) / 1_000_000).toFixed(0)}M`,
            },
          },
          y1: {
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `${((v as number) / 1000).toFixed(0)}k`,
            },
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { autoSkip: false, maxRotation: 60, minRotation: 60, font: { size: 9 } },
          },
        },
      },
    };
  }

  // ── Vaccination band → avg death rate ──
  private vaxEffectChart(p: any): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['0–20%', '20–40%', '40–60%', '60–80%', '80%+'],
        datasets: [
          {
            label: 'Avg Death Rate',
            data: [1.40, 2.04, 1.35, 0.88, 0.57],
            backgroundColor: (ctx: ScriptableContext<'bar'>) => {
              const v = (ctx.raw as number) ?? 0;
              if (v >= 1.5) return p.red;
              if (v >= 1.0) return p.orange;
              if (v >= 0.7) return p.gold;
              return p.green;
            },
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Death rate: ${(ctx.parsed.y as number).toFixed(2)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          x: { grid: { display: false }, border: { display: false } },
        },
      },
    };
  }

  // ── GDP band → death rate + vax rate twin-axis ──
  private gdpEffectChart(p: any): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['<$5k', '$5k–$15k', '$15k–$30k', '$30k–$50k', '$50k+'],
        datasets: [
          {
            type: 'bar',
            label: 'Avg Death Rate',
            data: [1.92, 1.61, 1.14, 0.58, 0.35],
            backgroundColor: p.red,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Avg Vax Rate',
            data: [34, 52, 60, 73, 79],
            borderColor: p.green,
            backgroundColor: p.green,
            pointBackgroundColor: p.green,
            pointRadius: 5,
            tension: 0.35,
            yAxisID: 'y1',
            order: 1,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ctx.dataset.label === 'Avg Vax Rate'
                  ? `Vax: ${ctx.parsed.y}%`
                  : `Death rate: ${(ctx.parsed.y as number).toFixed(2)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          x: { grid: { display: false }, border: { display: false } },
        },
      },
    };
  }

  // ── Continent deaths-per-million ──
  private continentDeathsChart(p: any): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['South America', 'North America', 'Europe', 'Oceania', 'Asia', 'Africa'],
        datasets: [
          {
            label: 'Deaths per Million',
            data: [3104, 2784, 2581, 731, 347, 182],
            backgroundColor: [p.red, p.orange, p.gold, p.indigo, p.blue, p.green],
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${(ctx.parsed.x as number).toLocaleString()} per million`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${(v as number).toLocaleString()}` },
          },
          y: { grid: { display: false }, border: { display: false } },
        },
      },
    };
  }

  // ── Vaccination rate vs death rate scatter (sample) ──
  private vaxScatterChart(p: any): ChartConfiguration {
    // [vax rate %, death rate %, country]  — 30 representative points
    const points: { x: number; y: number; c: string }[] = [
      { x: 68, y: 1.15, c: 'United States' },
      { x: 82, y: 1.87, c: 'Brazil' },
      { x: 67, y: 1.18, c: 'India' },
      { x: 55, y: 1.66, c: 'Russia' },
      { x: 64, y: 4.39, c: 'Mexico' },
      { x: 75, y: 0.93, c: 'United Kingdom' },
      { x: 84, y: 4.88, c: 'Peru' },
      { x: 81, y: 0.74, c: 'Italy' },
      { x: 76, y: 0.46, c: 'Germany' },
      { x: 78, y: 0.43, c: 'France' },
      { x: 64, y: 2.37, c: 'Indonesia' },
      { x: 66, y: 1.93, c: 'Iran' },
      { x: 72, y: 2.23, c: 'Colombia' },
      { x: 77, y: 1.29, c: 'Argentina' },
      { x: 90, y: 0.12, c: 'China' },
      { x: 86, y: 0.87, c: 'Spain' },
      { x: 57, y: 1.81, c: 'Poland' },
      { x: 40, y: 1.99, c: 'Ukraine' },
      { x: 35, y: 2.52, c: 'South Africa' },
      { x: 62, y: 0.60, c: 'Turkey' },
      { x: 83, y: 0.22, c: 'Japan' },
      { x: 41, y: 1.94, c: 'Romania' },
      { x: 68, y: 1.60, c: 'Philippines' },
      { x: 90, y: 1.19, c: 'Chile' },
      { x: 83, y: 1.15, c: 'Canada' },
      { x: 15, y: 1.20, c: 'Ethiopia' },
      { x: 12, y: 1.40, c: 'Nigeria' },
      { x: 8,  y: 2.10, c: 'Yemen' },
      { x: 25, y: 1.80, c: 'Sudan' },
      { x: 30, y: 1.55, c: 'Iraq' },
    ];

    return {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Country',
            data: points.map((d) => ({ x: d.x, y: d.y })),
            pointBackgroundColor: (ctx: ScriptableContext<'scatter'>) => {
              const raw = ctx.raw as { x: number };
              if (!raw) return p.blue;
              if (raw.x < 20) return p.red;
              if (raw.x < 40) return p.orange;
              if (raw.x < 60) return p.gold;
              if (raw.x < 80) return p.cyan;
              return p.green;
            },
            pointRadius: 5,
            pointHoverRadius: 7,
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const i = ctx.dataIndex;
                const pt = points[i];
                return `${pt.c}: vax ${pt.x}%, death ${pt.y}%`;
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Vaccination rate (%)', color: p.text },
            min: 0, max: 100,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          y: {
            title: { display: true, text: 'Death rate (CFR %)', color: p.text },
            min: 0,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
        },
      },
    };
  }

  // ── CFR decline over time (monthly CFR) ──
  private cfrDeclineChart(p: any): ChartConfiguration {
    const labels = [
      '2020-04','2020-07','2020-10','2021-01','2021-04','2021-07','2021-10',
      '2022-01','2022-04','2022-07','2022-10','2023-01','2023-04','2023-07',
      '2023-10','2024-01','2024-04','2024-07',
    ];
    const cfr = [
      8.78, 2.68, 1.54, 2.19, 1.70, 1.75, 1.64,
      0.28, 0.32, 0.22, 0.37, 0.18, 0.74, 0.47,
      1.84, 2.34, 2.09, 1.58,
    ];

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly CFR %',
            data: cfr,
            borderColor: p.gold,
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            fill: 'origin',
            tension: 0.35,
            pointBackgroundColor: p.gold,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            callbacks: {
              label: (ctx) => `CFR: ${(ctx.parsed.y as number).toFixed(2)}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { maxRotation: 60, minRotation: 60, font: { size: 9 } },
          },
        },
      },
    };
  }
}
