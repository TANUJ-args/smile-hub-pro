import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PatientForm from '@/components/PatientForm';
import PatientDetails from '@/components/PatientDetails';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Filter, Eye, Edit, Trash2, Image, DollarSign, Calendar, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Payment {
  id: string;
  amount: number;
  date: Date;
  method: string;
  notes?: string;
}

interface PatientData {
  id: number;
  name: string;
  surname: string;
  gender: string;
  mobile: string;
  age: number;
  treatmentType: string;
  chiefComplaint: string;   // renamed from description
  diagnosis: string;        // new field
  treatmentPlan: string;    // new field
  startDate: Date | undefined;
  totalFee: number;
  images: string[];
  payments: Payment[];
  createdAt: Date;
}

const convertToPatientData = (p: any): PatientData => {
  const payments = p.payments ? (typeof p.payments === 'string' ? JSON.parse(p.payments) : p.payments) : [];
  return {
    id: p.id,
    name: p.name,
    surname: p.surname,
    gender: p.gender,
    mobile: p.mobile,
    age: p.age,
    treatmentType: p.treatment_type,
    chiefComplaint: p.chief_complaint,
    diagnosis: p.diagnosis,
    treatmentPlan: p.treatment_plan,
    startDate: p.start_date ? new Date(p.start_date) : undefined,
    totalFee: p.total_fee,
    images: p.images || [],
    payments: payments.map((payment: any) => ({ ...payment, date: new Date(payment.date) })),
    createdAt: new Date(p.created_at),
  };
};

