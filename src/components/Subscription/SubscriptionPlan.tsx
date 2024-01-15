'use client';

import React, { useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import BreadCrumbs from '../BreadCrumbs';

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

	const memberHeader = [
		{ columnName: 'Organization Name' },
		{ columnName: 'Plan ' },
	];

	const memberTableData = [
		{
			orgName: 'ProActive.Com ',
			planType: 'Free',
		},
		{
			orgName: 'ProStudio.Com ',
			planType: 'Pro',
		},
	];

	return (
		<div className="p-4" id="connection_list">
			<BreadCrumbs />
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Current Subscription
				</h1>
			</div>
			<div className="overflow-x-auto p-3 mb-4 bg-white dark:bg-gray-500 rounded-sm w-full">
				<table className="rounded-none w-full table-auto">
					<thead className="rounded-none bg-gray-200 p-4">
						<tr className="">
							{firstTableHeader &&
								firstTableHeader.map((header) => {
									return (
										<th className="w-1/5 md:w-1/4 lg:w-1/5 text-center m-4 p-2">
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
									<tr className="bg-white dark:border-gray-700 dark:bg-gray-800 m-4 p-2">
										<td
											onClick={() => handleSecondTableClick()}
											className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-1/5 md:w-1/4 lg:w-1/5 p-2 text-center"
										>
											<div className="flex items-center">
												<span>
													{isSecondTableOpen ? (
														<svg
															className="w-[14px] h-[14px] text-gray-800 dark:text-white"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 14 8"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="1"
																d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
															/>
														</svg>
													) : (
														<svg
															className="w-[14px] h-[14px] text-gray-800 dark:text-white"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 8 14"
														>
															<path
																stroke="currentColor"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="1"
																d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
															/>
														</svg>
													)}
												</span>
												<p className="w-full">{subscription.plan}</p>
											</div>
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
										<td className="w-1/5 md:w-1/4 lg:w-1/5 text-center p-2">
											<div className="flex justify-center">
												<button
													id="upgrade"
													// isProcessing={''}
													// onClick={() => props.registerWithPasskey(true)}
													className="text-base hover:!bg-primary-800 py-1 px-2 space-x-2 flex font-medium text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-2 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 flex justify-center items-center text-center rounded-md"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="17"
														height="17"
														viewBox="0 0 17 17"
														fill="none"
													>
														<path
															d="M8.5 17C3.825 17 0 13.175 0 8.5C0 3.825 3.825 0 8.5 0C13.175 0 17 3.825 17 8.5C17 13.175 13.175 17 8.5 17ZM8.5 1.41667C4.60417 1.41667 1.41667 4.60417 1.41667 8.5C1.41667 12.3958 4.60417 15.5833 8.5 15.5833C12.3958 15.5833 15.5833 12.3958 15.5833 8.5C15.5833 4.60417 12.3958 1.41667 8.5 1.41667ZM9.20833 12.75H7.79167V6.65833L5.45417 8.99583L4.4625 8.00417L8.5 3.96667L12.5375 8.00417L11.5458 8.99583L9.20833 6.65833V12.75Z"
															fill="white"
														/>
													</svg>{' '}
													<span>Upgrade</span>
												</button>
											</div>
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
												<th className="w-1/5 md:w-1/4 lg:w-1/5 text-center m-4 p-2">
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
											<td className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-1/5 md:w-1/4 lg:w-1/5  m-4 p-2 text-start">
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
											<td className="w-1/5 md:w-1/4 lg:w-1/5 text-center">
												<div className="flex items-center justify-center text-center w-full">
													{/* <CircularProgressbar value={feat.precentUsed} /> */}
													<CircularProgressbar value={50} className="w-6 h-6" />
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
			<div>
				<div
					className="flex items-center justify-between mb-4"
					id="issued-credentials-list"
				>
					<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
						Member organizations
					</h1>
				</div>

				<div className="overflow-x-auto p-3 mb-4 bg-white dark:bg-gray-500 rounded-sm w-full">
					<table className="rounded-none w-full table-auto">
						<thead className="rounded-none ounded-none bg-gray-200 p-4">
							<tr>
								{memberHeader &&
									memberHeader.map((header) => {
										return (
											<th className="w-1/5 md:w-1/4 lg:w-1/5 text-start m-4 p-2">
												<span className="ml-4">{header.columnName}</span>
											</th>
										);
									})}
							</tr>
						</thead>
						<tbody className="divide-y">
							{memberTableData.map((feat) => {
								return (
									<tr className="bg-white dark:border-gray-700 dark:bg-gray-800">
										<td className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-1/5 md:w-1/4 lg:w-1/5  m-4 p-2 text-start">
											<span className="ml-8">{feat.orgName}</span>
										</td>
										<td className="w-1/5 md:w-1/4 lg:w-1/5 text-start">
											<span className="ml-6">{feat.planType}</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
export default SubscriptionPlan;
