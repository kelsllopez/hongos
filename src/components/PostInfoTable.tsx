import { InfoTableRow } from "@/lib/types";

export function PostInfoTable({ rows, embedded = false }: { rows: InfoTableRow[]; embedded?: boolean }) {
  const visible = rows.filter((r) => r.label.trim() || r.value.trim());
  if (visible.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={embedded ? { border: "1px solid rgba(54,74,53,0.1)" } : { border: "1px solid rgba(54,74,53,0.15)" }}
    >
      <table className="w-full text-sm">
        <tbody>
          {visible.map((row, i) => (
            <tr
              key={row.id}
              style={{
                background: i % 2 === 0 ? (embedded ? "rgba(54,74,53,0.04)" : "var(--bone)") : "transparent",
              }}
            >
              <td
                className="px-4 py-2.5 font-semibold w-2/5"
                style={{ color: "var(--moss-dark)", borderRight: "1px solid rgba(54,74,53,0.1)" }}
              >
                {row.label}
              </td>
              <td className="px-4 py-2.5" style={{ color: "var(--ink)" }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
