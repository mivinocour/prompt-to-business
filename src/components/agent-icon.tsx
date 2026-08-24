import {
  AtSign,
  BookOpen,
  Bot,
  Calendar,
  Clock,
  Database,
  FileText,
  GitPullRequest,
  Github,
  Globe,
  HardDrive,
  Mail,
  MessageSquare,
  Pencil,
  Play,
  Plug,
  Plus,
  Radio,
  Search,
  Sparkles,
  Terminal,
  Webhook,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const AGENT_ICONS: Record<string, LucideIcon> = {
  search: Search,
  terminal: Terminal,
  globe: Globe,
  "file-text": FileText,
  database: Database,
  mail: Mail,
  calendar: Calendar,
  "message-square": MessageSquare,
  "book-open": BookOpen,
  "git-pull-request": GitPullRequest,
  radio: Radio,
  clock: Clock,
  play: Play,
  "at-sign": AtSign,
  webhook: Webhook,
  "hard-drive": HardDrive,
  github: Github,
  bot: Bot,
  plus: Plus,
  sparkles: Sparkles,
  wrench: Wrench,
  plug: Plug,
  zap: Zap,
  pencil: Pencil,
};

const MATERIAL_AGENT_ICONS: Record<string, string> = {
  antigravity: "antigravity",
  radio: "radio",
  support: "support_agent",
  chart: "query_stats",
  description: "description",
  build: "build",
};

export const getAgentIcon = (name: string): LucideIcon => AGENT_ICONS[name] ?? Wrench;

export const getAgentMaterialIcon = (name: string) =>
  MATERIAL_AGENT_ICONS[name] ?? "smart_toy";

export function AgentIcon({ name, ...props }: LucideProps & { name: string }) {
  const Icon = getAgentIcon(name);
  return <Icon {...props} />;
}
