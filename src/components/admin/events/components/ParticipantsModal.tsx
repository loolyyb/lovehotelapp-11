
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";

interface Participant {
  participation_id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  status: string;
  registered_at: string;
}

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  eventTitle: string;
}

export function ParticipantsModal({ isOpen, onClose, participants, eventTitle }: ParticipantsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredParticipants = participants.filter(participant => 
    participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Nom", "Username", "Status", "Date d'inscription"];
    const data = participants.map(p => [
      p.full_name || '',
      p.username || '',
      p.status,
      new Date(p.registered_at).toLocaleString('fr-FR')
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${eventTitle.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Participants à l'événement : {eventTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date d'inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.participation_id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar_url || ''} />
                      <AvatarFallback>{participant.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    {participant.full_name}
                  </TableCell>
                  <TableCell>{participant.username}</TableCell>
                  <TableCell>{participant.status}</TableCell>
                  <TableCell>
                    {new Date(participant.registered_at).toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
