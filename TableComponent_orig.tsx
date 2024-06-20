import React from "react";
import { Table } from "react-bootstrap";

interface TableComponentProps {
  data: any[]; // TODO: think of more specific type
  columns: {
    header: string;
    accessor: string | ((item: any) => React.ReactNode);
  }[];
  selectedRowIds?: Record<number, boolean>; // Tracks which rows are selected
  onRowSelect?: (rowId: number, isSelected: boolean) => void; // Callback when a row is selected/deselected
  onSelectAll?: (isSelected: boolean) => void; // Callback when select all is triggered
  isSelectable?: boolean; // Flag to enable/disable selection logic
}

/**
TableComponent Component

 */
const TableComponent = ({
  data,
  columns,
  selectedRowIds,
  onRowSelect,
  onSelectAll,
  isSelectable = false,
}: TableComponentProps) => {
  const allSelected =
    data.every((item) => selectedRowIds?.[item.id]) &&
    data.length === Object.keys(selectedRowIds ?? {}).length;
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked);
  };

  return (
    <div
      style={{ overflowY: "auto", maxHeight: "70vh", paddingBottom: "70px" }}
    >
      <Table striped hover bordered className="mt-2 sticky-table-header">
        <thead>
          <tr>
            {isSelectable && (
              <th className="text-center">
                <label
                  htmlFor="select-all-checkbox"
                  className="form-check-label d-block m-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="select-all-checkbox"
                    onChange={handleSelectAll}
                    checked={allSelected}
                  />
                </label>
              </th>
            )}
            {columns.map((col, index) => (
              <th key={index} className="text-center">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {isSelectable && (
                <td className="text-center">
                  <label
                    htmlFor={`checkbox-${item.id}`}
                    className="form-check-label d-block m-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`checkbox-${item.id}`}
                      className="form-check-input"
                      checked={!!selectedRowIds?.[item.id]}
                      onChange={(e) => onRowSelect?.(item.id, e.target.checked)}
                    />
                  </label>
                </td>
              )}
              {columns.map((col, colIndex) => {
                const cellData =
                  typeof col.accessor === "function"
                    ? col.accessor(item)
                    : item[col.accessor];
                return (
                  <td key={colIndex} className="text-center">
                    {cellData}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableComponent;
