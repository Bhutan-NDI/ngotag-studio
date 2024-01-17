import React from 'react';
import BreadCrumbs from '../BreadCrumbs';

const Plans = () => {
	const freePlan = [
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
	const proPlan = [
		{ Organizations: '5' },
		{ Wallets: '1 Wallet on Shared Agent/ Org' },
		{ Schema: '10/Org' },
		{ credDef: '50/Schema' },
		{ Users: '10/Org' },
		{ credentials_Issuance: '5000/Org/Month' },
		{ Credentials_Verification: '25000/Org/Month' },
		{ Bulk_Issuance: '1000/batch' },
		{ Bulk_Verification: '2500/batch' },
		{ Network_Agent: 'Indicio MainNet' },
		{ Mobile_App: 'Unlimited Installations' },
		{ Mobile_SSI_SDK: 'Not supported' },
		{ Technical_Support: 'Email, Community' },
		{ Customizations: 'Not Available' },
		{ White_Labeling: 'Not Available' },
	];
	return (
		<div className="p-4" id="plans">
			<BreadCrumbs />
			<div
				className="flex items-center justify-between mb-4"
				id="connection-list"
			>
				<h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Subscription Plans
				</h1>
			</div>
			<section className="bg-white dark:bg-gray-900">
				<div className="py-4 px-4 mx-auto max-w-screen-xl lg:py-8 lg:px-6">
					<div className="space-y-4 lg:grid lg:grid-cols-2 sm:gap-6 xl:gap-10 lg:space-y-0">
						<div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white shadow-md">
							<h3 className="mb-4 text-2xl font-semibold uppercase">Free</h3>
							<p className="font-light text-gray-500 sm:text-lg dark:text-gray-400 mx-4">
								Best option for personal use & for your next project.
							</p>
							<div className="flex justify-center items-baseline my-4">
								<span className="mr-2 text-5xl font-extrabold">$0</span>
								<span className="text-gray-500 dark:text-gray-400">/month</span>
							</div>
							<ul role="list" className="mb-8 space-y-4 text-left">
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>Organizations: 2 </span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Wallets : 1
										<span className="font-bold">
											{' '}
											Wallet on Shared Agent/ Org
										</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Schema: <span className="font-bold"> 5/Org</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Cred-def: <span className="font-bold"> 10/Schema</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Users: <span className="font-bold"> 5/Org</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Credentials Issuance:{' '}
										<span className="font-bold">500/Org/Month</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Credentials Verification:{' '}
										<span className="font-bold">500/Org/Month</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Bulk Issuance: <span className="font-bold">50/batch</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Network Agent:{' '}
										<span className="font-bold">
											{' '}
											Indicio TestNet and DemoNet
										</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Mobile SSI App:{' '}
										<span className="font-bold"> Unlimited Installations</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Mobile SSI SDK:{' '}
										<span className="font-bold">Not supported</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Technical support:{' '}
										<span className="font-bold"> Community</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										Customizations:{' '}
										<span className="font-bold">Not Available</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#D0EBDE" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="#25BA85"
										/>
									</svg>
									<span>
										White Labeling:{' '}
										<span className="font-bold">Not Available</span>{' '}
									</span>
								</li>
							</ul>
							<a
								href="#"
								className="text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900"
							>
								Current Plan{' '}
							</a>
						</div>
						<div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white shadow-md">
							<h3 className="mb-4 text-2xl font-semibold uppercase">Pro</h3>
							<p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
								Relevant for multiple users, extended & premium support.
							</p>
							<div className="flex justify-center items-baseline my-4">
								<span className="mr-2 text-5xl font-extrabold">$99</span>
								<span className="text-gray-500 dark:text-gray-400">/month</span>
							</div>
							<ul role="list" className="mb-8 space-y-4 text-left">
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Organizations:<span className="font-bold"> 5 </span>
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Wallets : 1
										<span className="font-bold">
											{' '}
											Wallet on Shared Agent/ Org
										</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Schema: <span className="font-bold"> 10/Org</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Cred-def: <span className="font-bold"> 50/Schema</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Users: <span className="font-bold"> 10/Org</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Credentials Issuance:{' '}
										<span className="font-bold">5000/Org/Month</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Credentials Verification:{' '}
										<span className="font-bold">25000/Org/Month</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Bulk Issuance: <span className="font-bold">1000/batch</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Network Agent:{' '}
										<span className="font-bold"> Indicio MainNet</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Mobile SSI App:{' '}
										<span className="font-bold"> Unlimited Installations</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Mobile SSI SDK:{' '}
										<span className="font-bold">Not supported</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Technical support:{' '}
										<span className="font-bold">Email, Community</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										Customizations:{' '}
										<span className="font-bold">Not Available</span>{' '}
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="19"
										height="19"
										viewBox="0 0 19 19"
										fill="none"
									>
										<rect width="19" height="19" rx="9.5" fill="#25BA85" />
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M14.7907 6.20496C14.9247 6.33623 15 6.51426 15 6.69988C15 6.8855 14.9247 7.06353 14.7907 7.1948L9.07129 12.795C8.93722 12.9263 8.75541 13 8.56584 13C8.37626 13 8.19445 12.9263 8.06038 12.795L5.20069 9.99492C5.07046 9.86289 4.9984 9.68607 5.00003 9.50252C5.00166 9.31897 5.07684 9.1434 5.2094 9.01361C5.34195 8.88382 5.52126 8.81019 5.70871 8.8086C5.89616 8.807 6.07675 8.87756 6.21159 9.00508L8.56584 11.3103L13.7798 6.20496C13.9138 6.07372 14.0957 6 14.2852 6C14.4748 6 14.6566 6.07372 14.7907 6.20496Z"
											fill="white"
										/>
									</svg>
									<span>
										White Labeling:{' '}
										<span className="font-bold">Not Available</span>{' '}
									</span>
								</li>
							</ul>
							<a
								href="#"
								className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900"
							>
								Buy Plan
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Plans;
