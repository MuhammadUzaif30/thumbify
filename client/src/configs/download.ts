export const downloadImage = async (url: string, name = "thumbnail") => {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        const objectUrl = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = objectUrl
        link.download = `${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`
        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(objectUrl)
    } catch {
        // fall back to opening the image if the fetch is blocked
        window.open(url, "_blank")
    }
}