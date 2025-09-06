import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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
import { useToast } from '@/hooks/use-toast';

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

interface PatientDetailsProps {
  patient: PatientData | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRevertChanges?: () => void;
  onPatientUpdate?: () => void; // Add this prop for updating parent state
}

export default function PatientDetails({ patient, open, onClose, onEdit, onRevertChanges, onPatientUpdate }: PatientDetailsProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [imageTransform, setImageTransform] = useState({
    rotation: 0,
    flipped: false
  });
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<any>();
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  if (!patient) return null;

  const totalPaid = patient.payments.reduce((sum, p) => sum + p.amount, 0);
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

  const openCropDialog = () => {
    setShowCropDialog(true);
  };

  const closeCropDialog = () => {
    setShowCropDialog(false);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
  };

  const saveCroppedImage = async () => {
    if (!completedCrop || !imgRef.current || !patient) {
      toast({
        title: "Error",
        description: "Please select an area to crop",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas is empty');
        
        const reader = new FileReader();
        reader.onload = async () => {
          const croppedImageUrl = reader.result as string;
          
          try {
            // Call backend API to update the image
            const response = await fetch(`/api/patients/${patient.id}/images/${selectedImage}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageData: croppedImageUrl }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Update the patient data with new images
            if (onPatientUpdate) {
              onPatientUpdate();
            }
            
            toast({
              title: "Success",
              description: "Image cropped and saved successfully",
            });
            
            closeCropDialog();
          } catch (apiError) {
            console.error('API Error:', apiError);
            toast({
              title: "Error",
              description: `Failed to save cropped image: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
              variant: "destructive"
            });
          }
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Error",
        description: "Failed to crop image",
        variant: "destructive"
      });
    }
  };

  const deleteImage = async (imageIndex: number) => {
    if (!patient) {
      toast({
        title: "Error",
        description: "Patient data not available",
        variant: "destructive"
      });
      return;
    }

    if (patient.images.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "At least one image must remain",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call backend API to delete the image
      const response = await fetch(`/api/patients/${patient.id}/images/${imageIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update the patient data with new images
      if (onPatientUpdate) {
        onPatientUpdate();
      }
      
      // Adjust selected image if needed
      if (selectedImage >= imageIndex && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      } else if (selectedImage >= result.images.length) {
        setSelectedImage(result.images.length - 1);
      }
      
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-heading bg-gradient-primary bg-clip-text text-transparent">
              Patient Details
            </span>
            <div className="flex space-x-2">
              <Button 
                onClick={onEdit}
                size="sm"
                className="bg-gradient-primary hover:shadow-glow"
              >
                Edit Patient
              </Button>
            </div>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{patient.mobile}</span>
                    </div>
                    {patient.surname && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Surname:</span>
                        <span>{patient.surname}</span>
                      </div>
                    )}
                    {patient.gender && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">Gender:</span>
                        <span>{patient.gender}</span>
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

                  {patient.age && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Age:</span>
                      <span>{patient.age}</span>
                    </div>
                  )}

                  {patient.chiefComplaint && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Chief Complaint
                      </h4>
                      <p className="text-muted-foreground">{patient.chiefComplaint}</p>
                    </div>
                  )}
                  
                  {patient.diagnosis && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Diagnosis
                      </h4>
                      <p className="text-muted-foreground">{patient.diagnosis}</p>
                    </div>
                  )}
                  
                  {patient.treatmentPlan && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Treatment Plan
                      </h4>
                      <p className="text-muted-foreground">{patient.treatmentPlan}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        onClick={openCropDialog}
                        title="Crop Image"
                      >
                        <Crop className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={reset}
                        title="Reset"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteImage(selectedImage)}
                        title="Delete Image"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {patient.images.map((img, index) => (
                      <div
                        key={index}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
                          selectedImage === index 
                            ? 'border-primary ring-2 ring-primary/50' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedImage(index);
                            setImageTransform({ rotation: 0, flipped: false });
                          }}
                          className="w-full h-full"
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(index);
                          }}
                          title="Delete Image"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
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
              
              {/* Start Date */}
              {patient.startDate && (
                <div className="mb-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Treatment Started</p>
                      <p className="text-sm text-muted-foreground">
                        {format(patient.startDate, 'dd MMM yyyy')}
                      </p>
                    </div>
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

      {/* Crop Image Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  src={patient.images[selectedImage]}
                  alt="Crop preview"
                  className="max-w-full max-h-[500px] object-contain"
                  style={{
                    transform: `rotate(${imageTransform.rotation}deg) ${imageTransform.flipped ? 'scaleX(-1)' : ''}`,
                  }}
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeCropDialog}>
                Cancel
              </Button>
              <Button onClick={saveCroppedImage}>
                Save Cropped Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}