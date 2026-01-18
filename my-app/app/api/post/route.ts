import { NextResponse } from "next/server";

export async function POST(req :Request) {
    const profile = process.env.profile;

    try{
        const formData = await req.formData();
        const platform = formData.get("platform") as string;
        const video = formData.get("video") as File;
        const content = formData.get("content") as string;
    const accountResponse = await fetch('https://getlate.dev/api/v1/accounts', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${process.env.lateKey}`
        }
      });
      
      const { accounts } = await accountResponse.json();
      
      console.log('Connected accounts:', accounts);

      const accountId = accounts.filter((acc : any) => {
        return acc.platform === platform;
      })[0]["_id"]

      // Step 1: Get presigned URL
    const urLresponse = await fetch('https://getlate.dev/api/v1/media/presign', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.lateKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename: 'my-video.mp4', 
      contentType: 'video/mp4'
    })
  });
  const { uploadUrl, publicUrl } = await urLresponse.json();
  
  // Step 2: Upload file directly to storage
  await fetch(uploadUrl, {
    method: 'PUT',
    body: video, //video file
    headers: { 'Content-Type': 'video/mp4' }
  });
  
  // Step 3: Use publicUrl when creating your post
  // The publicUrl is ready to use immediately after upload completes

    const response = await fetch('https://getlate.dev/api/v1/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.lateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          mediaItems: [{type: "video", url: publicUrl}],
          publishNow: true,
          platforms: [
            { platform: platform, accountId: accountId }] }
          )
      });
      
      const { post } = await response.json();
      console.log('Published:', post._id);

      return NextResponse.json({ success: true });
      
    } catch (err : any) {
        console.error("[api/connect] error", err);
        return NextResponse.json(
            { success: false, error: "Internal error posting video" },
            { status: 500 }
          );
    }
}