
import { NextResponse } from "next/server";


//route requires platform and formID in request

export async function POST(req: Request) { 
    const profile = process.env.profile;
    try {
        const formData = await req.formData();
        const platform = formData.get("platform") as string;
        let profID = formData.get("formID") as string | undefined;
        if (profID == undefined) {
            profID = process.env.profile;
        }
        if (!platform) {
            return NextResponse.json(
                { success: false, error: "No platform" },
                { status: 400 }
              );
        }

        const postResponse = await fetch('https://getlate.dev/api/v1/posts', {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${process.env.lateKey}`,
              'Content-Type': 'application/json'
            }
          });
          
        await postResponse.json();
    

    } catch (err) {
        console.error("[api/post] error", err);
        return NextResponse.json(
            { success: false, error: "Internal error posting media" },
            { status: 500 }
          );
    }    
}