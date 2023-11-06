import React from 'react'
import type { Organisation } from '../../components/organization/interfaces';
import { removeFromCookies, removeFromLocalStorage, setToCookies, setToLocalStorage } from '../../api/Auth';
import { storageKeys } from '../../config/CommonConstant';
import { pathRoutes } from '../../config/pathRoutes';
import CustomAvatar from '../../components/Avatar'

const OrgList = ({ item }: any) => {

    const goToOrgDashboard = async (org: Organisation) => {
        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID)
        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ROLE)
        await removeFromLocalStorage(storageKeys.ORG_DETAILS)

        await setOrgRoleDetails(org)
        window.location.href = pathRoutes.organizations.dashboard;
    };

    const setOrgRoleDetails = async (org: Organisation) => {
        await removeFromCookies(storageKeys.ORG_ID)
        await setToLocalStorage(storageKeys.ORG_ID, org.id.toString());
        await setToCookies(storageKeys.ORG_ID, org.id.toString());
        const roles: string[] = org?.userOrgRoles.map(role => role.orgRole.name)

        await setToCookies(storageKeys.ORG_ROLES, roles.toString());
        await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
    }
    return (
        <button
            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => goToOrgDashboard(item)}
        >
            {item.logoUrl ? (
                <CustomAvatar className='dark:text-white' size="25" src={item?.logoUrl} round />
            ) : (
                <CustomAvatar className='dark:text-white' size="25" name={item?.name} round />
            )}

            <span className="ml-3 text-base font-bold text-gray-500 dark:text-white text-start">{item?.name}</span>
        </button>
    )
}

export default OrgList