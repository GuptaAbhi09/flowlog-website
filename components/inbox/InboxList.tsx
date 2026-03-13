import { format, parseISO } from "date-fns";
import { ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import type { InboxItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InboxListProps {
  items: InboxItem[];
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InboxList({ items, onConvert, onDelete }: InboxListProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nothing in your inbox. Capture ideas as you work and process them here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-start gap-3 p-3">
            <div className="mt-1">
              {item.is_processed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{item.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(parseISO(item.created_at), "EEE, MMM d • h:mm a")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {!item.is_processed && (
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onConvert(item.id)}
                >
                  Convert to task
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

