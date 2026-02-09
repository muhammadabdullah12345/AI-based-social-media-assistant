import cloudinary from "@/src/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authoptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { base64Image } = await req.json();

  if (!base64Image) {
    return Response.json({ error: "Base64 image missing" }, { status: 400 });
  }

  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "generatify-ai-posts",
  });

  return Response.json({
    cloudinaryUrl: result.secure_url,
  });
}
