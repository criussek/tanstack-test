\
import * as React from "react";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";

export type GroupNode = {
  id: string;
  name: string;
  users?: number;
  courses?: number;
  path?: string[];
  children?: GroupNode[];
};

const rawData: GroupNode[] = [
  {
    id: "1",
    name: "Global",
    users: 1200,
    courses: 48,
    children: [
      {
        id: "1-1",
        name: "Europe",
        users: 600,
        courses: 32,
        children: [
          {
            id: "1-1-1",
            name: "Poland",
            users: 210,
            courses: 18,
            children: [
              {
                id: "1-1-1-1",
                name: "Warsaw",
                users: 130,
                courses: 12,
                children: [
                  {
                    id: "1-1-1-1-1",
                    name: "Ursynów",
                    users: 42,
                    courses: 6,
                    children: [
                      {
                        id: "1-1-1-1-1-1",
                        name: "Kabaty",
                        children: [
                          {
                            id: "1-1-1-1-1-1-1",
                            name: "Block 5",
                            children: [
                              {
                                id: "1-1-1-1-1-1-1-1",
                                name: "Entrance D",
                                children: [
                                  {
                                    id: "1-1-1-1-1-1-1-1-1",
                                    name: "Team A",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { id: "1-1-2", name: "Germany", users: 180, courses: 15 },
          { id: "1-1-3", name: "Spain", users: 160, courses: 14 },
        ],
      },
      {
        id: "1-2",
        name: "Americas",
        users: 400,
        courses: 26,
        children: [
          { id: "1-2-1", name: "USA", users: 260, courses: 20 },
          { id: "1-2-2", name: "Brazil", users: 90, courses: 12 },
        ],
      },
      {
        id: "1-3",
        name: "APAC",
        users: 200,
        courses: 17,
        children: [
          { id: "1-3-1", name: "Australia", users: 75, courses: 10 },
          { id: "1-3-2", name: "Japan", users: 65, courses: 9 },
        ],
      },
    ],
  },
];

function attachPaths(nodes: GroupNode[], path: string[] = []): GroupNode[] {
  return nodes.map((n) => ({
    ...n,
    path,
    children: n.children ? attachPaths(n.children, [...path, n.name]) : undefined,
  }));
}
const dataWithPaths = attachPaths(rawData);

function getBreadcrumbTail(path: string[], keep: number) {
  const collapsed = path.length > keep;
  const tail = collapsed ? path.slice(-keep) : path.slice();
  return { collapsed, tail };
}

function findNodeById(nodes: any[], id: string): any | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function runDemoTests() {
  const results: { name: string; pass: boolean }[] = [];
  results.push({
    name: 'Root path is empty',
    pass: Array.isArray(dataWithPaths[0].path) && dataWithPaths[0].path.length === 0,
  });
  const europe = findNodeById(dataWithPaths as any, '1-1');
  results.push({
    name: 'Europe has parent Global',
    pass: !!europe && Array.isArray(europe.path) && europe.path[0] === 'Global',
  });
  const teamA = findNodeById(dataWithPaths as any, '1-1-1-1-1-1-1-1-1');
  results.push({
    name: 'Team A path depth = 8 and ends with \"Entrance D\"',
    pass: !!teamA && Array.isArray(teamA.path) && teamA.path.length === 8 && teamA.path[teamA.path.length - 1] === 'Entrance D',
  });
  results.push({ name: 'Columns length = 4', pass: Array.isArray(columns) && columns.length === 4 });
  results.push({ name: 'First column id is tree', pass: Array.isArray(columns) && columns[0] && (columns[0] as any).id === 'tree' });
  const br = getBreadcrumbTail(['Global','Europe','Poland','Warsaw'], 2);
  results.push({ name: 'Breadcrumb collapsed for deep path', pass: br.collapsed && br.tail.join('/') === 'Poland/Warsaw' });
  const br2 = getBreadcrumbTail(['Global'], 2);
  results.push({ name: 'Breadcrumb not collapsed for shallow path', pass: !br2.collapsed && br2.tail.join('/') === 'Global' });
  return results;
}

const TestPanel: React.FC = () => {
  const tests = React.useMemo(runDemoTests, []);
  return (
    <div className="mt-6 rounded-lg border border-gray-200 p-3 bg-gray-50">
      <div className="font-semibold mb-2">Runtime tests</div>
      <ul className="text-sm space-y-1">
        {tests.map((t, idx) => (
          <li key={idx}>
            <span className={t.pass ? 'text-green-700' : 'text-red-700'}>
              {t.pass ? '✓ PASS' : '✗ FAIL'}
            </span>
            <span className="ml-2">{t.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MAX_GUIDES = 6;

const treeCol: ColumnDef<GroupNode> = {
  id: "tree",
  header: () => null,
  size: 56,
  cell: ({ row }) => {
    const depth = row.depth ?? 0;
    const canExpand = row.getCanExpand();
    const isExpanded = row.getIsExpanded();
    const visible = Math.min(depth, MAX_GUIDES);
    const overflow = Math.max(0, depth - MAX_GUIDES);
    return (
      <div className="flex items-center gap-1 w-14 px-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: visible }).map((_, i) => (
            <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
          ))}
        </div>
        {overflow > 0 && (
          <span className="text-[10px] leading-none px-1 rounded bg-gray-200 text-gray-700">
            +{overflow}
          </span>
        )}
        {canExpand ? (
          <button
            onClick={row.getToggleExpandedHandler()}
            className="ml-auto grid place-items-center rounded w-5 h-5 hover:bg-gray-100"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (<ChevronDown className="w-4 h-4" />) : (<ChevronRight className="w-4 h-4" />)}
          </button>
        ) : (<span className="ml-auto w-5 h-5" />)}
      </div>
    );
  },
};

const nameCol: ColumnDef<GroupNode> = {
  id: "groupName",
  header: () => <span className="font-semibold">Group</span>,
  accessorKey: "name",
  cell: (ctx) => {
    const row = ctx.row;
    const getValueFn: any = (ctx as any).getValue;
    const raw = typeof getValueFn === 'function' ? getValueFn() : undefined;
    const name = String(raw ?? (row.original?.name ?? ""));
    const path = Array.isArray(row.original?.path) ? (row.original!.path as string[]) : [];
    const KEEP = 2;
    const { collapsed, tail } = getBreadcrumbTail(path, KEEP);
    const fullPath = [...path, name].join(" / ");
    return (
      <div className="flex items-center gap-1 min-w-0 w-[260px]">
        {collapsed && <span className="text-gray-400">… /</span>}
        {tail.map((p, i) => (
          <span key={i} className="truncate max-w-[110px] text-gray-500" title={p}>
            {p} /
          </span>
        ))}
        <span className="truncate font-medium" title={fullPath}>{name}</span>
      </div>
    );
  },
};

const usersCol: ColumnDef<GroupNode> = {
  id: "users",
  header: () => <span className="font-semibold">Users</span>,
  accessorKey: "users",
  cell: (ctx) => {
    const gv: any = typeof (ctx as any).getValue === 'function' ? (ctx as any).getValue() : 0;
    const v = Number(gv ?? 0);
    return <span>{v}</span>;
  },
  size: 90,
};

const coursesCol: ColumnDef<GroupNode> = {
  id: "courses",
  header: () => <span className="font-semibold">Courses</span>,
  accessorKey: "courses",
  cell: (ctx) => {
    const gv: any = typeof (ctx as any).getValue === 'function' ? (ctx as any).getValue() : 0;
    const v = Number(gv ?? 0);
    return <span>{v}</span>;
  },
  size: 90,
};

const columns: ColumnDef<GroupNode>[] = [treeCol, nameCol, usersCol, coursesCol];

export default function App() {
  const [data] = React.useState<GroupNode[]>(dataWithPaths);
  const [expanded, setExpanded] = React.useState<ExpandedState>({ "1": true, "1-1": true });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children ?? [],
    getRowId: (row) => row.id,
    state: { expanded },
    onExpandedChange: setExpanded,
    columnResizeMode: "onChange",
  });

  const expandAll = React.useCallback(() => {
    const all: ExpandedState = {};
    const walk = (nodes: GroupNode[]) => {
      for (const n of nodes) {
        all[n.id] = true;
        if (n.children) walk(n.children);
      }
    };
    walk(data);
    setExpanded(all);
  }, [data]);

  const collapseAll = React.useCallback(() => setExpanded({}), []);

  return (
    <div className="p-4 bg-white text-gray-900">
      <h1 className="text-xl font-semibold mb-3">Groups – Tree Gutter Demo</h1>
      <p className="text-sm text-gray-700 mb-4">
        The narrow left <strong>gutter</strong> shows depth (dots) and the expand/collapse control.
        The group name is <strong>not indented</strong> — it stays readable in a narrow column using
        compact breadcrumbs. Try expanding deep branches (e.g., Warsaw → Ursynów → Kabaty → Block 5 → Entrance D → Team A).
        Notice how the text never overflows the column.
      </p>

      <div className="flex gap-2 mb-3">
        <button onClick={expandAll} className="px-3 py-1.5 rounded bg-gray-900 text-white text-sm hover:opacity-90">Expand all</button>
        <button onClick={collapseAll} className="px-3 py-1.5 rounded bg-gray-200 text-sm hover:bg-gray-300">Collapse all</button>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-[560px] w-full table-fixed">
          <thead className="bg-white border-b border-gray-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-3 py-2 text-left text-xs font-semibold text-gray-700 ${header.column.id === 'tree' ? 'bg-gray-50 border-r-2 border-gray-300' : 'border-r border-gray-200'}`}
                    style={{ width: (typeof (header.getSize as any) === 'function' ? (header.getSize as any)() : undefined) }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                {row.getVisibleCells().map((cell) => {
                  const isTree = cell.column.id === 'tree';
                  const tdClass = 'px-3 py-2 align-middle ' + (isTree ? 'bg-gray-50 border-r-2 border-gray-300' : 'border-r border-gray-200');
                  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                  return (
                    <td key={cell.id} className={tdClass}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TestPanel />
    </div>
  );
}
