import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';

// Import Hugeicons - mapping custom names to icon imports
import {
  Home07Icon,
  Calendar01Icon,
  UserMultiple02Icon,
  UserGroup03Icon,
  Settings01Icon,
  ViewIcon,
  ViewOffIcon,
  Mail01Icon,
  LockPasswordIcon,
  Cancel01Icon,
  CheckmarkCircleIcon,
  Add01Icon,
  Menu01Icon,
  ArrowLeftIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
  NotificationSnooze01Icon,
  Notification02Icon,
  Bookmark01Icon,
  MessageNotification01Icon,
  PowerServiceIcon,
  MoneyBag02Icon,
  DepartementIcon,
  UnfoldMoreIcon,
  UnfoldLessIcon,
  UserAdd02Icon,
  FilterRemoveIcon
} from '@hugeicons/core-free-icons';

// Icon mapping object for easy lookup
const iconMap = {
  layout: Home07Icon,
  calendar: Calendar01Icon,
  users: UserMultiple02Icon,
  groups: UserGroup03Icon,
  settings: Settings01Icon,
  eye: ViewIcon,
  'eye-off': ViewOffIcon,
  mail: Mail01Icon,
  letter: Mail01Icon,
  lock: LockPasswordIcon,
  x: Cancel01Icon,
  'check-circle': CheckmarkCircleIcon,
  plus: Add01Icon,
  menu: Menu01Icon,
  'chevron-left': ArrowLeftIcon,
  'chevron-right': ArrowRightDoubleIcon,
  search: Search01Icon,
  'bell-sleep': NotificationSnooze01Icon,
  bell: Notification02Icon,
  save: Bookmark01Icon,
  'message-notification': MessageNotification01Icon,
  service: PowerServiceIcon,
  money: MoneyBag02Icon,
  department: DepartementIcon,
  'unfold-more': UnfoldMoreIcon,
  'unfold-less': UnfoldLessIcon,
  'user-plus': UserAdd02Icon,
  'filter-remove': FilterRemoveIcon,
} as const;

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [HugeiconsIconComponent],
  template: `
    @if (icon()) {
      <hugeicons-icon
        [icon]="icon()"
        [size]="sizeNumber()"
        color="currentColor"
        [strokeWidth]="1.5"
        [class]="className()"
        aria-hidden="true"
      ></hugeicons-icon>
    } @else {
      <span class="text-xs text-gray-400">?</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  name = input.required<string>();
  className = input<string>('');
  size = input<string | number>('24');

  sizeNumber = computed(() => {
    const s = this.size();
    return typeof s === 'string' ? parseInt(s, 10) : s;
  });

  icon = computed(() => {
    const iconName = this.name() as keyof typeof iconMap;
    return iconMap[iconName] || null;
  });
}
