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
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface UpgradeAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceType: 'product' | 'category';
}

export function UpgradeAlert({ open, onOpenChange, resourceType }: UpgradeAlertProps) {
    const whatsappNumber = "201008116452";
    const message = `مرحباً، أرغب في ترقية باقتي في ${APP_NAME} للباقة الاحترافية لإضافة المزيد من ${resourceType === 'product' ? 'المنتجات' : 'الفئات'}.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-center text-brand-primary">
                        🚀 ترقية الباقة
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-lg space-y-2">
                        <p>
                            لقد وصلت إلى الحد المسموح به في الباقة الأساسية.
                        </p>
                        <p className="font-semibold text-foreground">
                            {resourceType === 'product' ? '50 منتج فقط' : '3 فئات فقط'}
                        </p>
                        <p>
                            لإضافة المزيد، يرجى الترقية إلى الباقة الاحترافية.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-4">
                    <Button asChild className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12 text-lg gap-2">
                        <Link href={whatsappUrl} target="_blank">
                            <MessageCircle className="w-6 h-6" />
                            طلب الباقة عبر واتساب
                        </Link>
                    </Button>
                    <AlertDialogCancel className="w-full mt-0">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
