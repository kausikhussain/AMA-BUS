import type { ReactNode } from "react";
import { AppShell } from "../../components/layout/app-shell";

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      eyebrow="Passenger Experience"
      title="AmaRide Passenger Hub"
      description="Plan journeys, watch buses move in real time, buy QR tickets, and manage your commuting profile."
      navItems={[
        { href: "/", label: "Home" },
        { href: "/search", label: "Search Route" },
        { href: "/live", label: "Live Map" },
        { href: "/tickets", label: "Tickets" },
        { href: "/profile", label: "Profile" }
      ]}
    >
      {children}
    </AppShell>
  );
}
