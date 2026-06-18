"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = () => {
    router.push("/login");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  return (
    <div>
      {user ? (
        <Button onClick={handleSignOut}>Logout</Button>
      ) : (
        <Button onClick={handleSignIn}>Login</Button>
      )}
    </div>
  );
}
