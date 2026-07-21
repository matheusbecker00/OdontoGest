import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideArchive,
  LucideArrowRight,
  LucideBadge,
  LucideBanknote,
  LucideBell,
  LucideBuilding2,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideCalendarPlus,
  LucideChartBar,
  LucideChartNoAxesCombined,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleQuestionMark,
  LucideClipboardClock,
  LucideCreditCard,
  LucideInfo,
  LucideKeyRound,
  LucideLayoutDashboard,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucideMailCheck,
  LucideMenu,
  LucidePackage,
  LucidePlus,
  LucideSettings,
  LucideShieldCheck,
  LucideStethoscope,
  LucideUserPlus,
  LucideUsers,
  LucideWalletCards,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';

const ICON_ALIASES: Readonly<Record<string, string>> = {
  verified_user: 'shield-check',
  domain: 'building-2',
  domain_add: 'building-2',
  lock: 'lock',
  mail: 'mail',
  password: 'key-round',
  mark_email_read: 'mail-check',
  grid_view: 'layout-dashboard',
  calendar_month: 'calendar-days',
  calendar_today: 'calendar-days',
  today: 'calendar-days',
  groups: 'users',
  medical_services: 'stethoscope',
  dentistry: 'badge',
  account_balance_wallet: 'wallet-cards',
  inventory_2: 'package',
  monitoring: 'chart-no-axes-combined',
  settings: 'settings',
  help_outline: 'circle-question-mark',
  logout: 'log-out',
  menu: 'menu',
  close: 'x',
  notifications_none: 'bell',
  add: 'plus',
  check: 'check',
  payments: 'banknote',
  pending_actions: 'clipboard-clock',
  event_available: 'calendar-check',
  person_add: 'user-plus',
  edit_calendar: 'calendar-plus',
  add_card: 'credit-card',
  credit_card: 'credit-card',
  bar_chart: 'chart-bar',
  arrow_forward: 'arrow-right',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  info: 'info',
  archive: 'archive',
};

const ICONS: Readonly<Record<string, LucideIconData>> = Object.fromEntries(
  [
    LucideArchive,
    LucideArrowRight,
    LucideBadge,
    LucideBanknote,
    LucideBell,
    LucideBuilding2,
    LucideCalendarCheck,
    LucideCalendarDays,
    LucideCalendarPlus,
    LucideChartBar,
    LucideChartNoAxesCombined,
    LucideCheck,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCircleQuestionMark,
    LucideClipboardClock,
    LucideCreditCard,
    LucideInfo,
    LucideKeyRound,
    LucideLayoutDashboard,
    LucideLock,
    LucideLogOut,
    LucideMail,
    LucideMailCheck,
    LucideMenu,
    LucidePackage,
    LucidePlus,
    LucideSettings,
    LucideShieldCheck,
    LucideStethoscope,
    LucideUserPlus,
    LucideUsers,
    LucideWalletCards,
    LucideX,
  ].map((icon) => [icon.icon.name, icon.icon]),
);

@Component({
  selector: 'og-icon',
  template: `
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
    >
      @for (child of icon().node; track child[1]['key'] ?? $index) {
        @let tag = child[0];
        @let attrs = child[1];
        @switch (tag) {
          @case ('path') {
            <svg:path [attr.d]="attrs['d']" [attr.fill]="attrs['fill']" />
          }
          @case ('line') {
            <svg:line
              [attr.x1]="attrs['x1']"
              [attr.x2]="attrs['x2']"
              [attr.y1]="attrs['y1']"
              [attr.y2]="attrs['y2']"
            />
          }
          @case ('polygon') {
            <svg:polygon [attr.points]="attrs['points']" />
          }
          @case ('polyline') {
            <svg:polyline [attr.points]="attrs['points']" />
          }
          @case ('circle') {
            <svg:circle
              [attr.cx]="attrs['cx']"
              [attr.cy]="attrs['cy']"
              [attr.r]="attrs['r']"
              [attr.fill]="attrs['fill']"
            />
          }
          @case ('ellipse') {
            <svg:ellipse
              [attr.cx]="attrs['cx']"
              [attr.cy]="attrs['cy']"
              [attr.rx]="attrs['rx']"
              [attr.ry]="attrs['ry']"
            />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="attrs['x']"
              [attr.y]="attrs['y']"
              [attr.width]="attrs['width']"
              [attr.height]="attrs['height']"
              [attr.rx]="attrs['rx']"
              [attr.ry]="attrs['ry']"
              [attr.fill]="attrs['fill']"
            />
          }
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 1.5rem;
      height: 1.5rem;
      align-items: center;
      justify-content: center;
      line-height: 1;
      vertical-align: middle;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
      stroke-width: 1.8;
      vector-effect: non-scaling-stroke;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<string>();
  protected readonly icon = computed(() => {
    const resolvedName = ICON_ALIASES[this.name()] ?? this.name();
    return ICONS[resolvedName] ?? LucideCircleQuestionMark.icon;
  });
}
