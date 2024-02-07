	import React from 'react';
	import BreadCrumbs from '../BreadCrumbs';
	import { Button } from 'flowbite-react';

	const FreePlan = () => {
		const planDetails = [
		{ Organizations: '2' },
		{ Wallets: '1 Wallet on Shared Agent/ Org' },
		{ Schema: '5/Org' },
		{ credDef: '10/Schema' },
		{ Users: '5/Org' },
		{ credentials_Issuance: '500/Org/Month' },
		{ Credentials_Verification: '500/Org/Month' },
		{ Bulk_Issuance: '50/batch' },
		{ Bulk_Verification: '50/batch' },
		{ Network_Agent: 'Indicio TestNet and DemoNet' },
		{ Mobile_SSI_App: 'Unlimited Installations' },
		{ Mobile_SSI_SDK: 'Not supported' },
		{ Technical_Support: 'Community' },
		{ Customizations: 'Not Available' },
		{ White_Labeling: 'Not Available' },
		];

		return (
			<div className="flex justify-center max-w-full" id="plans">
				<section className="bg-white dark:bg-gray-900">
					<div className="mt-20 ml-4 mr-4">
						<h3 className="mb-4 text-xl text-center font-semibold">
							CREDEBL (Free)
						</h3>
						<div className="flex justify-center items-baseline mt-8 mb-4">
							<span className="mr-2 text-4xl font-extrabold">&#8377;0.00</span>
							<span className="text-gray-500 dark:text-gray-400">Per month</span>
						</div>
							<button
								type="button"
								className="p-1.5 group flex h-min justify-center focus:z-10 focus:outline-none font-normal items-center text-xl text-primary-700 border border-blue-700 text-center rounded-lg focus:ring-4 focus:ring-primary-300 w-full dark:hover:bg-primary-700 dark:text-white dark:bg-primary-700 dark:focus:ring-blue-800"
							>
								Current Plan
							</button>
						<ul role="list" className="mb-8 space-y-4 text-left font-xs
					">
							{planDetails.map((detail, index) => (
								<li key={index} className="flex items-center space-x-3 font-xs">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									{Object.entries(detail).map(([key, value]) => (
										<span key={key}>
											{key}:{value}
										</span>
									))}
								</li>
							))}
						</ul>
					</div>
				</section>
			</div>
		);
	};

	export default FreePlan;