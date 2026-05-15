import { Component, inject } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { PortfolioService } from '../portfolio.service';

interface GraphNode {
  id: string;
  label: string;
  kind: 'project' | 'tech';
  projectType?: 'fe' | 'da';
  x: number;
  y: number;
  r: number;
}

interface GraphEdge {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ProjectData {
  id: string;
  label: string;
  type: 'fe' | 'da';
  tech: string[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent {

  private svc = inject(PortfolioService);

  // ── Map service projects → internal ProjectData ──────────────────────────
  // This is the ONLY source of truth. Add/remove projects in PortfolioService
  // and this component will reflect it automatically.
  readonly projects: ProjectData[] = this.svc.getProjects().map(p => ({
    id: `p${p.id}`,
    label: this.shortLabel(p.title),
    type: p.type,
    tech: p.tags.map(t => t.label),
  }));

  // ── SVG positions: keyed by project id ("p1", "p7", …) and tech label ────
  // Add a new entry here whenever a new project or unique tech is added to
  // the service. Positions that are missing will fall back to (400, 250).
  private readonly pos: Record<string, { x: number; y: number }> = {
    // Projects (matched to service ids)
    p1: { x: 110, y: 90  },
    p2: { x: 200, y: 50  },
    p3: { x: 95,  y: 180 },
    p4: { x: 420, y: 420 },
    p7: { x: 750, y: 280 },
    p8: { x: 680, y: 200 },

    // Tech nodes
    'Angular':          { x: 290, y: 180 },
    'WebRTC':           { x: 60,  y: 50  },
    'RxJS':             { x: 60,  y: 130 },
    'NgRx':             { x: 240, y: 110 },
    'Angular Material': { x: 320, y: 60  },
    'SVG':              { x: 200, y: 240 },
    'TypeScript':       { x: 130, y: 280 },
    'Python':           { x: 510, y: 290 },
    'Pandas':           { x: 580, y: 360 },
    'Matplotlib':       { x: 500, y: 380 },
    'Google Analytics': { x: 630, y: 460 },
    'SQL':              { x: 670, y: 130 },
    'Excel':            { x: 770, y: 160 },
    'Analytics':        { x: 740, y: 350 },
  };

  readonly nodes: GraphNode[] = this.buildNodes();
  readonly edges: GraphEdge[] = this.buildEdges();

  // ── Derived lists for the sidebar ─────────────────────────────────────────
  get feProjects(): ProjectData[] {
    return this.projects.filter(p => p.type === 'fe');
  }

  get daProjects(): ProjectData[] {
    return this.projects.filter(p => p.type === 'da');
  }

  get techNodes(): GraphNode[] {
    return this.nodes.filter(n => n.kind === 'tech');
  }

  // ── Graph builders ────────────────────────────────────────────────────────
  private buildNodes(): GraphNode[] {
    const techSet = new Set(this.projects.flatMap(p => p.tech));
    const nodes: GraphNode[] = [];

    for (const p of this.projects) {
      const pos = this.pos[p.id] ?? { x: 400, y: 250 };
      nodes.push({
        id: p.id, label: p.label, kind: 'project', projectType: p.type,
        x: pos.x, y: pos.y, r: 18,
      });
    }
    for (const tech of techSet) {
      const usage = this.projects.filter(p => p.tech.includes(tech)).length;
      const pos = this.pos[tech] ?? { x: 400, y: 250 };
      nodes.push({
        id: tech, label: tech, kind: 'tech',
        x: pos.x, y: pos.y, r: 8 + usage * 2,
      });
    }
    return nodes;
  }

  private buildEdges(): GraphEdge[] {
    return this.projects.flatMap(p => {
      const src = this.pos[p.id] ?? { x: 400, y: 250 };
      return p.tech.map(t => {
        const dst = this.pos[t] ?? { x: 400, y: 250 };
        return { from: p.id, to: t, x1: src.x, y1: src.y, x2: dst.x, y2: dst.y };
      });
    });
  }

  // ── Interaction ──────────────────────────────────────────────────────────
  activeId: string | null = null;

  focusNode(node: GraphNode, event: Event): void {
    event.stopPropagation();
    this.activeId = this.activeId === node.id ? null : node.id;
  }

  focusNodeById(id: string, event: Event): void {
    event.stopPropagation();
    this.activeId = this.activeId === id ? null : id;
  }

  clearFocus(): void {
    this.activeId = null;
  }

  private get neighbours(): Set<string> {
    if (!this.activeId) return new Set();
    const s = new Set<string>();
    if (this.activeId.startsWith('p')) {
      this.projects.find(p => p.id === this.activeId)?.tech.forEach(t => s.add(t));
    } else {
      this.projects.filter(p => p.tech.includes(this.activeId!)).forEach(p => s.add(p.id));
    }
    return s;
  }

  isNodeDim(id: string): boolean {
    return !!this.activeId && id !== this.activeId && !this.neighbours.has(id);
  }

  isNodeActive(id: string): boolean {
    return !!this.activeId && (id === this.activeId || this.neighbours.has(id));
  }

  isEdgeDim(e: GraphEdge): boolean {
    if (!this.activeId) return false;
    const nb = this.neighbours;
    return !((e.from === this.activeId && nb.has(e.to)) ||
             (e.to === this.activeId && nb.has(e.from)));
  }

  isEdgeActive(e: GraphEdge): boolean {
    if (!this.activeId) return false;
    const nb = this.neighbours;
    return (e.from === this.activeId && nb.has(e.to)) ||
           (e.to   === this.activeId && nb.has(e.from));
  }

  get infoData(): { prefix: string; items: string[] } | null {
    if (!this.activeId) return null;
    if (this.activeId.startsWith('p')) {
      const proj = this.projects.find(p => p.id === this.activeId)!;
      return {
        prefix: `${proj.label} (${proj.type === 'fe' ? 'frontend' : 'analytics'}) — uses`,
        items: proj.tech,
      };
    } else {
      const using = this.projects.filter(p => p.tech.includes(this.activeId!));
      return {
        prefix: `${this.activeId} — used in ${using.length} ${using.length === 1 ? 'project' : 'projects'}:`,
        items: using.map(p => p.label),
      };
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  /** Shorten a full project title to a compact graph label (≤14 chars). */
  private shortLabel(title: string): string {
    const map: Record<string, string> = {
      'WebRTC Video Platform':                          'WebRTC',
      'Doctor Booking System':                          'Booking',
      'SVG Template Engine':                            'SVG Engine',
      'Sales Trend Analysis':                           'Sales EDA',
      'AdventureWorks Sales & Profitability':           'AdventureWrks',
      'COVID-19 Impact & Vaccination Effectiveness':    'COVID Analysis',
    };
    return map[title] ?? title.slice(0, 14);
  }
}