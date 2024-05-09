import SideNav from "../ui/inicio/sidenav";

export default function Page( { children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <nav className="w-full flex-none md:w-64">
                <SideNav />
            </nav>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}