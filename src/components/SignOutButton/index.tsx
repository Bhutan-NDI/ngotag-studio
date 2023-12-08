import { removeFromLocalStorage } from "../../api/Auth"
import { storageKeys } from "../../config/CommonConstant"
import { removeCookie } from "../../utils/cookies"

const SignOutButton = () => {

    const signOut = async () => {

        await removeFromLocalStorage(storageKeys.TOKEN)
        await removeFromLocalStorage(storageKeys.USER_EMAIL)
        await removeFromLocalStorage(storageKeys.ORG_ID)
        await removeFromLocalStorage(storageKeys.ORG_ROLES)
        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID)
        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ROLE)
        await removeFromLocalStorage(storageKeys.USER_PROFILE)

        
        removeCookie(storageKeys.TOKEN)
        removeCookie(storageKeys.USER_EMAIL)
        removeCookie(storageKeys.ORG_ID)
        removeCookie(storageKeys.ORG_ROLES)
        removeCookie(storageKeys.ECOSYSTEM_ID)
        removeCookie(storageKeys.ECOSYSTEM_ROLE)
        removeCookie(storageKeys.USER_PROFILE)
        
        const response = await fetch('/api/auth/signout', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (response.redirected) {
            window.location.assign(response.url);
        }
    }
    return (
        <button onClick={signOut}
            className="w-full cursor-pointer text-start block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            role="menuitem">Sign out</button>
    )
}

export default SignOutButton