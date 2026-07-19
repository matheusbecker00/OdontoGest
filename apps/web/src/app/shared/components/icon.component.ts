import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
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
  LucideChevronLeft,
  LucideChevronRight,
  LucideCircleQuestionMark,
  LucideClipboardClock,
  LucideCreditCard,
  LucideDynamicIcon,
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
  provideLucideIcons,
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
  notifications_none: 'bell',
  add: 'plus',
  payments: 'banknote',
  pending_actions: 'clipboard-clock',
  event_available: 'calendar-check',
  person_add: 'user-plus',
  edit_calendar: 'calendar-plus',
  add_card: 'credit-card',
  bar_chart: 'chart-bar',
  arrow_forward: 'arrow-right',
  chevron_left: 'chevron-left',
  chevron_right: 'chevron-right',
  info: 'info',
};

@Component({
  selector: 'og-icon',
  imports: [LucideDynamicIcon],
  providers: [
    provideLucideIcons(
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
    ),
  ],
  template: '<svg [lucideIcon]="resolvedName()" aria-hidden="true"></svg>',
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
      stroke-width: 2;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<string>();
  protected readonly resolvedName = computed(() => ICON_ALIASES[this.name()] ?? this.name());
}
