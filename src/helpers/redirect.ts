import { apiURL } from '../settings'
import { checkForToken } from './getToken'

async function checkIfRedirectNeeded() {
    const token = checkForToken()
    if (!token) return
    
    let response = await fetch(apiURL + "account/status", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Token': token.token,
            'User-Id': token.userId.toString()
        }
    })

    if (response.ok && response.status !== 204) {
        const data = await response.json()
        window.location.href = data.redirect
    }
}

export default checkIfRedirectNeeded