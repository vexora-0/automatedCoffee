"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Settings,
  Package,
  MapPin,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Staff {
  staff_id: string;
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  documents: string[];
  assigned_machine_ids: string[];
  is_active: boolean;
  created_at: string;
  assigned_machines?: Machine[];
}

interface Machine {
  machine_id: string;
  location: string;
  status: string;
}

interface StaffFormData {
  name: string;
  mobile_number: string;
  email: string;
  address: string;
  documents: string[];
  assigned_machine_ids: string[];
}

export default function StaffManagementPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    mobile_number: "",
    email: "",
    address: "",
    documents: [],
    assigned_machine_ids: [],
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load staff and machines in parallel
      const [staffResponse, machinesResponse] = await Promise.all([
        apiCall("/staff"),
        apiCall("/machines"),
      ]);

      if (staffResponse.success) {
        setStaff(staffResponse.data || []);
      }

      if (machinesResponse.success) {
        setMachines(machinesResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load staff data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      mobile_number: "",
      email: "",
      address: "",
      documents: [],
      assigned_machine_ids: [],
    });
  };

  const handleCreateStaff = async () => {
    try {
      setSubmitting(true);

      const response = await apiCall("/staff", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff member",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;

    try {
      setSubmitting(true);

      const response = await apiCall(`/staff/${editingStaff.staff_id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingStaff(null);
        resetForm();
        loadData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff member",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const response = await apiCall(`/staff/${staffId}`, {
        method: "DELETE",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        });
        loadData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      mobile_number: staffMember.mobile_number,
      email: staffMember.email,
      address: staffMember.address,
      documents: staffMember.documents,
      assigned_machine_ids: staffMember.assigned_machine_ids,
    });
    setIsEditDialogOpen(true);
  };

  const toggleMachineAssignment = (machineId: string) => {
    setFormData((prev) => ({
      ...prev,
      assigned_machine_ids: prev.assigned_machine_ids.includes(machineId)
        ? prev.assigned_machine_ids.filter((id) => id !== machineId)
        : [...prev.assigned_machine_ids, machineId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute w-16 h-16 rounded-full border-2 border-[#C28654]/30"></div>
            <div className="absolute w-16 h-16 rounded-full border-t-2 border-[#5F3023] animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-[#C28654]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#5F3023]"></div>
            </div>
          </div>
          <p className="text-[#5F3023] text-lg font-medium">
            Loading staff data...
          </p>
          <p className="text-[#8A5738]/70 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

        {/* Coffee bean pattern */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              style={{
                width: Math.random() * 65 + 22 + "px",
                height: Math.random() * 38 + 12 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 p-8">
        {/* Back Button */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-[#8A5738] hover:text-[#5F3023] transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#5F3023]">
              Staff Management
            </h1>
            <p className="text-[#8A5738]">
              Manage staff members and machine assignments
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus size={16} className="mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-[#C28654]/20">
              <DialogHeader>
                <DialogTitle className="text-[#5F3023]">
                  Create New Staff Member
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-[#5F3023] font-medium"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="mobile"
                      className="text-[#5F3023] font-medium"
                    >
                      Mobile Number
                    </Label>
                    <Input
                      id="mobile"
                      value={formData.mobile_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile_number: e.target.value,
                        })
                      }
                      className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-[#5F3023] font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="address"
                    className="text-[#5F3023] font-medium"
                  >
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023] placeholder:text-[#8A5738]/60"
                    placeholder="Enter full address"
                  />
                </div>

                {/* Machine Assignment */}
                <div>
                  <Label className="text-[#5F3023] font-medium mb-3 block">
                    Assign Machines
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {machines.map((machine) => (
                      <div
                        key={machine.machine_id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          formData.assigned_machine_ids.includes(
                            machine.machine_id
                          )
                            ? "bg-[#C28654]/20 border-[#C28654]/50 text-[#5F3023]"
                            : "bg-white/50 border-[#8A5738]/30 text-[#8A5738] hover:border-[#C28654]/50 hover:bg-[#C28654]/10"
                        }`}
                        onClick={() =>
                          toggleMachineAssignment(machine.machine_id)
                        }
                      >
                        <div className="text-sm font-medium">
                          {machine.location}
                        </div>
                        <div className="text-xs opacity-70">
                          {machine.machine_id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStaff}
                    disabled={
                      submitting ||
                      !formData.name ||
                      !formData.email ||
                      !formData.mobile_number
                    }
                    className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Staff Member"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-xl border-[#C28654]/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8A5738]">
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5F3023]">
                {staff.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-[#8A5738]/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8A5738]">
                Active Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#C28654]">
                {staff.filter((s) => s.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-[#8A5738]/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8A5738]">
                Total Machines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5F3023]">
                {machines.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          {staff.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-xl border-[#C28654]/20 shadow-xl">
              <CardContent className="p-8 text-center">
                <Users size={48} className="mx-auto text-[#8A5738] mb-4" />
                <p className="text-[#5F3023] mb-2">No staff members found</p>
                <p className="text-sm text-[#8A5738]">
                  Create your first staff member to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            staff.map((staffMember) => (
              <Card
                key={staffMember.staff_id}
                className="bg-white/90 backdrop-blur-xl border-[#C28654]/20 shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#C28654]/20 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-[#5F3023]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#5F3023]">
                          {staffMember.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-[#8A5738]">
                          <span className="flex items-center">
                            <Mail size={14} className="mr-1" />
                            {staffMember.email}
                          </span>
                          <span className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            {staffMember.mobile_number}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 space-x-4">
                          <Badge
                            className={
                              staffMember.is_active
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {staffMember.is_active ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} className="mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                          <span className="text-sm text-[#8A5738]">
                            {staffMember.assigned_machine_ids.length} machines
                            assigned
                          </span>
                          <span className="text-sm text-[#8A5738]">
                            Created {formatDate(staffMember.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(staffMember)}
                        className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738] hover:text-white"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600/50 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-[#C28654]/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#5F3023]">
                              Delete Staff Member
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#8A5738]">
                              Are you sure you want to delete {staffMember.name}
                              ? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteStaff(staffMember.staff_id)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Assigned Machines */}
                  {staffMember.assigned_machine_ids.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#C28654]/20">
                      <p className="text-sm text-[#8A5738] mb-2">
                        Assigned Machines:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {staffMember.assigned_machine_ids.map((machineId) => {
                          const machine = machines.find(
                            (m) => m.machine_id === machineId
                          );
                          return (
                            <Badge
                              key={machineId}
                              variant="outline"
                              className="border-[#C28654]/30 text-[#5F3023] bg-[#C28654]/10"
                            >
                              <MapPin size={12} className="mr-1" />
                              {machine?.location || machineId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-[#C28654]/20">
            <DialogHeader>
              <DialogTitle className="text-[#5F3023]">
                Edit Staff Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-name"
                    className="text-[#5F3023] font-medium"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-mobile"
                    className="text-[#5F3023] font-medium"
                  >
                    Mobile Number
                  </Label>
                  <Input
                    id="edit-mobile"
                    value={formData.mobile_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile_number: e.target.value,
                      })
                    }
                    className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="edit-email"
                  className="text-[#5F3023] font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-address"
                  className="text-[#5F3023] font-medium"
                >
                  Address
                </Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 text-[#5F3023]"
                />
              </div>

              {/* Machine Assignment */}
              <div>
                <Label className="text-[#5F3023] font-medium mb-3 block">
                  Assign Machines
                </Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {machines.map((machine) => (
                    <div
                      key={machine.machine_id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        formData.assigned_machine_ids.includes(
                          machine.machine_id
                        )
                          ? "bg-[#C28654]/20 border-[#C28654]/50 text-[#5F3023]"
                          : "bg-white/50 border-[#8A5738]/30 text-[#8A5738] hover:border-[#C28654]/50 hover:bg-[#C28654]/10"
                      }`}
                      onClick={() =>
                        toggleMachineAssignment(machine.machine_id)
                      }
                    >
                      <div className="text-sm font-medium">
                        {machine.location}
                      </div>
                      <div className="text-xs opacity-70">
                        {machine.machine_id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingStaff(null);
                    resetForm();
                  }}
                  className="border-[#8A5738]/30 text-[#8A5738] hover:bg-[#8A5738]/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditStaff}
                  disabled={
                    submitting ||
                    !formData.name ||
                    !formData.email ||
                    !formData.mobile_number
                  }
                  className="bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Staff Member"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
