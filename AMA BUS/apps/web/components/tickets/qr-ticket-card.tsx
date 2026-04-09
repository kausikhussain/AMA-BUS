import type { TicketRecord } from "@amaride/shared";
import { currency, formatTime } from "../../lib/utils";
import { motion } from "framer-motion";
import { Bus, Clock, Users, ShieldCheck } from "lucide-react";

export function QrTicketCard({ ticket }: { ticket: TicketRecord }) {
  return (
    <motion.article 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="ticket-glass rounded-[2rem] p-6 shadow-glass text-white"
    >
      <div className="absolute top-4 right-4 animate-pulse">
        <ShieldCheck className="text-primary-foreground opacity-80" strokeWidth={1.5} />
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
        <div className="space-y-6">
          <div>
            <div className="badge bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="pulse-dot bg-white shadow-white" style={{ background: 'white', animation: 'pulse-ring 2s infinite' }} />
              Active Pass
            </div>
            <h3 className="mt-4 font-display text-3xl font-bold tracking-tight">{ticket.routeName}</h3>
            <div className="mt-2 text-primary-foreground/80 font-medium tracking-wide flex items-center gap-2">
              <Bus size={18} /> {ticket.busNumber}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-1 flex items-center gap-1"><Users size={12}/> Passengers</p>
              <p className="font-semibold">{ticket.passengerCount}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-1 flex items-center gap-1"><Clock size={12}/> Valid Until</p>
              <p className="font-semibold">{formatTime(ticket.expiresAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary opacity-50 blur-2xl rounded-full" />
          <div className="relative rounded-[2rem] bg-white p-5 shadow-2xl transition-transform hover:scale-105 duration-300">
            <img src={ticket.qrCode} alt="QR Ticket" className="h-44 w-44 object-contain" />
            <div className="mt-3 text-center text-xs font-bold text-slate-800 tracking-widest uppercase">
              {ticket.id.split('-')[0]}-{ticket.id.split('-').pop()?.slice(0, 4)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-sm font-medium">
        <span className="text-white/60 uppercase tracking-widest text-xs">Total Fare</span>
        <span className="text-xl">{currency(ticket.fare)}</span>
      </div>
    </motion.article>
  );
}
