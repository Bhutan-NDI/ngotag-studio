'use client';

import { Table } from 'flowbite-react';
import React, { useState } from 'react';
const SubscriptionPlan = () => {
	const [isSecondTableOpen, setIsSecondTableOpen] = useState(false);

	const handleSecondTableClick = () => {
		console.log('Second table opened');
		setIsSecondTableOpen(!isSecondTableOpen);
		// You can add your logic to handle the opening of the second table
		// For example, you can fetch data for the second table here.
	};
	return (
		<div className="overflow-x-auto p-8">
			<Table>
				<Table.Head>
					{/* <Table.HeadCell></Table.HeadCell> */}
					<Table.HeadCell>Plan</Table.HeadCell>
					<Table.HeadCell>Validity</Table.HeadCell>
					<Table.HeadCell>Start Date</Table.HeadCell>
					<Table.HeadCell>End Date</Table.HeadCell>
					<Table.HeadCell>Action</Table.HeadCell>
					<Table.HeadCell>
						<span className="sr-only">Edit</span>
					</Table.HeadCell>
				</Table.Head>
				<Table.Body className="divide-y">
					<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
						<Table.Cell
							onClick={() => {
								handleSecondTableClick();
							}}
							className="whitespace-nowrap font-medium text-gray-900 dark:text-white"
						>
							<span>{'>'}</span>
							<span className="pl-2">Free</span>
						</Table.Cell>
						<Table.Cell>1 month</Table.Cell>
						<Table.Cell>01/02/2024</Table.Cell>
						<Table.Cell>01/03/2024</Table.Cell>
						<Table.Cell>
							<a
								href="#"
								className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
							>
								Upgrade
							</a>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
			{isSecondTableOpen && (
				<Table>
					<Table.Head>
						<Table.HeadCell></Table.HeadCell>

						<Table.HeadCell>Plan</Table.HeadCell>
						<Table.HeadCell>Validity</Table.HeadCell>
						<Table.HeadCell>Start Date</Table.HeadCell>
						<Table.HeadCell>End Date</Table.HeadCell>
						<Table.HeadCell>Action</Table.HeadCell>
						<Table.HeadCell>
							<span className="sr-only">Edit</span>
						</Table.HeadCell>
					</Table.Head>{' '}
				</Table>
			)}
		</div>
	);
};
export default SubscriptionPlan;
