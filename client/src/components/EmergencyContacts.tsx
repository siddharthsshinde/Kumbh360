import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, UserPlus, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Placeholder user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = "user123";

interface EmergencyContact {
  id: number;
  userId: string;
  contactName: string;
  contactNumber: string;
  relationship: string | null;
  createdAt: string;
}

export function EmergencyContacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    contactName: "",
    contactNumber: "",
    relationship: "",
  });

  // Fetch emergency contacts
  const { data: contacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: [`/api/user-emergency-contacts/${CURRENT_USER_ID}`],
    refetchOnWindowFocus: false,
  });

  // Add new contact
  const addContactMutation = useMutation({
    mutationFn: async (contact: {
      userId: string;
      contactName: string;
      contactNumber: string;
      relationship: string;
    }) => {
      return apiRequest<{ id: number }>("/api/user-emergency-contacts", {
        method: "POST",
        body: JSON.stringify(contact),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user-emergency-contacts/${CURRENT_USER_ID}`] });
      toast({
        title: "Contact Added",
        description: "Emergency contact has been added successfully.",
      });
      setOpen(false);
      setNewContact({
        contactName: "",
        contactNumber: "",
        relationship: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add emergency contact. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding contact:", error);
    },
  });

  // Delete contact
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      return apiRequest(`/api/user-emergency-contacts/${contactId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user-emergency-contacts/${CURRENT_USER_ID}`] });
      toast({
        title: "Contact Removed",
        description: "Emergency contact has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove emergency contact. Please try again.",
        variant: "destructive",
      });
      console.error("Error removing contact:", error);
    },
  });

  const handleAddContact = () => {
    if (!newContact.contactName || !newContact.contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and phone number.",
        variant: "destructive",
      });
      return;
    }

    addContactMutation.mutate({
      userId: CURRENT_USER_ID,
      contactName: newContact.contactName,
      contactNumber: newContact.contactNumber,
      relationship: newContact.relationship || "",
    });
  };

  const handleDeleteContact = (contactId: number) => {
    deleteContactMutation.mutate(contactId);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Emergency Contacts
        </h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
              <DialogDescription>
                Add a trusted person to be notified in case of emergency.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Contact name"
                  className="col-span-3"
                  value={newContact.contactName}
                  onChange={(e) => setNewContact({ ...newContact, contactName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  className="col-span-3"
                  value={newContact.contactNumber}
                  onChange={(e) => setNewContact({ ...newContact, contactNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="relation" className="text-right">
                  Relation
                </Label>
                <Input
                  id="relation"
                  placeholder="Relationship (optional)"
                  className="col-span-3"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
                {addContactMutation.isPending ? "Adding..." : "Add Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No emergency contacts added yet.</div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{contact.contactName}</div>
                <div className="text-sm text-gray-600">{contact.contactNumber}</div>
                {contact.relationship && (
                  <div className="text-xs text-gray-500">{contact.relationship}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteContact(contact.id)}
                disabled={deleteContactMutation.isPending}
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        These contacts will be notified in case you press the SOS button, providing them with your current location and emergency details.
      </div>
    </Card>
  );
}