import { Outlet, redirect, useLoaderData } from "react-router";
import { RootNavbar } from "~/components";
import { account } from "~/appwrite/client";
import { getExistingUser, getUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  console.log("PageLayout clientLoader running...");
  try {
    const user = await account.get();
    console.log("User from account.get():", user);

    if (!user || !user.$id) {
      console.log("No user found, redirecting to sign-in");
      throw new Error("No user found");
    }

    let existingUser = await getExistingUser(user.$id);
    console.log("Existing user:", existingUser);

    if (!existingUser) {
      console.log("Creating new user data...");
      try {
        const newUser = await storeUserData();
        existingUser = newUser;
      } catch (storeError: any) {
        console.error("Failed to store user data:", storeError);
        // Continue anyway - the user is authenticated, just couldn't save to DB
        // This prevents infinite redirect loops
      }
    }

    // If we still don't have user data, return minimal user info
    if (!existingUser) {
      return {
        accountId: user.$id,
        email: user.email,
        name: user.name.substring(0, 20),
        imageUrl: null,
        status: 'user', // Default to 'user' if no existing user data
      };
    }

    const userData = await getUser();
    console.log("User data from getUser():", userData);
    console.log("User status:", userData?.status);
    return userData;
  } catch (e: any) {
    console.error("Error in PageLayout clientLoader:", e);

    // Clear stale cache on auth errors
    if (e?.code === 401 || e?.type === 'general_unauthorized_scope') {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.clear();
      }
    }

    throw redirect("/sign-in");
  }
}

const PageLayout = () => {
  const loaderData = useLoaderData() as any;
  console.log("PageLayout rendering with loaderData:", loaderData);
  return (
    <>
      <RootNavbar userStatus={loaderData?.status} />
      <Outlet />
    </>
  );
};

export default PageLayout;