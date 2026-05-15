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

type TabId = 'overview' | 'charts' | 'products' | 'insights' | 'sql';

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

interface DiscountRow {
  bucket: string;
  margin: string;
  profit: number;
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
  selector: 'app-adventureworks-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventureworks-detail.component.html',
  styleUrls: ['./adventureworks-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdventureworksDetailComponent
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
    { id: 'overview', label: 'Overview' },
    { id: 'charts',   label: 'Charts' },
    { id: 'products', label: 'Products' },
    { id: 'insights', label: 'Insights & Recs' },
    { id: 'sql',      label: 'SQL Code' },
  ];

  setTab(id: TabId): void {
    this.activeTab.set(id);
    // Build charts only when the Charts pane mounts.
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
    { label: 'Total Revenue',       value: '$109.8M', sub: '4-year cumulative' },
    { label: 'Total Profit',        value: '$10.4M',  sub: 'Net after all lines', tone: 'good' },
    { label: 'Avg Margin',          value: '~9.5%',   sub: 'Volatile across periods' },
    { label: 'Best Margin Month',   value: '19%',     sub: 'November', tone: 'good' },
    { label: 'Worst Margin Month',  value: '3%',      sub: 'June', tone: 'bad' },
    { label: 'Neg. Profit Lines',   value: '29,161',  sub: 'Many at 0% discount', tone: 'bad' },
  ];

