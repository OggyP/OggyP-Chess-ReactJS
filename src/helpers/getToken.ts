function setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None;Secure";
}

function deleteCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=None;Secure';
}

function getCookie(cname: string) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkForToken() {
    let token: string | string[] = getCookie("token");
    if (token !== "") {
        token = token.split('|')
        return {
            token: token[0],
            userId: token[1]
        }
    }
    return null
}

interface tokenType {
    token: string;
    userId: string;
}

export { checkForToken, setCookie, deleteCookie, getCookie }
export type { tokenType }