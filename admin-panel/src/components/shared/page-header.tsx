import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <motion.div
      className="flex flex-col gap-4 rounded-3xl border bg-card/70 p-6 shadow-soft backdrop-blur xl:flex-row xl:items-center xl:justify-between"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button size="lg" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </motion.div>
  );
}
