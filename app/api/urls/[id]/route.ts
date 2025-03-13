import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("urls").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Không tìm thấy URL" }, { status: 404 })
    }

    return NextResponse.json({ message: "URL đã được xóa thành công" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting URL:", error)
    return NextResponse.json({ message: "Có lỗi xảy ra khi xóa URL" }, { status: 500 })
  }
}

