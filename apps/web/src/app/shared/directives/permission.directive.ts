import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({ selector: '[ogPermission]' })
export class PermissionDirective {
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private readonly auth = inject(AuthStore);
  readonly required = input.required<readonly string[]>({ alias: 'ogPermission' });
  private visible = false;

  constructor() {
    effect(() => {
      const allowed = this.auth.hasEveryPermission(this.required());
      if (allowed && !this.visible) {
        this.container.createEmbeddedView(this.template);
        this.visible = true;
      } else if (!allowed && this.visible) {
        this.container.clear();
        this.visible = false;
      }
    });
  }
}
