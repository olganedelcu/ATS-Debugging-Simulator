import type { ReactNode } from "react";

interface MappingRow {
  label: string;
  value: ReactNode;
}

interface MappingTableProps {
  rows: MappingRow[];
}

export function MappingTable({ rows }: MappingTableProps) {
  return (
    <table className="mapping-table">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
