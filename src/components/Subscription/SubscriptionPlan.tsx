'use client';

import { Table } from 'flowbite-react';
import React, { useState } from 'react';
const SubscriptionPlan = () => {
	const [isSecondTableOpen, setIsSecondTableOpen] = useState(false);

	const handleSecondTableClick = () => {
		console.log('Second table opened');
		setIsSecondTableOpen(!isSecondTableOpen);
	};
	const firstTableHeader = [
		'Plan',
		'Validity',
		'Start Date',
		'End Date',
		'Action',
	];
	const secondTableHeader = [
		'Features',
		'Total',
		'Used',
		'Remaining',
		'Percent Used',
	];

	const data = [
		{
			feature: 'Organization',
			total: '2',
			used: '1',
			remaining: '1',
			precentUsed: '50',
		},
		{
			feature: 'Schema',
			total: '5',
			used: '3',
			remaining: '2',
			precentUsed: '60',
		},
		{
			feature: 'Issuance',
			total: '50',
			used: '30',
			remaining: '20',
			precentUsed: '60',
		},
	];

	const subscriptionDetails = [
		{
			plan: 'Free',
			validity: '1 month',
			startDate: '01/02/2024',
			endDate: '29/02/2024',
		},
	];
	return (
		// <div className="overflow-x-auto p-8 m-4 bg-white dark:bg-gray-500 rounded-sm">
		// 	<Table className="rounded-none">
		// 		<Table.Head className="rounded-none">
		// 			<Table.HeadCell>Plan</Table.HeadCell>
		// 			<Table.HeadCell>Validity</Table.HeadCell>
		// 			<Table.HeadCell>Start Date</Table.HeadCell>
		// 			<Table.HeadCell>End Date</Table.HeadCell>
		// 			<Table.HeadCell>Action</Table.HeadCell>
		// 		</Table.Head>
		// 		<Table.Body className="divide-y">
		// 			<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
		// 				<Table.Cell
		// 					onClick={() => {
		// 						handleSecondTableClick();
		// 					}}
		// 					className="whitespace-nowrap font-medium text-gray-900 dark:text-white flex items-center"
		// 				>
		// 					<span>
		// 						{isSecondTableOpen ? (
		// 							<svg
		// 								xmlns="http://www.w3.org/2000/svg"
		// 								width="12"
		// 								height="7"
		// 								viewBox="0 0 12 7"
		// 								fill="none"
		// 							>
		// 								<path
		// 									d="M10.1643 0.725C10.4786 0.425 10.95 0.425 11.2643 0.725C11.4214 0.875 11.5 1.025 11.5 1.25C11.5 1.475 11.4214 1.625 11.2643 1.775L6.55 6.275C6.23571 6.575 5.76429 6.575 5.45 6.275L0.735714 1.775C0.421429 1.475 0.421429 1.025 0.735714 0.725C1.05 0.425 1.52143 0.425 1.83571 0.725L6 4.7L10.1643 0.725Z"
		// 									fill="#606972"
		// 								/>
		// 							</svg>
		// 						) : (
		// 							<svg
		// 								xmlns="http://www.w3.org/2000/svg"
		// 								width="6"
		// 								height="11"
		// 								viewBox="0 0 6 11"
		// 								fill="none"
		// 							>
		// 								<path
		// 									d="M0.225 1.33571C-0.0749998 1.02143 -0.0749998 0.55 0.225 0.235715C0.375 0.0785723 0.525 0 0.75 0C0.975 0 1.125 0.0785723 1.275 0.235715L5.775 4.95C6.075 5.26429 6.075 5.73571 5.775 6.05L1.275 10.7643C0.975 11.0786 0.525 11.0786 0.225 10.7643C-0.0749998 10.45 -0.0749998 9.97857 0.225 9.66429L4.2 5.5L0.225 1.33571Z"
		// 									fill="#606972"
		// 								/>
		// 							</svg>
		// 						)}
		// 					</span>
		// 					<span className="pl-2">Free</span>
		// 				</Table.Cell>
		// 				<Table.Cell>1 month</Table.Cell>
		// 				<Table.Cell>01/02/2024</Table.Cell>
		// 				<Table.Cell>01/03/2024</Table.Cell>
		// 				<Table.Cell>
		// 					<a
		// 						href="#"
		// 						className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
		// 					>
		// 						Upgrade
		// 					</a>
		// 				</Table.Cell>
		// 			</Table.Row>
		// 		</Table.Body>
		// 	</Table>
		// 	{isSecondTableOpen && (
		// 		<div className="m-5">
		// 			<Table>
		// 				<Table.Head>
		// 					<Table.HeadCell>Features</Table.HeadCell>
		// 					<Table.HeadCell>Total</Table.HeadCell>
		// 					<Table.HeadCell>Used</Table.HeadCell>
		// 					<Table.HeadCell>Remaining</Table.HeadCell>
		// 					<Table.HeadCell>Percent Used</Table.HeadCell>
		// 				</Table.Head>{' '}
		// 				<Table.Body className="divide-y">
		// 					<Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
		// 						<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
		// 							<span className="pl-2">Organization</span>
		// 						</Table.Cell>
		// 						<Table.Cell>2</Table.Cell>
		// 						<Table.Cell>1</Table.Cell>
		// 						<Table.Cell>1</Table.Cell>
		// 						<Table.Cell>
		// 							<a
		// 								href="#"
		// 								className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
		// 							>
		// 								50%
		// 							</a>
		// 						</Table.Cell>
		// 					</Table.Row>
		// 				</Table.Body>
		// 			</Table>
		// 		</div>
		// 	)}
		// </div>
		<div className="overflow-x-auto p-8 m-4 bg-white dark:bg-gray-500 rounded-sm w-full">
			<table className="rounded-none w-full table-auto">
				<thead className="rounded-none bg-gray-200 p-4">
					<tr>
						{firstTableHeader &&
							firstTableHeader.map((header) => {
								return (
									<th className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
										{header}
									</th>
								);
							})}
					</tr>
				</thead>
				<tbody className="divide-y w-full">
					{subscriptionDetails &&
						subscriptionDetails.map((subscription) => {
							return (
								<tr className="bg-white dark:border-gray-700 dark:bg-gray-800 p-2 m-4">
									<td
										onClick={() => handleSecondTableClick()}
										className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-1/5 md:w-1/4 lg:w-1/5 p-2 flex items-center text-center justify-center"
									>
										<span>
											{isSecondTableOpen ? (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="7"
													viewBox="0 0 12 7"
													fill="none"
												>
													<path
														d="M10.1643 0.725C10.4786 0.425 10.95 0.425 11.2643 0.725C11.4214 0.875 11.5 1.025 11.5 1.25C11.5 1.475 11.4214 1.625 11.2643 1.775L6.55 6.275C6.23571 6.575 5.76429 6.575 5.45 6.275L0.735714 1.775C0.421429 1.475 0.421429 1.025 0.735714 0.725C1.05 0.425 1.52143 0.425 1.83571 0.725L6 4.7L10.1643 0.725Z"
														fill="#606972"
													/>
												</svg>
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="6"
													height="11"
													viewBox="0 0 6 11"
													fill="none"
												>
													<path
														d="M0.225 1.33571C-0.0749998 1.02143 -0.0749998 0.55 0.225 0.235715C0.375 0.0785723 0.525 0 0.75 0C0.975 0 1.125 0.0785723 1.275 0.235715L5.775 4.95C6.075 5.26429 6.075 5.73571 5.775 6.05L1.275 10.7643C0.975 11.0786 0.525 11.0786 0.225 10.7643C-0.0749998 10.45 -0.0749998 9.97857 0.225 9.66429L4.2 5.5L0.225 1.33571Z"
														fill="#606972"
													/>
												</svg>
											)}
										</span>
										<span className="pl-2">{subscription.plan}</span>
									</td>
									<td className="w-1/5 md:w-1/4 lg:w-1/5 text-center">
										{subscription.validity}
									</td>
									<td className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
										{subscription.startDate}
									</td>
									<td className="w-1/5 md:w-1/4 lg:w-1/5 text-center">
										{subscription.endDate}
									</td>
									<td className="w-1/5 md:w-1/4 lg:w-1/5 text-center">
										<a
											href="#"
											className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 text-center"
										>
											Upgrade
										</a>
									</td>
								</tr>
							);
						})}
				</tbody>
			</table>
			{isSecondTableOpen && (
				<div className="mx-10">
					<table className="rounded-none w-full table-auto">
						<thead className="rounded-none ounded-none bg-gray-200 p-4">
							<tr>
								{secondTableHeader &&
									secondTableHeader.map((header) => {
										return (
											<th className="w-1/5 md:w-1/4 lg:w-1/5 text-center">
												{header}
											</th>
										);
									})}
							</tr>
						</thead>
						<tbody className="divide-y">
							{data.map((feat) => {
								return (
									<tr className="bg-white dark:border-gray-700 dark:bg-gray-800">
										<td className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-1/5 md:w-1/4 lg:w-1/5  text-start">
											<span className="ml-8">{feat.feature}</span>
										</td>
										<td className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
											{feat.total}
										</td>
										<td className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
											{feat.used}
										</td>
										<td className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
											{feat.remaining}
										</td>
										<td className="w-1/5 md:w-1/4 lg:w-1/5  text-center">
											<a
												href="#"
												className="font-medium text-cyan-600 hover:underline dark:text-cyan-500"
											>
												{feat.precentUsed}
											</a>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};
export default SubscriptionPlan;
