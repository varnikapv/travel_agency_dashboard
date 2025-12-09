import { Link, NavLink, useLoaderData, useNavigate } from "react-router";
import { sidebarItems } from "~/constants";
import { cn } from "~/lib/utils";

const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
  const user = useLoaderData() as { name?: string; email?: string; imageUrl?: string };
  const navigate = useNavigate();

  

  return (
    <section className="nav-items">
      <Link to="/" className="link-logo" onClick={handleClick}>
        <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />
        <h1>Tourvisto</h1>
      </Link>

      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink
              key={id}
              to={href}
              end
              className={({ isActive }) =>
                cn("group nav-item", isActive && "bg-primary-100 !text-white")
              }
              onClick={handleClick}
            >
              <img
                src={icon}
                alt={label}
                className={cn(
                  "size-5 transition group-hover:brightness-0 group-hover:invert",
                  "text-dark-200",
                  "group-[.bg-primary-100]:brightness-0 group-[.bg-primary-100]:invert"
                )}
              />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <footer className="nav-footer">
          <img
            src={user?.imageUrl || "/assets/images/david.webp"}
            alt={user?.name || "User"}
            referrerPolicy="no-referrer"
          />
          <article>
            <h2>{user?.name || "User"}</h2>
            <p>{user?.email || ""}</p>
          </article>
          
        </footer>
      </div>
    </section>
  );
};

export default NavItems;