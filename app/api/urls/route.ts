import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const urls = await db.collection("urls").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(urls)
  } catch (error) {
    console.error("Error fetching URLs:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi tải danh sách URL" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL không được để trống" }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch (err) {
      return NextResponse.json({ message: "URL không hợp lệ" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("urls").insertOne({
      url,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ message: "URL đã được lưu thành công", id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating URL:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi lưu URL" }, { status: 500 })
  }
}

