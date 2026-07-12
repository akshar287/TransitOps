import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./empty-state";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({ data, columns, emptyTitle = "No data found", emptyDescription = "There are no records to display at this time." }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b-border">
            {columns.map((col, i) => (
              <TableHead key={i} className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold h-10">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/30 transition-colors border-b-border/50">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className="text-[13px] py-3 align-middle font-medium">
                  {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
