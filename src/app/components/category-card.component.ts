import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Large photo-style card with a gradient, big emoji, count and title (like the "Locations" cards). */
@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="link()" [queryParams]="query()" [style.background]="background()" [class.active]="active()">
      <span class="emoji">{{ emoji() }}</span>
      <div class="shade"></div>
      <div class="caption">
        <div class="count">{{ count() }}</div>
        <div class="title">{{ title() }}</div>
        @if (hint()) {
          <div class="hint">{{ hint() }}</div>
        }
      </div>
    </a>
  `,
  styles: `
    :host { display: block; }
    .card {
      position: relative; display: block; overflow: hidden;
      height: 100%; min-height: 190px;
      border-radius: var(--epa-radius);
      text-decoration: none; color: #fff;
      outline: 3px solid transparent; outline-offset: -3px;
      transition: transform .15s, outline-color .15s;
    }
    .card:active { transform: scale(.98); }
    .card.active { outline-color: var(--epa-mint-strong); }
    .emoji {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      font-size: clamp(44px, 12vw, 84px); filter: drop-shadow(0 10px 14px rgba(0,0,0,.25));
    }
    .shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,.45) 100%); }
    .caption { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; }
    .count { font-size: 30px; font-weight: 400; line-height: 1.1; }
    .title { font-size: 20px; font-weight: 600; }
    .hint { font-size: 12px; opacity: .9; margin-top: 2px; }
  `,
})
export class CategoryCardComponent {
  readonly title = input.required<string>();
  readonly emoji = input.required<string>();
  readonly count = input<number>(0);
  readonly background = input.required<string>();
  readonly link = input<string | unknown[]>([]);
  readonly query = input<Record<string, string> | null>(null);
  readonly hint = input<string>('');
  readonly active = input(false);
}
