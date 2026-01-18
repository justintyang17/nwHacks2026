 "use client";

import { Button } from "@mui/material";
import { useSocialMediaContext } from "../context/SocialMediaContext";

export default function SocialMediaModal() {

    const { accounts, setAccount } = useSocialMediaContext();

    const handlePlatforms = () => {
        handlePlatforms
    }
 
  return (
    <div>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handlePlatforms}
        >
          Back to upload
        </Button>
    </div>
  );
}