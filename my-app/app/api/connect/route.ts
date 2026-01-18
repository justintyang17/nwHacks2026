import { NextResponse } from "next/server";


//route requires platform and formID in request

export async function POST(req: Request) { 
//    const formData = await req.formData();
  //  const file = formData.get("video") as File | null;
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

        const accountResponse = await fetch('https://getlate.dev/api/v1/accounts', {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${process.env.lateKey}`
            }
          });
          
          const { accounts } = await accountResponse.json();
          
          console.log('Connected accounts:', accounts);
    

        // if (platform in accounts.filter((account : any) => {
        //     return account.platform;
           
        // })) {
        //     //delete account
        //     fetch("https://getlate.dev/api/v1/accounts/string", {
        //         method: "DELETE",
        //         headers: {
        //           "Authorization": `Bearer ${process.env.lateKey}`
        //         }
        //       })
        // }

        const response = await fetch(
            `https://getlate.dev/api/v1/connect/${platform}?profileId=${profID}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.lateKey}`
              }
            }
          );
          
          const { authUrl } = await response.json();
          // Redirect user to this URL to authorize
          console.log(authUrl);
          window.location.href = authUrl;


    } catch (err) {
        console.error("[api/connect] error", err);
        return NextResponse.json(
            { success: false, error: "Internal error connecting platforms" },
            { status: 500 }
          );
    }

  
    
}