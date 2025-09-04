import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PatientForm from '@/components/PatientForm';
import PatientDetails from '@/components/PatientDetails';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Filter, Eye, Edit, Trash2, Image, DollarSign, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
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
  id: string;
  name: string;
  mobile: string;
  email: string;
  treatmentType: string;
  description: string;
  startDate: Date | undefined;
  totalFee: number;
  paidFee: number;
  images: string[];
  payments: Payment[];
  createdAt: Date;
}

const Patients = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load patients from localStorage on mount
  useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) {
      const parsed = JSON.parse(savedPatients);
      // Parse dates back to Date objects
      const patientsWithDates = parsed.map((p: any) => ({
        ...p,
        startDate: p.startDate ? new Date(p.startDate) : undefined,
        createdAt: new Date(p.createdAt),
        payments: p.payments?.map((payment: any) => ({
          ...payment,
          date: new Date(payment.date)
        })) || []
      }));
      setPatients(patientsWithDates);
    }
  }, []);

  // Save patients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  const handleAddPatient = (patientData: PatientData) => {
    if (editingPatient) {
      setPatients(prev => prev.map(p => p.id === patientData.id ? patientData : p));
      toast({
        title: "Patient Updated",
        description: `${patientData.name}'s information has been updated.`
      });
      setEditingPatient(null);
    } else {
      setPatients(prev => [...prev, patientData]);
      toast({
        title: "Patient Added",
        description: `${patientData.name} has been added successfully.`
      });
    }
    setShowForm(false);
  };

  const handleEdit = (patient: PatientData) => {
    setEditingPatient(patient);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleDelete = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
    toast({
      title: "Patient Deleted",
      description: "Patient record has been removed."
    });
  };

  const handleViewDetails = (patient: PatientData) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobile.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDue = (patient: PatientData) => {
    const totalPaid = patient.paidFee + patient.payments.reduce((sum, p) => sum + p.amount, 0);
    return patient.totalFee - totalPaid;
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
                        <TableCell className="font-medium">{patient.name}</TableCell>
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