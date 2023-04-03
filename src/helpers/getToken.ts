function checkForToken() {
    let token = localStorage.getItem("token");
    if (token) {
        const tokenSplit = token.split('|')
        return {
            token: tokenSplit[0],
            userId: tokenSplit[1]
        }
    }
    return null
}

interface tokenType {
    token: string;
    userId: string;
}

export { checkForToken }
export type { tokenType }