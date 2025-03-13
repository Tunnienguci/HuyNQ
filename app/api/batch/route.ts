import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
    try {
        const { urls } = await request.json()

        if (!Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ message: "Danh sách URL không hợp lệ" }, { status: 400 })
        }

        const { db } = await connectToDatabase()

        const documents = urls.map((url) => ({
            url: url.url,
            thumbnail: url.thumbnail,
            status: "active",
            createdAt: new Date().toISOString(),
        }))

        const result = await db.collection("urls").insertMany(documents)

        return NextResponse.json({ message: "URLs đã được lưu thành công", ids: result.insertedIds }, { status: 201 })
    } catch (error) {
        console.error("Error creating URLs:", error)
        return NextResponse.json({ message: "Có lỗi xảy ra khi lưu URLs" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { ids } = await request.json()

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: "Danh sách ID không hợp lệ" }, { status: 400 })
        }

        const { db } = await connectToDatabase()

        const result = await db.collection("urls").deleteMany({
            _id: { $in: ids.map((id) => new ObjectId(id)) },
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Không tìm thấy URL nào để xóa" }, { status: 404 })
        }

        return NextResponse.json({ message: "URLs đã được xóa thành công" }, { status: 200 })
    } catch (error) {
        console.error("Error deleting URLs:", error)
        return NextResponse.json({ message: "Có lỗi xảy ra khi xóa URLs" }, { status: 500 })
    }
}

