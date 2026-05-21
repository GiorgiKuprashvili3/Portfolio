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

type TabId = 'overview' | 'charts' | 'segments' | 'insights' | 'python';

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

interface SegmentRow {
  name: string;
  users: number;
  r: number;
  f: number;
  m: string;
  tone: 'good' | 'warn' | 'bad' | 'critical';
}

interface CodePhase {
  id: string;
  title: string;
  blurb: string;
  code: string;
  open: boolean;
}

@Component({
  selector: 'app-customer-segmentation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-segmentation-detail.component.html',
  styleUrls: ['./customer-segmentation-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSegmentationDetailComponent implements AfterViewInit, OnDestroy {
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
    { id: 'segments', label: 'Segments' },
    { id: 'insights', label: 'Insights & Recs' },
    { id: 'python',   label: 'Python Code' },
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
    { label: 'Python',       tone: 'sql' },
    { label: 'Scikit-learn', tone: 'excel' },
    { label: 'Machine Learning', tone: 'analytics' },
  ];

  keyStats: KeyStat[] = [
    { label: 'Total Profiles',     value: '4,339',  sub: 'Filtered UK retail customers' },
    { label: 'Optimal Clusters',   value: '4',      sub: 'Determined via Elbow Method' },
    { label: 'Analysis Model',     value: 'RFM',    sub: 'Recency, Frequency, Monetary' },
    { label: 'Champions (VIP)',    value: '22%',    sub: 'Highest revenue drivers', tone: 'good' },
    { label: 'Lost Customers',     value: '41%',    sub: 'Inactive for > 6 months', tone: 'bad' },
  ];

  insights: InsightCard[] = [
    {
      title: 'Champions drive disproportionate revenue',
      body: 'Only 22% of the customer base falls into the Champions cluster, but they account for over 55% of the total monetary value. Retention here is critical.',
      tone: 'good',
    },
    {
      title: 'High monetary value hidden in At-Risk segment',
      body: 'The At-Risk group features high historical spend but poor recency. A targeted win-back campaign offering high-value discounts could reactivate dormant revenue.',
      tone: 'warn',
    },
    {
      title: 'Data skew required log transformation',
      body: 'Initial monetary distributions were heavily right-skewed. Applying a log1p transformation alongside a StandardScaler was required before K-Means to ensure Euclidean distance validity.',
      tone: 'info',
    },
    {
      title: 'Large volume of Lost Customers',
      body: '41% of unique IDs mapped to the Lost segment (low frequency, low spend, high recency). Marketing spend should NOT be prioritized on this group.',
      tone: 'bad',
    },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — SEGMENTS
  // ────────────────────────────────────────────────────────────────

  segmentTable: SegmentRow[] = [
    { name: 'Champions',    users: 954,  r: 12,  f: 85, m: '$4,500', tone: 'good' },
    { name: 'Loyal',        users: 1102, r: 35,  f: 42, m: '$1,800', tone: 'good' },
    { name: 'At Risk',      users: 504,  r: 120, f: 15, m: '$950',   tone: 'warn' },
    { name: 'Lost',         users: 1779, r: 280, f: 2,  m: '$65',    tone: 'bad' },
  ];

  // ────────────────────────────────────────────────────────────────
  //  STATIC CONTENT — PYTHON
  // ────────────────────────────────────────────────────────────────

  codePhases: CodePhase[] = [
    {
      id: 'phase-1',
      title: 'Phase 1 — RFM Feature Engineering',
      blurb: 'Aggregating transactional data into Recency, Frequency, and Monetary metrics per user.',
      open: true,
      code: `import datetime as dt

# Calculate Recency, Frequency, and Monetary value for each customer
snapshot_date = df['InvoiceDate'].max() + dt.timedelta(days=1)

rfm = df.groupby('CustomerID').agg({
    'InvoiceDate': lambda x: (snapshot_date - x.max()).days,
    'InvoiceNo': 'count',
    'TotalPrice': 'sum'
})

rfm.rename(columns={'InvoiceDate': 'Recency',
                    'InvoiceNo': 'Frequency',
                    'TotalPrice': 'MonetaryValue'}, inplace=True)`,
    },
    {
      id: 'phase-2',
      title: 'Phase 2 — Transformation & Scaling',
      blurb: 'Fixing skewness to prepare data for K-Means.',
      open: false,
      code: `import numpy as np
from sklearn.preprocessing import StandardScaler

# Log transformation to handle right-skewed data
rfm_log = np.log1p(rfm)

# Initialize scaler
scaler = StandardScaler()
scaler.fit(rfm_log)

# Scale the data
rfm_normalized = scaler.transform(rfm_log)`,
    },
    {
      id: 'phase-3',
      title: 'Phase 3 — K-Means Clustering (K=4)',
      blurb: 'Applying the model after finding the optimal K via the Elbow Method.',
      open: false,
      code: `from sklearn.cluster import KMeans

# Optimal K was found to be 4
kmeans = KMeans(n_clusters=4, random_state=42)
kmeans.fit(rfm_normalized)

# Assign clusters back to the original RFM dataframe
rfm['Cluster'] = kmeans.labels_`,
    }
  ];

  // ────────────────────────────────────────────────────────────────
  //  LIFECYCLE & CHARTS
  // ────────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    if (this.activeTab() === 'charts') {
      this.rebuildCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private rebuildCharts(): void {
    this.destroyCharts();
    const arr = this.canvases.toArray();
    if (arr.length < 2) return;

    // 1. Cluster Distribution (Doughnut)
    const ctx1 = arr[0].nativeElement.getContext('2d');
    if (ctx1) {
      this.charts.push(
        new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: ['Champions', 'Loyal', 'At Risk', 'Lost'],
            datasets: [{
              data: [954, 1102, 504, 1779],
              backgroundColor: ['#34D399', '#60A5FA', '#FBBF24', '#F87171'],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: { position: 'right', labels: { color: '#9CA3AF', font: { family: 'Inter' } } }
            }
          }
        })
      );
    }

    // 2. Average RFM Centroids (Bar)
    const ctx2 = arr[1].nativeElement.getContext('2d');
    if (ctx2) {
      this.charts.push(
        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['Champions', 'Loyal', 'At Risk', 'Lost'],
            datasets: [
              {
                label: 'Recency (Days)',
                data: [12, 35, 120, 280],
                backgroundColor: '#818CF8',
              },
              {
                label: 'Frequency',
                data: [85, 42, 15, 2],
                backgroundColor: '#38BDF8',
              }
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
              x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
            },
            plugins: {
              legend: { labels: { color: '#9CA3AF' } }
            }
          }
        })
      );
    }
  }

  togglePhase(phase: CodePhase): void {
    phase.open = !phase.open;
  }
}