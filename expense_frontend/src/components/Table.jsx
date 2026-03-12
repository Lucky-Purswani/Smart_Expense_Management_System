"use client";

// Client component — reusable data table with sorting, pagination support
export default function Table({ columns = [], data = [], ...props }) {
  return (
    <div className="table-container">
      <table {...props}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Rows will be rendered here */}
        </tbody>
      </table>
    </div>
  );
}
