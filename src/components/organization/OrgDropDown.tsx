"use client"

import { BiChevronDown } from "react-icons/bi";
import CustomAvatar from '../Avatar'
import OrgList from '../../commonComponents/OrgSelectionOption/OrgList'
import React, { useEffect } from "react";
import type { Organisation } from "./interfaces";
import { storageKeys } from "../../config/CommonConstant.js";
import setCookies from "../../utils/set-cookies";

interface IProps {
	activeOrg: Organisation,
	orgList: Organisation[]
}

const OrgDropDown = ({ activeOrg, orgList }: IProps) => {
	const redirectToCreateOrgModal = () => {
		window.location.href = '/organizations?orgModal=true';
	}

	useEffect(() => {
		setCookies([{key: storageKeys.ORG_ID, value: activeOrg?.id}])
	}, [activeOrg])

	return (
		<>
			<div
				id="dropdownUsersButton"
				data-dropdown-toggle="dropdownUsers"
				data-dropdown-placement="bottom"
				className="text-primary-700 text-lg h-10 bg-primary-100 hover:!bg-primary-200 dark:bg-primary-700 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
					rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:hover:bg-primary-700 dark:focus:ring-blue-800"
			>
				{
					activeOrg
						? <>
							{activeOrg.logoUrl ? (
								<CustomAvatar size="20" src={activeOrg?.logoUrl} round />
							) : (
								<CustomAvatar size="20" name={activeOrg?.name} round />
							)}
							<text className="ml-2 text-primary-700 dark:text-white">{activeOrg?.name.length > 20 ? activeOrg?.name.substring(0, 20) + '...' : activeOrg?.name}</text>
						</>
						:
						<text className='text-primary-700 dark:text-white'>
							Select organization
						</text>
				}
				<BiChevronDown size={25} color='primary-700' className=' text-primary-700 dark:text-white' />
			</div>
			<div
				id="dropdownUsers"
				className="z-10 hidden border border-gray-200 shadow-xl bg-gray-50 rounded-lg shadow w-60 dark:bg-gray-700"
			>
				{orgList?.length > 0 ? (
					<ul
						className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200 text-sm scrollbar scrollbar-w-3 scrollbar-thumb-rounded-[0.25rem] scrollbar-track-slate-200 scrollbar-thumb-gray-400 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-700"
						aria-labelledby="dropdownUsersButton"
					>
						{orgList?.map((org) => {
							const roles: string[] = org.userOrgRoles.map(role => role.orgRole.name)
							org.roles = roles
							return (
								<li key={org?.id}>
									<OrgList item={org} />
								</li>
							)
						})
						}
					</ul>
				) : (
					<div className="text-black-100 text-sm text-center p-10">
						<text>No organizations found</text>
					</div>
				)}

				<a
					href="#"
					className="flex items-center p-5 text-sm font-medium text-primary-700 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white hover:underline"
					onClick={redirectToCreateOrgModal}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className='pr-2 dark:text-white' width="24" height="24" fill="none" viewBox="0 0 24 24">
						<path fill="currentColor" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
					</svg>


					Create Organization
				</a>
			</div>
		</>
	);
};

export default OrgDropDown;
