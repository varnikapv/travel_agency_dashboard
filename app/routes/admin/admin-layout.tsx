import { Outlet, redirect } from "react-router"
import {SidebarComponent} from "@syncfusion/ej2-react-navigations";
import { NavItems, MobileSidebar } from "~/components";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader(){
    try{
            const user = await account.get()

            if(!user || !user.$id){
                throw new Error("No user found");
            }

          const existingUser = await getExistingUser(user.$id); 
          
          // Restrict access to admin only
          if(existingUser?.status === 'user'){
            throw redirect('/');
          }

          return existingUser?.$id ? existingUser : await storeUserData();
    }catch(e: any){
        console.log("error in client loader", e);
        
        // Clear auth cache
        if (e?.code === 401 || e?.type === 'general_unauthorized_scope') {
            if (typeof window !== 'undefined') {
                sessionStorage.clear();
                localStorage.clear();
            }
        }
        
        throw redirect("/sign-in")
    }
}


const AdminLayout = () => {   
  return (
    <div className="admin-layout">
        <MobileSidebar />
        <aside className="w-full max-w-[270px] hidden lg:block">
          <SidebarComponent width={270} enableGestures={false}>
            <NavItems />

          </SidebarComponent>
        </aside>
        <aside className="children">
            <Outlet />
        </aside>
    </div>
  )
}

export default AdminLayout