  insights: InsightCard[] = [
    {
      title: 'Revenue is stable & growing',
      body:
        'Year-over-year profit growth is clear. After normalizing for partial years (2011, 2014), a consistent upward trend emerges from 13% margin in 2011 to 17% in 2014.',
      tone: 'good',
    },
    {
      title: 'Seasonality is margin-driven, not demand-driven',
      body:
        'Revenue fluctuates mildly; profitability swings dramatically. Q1 and Q4 are strongest (10–11% margin). Q2 is structurally weak at 6%.',
      tone: 'warn',
    },
    {
      title: '29K transactions sold below cost',
      body:
        '~29,000 lines show negative profit with 0% discount. This is a systemic pricing or cost-configuration failure — not a discount strategy issue.',
      tone: 'bad',
    },
    {
      title: 'Bikes = 80% of all profit',
      body:
        'Mountain Bikes and Road Bikes dominate. Accessories deliver excellent 50–60% margins at lower volume. Clothing (Jerseys, Caps) consistently loses money.',
      tone: 'info',
    },
    {
      title: 'Discounts above 10% are catastrophic',
      body:
        '0% discount generates +$11.3M profit. 10–30% discount bucket: −$922K. 30%+ bucket: −$709K. The margin destruction is near-total above 10%.',
      tone: 'warn',
    },
    {
      title: 'Products themselves are sound',
      body:
        'Theoretical margins are healthy for almost all SKUs. Losses stem from pricing execution, not bad product economics. A pricing floor would fix most of it.',
      tone: 'good',
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — CHARTS
  // ────────────────────────────────────────────────────────────────

  discountTable: DiscountRow[] = [
    { bucket: '0%',     margin: '30%',   profit:  11_264_979, tone: 'good' },
    { bucket: '0–10%',  margin: '7%',    profit:    -260_949, tone: 'warn' },
    { bucket: '10–30%', margin: '-74%',  profit:    -922_772, tone: 'bad' },
    { bucket: '30%+',   margin: '-306%', profit:    -709_354, tone: 'critical' },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — PRODUCTS
  // ────────────────────────────────────────────────────────────────

  topProducts: string[] = [
    'Mountain-200 Black, 42', 'Mountain-200 Black, 38', 'Mountain-200 Black, 46',
    'Mountain-200 Silver, 38', 'Mountain-200 Silver, 46', 'Mountain-200 Silver, 42',
    'Road-150 Red, 48', 'Road-150 Red, 62', 'Road-150 Red, 52', 'Road-150 Red, 56',
    'Road-150 Red, 44', 'Touring-1000 Blue, 54', 'Road-250 Red, 58', 'Road-250 Red, 48',
    'Road-350-W Yellow, 44', 'Touring-1000 Blue, 50', 'Touring-1000 Blue, 46',
    'Road-350-W Yellow, 42', 'Road-250 Red, 52', 'Hitch Rack - 4-Bike',
  ];

  lossProducts: string[] = [
    'Road-650 Red, 44', 'Touring-1000 Yellow, 60', 'Road-650 Red, 60',
    'Touring-1000 Yellow, 46', 'Road-650 Black, 52', 'Long-Sleeve Logo Jersey, L',
    'Road-650 Red, 62', 'Road-650 Black, 58', 'Road-650 Red, 48',
    'Touring-3000 Blue, 50', 'Touring-3000 Yellow, 62', 'Road-250 Black, 44',
    'Touring-3000 Yellow, 44', 'ML Road Frame-W - Yellow, 44',
    'Short-Sleeve Classic Jersey, XL', 'HL Road Frame - Red, 62',
    'HL Road Frame - Red, 44', 'Touring-3000 Blue, 54', 'Touring-3000 Yellow, 50',
    'Long-Sleeve Logo Jersey, M',
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — INSIGHTS & RECS
  // ────────────────────────────────────────────────────────────────

  findings: string[] = [
    'Profit losses are driven by pricing execution, not by demand or product quality.',
    'Discounts are not governed: any bucket above 0% drags margin below zero.',
    'Portfolio is over-concentrated in 1–2 categories (Bikes carries ~80% of profit).',
    'A handful of subcategories (Jerseys, Caps, Road/Touring Frames) consistently bleed money.',
    'Margins improve sharply (3% → 17%) once normalised pricing discipline returns in 2013–2014.',
  ];

  recommendations: Recommendation[] = [
    {
      title: 'Pricing policy',
      body:
        'Introduce a hard Price Floor = StandardCost. Cap discounts at 5–10% on low-margin SKUs. Require manager override for any sale below cost.',
      tone: 'bad',
    },
    {
      title: 'Portfolio optimisation',
      body:
        'Reprice or retire chronic loss-makers: Jerseys, Caps, Road/Touring Frames. Double down on Accessories with cross-sell into Bike orders.',
      tone: 'warn',
    },
    {
      title: 'Monitoring',
      body:
        'Weekly discount-bucket dashboard. Monthly category-mix report. Quarterly SKU profitability review. Alert on UnitPrice < StandardCost.',
      tone: 'info',
    },
    {
      title: 'Strategic focus',
      body:
        'Hold Bikes leadership and grow share-of-cart. Expand the Accessories catalogue (24 SKUs today) — highest-margin lever in the portfolio.',
      tone: 'good',
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — SQL
  // ────────────────────────────────────────────────────────────────

  sqlPhases: SqlPhase[] = [
    {
      id: 'phase-0',
      title: 'Phase 0 — Data Exploration',
      blurb: 'Structure and join sanity checks on the source tables.',
      open: false,
      code: `-- Quick structure & sample check of base tables
SELECT TOP 100 * FROM Sales.SalesOrderHeader;
SELECT TOP 100 * FROM Sales.SalesOrderDetail;
SELECT TOP 100 * FROM Production.Product;
SELECT TOP 100 * FROM Production.ProductSubcategory;
SELECT TOP 100 * FROM Production.ProductCategory;

-- Basic join sanity check
SELECT TOP 100 *
FROM Sales.SalesOrderHeader AS h
INNER JOIN Sales.SalesOrderDetail AS d ON h.SalesOrderID = d.SalesOrderID
INNER JOIN Production.Product AS p ON d.ProductID = p.ProductID
LEFT JOIN Production.ProductSubcategory AS ps ON p.ProductSubcategoryID = ps.ProductSubcategoryID
LEFT JOIN Production.ProductCategory AS pc ON ps.ProductCategoryID = pc.ProductCategoryID;`,
    },
    {
      id: 'phase-1',
      title: 'Phase 1 — Analytical Panel (General_Panel)',
      blurb: 'One unified view: revenue, cost, profit, margin, calendar, category hierarchy.',
      open: true,
      code: `IF OBJECT_ID('dbo.General_Panel', 'V') IS NOT NULL
    DROP VIEW dbo.General_Panel;
GO

CREATE VIEW dbo.General_Panel
AS
SELECT
    /* Keys & time */
    h.SalesOrderID,
    d.SalesOrderDetailID,
    h.OrderDate,
    YEAR(h.OrderDate)              AS OrderYear,
    MONTH(h.OrderDate)             AS OrderMonthNumber,
    DATENAME(month, h.OrderDate)   AS OrderMonthName,
    DATEPART(QUARTER, h.OrderDate) AS OrderQuarter,

    /* Product & category */
    d.ProductID,
    p.Name  AS ProductName,
    ps.Name AS SubcategoryName,
    pc.Name AS CategoryName,

    /* Quantities & prices */
    d.OrderQty,
    d.UnitPrice,
    d.UnitPriceDiscount AS DiscountPercent,
    d.UnitPrice * (1 - d.UnitPriceDiscount) AS NetUnitPrice,

    /* Financials */
    d.LineTotal AS LineRevenue,
    p.StandardCost,
    p.StandardCost * d.OrderQty    AS LineCost,
    (d.UnitPrice - p.StandardCost) AS UnitMargin,
    d.LineTotal - (d.OrderQty * p.StandardCost) AS LineProfit,
    (d.LineTotal - (d.OrderQty * p.StandardCost))
        / NULLIF(d.LineTotal, 0) AS MarginPercent
FROM Sales.SalesOrderHeader  AS h
INNER JOIN Sales.SalesOrderDetail AS d ON h.SalesOrderID = d.SalesOrderID
INNER JOIN Production.Product     AS p ON d.ProductID    = p.ProductID
LEFT JOIN Production.ProductSubcategory AS ps
    ON p.ProductSubcategoryID = ps.ProductSubcategoryID
LEFT JOIN Production.ProductCategory    AS pc
    ON ps.ProductCategoryID = pc.ProductCategoryID;
GO`,
    },
    {
      id: 'phase-2',
      title: 'Phase 2 — Data Quality Checks',
      blurb: 'NULLs, impossible values, duplicates, discount sanity. Surfaced 29,161 negative-profit rows.',
      open: false,
      code: `-- 2.3 Impossible / suspicious values
SELECT
    SUM(CASE WHEN OrderQty    <= 0 THEN 1 ELSE 0 END) AS NonPositiveQty,
    SUM(CASE WHEN UnitPrice   <= 0 THEN 1 ELSE 0 END) AS NonPositivePrice,
    SUM(CASE WHEN StandardCost <  0 THEN 1 ELSE 0 END) AS NegativeCost,
    SUM(CASE WHEN LineRevenue <= 0 THEN 1 ELSE 0 END) AS NonPositiveRevenue,
    SUM(CASE WHEN LineProfit   <  0 THEN 1 ELSE 0 END) AS NegativeProfitRows
FROM General_Panel;
-- 29,161 lines with negative profit (key insight)

-- 2.6 Discount distribution
SELECT
    CASE
        WHEN DiscountPercent  = 0    THEN '0%'
        WHEN DiscountPercent <= 0.10 THEN '0-10%'
        WHEN DiscountPercent <= 0.30 THEN '10-30%'
        ELSE '30%+'
    END AS DiscountBucket,
    COUNT(*) AS NoOfRows
FROM General_Panel
GROUP BY
    CASE
        WHEN DiscountPercent  = 0    THEN '0%'
        WHEN DiscountPercent <= 0.10 THEN '0-10%'
        WHEN DiscountPercent <= 0.30 THEN '10-30%'
        ELSE '30%+'
    END
ORDER BY DiscountBucket;

-- 2.14 Duplicate detection
SELECT SalesOrderID, ProductID, COUNT(*) AS LineCount
FROM General_Panel
GROUP BY SalesOrderID, ProductID
HAVING COUNT(*) > 1;
-- No duplicates found`,
    },
    {
      id: 'phase-3',
      title: 'Phase 3 — Seasonality & Trend',
      blurb: 'Monthly / quarterly / yearly aggregates, normalised to handle partial years (2011, 2014).',
      open: false,
      code: `-- 3.7 Normalised monthly seasonality
SELECT
    OrderMonthNumber,
    MAX(OrderMonthName) AS OrderMonthName,
    COUNT(DISTINCT OrderYear) AS YearsWithData,
    SUM(LineRevenue) / NULLIF(COUNT(DISTINCT OrderYear), 0) AS AvgMonthlyRevenue,
    SUM(LineProfit)  / NULLIF(COUNT(DISTINCT OrderYear), 0) AS AvgMonthlyProfit,
    SUM(LineProfit)  / NULLIF(SUM(LineRevenue), 0)          AS MarginPercent
FROM General_Panel
GROUP BY OrderMonthNumber
ORDER BY OrderMonthNumber;

-- 3.8 Normalised quarterly seasonality
SELECT
    OrderQuarter,
    COUNT(DISTINCT OrderYear) AS YearsWithData,
    SUM(LineRevenue) / NULLIF(COUNT(DISTINCT OrderYear), 0) AS AvgQuarterlyRevenue,
    SUM(LineProfit)  / NULLIF(COUNT(DISTINCT OrderYear), 0) AS AvgQuarterlyProfit,
    SUM(LineProfit)  / NULLIF(SUM(LineRevenue), 0)          AS MarginPercent
FROM General_Panel
GROUP BY OrderQuarter
ORDER BY OrderQuarter;

-- 3.6 Yearly trend with normalisation
WITH YearSummary AS (
    SELECT
        OrderYear,
        SUM(LineRevenue) AS TotalRevenue,
        SUM(LineProfit)  AS TotalProfit,
        SUM(LineProfit) / NULLIF(SUM(LineRevenue), 0) AS MarginPercent,
        COUNT(DISTINCT OrderMonthNumber) AS MonthsAvailable
    FROM General_Panel
    GROUP BY OrderYear
)
SELECT
    OrderYear, TotalRevenue, TotalProfit, MarginPercent, MonthsAvailable,
    TotalRevenue / NULLIF(MonthsAvailable, 0) AS AvgMonthlyRevenue,
    TotalProfit  / NULLIF(MonthsAvailable, 0) AS AvgMonthlyProfit
FROM YearSummary
ORDER BY OrderYear;`,
    },
    {
      id: 'phase-4',
      title: 'Phase 4 — Profitability Drivers',
      blurb: 'Discount buckets vs margin, category and subcategory mix.',
      open: false,
      code: `-- 4.2 Discount buckets: impact on margin & profit
SELECT
    CASE
        WHEN DiscountPercent  = 0    THEN '0%'
        WHEN DiscountPercent <= 0.10 THEN '0-10%'
        WHEN DiscountPercent <= 0.30 THEN '10-30%'
        ELSE '30%+'
    END AS DiscountBucket,
    AVG(MarginPercent) AS AvgMargin,
    SUM(LineRevenue)   AS Revenue,
    SUM(LineProfit)    AS Profit,
    COUNT(*)           AS Transactions
FROM General_Panel
GROUP BY
    CASE
        WHEN DiscountPercent  = 0    THEN '0%'
        WHEN DiscountPercent <= 0.10 THEN '0-10%'
        WHEN DiscountPercent <= 0.30 THEN '10-30%'
        ELSE '30%+'
    END
ORDER BY DiscountBucket;

-- 4.3 Profit by category
SELECT
    CategoryName,
    AVG(LineProfit)    AS AvgProfit,
    SUM(LineProfit)    AS TotalProfit,
    AVG(MarginPercent) AS AvgMarginPercent,
    COUNT(*)           AS Transactions,
    SUM(OrderQty)      AS TotalSold
FROM General_Panel
GROUP BY CategoryName
ORDER BY TotalProfit DESC;

-- 4.3 Profit by subcategory
SELECT
    SubcategoryName,
    CategoryName,
    AVG(LineProfit)    AS AvgProfit,
    SUM(LineProfit)    AS TotalProfit,
    AVG(MarginPercent) AS AvgMarginPercent,
    COUNT(*)           AS Transactions,
    SUM(OrderQty)      AS TotalSold
FROM General_Panel
GROUP BY SubcategoryName, CategoryName
ORDER BY TotalProfit DESC;`,
    },
    {
      id: 'phase-5',
      title: 'Phase 5 — Negative-Profit Root Cause',
      blurb: 'Are loss-maker SKUs inherently unprofitable, or sold below cost? Verdict: pricing execution.',
      open: false,
      code: `WITH NegativeLines AS (
    SELECT DISTINCT ProductID
    FROM General_Panel
    WHERE LineProfit < 0
),
ProductSummary AS (
    SELECT
        gp.ProductID,
        gp.ProductName,
        gp.CategoryName,
        gp.SubcategoryName,
        p.StandardCost,
        p.ListPrice,
        (p.ListPrice - p.StandardCost) AS TheoreticalProfit,
        (p.ListPrice - p.StandardCost) / NULLIF(p.ListPrice, 0)
            AS TheoreticalMarginPercent,
        MIN(gp.UnitPrice) AS MinUnitPrice_Sold,
        MAX(gp.UnitPrice) AS MaxUnitPrice_Sold,
        SUM(CASE WHEN gp.LineProfit < 0 THEN 1 ELSE 0 END) AS NegativeLineCount,
        COUNT(*) AS TotalLineCount,
        CASE WHEN p.ListPrice <= p.StandardCost THEN 1 ELSE 0 END
            AS IsInherentlyUnprofitable,
        MIN(gp.UnitPrice - p.StandardCost) AS MinUnitPriceMinusCost,
        MIN(gp.MarginPercent) AS MinObservedMarginPercent,
        MAX(gp.MarginPercent) AS MaxObservedMarginPercent
    FROM General_Panel  AS gp
    JOIN NegativeLines  AS nl ON gp.ProductID = nl.ProductID
    JOIN Production.Product AS p ON gp.ProductID = p.ProductID
    GROUP BY
        gp.ProductID, gp.ProductName, gp.CategoryName, gp.SubcategoryName,
        p.StandardCost, p.ListPrice
)
SELECT *
FROM ProductSummary
ORDER BY
    IsInherentlyUnprofitable DESC,
    NegativeLineCount       DESC;
-- Verdict: products are profitable at list price.
-- Losses come from selling below StandardCost (pricing execution, not catalog).`,
    },
  ];

  toggleSql(phase: SqlPhase): void {
    phase.open = !phase.open;
  }

  // ────────────────────────────────────────────────────────────────
  //  LIFECYCLE
  // ────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    // Charts are built lazily on tab activation.
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

    // Hard-coded dark palette — these are the chart-specific tokens,
    // independent of the host CSS variables so charts always read on the dark surface.
    const palette = {
      blue:   '#60A5FA',
      gold:   '#FBBF24',
      green:  '#34D399',
      red:    '#F87171',
      indigo: '#818CF8',
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
      case 'seasonality-month':   return this.monthlyChart(p);
      case 'seasonality-quarter': return this.quarterlyChart(p);
      case 'yearly-trend':        return this.yearlyChart(p);
      case 'discount-effect':     return this.discountChart(p);
      case 'category-profit':     return this.categoryChart(p);
      case 'subcategory-profit':  return this.subcategoryChart(p);
      case 'category-area':       return this.categoryAreaChart(p);
      default: return null;
    }
  }

  private monthlyChart(p: any): ChartConfiguration {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenue = [3400000,1700000,4500000,2000000,3000000,2500000,3400000,2600000,2800000,4000000,2000000,2600000];
    const profit  = [340000, 290000, 360000, 160000, 240000, 75000,  136000, 234000, 224000, 280000, 380000, 260000];
    const margin  = [10,17,8,8,8,3,4,9,8,7,19,10];
    return this.mixedChart(months, revenue, profit, margin, p);
  }

  private quarterlyChart(p: any): ChartConfiguration {
    const q = ['Q1','Q2','Q3','Q4'];
    const revenue = [9700000,7000000,9000000,8600000];
    const profit  = [970000, 420000, 630000, 946000];
    const margin  = [10,6,7,11];
    return this.mixedChart(q, revenue, profit, margin, p);
  }

  private yearlyChart(p: any): ChartConfiguration {
    const years = ['2011','2012','2013','2014'];
    const revenue = [1600000, 2800000, 3600000, 3350000];
    const profit  = [208000, 84000, 288000, 569000];
    const margin  = [13,3,8,17];
    return this.mixedChart(years, revenue, profit, margin, p);
  }

  private mixedChart(
    labels: string[],
    revenue: number[],
    profit: number[],
    margin: number[],
    p: any,
  ): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Avg Revenue',
            data: revenue,
            backgroundColor: p.blue,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'bar',
            label: 'Avg Profit',
            data: profit,
            backgroundColor: p.gold,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Margin %',
            data: margin,
            borderColor: p.green,
            backgroundColor: p.green,
            pointBackgroundColor: p.green,
            pointRadius: 3,
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
                ctx.dataset.label === 'Margin %'
                  ? `${ctx.dataset.label}: ${ctx.parsed.y}%`
                  : `${ctx.dataset.label}: $${(ctx.parsed.y as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) => `$${((v as number) / 1000).toLocaleString()}k`,
            },
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

  private discountChart(p: any): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['0%', '0–10%', '10–30%', '30%+'],
        datasets: [
          {
            label: 'Profit',
            data: [11_264_979, -260_949, -922_772, -709_354],
            backgroundColor: (ctx: ScriptableContext<'bar'>) =>
              ((ctx.raw as number) ?? 0) >= 0 ? p.green : p.red,
            borderRadius: 6,
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
                `Profit: $${(ctx.parsed.x as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `$${((v as number) / 1_000_000).toFixed(1)}M`,
            },
          },
          y: { grid: { display: false }, border: { display: false } },
        },
      },
    };
  }

  private categoryChart(p: any): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: ['Bikes', 'Accessories', 'Components', 'Clothing'],
        datasets: [
          {
            type: 'bar',
            label: 'Total Profit',
            data: [7_900_000, 700_000, 500_000, 300_000],
            backgroundColor: p.blue,
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Avg Margin %',
            data: [9, 59, 12, 20],
            borderColor: p.gold,
            backgroundColor: p.gold,
            pointBackgroundColor: p.gold,
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
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ctx.dataset.label === 'Avg Margin %'
                  ? `Margin: ${ctx.parsed.y}%`
                  : `Profit: $${(ctx.parsed.y as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `$${((v as number) / 1_000_000).toFixed(1)}M`,
            },
          },
          y1: {
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

  private subcategoryChart(p: any): ChartConfiguration {
    const labels = [
      'Mountain Bikes','Road Bikes','Mountain Frames','Helmets','Touring Bikes',
      'Wheels','Shorts','Tires and Tubes','Vests','Bike Racks','Gloves','Tights',
      'Cranksets','Bib-Shorts','Hydration Packs','Handlebars','Pedals',
      'Bottles and Cages','Fenders','Bike Stands','Forks','Derailleurs','Brakes',
      'Headsets','Saddles','Bottom Brackets','Socks','Cleaners','Locks','Pumps',
      'Chains','Caps','Jerseys','Touring Frames','Road Frames',
    ];
    const profit = [
      4_900_000, 2_800_000, 480_000, 60_000, 30_000,
      60_000, 60_000, 200_000, 100_000, 80_000, 30_000, 30_000,
      40_000, 30_000, 80_000, 20_000, 20_000,
      120_000, 30_000, 30_000, 20_000, 20_000, 20_000,
      20_000, 20_000, 20_000, 40_000, 20_000, 20_000, 20_000,
      20_000, -50_000, -180_000, -640_000, -780_000,
    ];
    const margin = [
      14, 7, 6, 55, 12,
      55, 47, 60, 48, 45, 45, 45,
      30, 30, 55, 22, 25,
      60, 60, 60, 25, 25, 25,
      25, 25, 25, 60, 30, 30, 30,
      25, 5, -10, -8, -15,
    ];
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Total Profit',
            data: profit,
            backgroundColor: (ctx: ScriptableContext<'bar'>) =>
              ((ctx.raw as number) ?? 0) < 0 ? p.red : p.blue,
            borderRadius: 3,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Avg Margin %',
            data: margin,
            borderColor: p.gold,
            pointBackgroundColor: p.gold,
            pointRadius: 2,
            tension: 0.2,
            yAxisID: 'y1',
            order: 1,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10 } },
        },
        scales: {
          y: {
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `$${((v as number) / 1000).toFixed(0)}k`,
            },
          },
          y1: {
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: { callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              autoSkip: false,
              maxRotation: 60,
              minRotation: 60,
              font: { size: 9 },
            },
          },
        },
      },
    };
  }

  private categoryAreaChart(p: any): ChartConfiguration {
    const years = ['2011', '2012', '2013', '2014'];
    return {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Bikes',
            data: [1_400_000, 600_000, 2_600_000, 2_900_000],
            backgroundColor: 'rgba(96, 165, 250, 0.55)',
            borderColor: p.blue,
            fill: 'origin',
            tension: 0.25,
          },
          {
            label: 'Components',
            data: [150_000, 130_000, 280_000, 80_000],
            backgroundColor: 'rgba(248, 113, 113, 0.55)',
            borderColor: p.red,
            fill: '-1',
            tension: 0.25,
          },
          {
            label: 'Clothing',
            data: [30_000, 80_000, 150_000, 120_000],
            backgroundColor: 'rgba(129, 140, 248, 0.55)',
            borderColor: p.indigo,
            fill: '-1',
            tension: 0.25,
          },
          {
            label: 'Accessories',
            data: [40_000, 90_000, 320_000, 300_000],
            backgroundColor: 'rgba(251, 191, 36, 0.55)',
            borderColor: p.gold,
            fill: '-1',
            tension: 0.25,
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
              label: (ctx) =>
                `${ctx.dataset.label}: $${(ctx.parsed.y as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            stacked: true,
            grid: { color: p.grid, drawTicks: false },
            border: { display: false },
            ticks: {
              callback: (v) =>
                `$${((v as number) / 1_000_000).toFixed(1)}M`,
            },
          },
          x: { grid: { display: false }, border: { display: false } },
        },
      },
    };
  }
}