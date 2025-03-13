import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: Request) {
    try {
        const { url } = await request.json()

        // Fetch the webpage
        const response = await fetch(url)
        const html = await response.text()
        const $ = cheerio.load(html)

        // Try to get thumbnail from meta tags
        let thumbnail =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            $('meta[property="og:image:url"]').attr("content")

        // If no thumbnail found, try to get the first image
        if (!thumbnail) {
            thumbnail = $("img").first().attr("src")
        }

        // If still no thumbnail, return null
        if (!thumbnail) {
            return NextResponse.json({ thumbnail: null })
        }

        // Convert relative URLs to absolute URLs
        if (thumbnail && !thumbnail.startsWith("http")) {
            const urlObj = new URL(url)
            thumbnail = new URL(thumbnail, urlObj.origin).toString()
        }

        return NextResponse.json({ thumbnail })
    } catch (error) {
        console.error("Error fetching preview:", error)
        return NextResponse.json({ message: "Có lỗi xảy ra khi tải preview" }, { status: 500 })
    }
}
