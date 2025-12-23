import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';

// Import Hugeicons - mapping custom names to icon imports
import {
  Home07Icon,
  Calendar01Icon,
  UserMultiple02Icon,
  UserGroup03Icon,
  User03Icon,
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
  ArrowLeft02Icon,
  ArrowRight01Icon,
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
  FilterRemoveIcon,
  Edit01Icon,
  Edit03Icon,
  Delete02Icon,
  FileAddIcon,
  File01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  WaterfallUp01Icon,
  DocumentAttachmentIcon,
  Logout02Icon,
  LocationStar02Icon,
  Login01Icon,
  Tick01Icon,
  Pdf01Icon,
  Xls01Icon,
  Download01Icon,
  MoreVerticalIcon,
  ShieldUserIcon,
  Notification01Icon,
  Task01Icon,
  CloudUploadIcon,
  TradeUpIcon,
  Upload05Icon,
  Files02Icon,
  AlarmClockIcon,
  Stethoscope02Icon,
  Clock01Icon,
  Timer01Icon,
  SpoonAndForkIcon,
  DashboardSquare01Icon,
  AccessIcon,
  Medicine02Icon,
  AlertSquareIcon,
  Tick02Icon,
  TaskDaily02Icon,
} from '@hugeicons/core-free-icons';

// Icon mapping object for easy lookup
const iconMap = {
  layout: Home07Icon,
  calendar: Calendar01Icon,
  users: UserMultiple02Icon,
  groups: UserGroup03Icon,
  user: User03Icon,
  'user-01': User03Icon,
  'stethoscope-01': Stethoscope02Icon,
  settings: Settings01Icon,
  'file-add': FileAddIcon,
  'file-text': File01Icon,
  eye: ViewIcon,
  'eye-off': ViewOffIcon,
  'edit-01': Edit01Icon,
  edit: Edit03Icon,
  delete: Delete02Icon,
  'trash-01': Delete02Icon,
  mail: Mail01Icon,
  letter: Mail01Icon,
  lock: LockPasswordIcon,
  x: Cancel01Icon,
  'check-circle': CheckmarkCircleIcon,
  plus: Add01Icon,
  menu: Menu01Icon,
  'chevron-left': ArrowLeftIcon,
  'chevron-right': ArrowRightDoubleIcon,
  'arrow-left': ArrowLeft02Icon,
  'arrow-right': ArrowRight01Icon,
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
  'arrow-up': ArrowUp01Icon,
  'arrow-down': ArrowDown01Icon,
  'waterfall-up': WaterfallUp01Icon,
  'document-attachment': DocumentAttachmentIcon,
  login: Login01Icon,
  logout: Logout02Icon,
  star: LocationStar02Icon,
  tick: Tick01Icon,
  pdf: Pdf01Icon,
  xls: Xls01Icon,
  download: Download01Icon,
  more: MoreVerticalIcon,
  shield: ShieldUserIcon,
  notification: Notification01Icon,
  resume: Task01Icon,
  documents: CloudUploadIcon,
  trending: TradeUpIcon,
  upload: Upload05Icon,
  files: Files02Icon,
  clock: AlarmClockIcon,
  'clock-01': Clock01Icon,
  'timer-01': Timer01Icon,
  'spoon-and-fork': SpoonAndForkIcon,
  stethoscope: Stethoscope02Icon,
  dashboard: DashboardSquare01Icon,
  access: AccessIcon,
  prescriptions: Medicine02Icon,
  'alert-circle': AlertSquareIcon,
  check: Tick02Icon,
  'clipboard-check': TaskDaily02Icon,
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
