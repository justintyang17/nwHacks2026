import { NextResponse } from "next/server";

export async function POST(req : Request) {
    try {
        const formData = await req.formData();
        const platform = formData.get("platform") as string;
    
        const accountResponse = await fetch('https://getlate.dev/api/v1/accounts', {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${process.env.lateKey}`
            }
          });
          
          const { accounts } = await accountResponse.json();
          
          console.log('Connected accounts:', accounts);
          if (accounts.filter((acc : any) => {
            return acc.platform === platform;
          }).length == 0) {
            return NextResponse.json (
                {success: true, platform: false}
            )
          } else {
            return NextResponse.json (
                {success: true, platform: true}
            )
          }
    } catch (err) {
        return NextResponse.json( {
            success: false, error: "Internal error getting acounts"
        }, {status: 500});
}}