const Patients = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientData | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [originalPatientData, setOriginalPatientData] = useState<{ [key: number]: PatientData }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;
      try {
        const response = await fetch(API_ENDPOINTS.PATIENTS, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401 || response.status === 403) {
          logout();
          navigate('/auth');
          toast({
            title: "Session expired",
            description: "Please log in again.",
            variant: "destructive"
          });
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        const patientsData = data.map(convertToPatientData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Error",
          description: "Could not load patient data from the server.",
          variant: "destructive"
        });
      }
    };

    fetchPatients();
  }, [token, logout, navigate]);

  const handleAddPatient = async (patientData: PatientData) => {
    if (!token) return;
    try {
      let response;
      let newPatientData;

      const backendData = {
        name: patientData.name,
        surname: patientData.surname,
        gender: patientData.gender,
        mobile: patientData.mobile,
        age: patientData.age,
        treatment_type: patientData.treatmentType,
        chief_complaint: patientData.chiefComplaint,
        diagnosis: patientData.diagnosis,
        treatment_plan: patientData.treatmentPlan,
        start_date: patientData.startDate,
        total_fee: patientData.totalFee,
        images: patientData.images,
        payments: patientData.payments
      };

      if (editingPatient) {
        response = await fetch(`${API_ENDPOINTS.PATIENTS}/${patientData.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update patient');
        }
        newPatientData = await response.json();
        
        const updatedPatient = convertToPatientData(newPatientData);

        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        toast({
          title: "Patient Updated",
          description: `${updatedPatient.name}'s information has been updated.`
        });
        setEditingPatient(null);

      } else {
        response = await fetch(API_ENDPOINTS.PATIENTS, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create patient');
        }
        newPatientData = await response.json();

        const newPatient = convertToPatientData(newPatientData);

        setPatients(prev => [newPatient, ...prev]);
        toast({
          title: "Patient Added",
          description: `${newPatient.name} has been added successfully.`
        });
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: "Error",
        description: `Could not save patient data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (patient: PatientData) => {
    setOriginalPatientData(prev => ({
      ...prev,
      [patient.id]: { ...patient }
    }));
    setEditingPatient(patient);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      setPatients(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
      toast({
        title: "Patient Deleted",
        description: "Patient record has been removed."
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Could not delete patient from the server.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (patient: PatientData) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobile.includes(searchTerm) ||
    patient.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDue = (patient: PatientData) => {
    const totalPaid = patient.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalFee = patient.totalFee || 0;
    return Math.max(0, totalFee - totalPaid);
  };

  const handlePatientUpdate = async () => {
    if (!token) return;
    try {
      const response = await fetch(API_ENDPOINTS.PATIENTS, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      const patientsData = data.map(convertToPatientData);
      setPatients(patientsData);

      // Update selected patient details if it's open
      if (selectedPatient) {
        const updatedSelected = patientsData.find(p => p.id === selectedPatient.id);
        if (updatedSelected) {
          setSelectedPatient(updatedSelected);
        } else {
          // The patient might have been deleted, so close the details view
          setShowDetails(false);
          setSelectedPatient(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing patient data:", error);
      toast({
        title: "Error",
        description: "Could not refresh patient data.",
        variant: "destructive"
      });
    }
  };

  const handleRevertChanges = async (patientId: number) => {
    const original = originalPatientData[patientId];
    if (original && token) {
      try {
        const backendData = {
          name: original.name,
          surname: original.surname,
          gender: original.gender,
          mobile: original.mobile,
          age: original.age,
          treatment_type: original.treatmentType,
          chief_complaint: original.chiefComplaint,
          diagnosis: original.diagnosis,
          treatment_plan: original.treatmentPlan,
          start_date: original.startDate,
          total_fee: original.totalFee,
          images: original.images,
          payments: original.payments
        };

        const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${patientId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to revert patient data');
        }

        const updatedPatientData = await response.json();
        const updatedPatient = convertToPatientData(updatedPatientData);

        setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
        
        if (selectedPatient && selectedPatient.id === patientId) {
            setSelectedPatient(updatedPatient);
        }

        toast({
          title: "Changes Reverted",
          description: "Patient data has been restored and saved to the database."
        });

        setOriginalPatientData(prev => {
          const newData = { ...prev };
          delete newData[patientId];
          return newData;
        });

      } catch (error) {
        console.error("Error reverting patient data:", error);
        toast({
          title: "Error",
          description: `Could not revert patient data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 space-y-4 animate-fade-up">
            <h1 className="text-4xl font-bold font-heading bg-gradient-primary bg-clip-text text-transparent">
              Patient Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your patients' records, treatments, and appointments
            </p>
          </div>

          {/* Action Bar */}
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search patients by name, ID, or contact..."
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button 
                onClick={() => {
                  setEditingPatient(null);
                  setShowForm(true);
                }}
                className="bg-gradient-primary hover:shadow-glow flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Patient
              </Button>
            </div>
          </Card>

          {/* Patients Table or Empty State */}
          {filteredPatients.length > 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const dueAmount = calculateDue(patient);
                    return (
                      <TableRow key={patient.id} className="hover:bg-background/50">
                        <TableCell className="font-medium">
                          {patient.name} {patient.surname}
                        </TableCell>
                        <TableCell>{patient.mobile}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.treatmentType}</Badge>
                        </TableCell>
                        <TableCell>
                          {patient.startDate ? format(patient.startDate, 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            {patient.images.length}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={dueAmount > 0 ? 'text-destructive font-medium' : 'text-success font-medium'}>
                            ₹{dueAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(patient)}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(patient)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {originalPatientData[patient.id] && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRevertChanges(patient.id)}
                                className="hover:bg-yellow-100 text-yellow-600"
                                title="Revert Changes"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(patient.id)}
                              className="hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50 animate-fade-up">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">
                  {searchTerm ? 'No patients found' : 'No Patients Yet'}
                </h2>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Start by adding your first patient to begin managing their dental records and treatments.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => {
                      setEditingPatient(null);
                      setShowForm(true);
                    }}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    Add Your First Patient
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Patient Form Modal */}
      <PatientForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPatient(null);
        }}
        onSubmit={handleAddPatient}
        editingPatient={editingPatient}
      />

      {/* Patient Details Modal */}
      <PatientDetails
        patient={selectedPatient}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedPatient(null);
        }}
        onEdit={() => {
          if (selectedPatient) {
            handleEdit(selectedPatient);
          }
        }}
        onRevertChanges={selectedPatient ? () => handleRevertChanges(selectedPatient.id) : undefined}
        onPatientUpdate={handlePatientUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient's record and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;