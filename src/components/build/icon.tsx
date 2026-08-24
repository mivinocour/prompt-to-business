import {
  ArrowLeft,
  ArrowUp,
  Braces,
  Bug,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Code2,
  Download,
  File,
  FileCode2,
  Flag,
  Folder,
  GitFork,
  Info,
  Lightbulb,
  ListTree,
  Maximize2,
  Mic,
  MonitorSmartphone,
  MoreVertical,
  Paintbrush,
  Pencil,
  PenTool,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  add: Plus,
  add_circle: PlusCircle,
  arrow_back: ArrowLeft,
  arrow_split: GitFork,
  arrow_upward_alt: ArrowUp,
  bug_report: Bug,
  build: Wrench,
  check_circle: CheckCircle,
  chevron_right: ChevronRight,
  close: X,
  code: Code2,
  collapse_all: ChevronsUp,
  data_object: Braces,
  devices: MonitorSmartphone,
  download: Download,
  draft: File,
  draw: PenTool,
  edit: Pencil,
  error: AlertCircle,
  expand_more: ChevronDown,
  flag: Flag,
  folder: Folder,
  fullscreen: Maximize2,
  info: Info,
  keyboard_arrow_down: ChevronDown,
  keyboard_arrow_up: ChevronUp,
  lightbulb: Lightbulb,
  mic: Mic,
  more_vert: MoreVertical,
  redo: RotateCcw,
  search: Search,
  segment: FileCode2,
  settings: Settings,
  stylus: Paintbrush,
  summarize: ListTree,
  sync: RefreshCw,
  thumb_down: ThumbsDown,
  thumb_up: ThumbsUp,
};

export function MsIcon({
  name,
  size = 18,
  className = "",
  fill = false,
}: {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
}) {
  const Icon = ICONS[name] ?? HelpCircle;

  return (
    <Icon
      aria-hidden
      className={`shrink-0 ${className}`}
      fill={fill ? "currentColor" : "none"}
      size={size}
      strokeWidth={1.8}
    />
  );
}
