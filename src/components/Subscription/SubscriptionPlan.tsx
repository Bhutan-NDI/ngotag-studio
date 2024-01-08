'use strict';

import React, {
	useCallback,
	useMemo,
	useRef,
	useState,
	StrictMode,
} from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
	ColDef,
	ColGroupDef,
	GridApi,
	GridOptions,
	GridReadyEvent,
	createGrid,
} from 'ag-grid-community';
// import { IOlympicData } from './interfaces';
export interface IOlympicData {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}
const SubscriptionPlan = () => {
	const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
	const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
	const [rowData, setRowData] = useState<IOlympicData[]>();
	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{ field: 'country', rowGroup: true, hide: true },
		{ field: 'year', rowGroup: true, hide: true },
		{ field: 'athlete' },
		{ field: 'sport' },
		{ field: 'gold' },
		{ field: 'silver' },
		{ field: 'bronze' },
	]);
	const defaultColDef = useMemo<ColDef>(() => {
		return {
			flex: 1,
			minWidth: 100,
		};
	}, []);
	const autoGroupColumnDef = useMemo<ColDef>(() => {
		return {
			minWidth: 200,
		};
	}, []);

	const onGridReady = useCallback((params: GridReadyEvent) => {
		fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
			.then((resp) => resp.json())
			.then((data: IOlympicData[]) => setRowData(data));
	}, []);

	return (
		<StrictMode>
			<p>idjiudfniufnj</p>
			<div style={containerStyle}>
				<div style={gridStyle} className={'ag-theme-quartz'}>
					<>
					{console.log("rowData11",rowData)
					}
					</>
					<AgGridReact<IOlympicData>
						rowData={rowData}
						columnDefs={columnDefs}
						defaultColDef={defaultColDef}
						autoGroupColumnDef={autoGroupColumnDef}
						onGridReady={onGridReady}
					/>
				</div>
			</div>
		</StrictMode>
	);
};

export default SubscriptionPlan
