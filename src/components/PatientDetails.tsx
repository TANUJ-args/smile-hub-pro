import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  FileText, 
  Image as ImageIcon,
  CreditCard,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Crop,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

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

interface PatientDetailsProps {
  patient: PatientData | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function PatientDetails({ patient, open, onClose, onEdit }: PatientDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [imageTransform, setImageTransform] = useState({
    rotation: 0,
    flipped: false
  });

  if (!patient) return null;

  const totalPaid = patient.paidFee + patient.payments.reduce((sum, p) => sum + p.amount, 0);
  const dueAmount = patient.totalFee - totalPaid;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % patient.images.length);
    setImageTransform({ rotation: 0, flipped: false });
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + patient.images.length) % patient.images.length);
    setImageTransform({ rotation: 0, flipped: false });
  };

  const rotateLeft = () => {
    setImageTransform(prev => ({ ...prev, rotation: prev.rotation - 90 }));
  };

  const rotateRight = () => {
    setImageTransform(prev => ({ ...prev, rotation: prev.rotation + 90 }));
  };

  const flip = () => {
    setImageTransform(prev => ({ ...prev, flipped: !prev.flipped }));
  };

  const reset = () => {
    setImageTransform({ rotation: 0, flipped: false });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-heading bg-gradient-primary bg-clip-text text-transparent">
              Patient Details
            </span>
            <Button 
              onClick={onEdit}
              size="sm"
              className="bg-gradient-primary hover:shadow-glow"
            >
              Edit Patient
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-background/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Patient Info Card */}
            <Card className="p-6 bg-background/50">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-semibold">{patient.name}</h3>
                    <Badge variant="outline" className="mt-2">
                      {patient.treatmentType}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{patient.mobile}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                    {patient.startDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {format(patient.startDate, 'dd MMM yyyy')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ImageIcon className="w-4 h-4" />
                      <span>{patient.images.length} Image{patient.images.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {patient.description && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h4>
                      <p className="text-muted-foreground">{patient.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Financial Summary */}
            <Card className="p-6 bg-background/50">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                  <p className="text-2xl font-semibold">₹{patient.totalFee.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-semibold text-success">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Due Amount</p>
                  <p className="text-2xl font-semibold text-destructive">₹{dueAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            {patient.images.length > 0 ? (
              <Card className="p-6 bg-background/50">
                <div className="space-y-4">
                  {/* Image Viewer */}
                  <div className="relative bg-background rounded-lg overflow-hidden">
                    <img
                      src={patient.images[selectedImage]}
                      alt={`Patient image ${selectedImage + 1}`}
                      className="w-full h-[400px] object-contain"
                      style={{
                        transform: `rotate(${imageTransform.rotation}deg) ${imageTransform.flipped ? 'scaleX(-1)' : ''}`,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                    
                    {patient.images.length > 1 && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={rotateLeft}
                        title="Rotate Left"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={rotateRight}
                        title="Rotate Right"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={flip}
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={reset}
                        title="Reset"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-6 gap-2">
                    {patient.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index);
                          setImageTransform({ rotation: 0, flipped: false });
                        }}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-primary ring-2 ring-primary/50' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center bg-background/50">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No images uploaded for this patient</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="p-6 bg-background/50">
              <h4 className="font-medium mb-4">Payment History</h4>
              
              {/* Initial Payment */}
              {patient.paidFee > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Initial Payment</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.startDate && format(patient.startDate, 'dd MMM yyyy')}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-success">₹{patient.paidFee.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Installment Payments */}
              {patient.payments.length > 0 ? (
                <div className="space-y-2">
                  {patient.payments.map((payment) => (
                    <div key={payment.id} className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {payment.method}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(payment.date, 'dd MMM yyyy')}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                          )}
                        </div>
                        <p className="text-lg font-semibold text-success">₹{payment.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No installment payments recorded
                </p>
              )}

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Total Paid</p>
                  <p className="text-xl font-semibold text-success">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-medium">Remaining Due</p>
                  <p className="text-xl font-semibold text-destructive">₹{dueAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6 bg-background/50">
              <h4 className="font-medium mb-4">Treatment History</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="font-medium">Patient Registered</p>
                    <p className="text-muted-foreground">
                      {format(patient.createdAt, 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
                
                {patient.startDate && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="font-medium">Treatment Started - {patient.treatmentType}</p>
                      <p className="text-muted-foreground">
                        {format(patient.startDate, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {patient.payments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center gap-4 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <div className="flex-1">
                      <p className="font-medium">Payment #{index + 1} Received</p>
                      <p className="text-muted-foreground">
                        ₹{payment.amount} via {payment.method} • {format(payment.date, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}