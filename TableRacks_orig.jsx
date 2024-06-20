import React from "react";

import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { removeRack } from "../features/rack/rackActions";
import { BiEdit } from "react-icons/bi";

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const { t } = useTranslation();
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      {t("racks.search")}:{" "}
      <input
        className="form-control"
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  // const count = preFilteredRows.length;

  return (
    <input
      className="form-control"
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder="Search" /* {`Search ${count} records...`} */
    />
  );
}

function Table({ columns, data }) {
  const defaultColumn = React.useMemo(
    () => ({
      // Default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const deleteHandler = (id) => {
    if (window.confirm("Are you sure")) {
      console.log("DELETED ID:", id);
      dispatch(removeRack(id));
    }
  };

  return (
    <div style={{ overflowY: "auto", maxHeight: "70vh" }}>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <table className="table sticky-table-header" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th key={column.id}>
                  {" "}
                  {/*  Added key */}
                  {console.log("WHG test:", column.id)}
                  <div
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </div>
                  {/* Render the columns filter UI */}
                  <div>{column.canFilter ? column.render("Filter") : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} key={`${i}-${cell.column.id}`}>
                      {" "}
                      {/* Fixed: Added key */} {cell.render("Cell")}
                    </td>
                  );
                })}
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{t("pages.joblist.edit")}</Tooltip>}
                  >
                    <NavLink
                      className="rackEdit"
                      to={`/settings/racks/${row.cells[0].value}/edit-rack`} //row.cells[0].value=rackType.id
                    >
                      <BiEdit className="text-primary h2"></BiEdit>
                    </NavLink>
                  </OverlayTrigger>
                </td>
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>{t("button.deleteBtn")}</Tooltip>}
                  >
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(row.cells[0].value)}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* <br />
      <div>Showing the first 20 results of {rows.length} rows</div>
      <div>
        <pre>
          <code>{JSON.stringify(state.filters, null, 2)}</code>
        </pre>
      </div> */}
    </div>
  );
}

const TableRacks = ({ racks }) => {
  const { t } = useTranslation();
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "rack_id",
      },
      {
        Header: t("racks.rmsRackCode"),
        accessor: "rms_rack_code",
      },
      {
        Header: t("racks.erpRackCode"),
        accessor: "erp_rack_code",
      },
      {
        Header: t("racks.mapPointID"),
        accessor: "map_point_id",
      },
      {
        Header: t("racks.typeName"),
        accessor: "racktype_data.name",
      },
      {
        Header: t("racks.typeID"),
        accessor: "racktype_id",
      },

      {
        Header: t("racks.width"),
        accessor: "racktype_data.dim_x_mm",
      },
      {
        Header: t("racks.depth"),
        accessor: "racktype_data.dim_y_mm",
      },
      {
        Header: t("racks.height"),
        accessor: "racktype_data.dim_z_mm",
      },
      {
        Header: t("racks.floorCount"),
        accessor: "racktype_data.floor_count",
      },
      {
        Header: t("racks.maxLoad"),
        accessor: "racktype_data.max_load_kg",
      },
      {
        Header: t("racks.feetDiameter"),
        accessor: "racktype_data.feet_diameter_mm",
      },
    ],
    [t]
  );

  const data = racks;

  return <Table columns={columns} data={data} />;
};

export default TableRacks;
