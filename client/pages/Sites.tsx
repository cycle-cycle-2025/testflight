import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { ApiResponse, Site, User } from "@shared/api";

export default function Sites() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [expandedSites, setExpandedSites] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const siteIncharges = useMemo(
    () => users.filter((u) => u.role === "site_incharge"),
    [users],
  );
  const foremen = useMemo(
    () => users.filter((u) => u.role === "foreman"),
    [users],
  );

  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const load = async () => {
      const [u, s] = await Promise.all([
        fetch("/api/admin/users", { headers }).then(
          (r) => r.json() as Promise<ApiResponse<User[]>>,
        ),
        fetch("/api/sites", { headers }).then(
          (r) => r.json() as Promise<ApiResponse<Site[]>>,
        ),
      ]);
      if (u.success && u.data) setUsers(u.data);
      if (s.success && s.data) setSites(s.data);
    };
    load();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Only admins can view this page.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Browse sites and view attendance per foreman</p>
      </div>

      <div className="max-w-md">
        <input
          placeholder="Search sites..."
          className="border rounded-md h-10 px-3 w-full"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>
            Tap a site to expand and view foremen; click a foreman to view attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="text-gray-500">No sites found.</div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-2 p-3 text-sm text-gray-600 bg-muted/50 rounded-t-md">
                <div className="col-span-3">Site Incharge</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Location</div>
                <div className="col-span-2">Total Foremen</div>
              </div>
              <Accordion
                type="multiple"
                value={expandedSites}
                onValueChange={(v) => setExpandedSites(v as string[])}
              >
              {sites
                .filter((site) => site.name.toLowerCase().includes(query.toLowerCase()))
                .map((site) => {
                const incharge = siteIncharges.find(
                  (u) => u.id === site.inchargeId,
                );
                const siteForemen = foremen.filter((f) => f.siteId === site.id);
                return (
                  <AccordionItem key={site.id} value={site.id}>
                    <AccordionTrigger>
                      <div className="grid grid-cols-12 gap-2 w-full text-left">
                        <div className="col-span-3 flex items-center gap-2">
                          <span className="font-medium">{incharge?.name || '-'}</span>
                        </div>
                        <div className="col-span-3 font-medium">{site.name}</div>
                        <div className="col-span-4 text-gray-600">{site.location}</div>
                        <div className="col-span-2">{siteForemen.length}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border rounded-md">
                        <div className="grid grid-cols-12 gap-2 p-3 text-sm text-gray-600 bg-muted/30">
                          <div className="col-span-4">Site Foremen</div>
                          <div className="col-span-8 text-right"></div>
                        </div>
                        <div className="p-3 space-y-2">
                          {siteForemen.length === 0 ? (
                            <div className="text-gray-500">No foremen assigned.</div>
                          ) : (
                            siteForemen.map((f) => (
                              <div key={f.id} className="grid grid-cols-12 items-center gap-2">
                                <div className="col-span-10 flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-sm bg-gray-100 flex items-center justify-center text-xs">{f.name.charAt(0)}</div>
                                  <span className="font-medium">{f.name}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                  <a className="inline-block" href={`/attendance/records?foremanId=${f.id}&name=${encodeURIComponent(f.name)}`}>
                                    <button className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">View</button>
                                  </a>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600">Showing {sites.length} sites</div>
    </div>
  );
}
