import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Palette, MessageCircle } from "lucide-react";

interface UpgradeAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resourceType: 'product' | 'category';
}

export function UpgradeAlert({ open, onOpenChange, resourceType }: UpgradeAlertProps) {
    const limitText = resourceType === 'product' ? '50 منتج' : '5 تصنيفات';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                        <Crown className="h-7 w-7 text-amber-500" />
                        ترقية إلى باقة البرو
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        لقد وصلت إلى الحد الأقصى ({limitText}) في الباقة الأساسية
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Sparkles className="h-5 w-5 text-brand-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">عدد غير محدود من المنتجات والتصنيفات</p>
                                <p className="text-xs text-muted-foreground">أضف عدد لا نهائي من المنتجات والتصنيفات</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Palette className="h-5 w-5 text-brand-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">أنماط مظهر متعددة</p>
                                <p className="text-xs text-muted-foreground">اختر من بين 10 أنماط ألوان مختلفة لمتجرك</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Crown className="h-5 w-5 text-brand-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-sm">دعم فني مميز</p>
                                <p className="text-xs text-muted-foreground">أولوية في الرد والدعم الفني</p>
                            </div>
                        </div>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <a
                            href="https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MessageCircle className="h-4 w-4 ml-2" />
                            طلب الترقية
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
