"use client";

import { ThemeToggle } from "@/components";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ContentFrame from "@/components/ContentFrame";
import SectionHeader from "@/components/SectionHeader";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="border-4 border-black bg-nb-yellow p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tight">
                POMPA<span className="text-nb-purple">WM</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge color="bg-nb-green">ONLINE</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <ContentFrame shadowSize="xl" className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Badge color="bg-nb-pink" className="mb-4">
                🚀 NEO-BRUTALISM STYLE
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase leading-tight">
                Pompa WM
                <br />
                <span className="text-nb-purple">Dashboard</span>
              </h2>
              <p className="mt-4 text-lg font-bold text-black/70 dark:text-white/70 max-w-lg">
                Aplikasi monitoring dan manajemen pompa Water Management dengan
                desain Neo-Brutalism yang bold dan fungsional.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="primary" size="lg">
                🔧 Mulai Monitor
              </Button>
              <Button variant="secondary" size="md">
                📊 Lihat Laporan
              </Button>
            </div>
          </div>
        </ContentFrame>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader title="Status Pompa" headSize="md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pompa"
            value="24"
            color="bg-nb-yellow"
            trend="neutral"
            trendValue="Stabil"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
            }
          />
          <StatCard
            title="Aktif"
            value="18"
            color="bg-nb-green"
            trend="up"
            trendValue="+3 hari ini"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            }
          />
          <StatCard
            title="Maintenance"
            value="4"
            color="bg-nb-orange"
            trend="down"
            trendValue="-2 dari kemarin"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
            }
          />
          <StatCard
            title="Nonaktif"
            value="2"
            color="bg-nb-red"
            trend="down"
            trendValue="-1 dari kemarin"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" /></svg>
            }
          />
        </div>
      </section>

      {/* Cards Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader title="Area Monitoring" headSize="md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Area Utara",
              pumps: 8,
              status: "Normal",
              color: "bg-nb-cyan",
              statusColor: "bg-nb-green",
            },
            {
              title: "Area Selatan",
              pumps: 6,
              status: "Peringatan",
              color: "bg-nb-pink",
              statusColor: "bg-nb-orange",
            },
            {
              title: "Area Timur",
              pumps: 5,
              status: "Normal",
              color: "bg-nb-green",
              statusColor: "bg-nb-green",
            },
            {
              title: "Area Barat",
              pumps: 3,
              status: "Kritis",
              color: "bg-nb-red",
              statusColor: "bg-nb-red",
            },
            {
              title: "Area Pusat",
              pumps: 2,
              status: "Normal",
              color: "bg-nb-purple",
              statusColor: "bg-nb-green",
            },
          ].map((area, idx) => (
            <Card key={idx} hover className="overflow-hidden">
              <div className={`${area.color} p-4 border-b-4 border-black`}>
                <h3 className="text-xl font-black text-black uppercase">
                  {area.title}
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-black dark:text-white">
                    Jumlah Pompa
                  </span>
                  <span className="text-3xl font-black text-black dark:text-white">
                    {area.pumps}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black/70 dark:text-white/70">
                    Status
                  </span>
                  <Badge color={area.statusColor}>{area.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white dark:bg-gray-900 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="border-3 border-black bg-nb-yellow p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
              </div>
              <span className="font-black text-black dark:text-white">
                POMPA<span className="text-nb-purple">WM</span> App
              </span>
            </div>
            <p className="font-bold text-black/60 dark:text-white/60 text-sm">
              © 2025 Pompa WM App — Neo-Brutalism Dashboard Template
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
