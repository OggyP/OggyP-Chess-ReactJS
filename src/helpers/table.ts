function getTdCSS(widthPercent: number) {
    return {
        width: widthPercent + "%",
        overflow: "hidden",
        textOverflow: "ellipsis",
    }
}

export {getTdCSS}