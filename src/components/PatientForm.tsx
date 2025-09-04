import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Calendar, Plus, Trash2, CreditCard, Banknote, Smartphone, Building } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientData) => void;
  editingPatient?: PatientData | null;
}

export default function PatientForm({ open, onClose, onSubmit, editingPatient }: PatientFormProps) {
  const [formData, setFormData] = useState<Partial<PatientData>>(
    editingPatient || {
      name: '',
      mobile: '',
      email: '',
      treatmentType: '',
      description: '',
      startDate: undefined,
      totalFee: 0,
      paidFee: 0,
      images: [],
      payments: []
    }
  );
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(editingPatient?.images || []);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    amount: 0,
    date: new Date(),
    method: 'Cash',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const treatmentTypes = [
    'General Checkup',
    'Cleaning',
    'Filling',
    'Root Canal',
    'Crown',
    'Bridge',
    'Dentures',
    'Implants',
    'Orthodontics',
    'Teeth Whitening',
    'Extraction',
    'Other'
  ];

  const paymentMethods = [
    { value: 'Cash', icon: Banknote },
    { value: 'Card', icon: CreditCard },
    { value: 'UPI', icon: Smartphone },
    { value: 'Bank Transfer', icon: Building }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (previewImages.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed per patient",
        variant: "destructive"
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 500 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 500KB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    const input = { target: { files } } as any;
    handleImageUpload(input);
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addPayment = () => {
    if (!newPayment.amount || newPayment.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      amount: newPayment.amount,
      date: newPayment.date || new Date(),
      method: newPayment.method || 'Cash',
      notes: newPayment.notes
    };

    setFormData(prev => ({
      ...prev,
      payments: [...(prev.payments || []), payment]
    }));

    setNewPayment({
      amount: 0,
      date: new Date(),
      method: 'Cash',
      notes: ''
    });
    setShowPaymentDialog(false);
    
    toast({
      title: "Payment added",
      description: `Payment of ₹${payment.amount} added successfully`
    });
  };

  const removePayment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments?.filter(p => p.id !== id) || []
    }));
  };

  const calculateDue = () => {
    const totalPaid = (formData.paidFee || 0) + 
      (formData.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
    return (formData.totalFee || 0) - totalPaid;
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.mobile || !formData.treatmentType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast({
        title: "Invalid mobile number",
        description: "Enter 10-digit mobile number starting with 6, 7, 8, or 9",
        variant: "destructive"
      });
      return;
    }

    const patientData: PatientData = {
      id: editingPatient?.id || Date.now().toString(),
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email || '',
      treatmentType: formData.treatmentType,
      description: formData.description || '',
      startDate: formData.startDate,
      totalFee: formData.totalFee || 0,
      paidFee: formData.paidFee || 0,
      images: previewImages,
      payments: formData.payments || [],
      createdAt: editingPatient?.createdAt || new Date()
    };

    onSubmit(patientData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading bg-gradient-primary bg-clip-text text-transparent">
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the patient details and treatment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient name"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="10-digit number (6,7,8,9)"
                maxLength={10}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Enter 10-digit mobile number starting with 6, 7, 8, or 9
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="patient@example.com"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment Type *</Label>
              <Select
                value={formData.treatmentType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentType: value }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Patient Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter patient history, symptoms, or notes..."
              className="min-h-[100px] bg-background/50"
            />
          </div>

          {/* Treatment Date and Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Treatment Starting Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/50",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "dd-MM-yyyy") : "dd-mm-yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Date must be within the last 3 years
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalFee">Total Fee (INR)</Label>
              <Input
                id="totalFee"
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData(prev => ({ ...prev, totalFee: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidFee">Paid Fees (INR)</Label>
              <Input
                id="paidFee"
                type="number"
                value={formData.paidFee}
                onChange={(e) => setFormData(prev => ({ ...prev, paidFee: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Patient Images */}
          <div className="space-y-2">
            <Label>Patient Images</Label>
            <Card
              className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer bg-background/30"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Upload Patient Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop images here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum 500KB per image, up to 10 images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </Card>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                {previewImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Installment Payments */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Installment Payments</Label>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowPaymentDialog(true)}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Payment
              </Button>
            </div>

            {formData.payments && formData.payments.length > 0 && (
              <Card className="p-4 bg-background/50">
                <div className="space-y-2">
                  {formData.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">₹{payment.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.date, 'dd MMM yyyy')} • {payment.method}
                          {payment.notes && ` • ${payment.notes}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePayment(payment.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-sm font-medium">
                      Due Amount: ₹{calculateDue()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-primary hover:shadow-glow">
            {editingPatient ? 'Update Patient' : 'Add Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter amount"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/50",
                      !newPayment.date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newPayment.date ? format(newPayment.date, "dd-MM-yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newPayment.date}
                    onSelect={(date) => setNewPayment(prev => ({ ...prev, date: date || new Date() }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={newPayment.method}
                onValueChange={(value) => setNewPayment(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="w-4 h-4" />
                        {method.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={newPayment.notes}
                onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this payment..."
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addPayment} className="bg-gradient-primary hover:shadow-glow">
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}