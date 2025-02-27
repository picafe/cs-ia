import { Outlet } from "react-router-dom";

export default function AuthShell() {
  return (
    <div className="flex flex-row max-h-screen">
      <div className="w-2/5">
        <Outlet />
      </div>

      <div className="w-3/5 overflow-hidden">
        <img
          src="/pawel-czerwinski-rRJmwU2R1Kk-unsplash.jpg"
          loading="eager"
          alt="abstract green 3D render"
          className="object-cover w-full"
        />
      </div>
    </div>
  );
}
