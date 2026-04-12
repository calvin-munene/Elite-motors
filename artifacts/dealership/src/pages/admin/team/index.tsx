import { AdminLayout } from "@/components/admin/AdminLayout";
import { useListTeamMembers, useDeleteTeamMember } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminTeam() {
  const { data: teamMembers, refetch } = useListTeamMembers();
  const deleteTeamMember = useDeleteTeamMember();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      deleteTeamMember.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Team member removed" });
          refetch();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-gray-400">Manage your dealership staff profiles.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="bg-card border border-white/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Profile</TableHead>
              <TableHead className="text-gray-400">Contact</TableHead>
              <TableHead className="text-gray-400">Specialty</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!teamMembers?.length ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">No team members found.</TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member) => (
                <TableRow key={member.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-serif">{member.name.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-xs text-primary">{member.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-400 space-y-1">
                      {member.phone && <p>{member.phone}</p>}
                      {member.email && <p>{member.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-400">{member.specialty || "N/A"}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
